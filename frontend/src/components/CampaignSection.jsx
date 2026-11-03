
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
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

export default function CampaignSection({ limit = null }) {
  const navigate = useNavigate();

  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/campaigns`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to fetch campaigns");
      }

      setCampaigns(data.campaigns || []);
    } catch (err) {
      console.error("Campaign fetch error:", err);
      setError(err.message || "Unable to load campaigns.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  // Homepage can limit the number of campaigns.
  // Campaigns page displays the complete list.
  const visibleCampaigns =
    limit === null ? campaigns : campaigns.slice(0, limit);

  return (
    <section
      id="campaigns"
      className="bg-emerald-50/60 px-5 py-16 sm:px-8 lg:px-16 lg:py-20"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <span className="inline-block rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-800">
            MAKE A DIFFERENCE
          </span>

          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-emerald-950 sm:text-4xl">
            Support a Cause You Believe In
          </h2>

          <p className="mt-4 text-base leading-7 text-emerald-900/70">
            Explore campaigns, learn about their purpose, and make informed
            decisions through TrustChain.
          </p>
        </div>

        {loading && (
          <p className="py-10 text-center text-emerald-800">
            Loading campaigns...
          </p>
        )}

        {error && (
          <div className="py-10 text-center">
            <p className="mb-4 text-red-600">{error}</p>
            <button
              onClick={fetchCampaigns}
              className="rounded-xl bg-emerald-700 px-5 py-2 text-white hover:bg-emerald-800"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && campaigns.length === 0 && (
          <p className="py-10 text-center text-gray-600">
            No approved campaigns are available right now.
          </p>
        )}

        {!loading && !error && visibleCampaigns.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visibleCampaigns.map((campaign) => {
              const progress =
                campaign.targetAmount > 0
                  ? Math.min(
                      (campaign.raisedAmount / campaign.targetAmount) * 100,
                      100
                    )
                  : 0;

              const image = getCampaignImage(campaign);

              return (
                <article
                  key={campaign._id}
                  className="group overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm transition duration-300 hover:-translate-y-2 hover:border-emerald-300 hover:shadow-xl"
                >
                  <div className="relative h-52 overflow-hidden">
                    <img
                      src={image}
                      alt={campaign.title}
                      onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src = heroImage;
                      }}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />

                    <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold tracking-wide text-emerald-800 shadow-sm">
                      {campaign.disasterType?.toUpperCase() || "RELIEF"}
                    </span>
                  </div>

                  <div className="p-5">
                    <h3 className="text-xl font-bold text-emerald-950 transition group-hover:text-emerald-700">
                      {campaign.title}
                    </h3>

                    <p className="mt-3 min-h-[72px] text-sm leading-6 text-gray-600">
                      {campaign.description}
                    </p>

                    <p className="mt-3 text-sm text-gray-500">
                      <span className="font-semibold">Location:</span>{" "}
                      {campaign.location}
                    </p>

                    <div className="mt-5">
                      <div className="mb-2 flex justify-between text-sm">
                        <span className="font-semibold text-emerald-800">
                          {campaign.currency}{" "}
                          {campaign.raisedAmount?.toLocaleString("en-US")}
                        </span>

                        <span className="text-gray-500">
                          Goal: {campaign.currency}{" "}
                          {campaign.targetAmount?.toLocaleString("en-US")}
                        </span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-emerald-100">
                        <div
                          className="h-full rounded-full bg-emerald-600 transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>

                      <p className="mt-1 text-right text-xs text-gray-500">
                        {progress.toFixed(1)}% funded
                      </p>
                    </div>

                    <div className="mt-5 border-t border-emerald-100 pt-4">
                      <button
                        type="button"
                        onClick={() =>
                          navigate(`/campaign/${campaign._id}`)
                        }
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 font-semibold text-white transition hover:bg-emerald-800"
                      >
                        View Details & Donate →
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Show all campaigns link only when a limit is applied */}
        {!loading &&
          !error &&
          limit !== null &&
          campaigns.length > limit && (
            <div className="mt-12 text-center">
              <Link
                to="/campaigns"
                className="inline-flex items-center justify-center rounded-full bg-emerald-700 px-8 py-3 font-semibold text-white transition hover:bg-emerald-800"
              >
                Explore All Campaigns →
              </Link>
            </div>
          )}
      </div>
    </section>
  );
}
