
const express = require("express");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

const Campaign = require("../models/Campaign");
const CreatorVerification = require("../models/CreatorVerification");
const User = require("../models/User");

const { authenticateToken } = require("../middleware/authMiddleware");
const uploadCampaignSubmission = require("../middleware/campaignSubmissionUpload");

const router = express.Router();

const campaignEvidenceCategories = [
  "disasterProof",
  "authorizationDocuments",
  "locationEvidence",
  "photosAndVideos",
  "additionalDocuments",
];

// Remove private storage keys before returning campaign data.
function serializeCampaign(campaign) {
  const data = campaign.toObject();

  if (data.campaignEvidence) {
    for (const category of campaignEvidenceCategories) {
      data.campaignEvidence[category] = (
        data.campaignEvidence[category] || []
      ).map(({ storageKey, ...safeFile }) => safeFile);
    }
  }

  return data;
}

const campaignEvidenceDirectory = path.resolve(
  __dirname,
  "../../private/campaign-evidence"
);


async function requireVerifier(req, res, next) {
  try {
    const reviewer = await User.findById(req.user.id).select("_id role");

    if (!reviewer) {
      return res.status(401).json({
        success: false,
        message: "Reviewer account not found.",
      });
    }

    if (!["verifier", "admin"].includes(reviewer.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Verifier or admin role required.",
      });
    }

    req.reviewer = reviewer;
    next();
  } catch (error) {
    console.error("Verifier authorization error:", error);

    return res.status(500).json({
      success: false,
      message: "Could not verify reviewer permissions.",
    });
  }
}



// POST /api/campaigns

router.post(
  "/",
  authenticateToken,
  uploadCampaignSubmission,
  async (req, res) => {
    const session = await mongoose.startSession();
    let transactionCommitted = false;

    const removeUploadedFiles = async () => {
      const files = Object.values(req.files || {}).flat();

      await Promise.all(
        files.map((file) =>
          fs.promises.unlink(file.path).catch(() => {})
        )
      );
    };

    const fail = (status, message) => {
      const error = new Error(message);
      error.status = status;
      throw error;
    };

    try {
      const {
        title,
        description,
        disasterType,
        location,
        targetAmount,
        identityDocumentType,
        addressDocumentType,
      } = req.body;

      // 1. Validate campaign details.
      if (
        typeof title !== "string" ||
        typeof description !== "string" ||
        typeof disasterType !== "string" ||
        typeof location !== "string" ||
        targetAmount === undefined ||
        targetAmount === null
      ) {
        fail(
          400,
          "Title, description, disaster type, location, and target amount are required."
        );
      }

      const amount = Number(targetAmount);

      if (!Number.isFinite(amount) || amount < 1) {
        fail(400, "Target amount must be at least 1.");
      }

      const allowedDisasterTypes = [
        "flood",
        "earthquake",
        "cyclone",
        "wildfire",
        "drought",
        "landslide",
        "other",
      ];

      if (!allowedDisasterTypes.includes(disasterType)) {
        fail(400, "Invalid disaster type.");
      }

      if (title.trim().length < 10 || title.trim().length > 120) {
        fail(400, "Campaign title must contain 10 to 120 characters.");
      }

      if (
        description.trim().length < 30 ||
        description.trim().length > 5000
      ) {
        fail(400, "Description must contain 30 to 5000 characters.");
      }

      if (!location.trim() || location.trim().length > 200) {
        fail(400, "Location is required and must not exceed 200 characters.");
      }

      // 2. Collect campaign evidence.
      const evidenceCategories = [
        "disasterProof",
        "authorizationDocuments",
        "locationEvidence",
        "photosAndVideos",
        "additionalDocuments",
      ];

      const campaignEvidence = {};

      let totalEvidenceFiles = 0;

      for (const category of evidenceCategories) {
        const files = req.files?.[category] || [];

        campaignEvidence[category] = files.map((file) => ({
          originalName: path.basename(file.originalname),
          storageKey: path.basename(file.filename),
          mimeType: file.mimetype,
          size: file.size,
          contentHash: null,
          uploadedAt: new Date(),
        }));

        totalEvidenceFiles += files.length;
      }

      if (totalEvidenceFiles < 1) {
        fail(
          400,
          "Every campaign must include at least one evidence file."
        );
      }

      // 3. Start the database transaction.
      await session.withTransaction(async () => {
        const user = await User.findById(req.user.id)
          .select("_id role")
          .session(session);

        if (!user) {
          fail(401, "User account not found.");
        }

        if (!["donor", "creator"].includes(user.role)) {
          fail(403, "This account cannot submit campaigns.");
        }

        const existingVerification =
          await CreatorVerification.findOne({
            userId: user._id,
          }).session(session);

        let creatorVerificationStatus = "pending";

        const identityFile =
          req.files?.identityDocument?.[0];

        const addressFile =
          req.files?.addressDocument?.[0];

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

        // 4. Handle creator identity verification.
        if (existingVerification?.status === "pending") {
          fail(
            409,
            "Your creator verification is pending. Please wait for the verification decision before submitting another campaign."
          );
        }

        if (existingVerification?.status === "verified") {
          if (identityFile || addressFile) {
            fail(
              400,
              "Your identity is already verified. Do not upload identity documents again."
            );
          }

          creatorVerificationStatus = "verified";
        } else {
          // First-time creator or previously rejected creator.
          if (!identityFile || !addressFile) {
            fail(
              400,
              "Identity and address documents are both required for creator verification."
            );
          }

          if (
            !allowedIdentityTypes.includes(identityDocumentType) ||
            !allowedAddressTypes.includes(addressDocumentType)
          ) {
            fail(400, "Invalid identity or address document type.");
          }

          const verificationData = {
            identityDocument: {
              documentType: identityDocumentType,
              storageKey: path.basename(identityFile.filename),
            },
            addressDocument: {
              documentType: addressDocumentType,
              storageKey: path.basename(addressFile.filename),
            },
            status: "pending",
            reviewedBy: null,
            reviewedAt: null,
            rejectionReason: "",
          };

          if (existingVerification) {
            // Reuse the rejected verification record.
            Object.assign(existingVerification, verificationData);

            await existingVerification.save({ session });
          } else {
            // Create the first verification record.
            const verification = new CreatorVerification({
              userId: user._id,
              ...verificationData,
            });

            await verification.save({ session });
          }

          creatorVerificationStatus = "pending";
        }

        // 5. Create campaign in the same transaction.
        const campaign = new Campaign({
          title: title.trim(),
          description: description.trim(),
          disasterType,
          location: location.trim(),
          targetAmount: amount,
          currency: "USD",
          creator: user._id,
          status: "pending",
          creatorVerificationStatus,
          campaignEvidence,
        });

        await campaign.save({ session });

        // Return only safe campaign information.
        // Never expose private storage keys.
        req.createdCampaign = {
          id: campaign._id,
          title: campaign.title,
          disasterType: campaign.disasterType,
          location: campaign.location,
          targetAmount: campaign.targetAmount,
          currency: campaign.currency,
          status: campaign.status,
          creatorVerificationStatus:
            campaign.creatorVerificationStatus,
          createdAt: campaign.createdAt,
        };
      });

      transactionCommitted = true;

      return res.status(201).json({
        success: true,
        message: "Campaign submitted successfully for verification.",
        campaign: req.createdCampaign,
      });
    } catch (error) {
      if (!transactionCommitted) {
        await removeUploadedFiles();
      }

      if (
        error.status ||
        error.name === "ValidationError" ||
        error.name === "CastError"
      ) {
        return res.status(error.status || 400).json({
          success: false,
          message: error.status
            ? error.message
            : "Invalid campaign data.",
        });
      }

      if (error.code === 11000) {
        return res.status(409).json({
          success: false,
          message: "A creator verification record already exists.",
        });
      }

      console.error("Create campaign error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to submit campaign.",
      });
    } finally {
      await session.endSession();
    }
  }
);


/**
 * GET /api/campaigns/:id/evidence/:category/:evidenceId
 * Securely view campaign evidence (verifier/admin only)
 */
router.get(
  "/:id/evidence/:category/:evidenceId",
  authenticateToken,
  requireVerifier,
  async (req, res) => {
    try {
      const allowedCategories = campaignEvidenceCategories;

      const { id, category, evidenceId } = req.params;

      if (!allowedCategories.includes(category)) {
        return res.status(400).json({
          success: false,
          message: "Invalid evidence category",
        });
      }

      const campaign = await Campaign.findById(id);

      if (!campaign) {
        return res.status(404).json({
          success: false,
          message: "Campaign not found",
        });
      }

      // Evidence is available for review while the campaign is pending.
      if (campaign.status !== "pending") {
        return res.status(409).json({
          success: false,
          message: "Only pending campaign evidence can be reviewed",
        });
      }

      const evidence = campaign.campaignEvidence[category].id(evidenceId);

      if (!evidence || !evidence.storageKey) {
        return res.status(404).json({
          success: false,
          message: "Evidence file not found",
        });
      }

      const storageKey = evidence.storageKey;

      // Reject path traversal and unexpected filenames.
      if (path.basename(storageKey) !== storageKey) {
        return res.status(400).json({
          success: false,
          message: "Invalid evidence file reference",
        });
      }

      const filePath = path.resolve(
        campaignEvidenceDirectory,
        storageKey
      );

      const allowedDirectory = campaignEvidenceDirectory + path.sep;

      if (!filePath.startsWith(allowedDirectory)) {
        return res.status(403).json({
          success: false,
          message: "Invalid evidence path",
        });
      }

      const extension = path.extname(storageKey).toLowerCase();

      const contentTypes = {
        ".pdf": "application/pdf",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".mp4": "video/mp4",
      };

      const contentType = contentTypes[extension];

      if (!contentType) {
        return res.status(415).json({
          success: false,
          message: "Unsupported evidence format",
        });
      }

      const fileStat = await fs.promises.stat(filePath);

      if (!fileStat.isFile()) {
        return res.status(404).json({
          success: false,
          message: "Evidence file not found",
        });
      }

      res.set({
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename="campaign-evidence${extension}"`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      });

      return res.sendFile(filePath, (error) => {
        if (error) {
          console.error("Campaign evidence delivery error:", error);

          if (!res.headersSent) {
            res.status(500).json({
              success: false,
              message: "Could not retrieve campaign evidence",
            });
          }
        }
      });
    } catch (error) {
      if (error.name === "CastError") {
        return res.status(400).json({
          success: false,
          message: "Invalid campaign or evidence ID",
        });
      }

      if (error.code === "ENOENT") {
        return res.status(404).json({
          success: false,
          message: "Evidence file not found",
        });
      }

      console.error("Campaign evidence viewing error:", error);

      return res.status(500).json({
        success: false,
        message: "Could not retrieve campaign evidence",
      });
    }
  }
);


/**
 * GET /api/campaigns/my-campaigns
 * Get campaigns created by the logged-in user
 */
router.get("/my-campaigns", authenticateToken, async (req, res) => {
  try {
    const campaigns = await Campaign.find({
      creator: req.user.id,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: campaigns.length,
      campaigns: campaigns.map(serializeCampaign),
    });
  } catch (error) {
    console.error("Fetch my campaigns error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch your campaigns",
    });
  }
});


/**
 * GET /api/campaigns/pending
 * List pending campaigns for verifier/admin review
 */
router.get(
  "/pending",
  authenticateToken,
  requireVerifier,
  async (req, res) => {
    try {
      const campaigns = await Campaign.find({ status: "pending" })
        .populate("creator", "name")
        .sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        count: campaigns.length,
        campaigns: campaigns.map(serializeCampaign),
      });
    } catch (error) {
      console.error("Fetch pending campaigns error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch pending campaigns",
      });
    }
  }
);


/**
 * GET /api/campaigns
 * List all approved campaigns
 */
router.get("/", async (req, res) => {
  try {
    const campaigns = await Campaign.find({ status: "approved" })
      .populate("creator", "name")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: campaigns.length,
      campaigns: campaigns.map(serializeCampaign),
    });
  } catch (error) {
    console.error("Fetch campaigns error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch campaigns",
    });
  }
});

/**
 * GET /api/campaigns/pending
 * List pending campaigns for verifier/admin review
 */
router.get(
  "/pending",
  authenticateToken,
  requireVerifier,
  async (req, res) => {
    try {
      const campaigns = await Campaign.find({ status: "pending" })
        .populate("creator", "name")
        .sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        count: campaigns.length,
        campaigns: campaigns.map(serializeCampaign),
      });
    } catch (error) {
      console.error("Fetch pending campaigns error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch pending campaigns",
      });
    }
  }
);

/**
 * GET /api/campaigns/completed
 * Public list of completed campaigns
 */
router.get("/completed", async (req, res) => {
  try {
    const campaigns = await Campaign.find({ status: "completed" })
  .populate("creator", "name")
  .sort({ updatedAt: -1 })
  .select(
    "title description disasterType location targetAmount currency raisedAmount creator createdAt updatedAt campaignEvidence"
  );

    return res.status(200).json({
      success: true,
      count: campaigns.length,
      campaigns,
    });
  } catch (error) {
    console.error("Fetch completed campaigns error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch completed campaigns",
    });
  }
});

/**
 * GET /api/campaigns/:id
 * Get details of one approved campaign
 */
router.get("/:id", async (req, res) => {
  try {
    const campaign = await Campaign.findOne({
      _id: req.params.id,
      status: "approved",
    }).populate("creator", "name");

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: "Approved campaign not found",
      });
    }

    return res.status(200).json({
      success: true,
      campaign: serializeCampaign(campaign),
    });
  } catch (error) {
    // Invalid MongoDB ObjectId
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid campaign ID",
      });
    }

    console.error("Fetch campaign details error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch campaign details",
    });
  }
});


/**
 * GET /api/campaigns/:id/image/:category/:evidenceId
 * Publicly serve image evidence for approved and completed campaigns.
 *
 * Only photos, disaster proof and location images are allowed.
 * Identity documents, authorization documents, PDFs and videos
 * are never served through this endpoint.
 */
router.get("/:id/image/:category/:evidenceId", async (req, res) => {
  try {
    const { id, category, evidenceId } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(id) ||
      !mongoose.Types.ObjectId.isValid(evidenceId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid campaign or image ID",
      });
    }

    const publicImageCategories = [
      "photosAndVideos",
      "disasterProof",
      "locationEvidence",
    ];

    if (!publicImageCategories.includes(category)) {
      return res.status(403).json({
        success: false,
        message: "This evidence category is not publicly accessible",
      });
    }

    const campaign = await Campaign.findOne({
      _id: id,
      status: { $in: ["approved", "completed"] },
    });

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: "Approved campaign not found",
      });
    }

    const evidence = campaign.campaignEvidence?.[category]?.id(evidenceId);

    if (!evidence || !evidence.storageKey) {
      return res.status(404).json({
        success: false,
        message: "Campaign image not found",
      });
    }

    const allowedImages = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".webp": "image/webp",
      ".gif": "image/gif",
    };

    const storageKey = evidence.storageKey;

    if (path.basename(storageKey) !== storageKey) {
      return res.status(400).json({
        success: false,
        message: "Invalid image reference",
      });
    }

    const extension = path.extname(storageKey).toLowerCase();
    const expectedMimeType = allowedImages[extension];

    if (!expectedMimeType || evidence.mimeType !== expectedMimeType) {
      return res.status(415).json({
        success: false,
        message: "Unsupported image format",
      });
    }

    const filePath = path.resolve(campaignEvidenceDirectory, storageKey);
    const allowedDirectory = campaignEvidenceDirectory + path.sep;

    if (!filePath.startsWith(allowedDirectory)) {
      return res.status(403).json({
        success: false,
        message: "Invalid image path",
      });
    }

    const fileStat = await fs.promises.stat(filePath);

    if (!fileStat.isFile()) {
      return res.status(404).json({
        success: false,
        message: "Image file not found",
      });
    }

    res.set({
      "Content-Type": expectedMimeType,
      "Content-Disposition": `inline; filename="campaign-image${extension}"`,
      "Cache-Control": "public, max-age=3600",
      "X-Content-Type-Options": "nosniff",
    });

    return res.sendFile(filePath, (error) => {
      if (error) {
        console.error("Public campaign image error:", error);

        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            message: "Could not retrieve campaign image",
          });
        }
      }
    });
  } catch (error) {
    if (error.code === "ENOENT") {
      return res.status(404).json({
        success: false,
        message: "Image file not found",
      });
    }

    console.error("Public campaign image error:", error);

    return res.status(500).json({
      success: false,
      message: "Could not retrieve campaign image",
    });
  }
});


/**
 * PATCH /api/campaigns/:id/review
 * Approve or reject a campaign
 */
router.patch("/:id/review", authenticateToken, requireVerifier, async (req, res) => {
  try {
    const { status, notes } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be approved or rejected",
      });
    }

    const campaign = await Campaign.findById(req.params.id);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: "Campaign not found",
      });
    }

    if (campaign.status !== "pending") {
      return res.status(409).json({
        success: false,
        message: "Only pending campaigns can be reviewed",
      });
    }
    
    // Check the creator's actual identity verification record
    if (status === "approved") {
      const creatorVerification = await CreatorVerification.findOne({
        userId: campaign.creator,
      }).select("status");

      if (!creatorVerification) {
        return res.status(403).json({
          success: false,
          message: "Campaign cannot be approved because creator verification has not been submitted.",
        });
      }

      if (creatorVerification.status !== "verified") {
        return res.status(403).json({
          success: false,
          message: `Campaign cannot be approved. Creator verification status is ${creatorVerification.status}.`,
        });
      }

      // Keep the campaign's verification snapshot synchronized
      campaign.creatorVerificationStatus = "verified";
    }


    campaign.status = status;
    campaign.verification = {
      reviewedBy: req.reviewer._id,
      reviewedAt: new Date(),
      notes: typeof notes === "string" ? notes.trim() : "",
    };

    await campaign.save();

    return res.status(200).json({
      success: true,
      message: `Campaign ${status} successfully`,
      campaign: serializeCampaign(campaign),
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid campaign ID",
      });
    }

    console.error("Campaign review error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to review campaign",
    });
  }
});


module.exports = router;
