
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  ArrowLeft,
  Plus,
  MapPin,
  CalendarDays,
  Target,
  RefreshCw,
  CheckCircle,
  Clock,
  XCircle,
  FileText,
} from "lucide-react";

const API_URL = "http://localhost:5000/api/campaigns";

export default function MyCampaigns() {
  const { user } = useAuth();

  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        setLoading(true);
        setError("");

        const token = sessionStorage.getItem("token");

        const response = await fetch(`${API_URL}/my-campaigns`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to fetch campaigns");
        }

        setCampaigns(data.campaigns || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

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

  const getStatus = (status) => {
    switch (status) {
      case "approved":
        return {
          label: "Approved",
          icon: CheckCircle,
          style: "bg-green-100 text-green-700",
        };

      case "pending":
        return {
          label: "Pending Review",
          icon: Clock,
          style: "bg-yellow-100 text-yellow-700",
        };

      case "rejected":
        return {
          label: "Rejected",
          icon: XCircle,
          style: "bg-red-100 text-red-700",
        };

      default:
        return {
          label: status,
          icon: FileText,
          style: "bg-gray-100 text-gray-700",
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCw className="animate-spin text-green-700" size={28} />
        <p className="ml-3 text-gray-600">Loading your campaigns...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <p className="mb-4 text-red-600">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="rounded-lg bg-green-700 px-5 py-2 text-white"
        >
          Try Again
        </button>
      </div>
    );
  }

  const pendingCount = campaigns.filter(
    (campaign) => campaign.status === "pending"
  ).length;

  const approvedCount = campaigns.filter(
    (campaign) => campaign.status === "approved"
  ).length;

  const rejectedCount = campaigns.filter(
    (campaign) => campaign.status === "rejected"
  ).length;

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

        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              My Campaigns
            </h1>
            <p className="mt-2 text-gray-600">
              Welcome{user?.name ? `, ${user.name}` : ""}. Manage your campaign submissions.
            </p>
          </div>

          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-700 px-6 py-3 font-semibold text-white hover:bg-emerald-800"
          >
            <Plus size={18} />
            Create Campaign
          </Link>
        </div>

        {/* Summary */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">

          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Pending Review</p>
            <h2 className="mt-2 text-3xl font-bold text-yellow-600">
              {pendingCount}
            </h2>
          </div>

          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Approved Campaigns</p>
            <h2 className="mt-2 text-3xl font-bold text-green-700">
              {approvedCount}
            </h2>
          </div>

          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Rejected Campaigns</p>
            <h2 className="mt-2 text-3xl font-bold text-red-600">
              {rejectedCount}
            </h2>
          </div>

        </div>

        {/* Campaign list */}
        {campaigns.length === 0 ? (
          <div className="rounded-2xl border border-gray-100 bg-white px-5 py-16 text-center shadow-sm">
            <FileText size={44} className="mx-auto mb-4 text-gray-300" />

            <h2 className="text-xl font-semibold text-gray-800">
              No campaigns yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-gray-500">
              You haven't submitted any campaigns. Create your first campaign to start making an impact.
            </p>

            <Link
              to="/"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-emerald-700 px-6 py-3 font-semibold text-white hover:bg-emerald-800"
            >
              <Plus size={18} />
              Create Your First Campaign
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">

            {campaigns.map((campaign) => {
              const status = getStatus(campaign.status);
              const StatusIcon = status.icon;

              const progress =
                campaign.targetAmount > 0
                  ? Math.min(
                      (campaign.raisedAmount / campaign.targetAmount) * 100,
                      100
                    )
                  : 0;

              return (
                <div
                  key={campaign._id}
                  className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
                >
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium capitalize text-emerald-700">
                      {campaign.disasterType}
                    </span>

                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${status.style}`}
                    >
                      <StatusIcon size={14} />
                      {status.label}
                    </span>
                  </div>

                  <h2 className="text-xl font-bold text-gray-900">
                    {campaign.title}
                  </h2>

                  <p className="mt-2 line-clamp-3 text-sm text-gray-600">
                    {campaign.description}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1.5">
                      <MapPin size={16} />
                      {campaign.location}
                    </span>

                    <span className="flex items-center gap-1.5">
                      <CalendarDays size={16} />
                      {formatDate(campaign.createdAt)}
                    </span>
                  </div>

                  <div className="mt-6 border-t border-gray-100 pt-5">
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1.5 text-gray-600">
                        <Target size={16} />
                        Fundraising Progress
                      </span>

                      <span className="font-semibold text-gray-800">
                        {progress.toFixed(1)}%
                      </span>
                    </div>

                    <div className="h-2.5 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-emerald-600"
                        style={{ width: `${progress}%` }}
                      />
                    </div>

                    <div className="mt-3 flex justify-between text-sm">
                      <span className="font-semibold text-emerald-700">
                        {formatAmount(
                          campaign.raisedAmount,
                          campaign.currency
                        )}
                      </span>

                      <span className="text-gray-500">
                        Goal: {formatAmount(
                          campaign.targetAmount,
                          campaign.currency
                        )}
                      </span>
                    </div>
                  </div>

                  {campaign.status === "rejected" &&
                    campaign.verification?.notes && (
                      <div className="mt-5 rounded-lg bg-red-50 p-4">
                        <p className="text-sm font-semibold text-red-800">
                          Verification Feedback
                        </p>
                        <p className="mt-1 text-sm text-red-700">
                          {campaign.verification.notes}
                        </p>
                      </div>
                    )}

                  {campaign.status === "approved" &&
                    campaign.verification?.notes && (
                      <div className="mt-5 rounded-lg bg-green-50 p-4">
                        <p className="text-sm font-semibold text-green-800">
                          Verification Notes
                        </p>
                        <p className="mt-1 text-sm text-green-700">
                          {campaign.verification.notes}
                        </p>
                      </div>
                    )}
                </div>
              );
            })}

          </div>
        )}

      </div>
    </div>
  );
}
