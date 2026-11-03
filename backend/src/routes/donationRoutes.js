const express = require("express");
const mongoose = require("mongoose");

const Donation = require("../models/Donation");
const Campaign = require("../models/Campaign");
const { authenticateToken } = require("../middleware/authMiddleware");

const router = express.Router();

// Create a donation
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { campaignId, amount } = req.body;

    // Validate required fields
    if (!campaignId || !amount) {
      return res.status(400).json({
        success: false,
        message: "Campaign ID and donation amount are required",
      });
    }

    // Validate campaign ID
    if (!mongoose.Types.ObjectId.isValid(campaignId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid campaign ID",
      });
    }

    // Validate amount
    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Donation amount must be greater than zero",
      });
    }

    // Check whether campaign exists and is approved
    const campaign = await Campaign.findOne({
      _id: campaignId,
      status: "approved",
    });

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: "Approved campaign not found",
      });
    }

    // Create pending donation
    const donation = await Donation.create({
      donor: req.user.id,
      campaign: campaign._id,
      amount,
      currency: "USD",
      paymentMethod: "mock",
      status: "pending",
    });

    return res.status(201).json({
      success: true,
      message: "Donation created. Payment confirmation is pending.",
      donation,
    });
  } catch (error) {
    console.error("Donation creation error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while creating donation",
    });
  }
});

// Confirm a donation (mock payment)
router.patch("/:id/confirm", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Validate donation ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid donation ID"
      });
    }

    // Find donation belonging to the logged-in user
    const donation = await Donation.findOne({
      _id: id,
      donor: req.user.id
    });

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: "Donation not found"
      });
    }

    // Prevent confirming an already processed donation
    if (donation.status !== "pending") {
      return res.status(409).json({
        success: false,
        message: "Donation has already been processed"
      });
    }

    // Confirm donation
    donation.status = "confirmed";
    donation.confirmedAt = new Date();

    await donation.save();

    // Update campaign's raised amount
const updatedCampaign = await Campaign.findByIdAndUpdate(
  donation.campaign,
  {
    $inc: { raisedAmount: donation.amount }
  },
  { new: true }
);

// Automatically complete campaign when target is reached
if (
  updatedCampaign &&
  updatedCampaign.raisedAmount >= updatedCampaign.targetAmount
) {
  updatedCampaign.status = "completed";
  await updatedCampaign.save();
}

    return res.status(200).json({
      success: true,
      message: "Donation confirmed successfully",
      donation
    });

  } catch (error) {
    console.error("Donation confirmation error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while confirming donation"
    });
  }
});

// Get logged-in user's donation history
router.get("/my-donations", authenticateToken, async (req, res) => {
  try {
    const donations = await Donation.find({
      donor: req.user.id,
    })
      .populate("campaign", "title location status")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: donations.length,
      donations,
    });
  } catch (error) {
    console.error("Donation history error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching donations",
    });
  }
});

// Get confirmed donation history for a campaign
router.get("/campaign/:campaignId", async (req, res) => {
  try {
    const { campaignId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(campaignId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid campaign ID"
      });
    }

    const campaign = await Campaign.findOne({
      _id: campaignId,
      status: "approved"
    });

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: "Approved campaign not found"
      });
    }

    const donations = await Donation.find({
      campaign: campaignId,
      status: "confirmed"
    })
      .select("amount currency status paymentMethod confirmedAt createdAt")
      .sort({ confirmedAt: -1 });

    return res.status(200).json({
      success: true,
      count: donations.length,
      donations
    });

  } catch (error) {
    console.error("Campaign donation history error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching campaign donations"
    });
  }
});

// Get campaign donation summary
router.get("/campaign/:campaignId/summary", async (req, res) => {
  try {
    const { campaignId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(campaignId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid campaign ID"
      });
    }

    const campaign = await Campaign.findOne({
      _id: campaignId,
      status: "approved"
    });

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: "Approved campaign not found"
      });
    }

    const donations = await Donation.find({
      campaign: campaignId
    });

    const confirmedDonations = donations.filter(
      donation => donation.status === "confirmed"
    );

    const pendingDonations = donations.filter(
      donation => donation.status === "pending"
    );

    const totalRaised = confirmedDonations.reduce(
      (total, donation) => total + donation.amount,
      0
    );

    const pendingAmount = pendingDonations.reduce(
      (total, donation) => total + donation.amount,
      0
    );

    const uniqueDonors = new Set(
      confirmedDonations.map(donation => donation.donor.toString())
    ).size;

    const progressPercentage =
      campaign.targetAmount > 0
        ? Number(((totalRaised / campaign.targetAmount) * 100).toFixed(2))
        : 0;

    return res.status(200).json({
      success: true,
      summary: {
        campaignId: campaign._id,
        campaignTitle: campaign.title,
        targetAmount: campaign.targetAmount,
        totalRaised,
        pendingAmount,
        totalDonations: confirmedDonations.length,
        uniqueDonors,
        progressPercentage
      }
    });

  } catch (error) {
    console.error("Campaign summary error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching campaign summary"
    });
  }
});

module.exports = router;