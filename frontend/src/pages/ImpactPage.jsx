
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle,
  MapPin,
  CalendarDays,
  Target,
  Heart,
  RefreshCw,
  Trophy,
} from "lucide-react";
import Navbar from "../components/Navbar";
import heroImage from "../assets/hero.png";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function getCampaignImage(campaign) {
  const categories = [
    "photosAndVideos",
    "disasterProof",
    "locationEvidence",
  ];

  for (const category of categories) {
    const files = campaign.campaignEvidence?.[category] || [];

    const image = files.find((file) =>
      file.mimeType?.startsWith("image/")
    );

    if (image) {
      return `${API_URL}/campaigns/${campaign._id}/image/${category}/${image._id}`;
    }
  }

  return heroImage;
}

export default function ImpactPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCompletedCampaigns = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/campaigns/completed`);
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Unable to fetch completed campaigns"
          );
        }

        setCampaigns(data.campaigns || []);
      } catch (err) {
        console.error("Impact page error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCompletedCampaigns();
  }, []);

  const formatAmount = (amount, currency = "USD") =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount || 0);

  const formatDate = (date) => {
    if (!date) return "Not available";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const totalRaised = campaigns.reduce(
    (total, campaign) => total + (campaign.raisedAmount || 0),
    0
  );

  const totalTarget = campaigns.reduce(
    (total, campaign) => total + (campaign.targetAmount || 0),
    0
  );

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-emerald-50/50">
        {/* Hero */}
        <section className="bg-gradient-to-br from-emerald-950 via-emerald-800 to-green-700 px-5 py-20 text-white sm:px-8">
          <div className="mx-auto max-w-6xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold">
              <Heart size={16} />
              OUR IMPACT
            </span>

            <h1 className="mt-6 text-4xl font-extrabold sm:text-5xl">
              Every Contribution Creates Hope.
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-emerald-50">
              Behind every completed campaign is a community, a cause and
              people who came together to make a difference. Explore the
              campaigns completed through TrustChain.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
          <Link
            to="/"
            className="mb-8 inline-flex items-center gap-2 text-emerald-800 hover:underline"
          >
            <ArrowLeft size={18} />
            Back to Home
          </Link>

          {/* Impact summary */}
          <section className="mb-14 grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                <Trophy size={24} />
              </div>
              <p className="text-sm text-gray-500">Completed Campaigns</p>
              <h2 className="mt-2 text-3xl font-bold text-emerald-950">
                {loading ? "—" : campaigns.length}
              </h2>
            </div>

            <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-green-700">
                <Heart size={24} />
              </div>
              <p className="text-sm text-gray-500">Total Funds Raised</p>
              <h2 className="mt-2 text-3xl font-bold text-emerald-950">
                {loading ? "—" : formatAmount(totalRaised)}
              </h2>
            </div>

            <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                <Target size={24} />
              </div>
              <p className="text-sm text-gray-500">Combined Campaign Goals</p>
              <h2 className="mt-2 text-3xl font-bold text-emerald-950">
                {loading ? "—" : formatAmount(totalTarget)}
              </h2>
            </div>
          </section>

          {/* Completed campaigns */}
          <section>
            <div className="mb-8">
              <span className="text-sm font-bold tracking-widest text-emerald-700">
                REAL STORIES. REAL CONTRIBUTIONS.
              </span>
              <h2 className="mt-2 text-3xl font-extrabold text-emerald-950">
                Completed Campaigns
              </h2>
              <p className="mt-3 text-gray-600">
                Explore the campaigns that have reached completion through
                TrustChain.
              </p>
            </div>

            {loading && (
              <div className="flex items-center justify-center py-16">
                <RefreshCw className="animate-spin text-emerald-700" size={28} />
                <span className="ml-3 text-gray-600">
                  Loading completed campaigns...
                </span>
              </div>
            )}

            {error && (
              <div className="rounded-xl bg-red-50 p-6 text-center">
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {!loading && !error && campaigns.length === 0 && (
              <div className="rounded-2xl border border-emerald-100 bg-white px-6 py-16 text-center">
                <Trophy size={44} className="mx-auto mb-4 text-emerald-300" />
                <h3 className="text-xl font-bold text-gray-800">
                  Our impact stories are coming soon
                </h3>
                <p className="mx-auto mt-2 max-w-lg text-gray-500">
                  No campaigns have been marked as completed yet. Once
                  campaigns are completed, they will appear here.
                </p>
                <Link
                  to="/campaigns"
                  className="mt-6 inline-flex rounded-full bg-emerald-700 px-6 py-3 font-semibold text-white hover:bg-emerald-800"
                >
                  Explore Active Campaigns
                </Link>
              </div>
            )}

            {!loading && !error && campaigns.length > 0 && (
              <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
                {campaigns.map((campaign) => {
                  const progress =
                    campaign.targetAmount > 0
                      ? Math.min(
                          (campaign.raisedAmount /
                            campaign.targetAmount) *
                            100,
                          100
                        )
                      : 0;

                  return (
                    <article
                      key={campaign._id}
                      className="overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                    >
                      <div className="relative h-52 overflow-hidden">
                        <img
  src={getCampaignImage(campaign)}
  alt={campaign.title}
  onError={(event) => {
    event.currentTarget.onerror = null;
    event.currentTarget.src = heroImage;
  }}
  className="h-full w-full object-cover"
/>

                        <span className="absolute left-4 top-4 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-emerald-800">
                          {campaign.disasterType?.toUpperCase() || "RELIEF"}
                        </span>

                        <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-green-600 px-3 py-1.5 text-xs font-bold text-white">
                          <CheckCircle size={13} />
                          COMPLETED
                        </span>
                      </div>

                      <div className="p-6">
                        <h3 className="text-xl font-bold text-emerald-950">
                          {campaign.title}
                        </h3>

                        <p className="mt-3 line-clamp-3 text-sm leading-6 text-gray-600">
                          {campaign.description}
                        </p>

                        <div className="mt-4 space-y-2 text-sm text-gray-500">
                          <p className="flex items-center gap-2">
                            <MapPin size={16} />
                            {campaign.location}
                          </p>

                          <p className="flex items-center gap-2">
                            <CalendarDays size={16} />
                            Created: {formatDate(campaign.createdAt)}
                          </p>
                        </div>

                        <div className="mt-5 border-t border-gray-100 pt-5">
                          <div className="mb-2 flex justify-between text-sm">
                            <span className="font-semibold text-emerald-800">
                              {formatAmount(
                                campaign.raisedAmount,
                                campaign.currency
                              )}
                            </span>
                            <span className="text-gray-500">
                              Goal:{" "}
                              {formatAmount(
                                campaign.targetAmount,
                                campaign.currency
                              )}
                            </span>
                          </div>

                          <div className="h-2 overflow-hidden rounded-full bg-emerald-100">
                            <div
                              className="h-full rounded-full bg-emerald-600"
                              style={{ width: `${progress}%` }}
                            />
                          </div>

                          <p className="mt-2 text-right text-xs text-gray-500">
                            {progress.toFixed(1)}% of goal raised
                          </p>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          {/* Closing CTA */}
          <section className="mt-16 rounded-3xl bg-emerald-900 px-6 py-12 text-center text-white sm:px-12">
            <h2 className="text-3xl font-bold">
              Be Part of the Next Success Story
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-emerald-100">
              Your support can help bring relief and hope to communities
              affected by disasters.
            </p>
            <Link
              to="/campaigns"
              className="mt-7 inline-flex rounded-full bg-emerald-600 px-7 py-3 font-bold text-emerald-900 hover:bg-emerald-800"
            >
              Explore Campaigns
            </Link>
          </section>
        </div>
      </main>
    </>
  );
}
