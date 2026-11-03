
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const identityDirectory = path.join(
  __dirname,
  "../../private/creator-verification"
);

const evidenceDirectory = path.join(
  __dirname,
  "../../private/campaign-evidence"
);

fs.mkdirSync(identityDirectory, { recursive: true });
fs.mkdirSync(evidenceDirectory, { recursive: true });

const identityFields = ["identityDocument", "addressDocument"];

const evidenceFields = [
  "disasterProof",
  "authorizationDocuments",
  "locationEvidence",
  "photosAndVideos",
  "additionalDocuments",
];

const allowedTypes = {
  ".pdf": ["application/pdf"],
  ".jpg": ["image/jpeg"],
  ".jpeg": ["image/jpeg"],
  ".png": ["image/png"],
  ".mp4": ["video/mp4"],
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const directory = identityFields.includes(file.fieldname)
      ? identityDirectory
      : evidenceDirectory;

    cb(null, directory);
  },

  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();

    cb(
      null,
      `${req.user.id}-${crypto.randomUUID()}${extension}`
    );
  },
});

const fileFilter = (req, file, cb) => {
  const extension = path.extname(file.originalname).toLowerCase();
  const validTypes = allowedTypes[extension];

  if (!validTypes || !validTypes.includes(file.mimetype)) {
    return cb(
      new Error("Unsupported file type. Upload PDF, JPG, PNG, or MP4 files.")
    );
  }

  if (
    identityFields.includes(file.fieldname) &&
    ![".pdf", ".jpg", ".jpeg", ".png"].includes(extension)
  ) {
    return cb(new Error("Identity documents must be PDF, JPG, or PNG."));
  }

  cb(null, true);
};

const uploadFields = [
  { name: "identityDocument", maxCount: 1 },
  { name: "addressDocument", maxCount: 1 },
  ...evidenceFields.map((name) => ({
    name,
    maxCount: 5,
  })),
];

const multerUpload = multer({
  storage,
  fileFilter,
  limits: {
    files: 20,
    fileSize: 10 * 1024 * 1024,
  },
}).fields(uploadFields);

async function removeUploadedFiles(files) {
  const allFiles = Object.values(files || {}).flat();

  await Promise.all(
    allFiles.map((file) =>
      fs.promises.unlink(file.path).catch(() => {})
    )
  );
}

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
        Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
      );
    }

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

const uploadCampaignSubmission = (req, res, next) => {
  multerUpload(req, res, async (error) => {
    if (error) {
      await removeUploadedFiles(req.files);

      if (error instanceof multer.MulterError) {
        const isFileTooLarge = error.code === "LIMIT_FILE_SIZE";

        return res.status(isFileTooLarge ? 413 : 400).json({
          success: false,
          message: isFileTooLarge
            ? "Each file must be 10 MB or smaller."
            : "Invalid upload. Maximum 20 files and 5 files per evidence category.",
        });
      }

      return res.status(400).json({
        success: false,
        message: error.message || "File upload failed.",
      });
    }

    try {
      const files = Object.values(req.files || {}).flat();

      for (const file of files) {
        // Identity documents have a stricter 5 MB limit.
        if (
          identityFields.includes(file.fieldname) &&
          file.size > 5 * 1024 * 1024
        ) {
          await removeUploadedFiles(req.files);

          return res.status(413).json({
            success: false,
            message: "Identity and address documents must be 5 MB or smaller.",
          });
        }

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

module.exports = uploadCampaignSubmission;
