
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  RefreshCw,
  ShieldCheck,
  Clock,
  FileText,
  User,
  CalendarDays,
  MapPin,
  Target,
  CheckCircle,
} from "lucide-react";

const API_URL = "http://localhost:5000/api";

export default function VerifierDashboard() {
  const [requests, setRequests] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(null);
const [previewLoading, setPreviewLoading] = useState(false);
const [previewError, setPreviewError] = useState("");
const [reviewingCampaignId, setReviewingCampaignId] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const token = sessionStorage.getItem("token");

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [verificationResponse, campaignResponse] =
        await Promise.all([
          fetch(`${API_URL}/creator-verification/pending`, { headers }),
          fetch(`${API_URL}/campaigns/pending`, { headers }),
        ]);

      const verificationData = await verificationResponse.json();
      const campaignData = await campaignResponse.json();

      if (!verificationResponse.ok) {
        throw new Error(
          verificationData.message || "Unable to fetch verification requests"
        );
      }

      if (!campaignResponse.ok) {
        throw new Error(
          campaignData.message || "Unable to fetch pending campaigns"
        );
      }

      setRequests(verificationData.requests || []);
      setCampaigns(campaignData.campaigns || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


  const handlePreviewEvidence = async (campaignId, category, file) => {
    try {
      setPreviewLoading(true);
      setPreviewError("");

      const token = sessionStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/campaigns/${campaignId}/evidence/${category}/${file._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Unable to load evidence");
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);

      setPreview((previous) => {
        if (previous?.url) {
          URL.revokeObjectURL(previous.url);
        }

        return {
          url: objectUrl,
          mimeType: blob.type,
          fileName: file.originalName,
        };
      });
    } catch (err) {
      setPreviewError(err.message);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleCampaignReview = async (campaignId, status, rejectionReason = "") => {
  try {
    setReviewingCampaignId(campaignId);
    setError("");

    const token = sessionStorage.getItem("token");

    const response = await fetch(
      `${API_URL}/campaigns/${campaignId}/review`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status,
          ...(status === "rejected" && { rejectionReason }),
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Campaign review failed");
    }

    await fetchDashboardData();
  } catch (err) {
    setError(err.message);
  } finally {
    setReviewingCampaignId(null);
  }
};

  const closePreview = () => {
  setPreview(null);
  setPreviewError("");
};


  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
  return () => {
    if (preview?.url) {
      URL.revokeObjectURL(preview.url);
    }
  };
}, [preview?.url]);

  const formatDate = (date) => {
    if (!date) return "Not available";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatAmount = (amount, currency = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount || 0);
  };

  const evidenceCategories = [
    { key: "disasterProof", label: "Disaster Proof" },
    { key: "authorizationDocuments", label: "Authorization Documents" },
    { key: "locationEvidence", label: "Location Evidence" },
    { key: "photosAndVideos", label: "Photos and Videos" },
    { key: "additionalDocuments", label: "Additional Documents" },
  ];

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <RefreshCw className="animate-spin text-green-700" size={28} />
        <p className="ml-3 text-gray-600">Loading verifier dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-6xl">

        <Link
          to="/"
          className="mb-8 inline-flex items-center gap-2 text-green-700 hover:underline"
        >
          <ArrowLeft size={18} />
          Back to Home
        </Link>

        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Verifier Dashboard
            </h1>
            <p className="mt-2 text-gray-600">
              Review creator identities and disaster relief campaigns.
            </p>
          </div>

          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-700 px-5 py-3 font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
          >
            <RefreshCw size={17} />
            Refresh
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-xl bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {/* Dashboard summary */}
        <div className="mb-10 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Pending Creator Verifications
            </p>
            <h2 className="mt-2 text-3xl font-bold text-yellow-600">
              {requests.length}
            </h2>
          </div>
          

          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Pending Campaigns
            </p>
            <h2 className="mt-2 text-3xl font-bold text-yellow-600">
              {campaigns.length}
            </h2>
          </div>
        </div>

        {/* Creator verification section */}
        <section className="mb-12">
          <div className="mb-5">
            <h2 className="text-2xl font-bold text-gray-900">
              Creator Verification Requests
            </h2>
            <p className="mt-1 text-gray-500">
              Pending identity and address document reviews.
            </p>
          </div>

          {requests.length === 0 ? (
            <div className="rounded-2xl border border-gray-100 bg-white px-5 py-12 text-center shadow-sm">
              <ShieldCheck size={40} className="mx-auto mb-3 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-800">
                No Pending Requests
              </h3>
              <p className="mt-2 text-gray-500">
                All creator verification requests have been reviewed.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
                >
                  <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700">
                    <Clock size={13} className="mr-1 inline" />
                    Pending
                  </span>

                  <h3 className="mt-4 flex items-center gap-2 text-xl font-bold text-gray-900">
                    <User size={19} />
                    {request.creator?.name || "Unknown Creator"}
                  </h3>

                  <p className="mt-3 text-sm text-gray-500">
                    Submitted: {formatDate(request.submittedAt)}
                  </p>

                  <div className="mt-4 space-y-2 border-t pt-4 text-sm">
                    <p>
                      Identity:{" "}
                      <span className="font-medium capitalize">
                        {(request.identityDocumentType || "").replaceAll("_", " ")}
                      </span>
                    </p>
                    <p>
                      Address:{" "}
                      <span className="font-medium capitalize">
                        {(request.addressDocumentType || "").replaceAll("_", " ")}
                      </span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Campaign review section */}
        <section>
          <div className="mb-5">
            <h2 className="text-2xl font-bold text-gray-900">
              Pending Campaign Reviews
            </h2>
            <p className="mt-1 text-gray-500">
              Review campaign details and uploaded supporting evidence.
            </p>
          </div>

          {campaigns.length === 0 ? (
            <div className="rounded-2xl border border-gray-100 bg-white px-5 py-12 text-center shadow-sm">
              <CheckCircle size={40} className="mx-auto mb-3 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-800">
                No Pending Campaigns
              </h3>
              <p className="mt-2 text-gray-500">
                There are no campaigns waiting for review.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {campaigns.map((campaign) => (
                <div
                  key={campaign._id}
                  className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
                >
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700">
                      <Clock size={13} className="mr-1 inline" />
                      Pending Review
                    </span>

                    <span className="text-xs text-gray-400">
                      {formatDate(campaign.createdAt)}
                    </span>
                  </div>

                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium capitalize text-emerald-700">
                    {campaign.disasterType}
                  </span>

                  <h3 className="mt-4 text-xl font-bold text-gray-900">
                    {campaign.title}
                  </h3>

                  <p className="mt-2 line-clamp-3 text-sm text-gray-600">
                    {campaign.description}
                  </p>

                  <div className="mt-4 space-y-2 text-sm text-gray-500">
                    <p className="flex items-center gap-2">
                      <User size={16} />
                      Creator: {campaign.creator?.name || "Unknown"}
                    </p>

                    <p className="flex items-center gap-2">
                      <MapPin size={16} />
                      {campaign.location}
                    </p>

                    <p className="flex items-center gap-2">
                      <Target size={16} />
                      Target: {formatAmount(
                        campaign.targetAmount,
                        campaign.currency
                      )}
                    </p>

                    <p className="flex items-center gap-2">
                      <CalendarDays size={16} />
                      Submitted: {formatDate(campaign.createdAt)}
                    </p>
                  </div>

                  <div className="mt-5 rounded-lg bg-gray-50 p-4">
                    <h4 className="mb-3 font-semibold text-gray-800">
                      Uploaded Evidence
                    </h4>

                    {evidenceCategories.map((category) => {
                      const files =
                        campaign.campaignEvidence?.[category.key] || [];

                      return (
                        <div
                          key={category.key}
                          className="mb-3 last:mb-0"
                        >
                          <p className="text-sm font-medium text-gray-700">
                            {category.label} ({files.length})
                          </p>

                          {files.length > 0 ? (
                            <ul className="mt-1 space-y-1">
                              {files.map((file) => (
  <li key={file._id}>
    <button
      type="button"
      onClick={() =>
        handlePreviewEvidence(campaign._id, category.key, file)
      }
      className="flex items-center gap-2 text-left text-xs text-emerald-700 hover:underline"
    >
      <FileText size={14} />
      {file.originalName}
    </button>
  </li>
))}
                            </ul>
                          ) : (
                            <p className="mt-1 text-xs text-gray-400">
                              No files uploaded
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-5 border-t border-gray-100 pt-4">
                    <p className="text-sm text-gray-600">
                      Creator verification:{" "}
                      <span className={`font-semibold ${
                        campaign.creatorVerificationStatus === "verified"
                          ? "text-green-700"
                          : "text-yellow-700"
                      }`}>
                        {campaign.creatorVerificationStatus || "Not available"}
                      </span>
                    </p>
                  </div>

                  <div className="mt-5 flex gap-3">
  <button
    type="button"
    onClick={() =>
      handleCampaignReview(campaign._id, "approved")
    }
    disabled={reviewingCampaignId === campaign._id}
    className="flex-1 rounded-lg bg-green-700 px-4 py-2 font-semibold text-white hover:bg-green-800 disabled:opacity-50"
  >
    {reviewingCampaignId === campaign._id ? "Processing..." : "Approve"}
  </button>

  <button
    type="button"
    onClick={() => {
      const reason = window.prompt("Enter rejection reason:");

      if (reason === null) return;

      if (!reason.trim()) {
        alert("Rejection reason is required.");
        return;
      }

      handleCampaignReview(campaign._id, "rejected", reason.trim());
    }}
    disabled={reviewingCampaignId === campaign._id}
    className="flex-1 rounded-lg bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700 disabled:opacity-50"
  >
    Reject
  </button>
</div>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
      {(preview || previewLoading || previewError) && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
    <div className="relative flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

      {/* Modal Header */}
      <div className="flex items-center justify-between border-b p-4">
        <h3 className="truncate pr-4 font-semibold text-gray-800">
          {preview?.fileName || "Evidence Preview"}
        </h3>

        <button
          type="button"
          onClick={closePreview}
          className="rounded-lg px-3 py-1 text-2xl text-gray-500 hover:bg-gray-100 hover:text-gray-900"
          aria-label="Close preview"
        >
          ×
        </button>
      </div>

      {/* Preview Content */}
      <div className="flex min-h-[300px] items-center justify-center overflow-auto bg-gray-100 p-4">

        {previewLoading ? (
          <p className="text-gray-600">Loading evidence...</p>
        ) : previewError ? (
          <p className="text-red-600">{previewError}</p>
        ) : preview?.mimeType?.startsWith("image/") ? (
          <img
            src={preview.url}
            alt={preview.fileName}
            className="max-h-[75vh] max-w-full rounded-lg object-contain"
          />
        ) : preview?.mimeType === "application/pdf" ? (
          <iframe
            src={preview.url}
            title={preview.fileName}
            className="h-[75vh] w-full rounded-lg bg-white"
          />
        ) : preview?.mimeType?.startsWith("video/") ? (
          <video
            src={preview.url}
            controls
            className="max-h-[75vh] max-w-full rounded-lg"
          />
        ) : (
          <p className="text-gray-600">
            Preview is not available for this file type.
          </p>
        )}

      </div>
    </div>
  </div>
)}
    </div>
  );
}
