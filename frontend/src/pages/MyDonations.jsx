
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Heart,
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
} from "lucide-react";

const API_URL = "http://localhost:5000/api/donations";

export default function MyDonations() {
  const { user } = useAuth();

  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        setLoading(true);
        setError("");

        const token = sessionStorage.getItem("token");

        const response = await fetch(`${API_URL}/my-donations`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to fetch donations");
        }

        setDonations(data.donations || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDonations();
  }, []);

  const confirmedDonations = donations.filter(
    (donation) => donation.status === "confirmed"
  );

  const totalDonated = confirmedDonations.reduce(
    (total, donation) => total + donation.amount,
    0
  );

  const formatDate = (date) => {
    if (!date) return "Not available";

    return new Date(date).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "confirmed":
        return {
          label: "Confirmed (Mock)",
          icon: CheckCircle,
          className: "bg-green-100 text-green-700",
        };

      case "pending":
        return {
          label: "Pending",
          icon: Clock,
          className: "bg-yellow-100 text-yellow-700",
        };

      case "failed":
        return {
          label: "Failed",
          icon: XCircle,
          className: "bg-red-100 text-red-700",
        };

      default:
        return {
          label: status,
          icon: Clock,
          className: "bg-gray-100 text-gray-700",
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCw className="animate-spin text-green-700" size={28} />
        <p className="ml-3 text-gray-600">Loading your donations...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-green-700 text-white px-5 py-2 rounded-lg"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto">

        <Link
          to="/"
          className="inline-flex items-center gap-2 text-green-700 mb-8 hover:underline"
        >
          <ArrowLeft size={18} />
          Back to Home
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            My Donations
          </h1>
          <p className="text-gray-600 mt-2">
            Welcome{user?.name ? `, ${user.name}` : ""}. Track your contribution history.
          </p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 rounded-xl bg-green-100 text-green-700">
                <Heart size={22} />
              </div>
              <p className="text-gray-500 font-medium">
                Total Donated
              </p>
            </div>

            <h2 className="text-3xl font-bold text-gray-900">
              ${totalDonated.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </h2>

            <p className="text-xs text-gray-500 mt-2">
              Confirmed mock donations only · USD
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 rounded-xl bg-blue-100 text-blue-700">
                <CheckCircle size={22} />
              </div>
              <p className="text-gray-500 font-medium">
                Confirmed Donations
              </p>
            </div>

            <h2 className="text-3xl font-bold text-gray-900">
              {confirmedDonations.length}
            </h2>

            <p className="text-xs text-gray-500 mt-2">
              Successful donation records
            </p>
          </div>

        </div>

        {/* Donation history */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900">
              Donation History
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Your recent and previous donation records
            </p>
          </div>

          {donations.length === 0 ? (
            <div className="text-center py-16 px-5">
              <Heart size={42} className="mx-auto text-gray-300 mb-4" />

              <h3 className="text-lg font-semibold text-gray-800">
                No donations yet
              </h3>

              <p className="text-gray-500 mt-2 mb-6">
                Your donation history will appear here after you contribute.
              </p>

              <Link
                to="/"
                className="inline-block bg-green-700 text-white px-6 py-3 rounded-lg hover:bg-green-800"
              >
                Explore Campaigns
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {donations.map((donation) => {
                const status = getStatusStyle(donation.status);
                const StatusIcon = status.icon;

                return (
                  <div
                    key={donation._id}
                    className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-900">
                        {donation.campaign?.title || "Campaign unavailable"}
                      </h3>

                      <p className="text-sm text-gray-500 mt-1">
                        {donation.campaign?.location || "Location unavailable"}
                      </p>

                      <p className="text-xs text-gray-400 mt-2">
                        Donated on {formatDate(donation.createdAt)}
                      </p>

                      {donation.confirmedAt && (
                        <p className="text-xs text-gray-400 mt-1">
                          Confirmed on {formatDate(donation.confirmedAt)}
                        </p>
                      )}
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3">
                      <p className="text-xl font-bold text-gray-900">
                        {donation.currency === "USD" ? "$" : ""}
                        {donation.amount?.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                        {" "}
                        {donation.currency !== "USD" && donation.currency}
                      </p>

                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${status.className}`}
                      >
                        <StatusIcon size={14} />
                        {status.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
