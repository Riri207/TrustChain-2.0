
const express = require("express");
const Campaign = require("../models/Campaign");
const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

function requireVerifier(req, res, next) {
  if (!req.user || !["verifier", "admin"].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: "Access denied. Verifier or admin role required.",
    });
  }

  next();
}


// POST /api/campaigns
router.post("/", authenticateToken, async (req, res) => {
  try {
    const {
      title,
      description,
      disasterType,
      location,
      targetAmount,
    } = req.body;

    // 1. Validate required fields
    if (
      typeof title !== "string" ||
      typeof description !== "string" ||
      typeof disasterType !== "string" ||
      typeof location !== "string" ||
      targetAmount === undefined ||
      targetAmount === null
    ) {
      return res.status(400).json({
        message:
          "Title, description, disaster type, location, and target amount are required",
      });
    }

    // 2. Validate target amount
    const amount = Number(targetAmount);

    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({
        message: "Target amount must be a positive number",
      });
    }

    // 3. Create campaign
    const campaign = await Campaign.create({
      title: title.trim(),
      description: description.trim(),
      disasterType,
      location: location.trim(),
      targetAmount: amount,
      creator: req.user.id,
      status: "pending",
    });

    return res.status(201).json({
      message: "Campaign submitted for verification",
      campaign,
    });
  } catch (error) {
    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid campaign data",
        errors: error.message,
      });
    }

    console.error("Create campaign error:", error.message);

    return res.status(500).json({
      message: "Failed to create campaign",
    });
  }
});


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
      campaigns,
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
      campaign,
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

    campaign.status = status;
    campaign.verification = {
      reviewedBy: req.user.id,
      reviewedAt: new Date(),
      notes: typeof notes === "string" ? notes.trim() : "",
    };

    await campaign.save();

    return res.status(200).json({
      success: true,
      message: `Campaign ${status} successfully`,
      campaign,
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
