
const mongoose = require("mongoose");

const campaignSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 120,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 30,
      maxlength: 5000,
    },

    disasterType: {
      type: String,
      required: true,
      enum: [
        "flood",
        "earthquake",
        "cyclone",
        "wildfire",
        "drought",
        "landslide",
        "other",
      ],
    },

    location: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    targetAmount: {
      type: Number,
      required: true,
      min: 1,
    },

    currency: {
      type: String,
      default: "USD",
      enum: ["USD"],
    },

    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "completed"],
      default: "pending",
      index: true,
    },

    creatorVerificationStatus: {
  type: String,
  enum: ["pending", "verified", "rejected"],
  default: "pending",
  index: true,
},

    evidence: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
        },
        url: {
          type: String,
          required: true,
        },
        contentHash: {
          type: String,
          default: null,
        },
      },
    ],

    campaignEvidence: {
  disasterProof: [
    {
      originalName: { type: String, required: true, trim: true },
      storageKey: { type: String, required: true },
      mimeType: { type: String, required: true },
      size: { type: Number, required: true, min: 1 },
      contentHash: { type: String, default: null },
      uploadedAt: { type: Date, default: Date.now },
    },
  ],

  authorizationDocuments: [
    {
      originalName: { type: String, required: true, trim: true },
      storageKey: { type: String, required: true },
      mimeType: { type: String, required: true },
      size: { type: Number, required: true, min: 1 },
      contentHash: { type: String, default: null },
      uploadedAt: { type: Date, default: Date.now },
    },
  ],

  locationEvidence: [
    {
      originalName: { type: String, required: true, trim: true },
      storageKey: { type: String, required: true },
      mimeType: { type: String, required: true },
      size: { type: Number, required: true, min: 1 },
      contentHash: { type: String, default: null },
      uploadedAt: { type: Date, default: Date.now },
    },
  ],

  photosAndVideos: [
    {
      originalName: { type: String, required: true, trim: true },
      storageKey: { type: String, required: true },
      mimeType: { type: String, required: true },
      size: { type: Number, required: true, min: 1 },
      contentHash: { type: String, default: null },
      uploadedAt: { type: Date, default: Date.now },
    },
  ],

  additionalDocuments: [
    {
      originalName: { type: String, required: true, trim: true },
      storageKey: { type: String, required: true },
      mimeType: { type: String, required: true },
      size: { type: Number, required: true, min: 1 },
      contentHash: { type: String, default: null },
      uploadedAt: { type: Date, default: Date.now },
    },
  ],
},

    verification: {
      reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },
      reviewedAt: {
        type: Date,
        default: null,
      },
      notes: {
        type: String,
        default: "",
        maxlength: 2000,
      },
    },

    raisedAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Campaign", campaignSchema);
