
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

// Private storage directory (not served as static content)
const uploadDirectory = path.join(
  __dirname,
  "../../private/creator-verification"
);

fs.mkdirSync(uploadDirectory, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },

  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();

    const safeFilename = `${req.user.id}-${crypto.randomUUID()}${extension}`;

    cb(null, safeFilename);
  },
});

const allowedMimeTypes = [
  "application/pdf",
  "image/jpeg",
  "image/png",
];

const allowedExtensions = [".pdf", ".jpg", ".jpeg", ".png"];

const fileFilter = (req, file, cb) => {
  const extension = path.extname(file.originalname).toLowerCase();

  if (
    allowedMimeTypes.includes(file.mimetype) &&
    allowedExtensions.includes(extension)
  ) {
    return cb(null, true);
  }

  cb(new Error("Only PDF, JPG, and PNG files are allowed"));
};


const multerUpload = multer({
  storage,
  fileFilter,
  limits: {
    files: 2,
    fileSize: 5 * 1024 * 1024,
  },
}).fields([
  { name: "identityDocument", maxCount: 1 },
  { name: "addressDocument", maxCount: 1 },
]);

// Check actual file signatures
async function hasValidSignature(file) {
  const handle = await fs.promises.open(file.path, "r");

  try {
    const buffer = Buffer.alloc(8);
    const { bytesRead } = await handle.read(buffer, 0, 8, 0);
    const signature = buffer.subarray(0, bytesRead);

    if (file.mimetype === "application/pdf") {
      return signature.subarray(0, 5).toString() === "%PDF-";
    }

    if (file.mimetype === "image/jpeg") {
      return (
        signature[0] === 0xff &&
        signature[1] === 0xd8 &&
        signature[2] === 0xff
      );
    }

    if (file.mimetype === "image/png") {
      return signature.equals(
        Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
      );
    }

    return false;
  } finally {
    await handle.close();
  }
}

// Remove uploaded files if validation fails
async function removeUploadedFiles(files) {
  const allFiles = Object.values(files || {}).flat();

  await Promise.all(
    allFiles.map((file) =>
      fs.promises.unlink(file.path).catch(() => {})
    )
  );
}

const uploadCreatorDocuments = (req, res, next) => {
  multerUpload(req, res, async (error) => {
    if (error) {
  // Best-effort cleanup of any files exposed on the request.
  await removeUploadedFiles(req.files);

  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({
        success: false,
        message: "Each document must be 5 MB or smaller.",
      });
    }

    return res.status(400).json({
      success: false,
      message: "Invalid upload. Please check the number and names of uploaded files.",
    });
  }

  return res.status(400).json({
    success: false,
    message: error.message || "Document upload failed.",
  });
}

    try {
      const files = Object.values(req.files || {}).flat();

      for (const file of files) {
        const valid = await hasValidSignature(file);

        if (!valid) {
          await removeUploadedFiles(req.files);

          return res.status(400).json({
            success: false,
            message: "A document has an invalid file signature.",
          });
        }
      }

      next();
    } catch (error) {
      await removeUploadedFiles(req.files);
      next(error);
    }
  });
};

module.exports = uploadCreatorDocuments;
