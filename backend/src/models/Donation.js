const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema(
  {
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    campaign: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campaign",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: [0.01, "Donation amount must be greater than zero"],
    },

    currency: {
      type: String,
      default: "USD",
      enum: ["USD"],
    },

    paymentMethod: {
      type: String,
      enum: ["mock", "blockchain"],
      default: "mock",
    },

    status: {
      type: String,
      enum: ["pending", "confirmed", "failed"],
      default: "pending",
    },

    transactionHash: {
      type: String,
      default: undefined,
    },

    walletAddress: {
      type: String,
      default: null,
    },

    confirmedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Donation", donationSchema);