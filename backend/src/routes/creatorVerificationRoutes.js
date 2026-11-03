
const express = require("express");
const fs = require("fs");
const path = require("path");

const CreatorVerification = require("../models/CreatorVerification");
const User = require("../models/User");
const Campaign = require("../models/Campaign");
const { authenticateToken } = require("../middleware/authMiddleware");
const uploadCreatorDocuments = require("../middleware/creatorDocumentUpload");

const router = express.Router();

const uploadDirectory = path.join(
  __dirname,
  "../../private/creator-verification"
);

// POST /api/creator-verification/submit
router.post(
  "/submit",
  authenticateToken,
  async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id).select("_id role");

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User account not found",
        });
      }

      if (!["creator", "donor"].includes(user.role)) {
        return res.status(403).json({
          success: false,
          message: "This account cannot submit creator verification",
        });
      }

      const existing = await CreatorVerification.findOne({
        userId: user._id,
      });

      if (existing) {
        return res.status(409).json({
          success: false,
          message: "A verification request already exists for this account",
          status: existing.status,
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  },
  uploadCreatorDocuments,
  async (req, res) => {
    try {
      const identityFile = req.files?.identityDocument?.[0];
      const addressFile = req.files?.addressDocument?.[0];

      if (!identityFile || !addressFile) {
        await Promise.all(
          Object.values(req.files || {}).flat().map((file) =>
            fs.promises.unlink(file.path).catch(() => {})
          )
        );

        return res.status(400).json({
          success: false,
          message: "Both identity and address documents are required",
        });
      }

      const { identityDocumentType, addressDocumentType } = req.body;
      const allowedIdentityTypes = [
  "masked_aadhaar",
  "passport",
  "voter_id",
  "driving_license",
  "other",
];

const allowedAddressTypes = [
  "masked_aadhaar",
  "passport",
  "voter_id",
  "driving_license",
  "utility_bill",
  "bank_statement",
  "other",
];

if (
  !allowedIdentityTypes.includes(identityDocumentType) ||
  !allowedAddressTypes.includes(addressDocumentType)
) {
  await Promise.all(
    Object.values(req.files || {}).flat().map((file) =>
      fs.promises.unlink(file.path).catch(() => {})
    )
  );

  return res.status(400).json({
    success: false,
    message: "Please select valid identity and address document types.",
  });
}

      const verification = await CreatorVerification.create({
        userId: req.user.id,

        identityDocument: {
          documentType: identityDocumentType,
          storageKey: path.basename(identityFile.filename),
        },

        addressDocument: {
          documentType: addressDocumentType,
          storageKey: path.basename(addressFile.filename),
        },

        status: "pending",
      });

      return res.status(201).json({
        success: true,
        message: "Creator verification submitted successfully",
        verification: {
          id: verification._id,
          status: verification.status,
          createdAt: verification.createdAt,
        },
      });
    } catch (error) {
      await Promise.all(
        Object.values(req.files || {}).flat().map((file) =>
          fs.promises.unlink(file.path).catch(() => {})
        )
      );

      if (error.code === 11000) {
        return res.status(409).json({
          success: false,
          message: "A verification request already exists",
        });
      }

      console.error("Creator verification submission error:", error.message);

      return res.status(500).json({
        success: false,
        message: "Could not submit creator verification",
      });
    }
  }
);


// GET /api/creator-verification/status
router.get("/status", authenticateToken, async (req, res) => {
  try {
    const verification = await CreatorVerification.findOne({
      userId: req.user.id,
    }).select(
      "status identityDocument.documentType addressDocument.documentType reviewedAt rejectionReason createdAt updatedAt"
    );

    if (!verification) {
      return res.status(404).json({
        success: false,
        message: "No creator verification request found",
        status: "not_submitted",
      });
    }

    return res.status(200).json({
      success: true,
      verification: {
        id: verification._id,
        status: verification.status,
        identityDocumentType: verification.identityDocument.documentType,
        addressDocumentType: verification.addressDocument.documentType,
        reviewedAt: verification.reviewedAt,
        rejectionReason: verification.rejectionReason,
        submittedAt: verification.createdAt,
        updatedAt: verification.updatedAt,
      },
    });
  } catch (error) {
    console.error("Creator verification status error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Could not retrieve verification status",
    });
  }
});


// GET /api/creator-verification/pending
// List pending creator verification requests for verifiers/admins
router.get("/pending", authenticateToken, async (req, res) => {
  try {
    // Check the reviewer's current database role
    const reviewer = await User.findById(req.user.id).select("_id role");

    if (!reviewer) {
      return res.status(401).json({
        success: false,
        message: "Reviewer account not found",
      });
    }

    if (!["verifier", "admin"].includes(reviewer.role)) {
      return res.status(403).json({
        success: false,
        message: "Only verifiers or admins can view pending requests",
      });
    }

    // Retrieve pending requests without exposing private storage keys
    const requests = await CreatorVerification.find({
      status: "pending",
    })
      .select(
        "userId identityDocument.documentType addressDocument.documentType status createdAt"
      )
      .populate("userId", "name email")
      .sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      count: requests.length,
      requests: requests.map((request) => ({
        id: request._id,
        creator: request.userId
          ? {
              id: request.userId._id,
              name: request.userId.name,
              email: request.userId.email,
            }
          : null,
        identityDocumentType: request.identityDocument.documentType,
        addressDocumentType: request.addressDocument.documentType,
        status: request.status,
        submittedAt: request.createdAt,
      })),
    });
  } catch (error) {
    console.error("Pending creator verification error:", error);

    return res.status(500).json({
      success: false,
      message: "Could not retrieve pending verification requests",
    });
  }
});


// GET /api/creator-verification/:id/documents/:documentType
// Securely view creator identity or address documents
router.get(
  "/:id/documents/:documentType",
  authenticateToken,
  async (req, res) => {
    try {
      // 1. Check current reviewer role from MongoDB
      const reviewer = await User.findById(req.user.id).select("_id role");

      if (!reviewer) {
        return res.status(401).json({
          success: false,
          message: "Reviewer account not found",
        });
      }

      if (!["verifier", "admin"].includes(reviewer.role)) {
        return res.status(403).json({
          success: false,
          message: "Only verifiers or admins can view creator documents",
        });
      }

      // 2. Validate requested document type
      const documentFields = {
        identity: "identityDocument",
        address: "addressDocument",
      };

      const documentField = documentFields[req.params.documentType];

      if (!documentField) {
        return res.status(400).json({
          success: false,
          message: "Document type must be identity or address",
        });
      }

      // 3. Find verification request
      const verification = await CreatorVerification.findById(
        req.params.id
      );

      if (!verification) {
        return res.status(404).json({
          success: false,
          message: "Creator verification request not found",
        });
      }

      // 4. Retrieve private storage key
      const document = verification[documentField];
      const storageKey = document?.storageKey;

      if (!storageKey || path.basename(storageKey) !== storageKey) {
        return res.status(404).json({
          success: false,
          message: "Document not found",
        });
      }

      // 5. Prevent directory traversal
      const filePath = path.resolve(uploadDirectory, storageKey);
      const allowedDirectory = path.resolve(uploadDirectory) + path.sep;

      if (!filePath.startsWith(allowedDirectory)) {
        return res.status(403).json({
          success: false,
          message: "Invalid document path",
        });
      }

      // 6. Confirm file exists
      const fileStat = await fs.promises.stat(filePath);

      if (!fileStat.isFile()) {
        return res.status(404).json({
          success: false,
          message: "Document not found",
        });
      }

      // 7. Determine safe content type
      const extension = path.extname(storageKey).toLowerCase();

      const contentTypes = {
        ".pdf": "application/pdf",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
      };

      const contentType = contentTypes[extension];

      if (!contentType) {
        return res.status(415).json({
          success: false,
          message: "Unsupported document format",
        });
      }

      // 8. Send document privately to authorized reviewer
      res.set({
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename="${req.params.documentType}-document${extension}"`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      });

      return res.sendFile(filePath, (error) => {
        if (error) {
          console.error("Document delivery error:", error.message);

          if (!res.headersSent) {
            res.status(500).json({
              success: false,
              message: "Could not retrieve document",
            });
          }
        }
      });
    } catch (error) {
      if (error.name === "CastError") {
        return res.status(400).json({
          success: false,
          message: "Invalid verification request ID",
        });
      }

      if (error.code === "ENOENT") {
        return res.status(404).json({
          success: false,
          message: "Document file not found",
        });
      }

      console.error("Secure document viewing error:", error);

      return res.status(500).json({
        success: false,
        message: "Could not retrieve creator document",
      });
    }
  }
);


// PATCH /api/creator-verification/:id/review
router.patch("/:id/review", authenticateToken, async (req, res) => {
  try {
    // 1. Check the user's current role directly from MongoDB
    const reviewer = await User.findById(req.user.id).select("_id role");

    if (!reviewer) {
      return res.status(401).json({
        success: false,
        message: "Reviewer account not found",
      });
    }

    if (!["verifier", "admin"].includes(reviewer.role)) {
      return res.status(403).json({
        success: false,
        message: "Only verifiers or admins can review creator verification",
      });
    }

    // 2. Validate the requested decision
    const { status, rejectionReason } = req.body;

    if (!["verified", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be either verified or rejected",
      });
    }

    if (
      status === "rejected" &&
      (!rejectionReason || !rejectionReason.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "A rejection reason is required",
      });
    }

    // 3. Find the verification request
    const verification = await CreatorVerification.findById(req.params.id);

    if (!verification) {
      return res.status(404).json({
        success: false,
        message: "Creator verification request not found",
      });
    }

    if (verification.status !== "pending") {
      return res.status(409).json({
        success: false,
        message: `This verification request has already been ${verification.status}`,
      });
    }

    // 4. Update the verification decision
    verification.status = status;
    verification.reviewedBy = reviewer._id;
    verification.reviewedAt = new Date();
    verification.rejectionReason =
      status === "rejected" ? rejectionReason.trim() : "";

    await verification.save();

    // 5. Update the status snapshot on this creator's pending campaigns
    await Campaign.updateMany(
      {
        creator: verification.userId,
        status: "pending",
      },
      {
        $set: {
          creatorVerificationStatus: status,
        },
      }
    );

    return res.status(200).json({
      success: true,
      message: `Creator verification ${status} successfully`,
      verification: {
        id: verification._id,
        status: verification.status,
        reviewedAt: verification.reviewedAt,
        rejectionReason: verification.rejectionReason,
      },
    });
  } catch (error) {
    console.error("Creator verification review error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Could not review creator verification",
    });
  }
});


module.exports = router;
