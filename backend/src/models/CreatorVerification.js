
const mongoose = require("mongoose");

const creatorVerificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    identityDocument: {
      documentType: {
        type: String,
        enum: [
          "masked_aadhaar",
          "passport",
          "voter_id",
          "driving_license",
          "other",
        ],
        required: true,
      },
      storageKey: {
        type: String,
        required: true,
      },
    },

    addressDocument: {
      documentType: {
        type: String,
        enum: [
          "masked_aadhaar",
          "passport",
          "voter_id",
          "driving_license",
          "utility_bill",
          "bank_statement",
          "other",
        ],
        required: true,
      },
      storageKey: {
        type: String,
        required: true,
      },
    },

    status: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
      index: true,
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    reviewedAt: {
      type: Date,
      default: null,
    },

    rejectionReason: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "CreatorVerification",
  creatorVerificationSchema
);
