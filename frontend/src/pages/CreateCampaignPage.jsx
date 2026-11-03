
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API_URL = "http://localhost:5000/api";

const evidenceCategories = [
  {
    name: "disasterProof",
    label: "Disaster Proof",
    description: "Official reports, news evidence, or disaster-related documents.",
  },
  {
    name: "authorizationDocuments",
    label: "Authorization Documents",
    description: "Permission letters or authorization documents, if applicable.",
  },
  {
    name: "locationEvidence",
    label: "Location Evidence",
    description: "Documents or photographs confirming the affected location.",
  },
  {
    name: "photosAndVideos",
    label: "Photos and Videos",
    description: "Photographs or videos showing the affected area and situation.",
  },
  {
    name: "additionalDocuments",
    label: "Additional Documents",
    description: "Any other supporting documents.",
  },
];

const identityTypes = [
  { value: "masked_aadhaar", label: "Masked Aadhaar" },
  { value: "passport", label: "Passport" },
  { value: "voter_id", label: "Voter ID" },
  { value: "driving_license", label: "Driving License" },
  { value: "other", label: "Other" },
];

const addressTypes = [
  ...identityTypes.slice(0, 4),
  { value: "utility_bill", label: "Utility Bill" },
  { value: "bank_statement", label: "Bank Statement" },
  { value: "other", label: "Other" },
];

export default function CreateCampaignPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [verificationStatus, setVerificationStatus] = useState(null);
  const [checkingVerification, setCheckingVerification] = useState(true);
  const [verificationError, setVerificationError] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const checkVerification = async () => {
      const token = sessionStorage.getItem("token");

      try {
        const response = await fetch(
          `${API_URL}/creator-verification/status`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (response.status === 404 && data.status === "not_submitted") {
          setVerificationStatus("not_submitted");
          return;
        }

        if (!response.ok) {
          throw new Error(
            data.message || "Could not check creator verification status."
          );
        }

        setVerificationStatus(data.verification?.status);
      } catch (err) {
        setVerificationError(err.message);
      } finally {
        setCheckingVerification(false);
      }
    };

    checkVerification();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const form = event.currentTarget;
    const formData = new FormData(form);

    const evidenceFields = evidenceCategories.map((item) => item.name);

    const evidenceFiles = evidenceFields.flatMap((field) =>
      formData.getAll(field).filter((file) => file instanceof File && file.name)
    );

    if (evidenceFiles.length === 0) {
      setError("Please upload at least one campaign evidence file.");
      return;
    }

    let totalFiles = evidenceFiles.length;

    if (verificationStatus !== "verified") {
      const identityFile = formData.get("identityDocument");
      const addressFile = formData.get("addressDocument");

      if (!identityFile?.name || !addressFile?.name) {
        setError("Please upload both identity and address documents.");
        return;
      }

      if (
        identityFile.size > 5 * 1024 * 1024 ||
        addressFile.size > 5 * 1024 * 1024
      ) {
        setError("Identity and address documents must be 5 MB or smaller.");
        return;
      }

      totalFiles += 2;
    }

    if (totalFiles > 20) {
      setError("You can upload a maximum of 20 files per submission.");
      return;
    }

    for (const category of evidenceCategories) {
      const files = formData
        .getAll(category.name)
        .filter((file) => file instanceof File && file.name);

      if (files.length > 5) {
        setError(`Maximum 5 files allowed in ${category.label}.`);
        return;
      }

      for (const file of files) {
        if (file.size > 10 * 1024 * 1024) {
          setError(`${file.name} exceeds the 10 MB file size limit.`);
          return;
        }
      }
    }

    const token = sessionStorage.getItem("token");

    try {
      setSubmitting(true);

      const response = await fetch(`${API_URL}/campaigns`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Campaign submission failed.");
      }

      setSuccess(data.message || "Campaign submitted successfully.");
      form.reset();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (checkingVerification) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-emerald-800 font-medium">
          Checking creator verification status...
        </p>
      </div>
    );
  }

  if (verificationError) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-red-700">{verificationError}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-lg bg-emerald-700 px-5 py-2 text-white"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (verificationStatus === "pending") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-lg rounded-xl border border-amber-200 bg-amber-50 p-8 text-center">
          <h2 className="text-2xl font-bold text-amber-900">
            Verification Pending
          </h2>
          <p className="mt-3 text-amber-800">
            Your creator identity verification is currently under review.
            Please wait for the verification decision before submitting
            another campaign.
          </p>
          <button
            onClick={() => navigate("/my-campaigns")}
            className="mt-6 rounded-lg bg-emerald-700 px-5 py-3 text-white"
          >
            View My Campaigns
          </button>
        </div>
      </div>
    );
  }

  if (
    !["not_submitted", "verified", "rejected"].includes(
      verificationStatus
    )
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <p className="text-red-700">
          Unknown creator verification status. Please contact support.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            Create a Relief Campaign
          </h1>
          <p className="mt-2 text-slate-600">
            Share accurate information and supporting documents to help
            people understand your relief campaign.
          </p>
        </div>

        {verificationStatus === "verified" && (
          <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
            Your creator identity is verified. You do not need to upload
            identity or address documents again.
          </div>
        )}

        {verificationStatus === "rejected" && (
          <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800">
            Your previous verification was rejected. Please upload your
            identity and address documents again with your new campaign.
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
        >
          {/* Campaign information */}
          <section>
            <h2 className="text-xl font-semibold text-slate-900">
              1. Campaign Information
            </h2>

            <div className="mt-5 space-y-5">
              <div>
                <label className="mb-2 block font-medium text-slate-700">
                  Campaign Title *
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  minLength={10}
                  maxLength={120}
                  placeholder="Enter your campaign title"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-emerald-600"
                />
                <p className="mt-1 text-sm text-slate-500">
                  10–120 characters
                </p>
              </div>

              <div>
                <label className="mb-2 block font-medium text-slate-700">
                  Campaign Description *
                </label>
                <textarea
                  name="description"
                  required
                  minLength={30}
                  maxLength={5000}
                  rows={6}
                  placeholder="Explain the disaster, affected people, relief activities and how donations will be used."
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-emerald-600"
                />
                <p className="mt-1 text-sm text-slate-500">
                  30–5000 characters
                </p>
              </div>

              <div>
                <label className="mb-2 block font-medium text-slate-700">
                  Disaster Type *
                </label>
                <select
                  name="disasterType"
                  required
                  defaultValue=""
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-emerald-600"
                >
                  <option value="" disabled>
                    Select disaster type
                  </option>
                  <option value="flood">Flood</option>
                  <option value="earthquake">Earthquake</option>
                  <option value="cyclone">Cyclone</option>
                  <option value="wildfire">Wildfire</option>
                  <option value="drought">Drought</option>
                  <option value="landslide">Landslide</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block font-medium text-slate-700">
                  Campaign Location *
                </label>
                <input
                  type="text"
                  name="location"
                  required
                  maxLength={200}
                  placeholder="e.g. Gorakhpur, Uttar Pradesh, India"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="mb-2 block font-medium text-slate-700">
                  Target Amount (USD) *
                </label>
                <input
                  type="number"
                  name="targetAmount"
                  required
                  min="1"
                  step="0.01"
                  placeholder="Enter target amount"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-emerald-600"
                />
                <p className="mt-1 text-sm text-slate-500">
                  The current backend stores campaign targets in USD.
                </p>
              </div>
            </div>
          </section>

          <div className="border-t border-slate-200" />

          {/* Creator verification */}
          {verificationStatus !== "verified" && (
            <>
              <section>
                <h2 className="text-xl font-semibold text-slate-900">
                  2. Creator Identity Verification
                </h2>

                <p className="mt-2 text-sm text-slate-600">
                  Upload your identity and address documents. These files
                  are stored privately and reviewed by an authorized verifier.
                </p>

                <div className="mt-5 space-y-5">
                  <div>
                    <label className="mb-2 block font-medium text-slate-700">
                      Identity Document Type *
                    </label>
                    <select
                      name="identityDocumentType"
                      required
                      defaultValue=""
                      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3"
                    >
                      <option value="" disabled>
                        Select identity document
                      </option>
                      {identityTypes.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block font-medium text-slate-700">
                      Upload Identity Document *
                    </label>
                    <input
                      type="file"
                      name="identityDocument"
                      required
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="w-full rounded-lg border border-slate-300 p-3"
                    />
                    <p className="mt-1 text-sm text-slate-500">
                      PDF, JPG or PNG. Maximum 5 MB.
                    </p>
                  </div>

                  <div>
                    <label className="mb-2 block font-medium text-slate-700">
                      Address Document Type *
                    </label>
                    <select
                      name="addressDocumentType"
                      required
                      defaultValue=""
                      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3"
                    >
                      <option value="" disabled>
                        Select address document
                      </option>
                      {addressTypes.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block font-medium text-slate-700">
                      Upload Address Document *
                    </label>
                    <input
                      type="file"
                      name="addressDocument"
                      required
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="w-full rounded-lg border border-slate-300 p-3"
                    />
                    <p className="mt-1 text-sm text-slate-500">
                      PDF, JPG or PNG. Maximum 5 MB.
                    </p>
                  </div>
                </div>
              </section>

              <div className="border-t border-slate-200" />
            </>
          )}

          {/* Campaign evidence */}
          <section>
            <h2 className="text-xl font-semibold text-slate-900">
              {verificationStatus === "verified"
                ? "2. Campaign Supporting Evidence"
                : "3. Campaign Supporting Evidence"}
            </h2>

            <p className="mt-2 text-sm text-slate-600">
              Upload at least one supporting evidence file. You can upload
              up to five files in each category.
            </p>

            <div className="mt-5 space-y-6">
              {evidenceCategories.map((category) => (
                <div key={category.name}>
                  <label className="mb-1 block font-medium text-slate-700">
                    {category.label}
                  </label>
                  <p className="mb-2 text-sm text-slate-500">
                    {category.description}
                  </p>
                  <input
                    type="file"
                    name={category.name}
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png,.mp4"
                    className="w-full rounded-lg border border-slate-300 p-3"
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    PDF, JPG, PNG or MP4. Maximum 5 files, 10 MB each.
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Feedback */}
          {error && (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          {success && (
            <div
              role="status"
              className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-800"
            >
              <p className="font-semibold">{success}</p>
              <p className="mt-1 text-sm">
                Your campaign is awaiting review. It will not appear in
                public campaigns until it is approved.
              </p>
              <button
                type="button"
                onClick={() => navigate("/my-campaigns")}
                className="mt-4 rounded-lg bg-emerald-700 px-5 py-2 text-white hover:bg-emerald-800"
              >
                View My Campaigns
              </button>
            </div>
          )}

          <div className="border-t border-slate-200 pt-6">
            <p className="mb-4 text-sm text-slate-500">
              By submitting, you confirm that the information and documents
              provided are accurate and genuine.
            </p>

            <button
              type="submit"
              disabled={submitting || Boolean(success)}
              className="w-full rounded-lg bg-emerald-700 px-6 py-3 font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {submitting ? "Submitting Campaign..." : "Submit Campaign"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
