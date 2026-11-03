
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const uploadDirectory = path.join(
  __dirname,
  "../../private/campaign-evidence"
);

fs.mkdirSync(uploadDirectory, { recursive: true });

const categories = [
  "disasterProof",
  "authorizationDocuments",
  "locationEvidence",
  "photosAndVideos",
  "additionalDocuments",
];

const allowedMimeTypes = {
  ".pdf": ["application/pdf"],
  ".jpg": ["image/jpeg"],
  ".jpeg": ["image/jpeg"],
  ".png": ["image/png"],
  ".mp4": ["video/mp4"],
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },

  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    cb(null, `${req.user.id}-${crypto.randomUUID()}${extension}`);
  },
});

const fileFilter = (req, file, cb) => {
  const extension = path.extname(file.originalname).toLowerCase();
  const allowedTypes = allowedMimeTypes[extension];

  if (!allowedTypes || !allowedTypes.includes(file.mimetype)) {
    return cb(
      new Error("Only PDF, JPG, PNG, and MP4 files are allowed.")
    );
  }

  cb(null, true);
};

const uploadFields = categories.map((category) => ({
  name: category,
  maxCount: 5,
}));

const multerUpload = multer({
  storage,
  fileFilter,
  limits: {
    files: 20,
    fileSize: 10 * 1024 * 1024,
  },
}).fields(uploadFields);

async function hasValidSignature(file) {
  const handle = await fs.promises.open(file.path, "r");

  try {
    const buffer = Buffer.alloc(12);
    const { bytesRead } = await handle.read(buffer, 0, 12, 0);
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
      return signature.subarray(0, 8).equals(
        Buffer.from([
          0x89, 0x50, 0x4e, 0x47,
          0x0d, 0x0a, 0x1a, 0x0a,
        ])
      );
    }

    // MP4: check the ISO Base Media File Format box marker.
    if (file.mimetype === "video/mp4") {
      return (
        signature.length >= 8 &&
        signature.subarray(4, 8).toString() === "ftyp"
      );
    }

    return false;
  } finally {
    await handle.close();
  }
}

async function removeUploadedFiles(files) {
  const allFiles = Object.values(files || {}).flat();

  await Promise.all(
    allFiles.map((file) =>
      fs.promises.unlink(file.path).catch(() => {})
    )
  );
}

const uploadCampaignEvidence = (req, res, next) => {
  multerUpload(req, res, async (error) => {
    if (error) {
      await removeUploadedFiles(req.files);

      if (error instanceof multer.MulterError) {
        const message =
          error.code === "LIMIT_FILE_SIZE"
            ? "Each file must be 10 MB or smaller."
            : "Invalid upload. Maximum 20 files and 5 files per category.";

        return res.status(
          error.code === "LIMIT_FILE_SIZE" ? 413 : 400
        ).json({
          success: false,
          message,
        });
      }

      return res.status(400).json({
        success: false,
        message: error.message || "Campaign evidence upload failed.",
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
            message: `Invalid file content: ${file.originalname}`,
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

module.exports = uploadCampaignEvidence;
