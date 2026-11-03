
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  ArrowLeft,
  Heart,
  MapPin,
  ShieldCheck,
  Target,
  Users,
  RefreshCw,
} from "lucide-react";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const imageCategories = [
  "photosAndVideos",
  "disasterProof",
  "locationEvidence",
];

function getCampaignImages(campaign) {
  const images = [];

  imageCategories.forEach((category) => {
    const files = campaign.campaignEvidence?.[category] || [];

    files.forEach((file) => {
      if (file.mimeType?.startsWith("image/")) {
        images.push({
          id: file._id,
          category,
          name: file.originalName,
          url: `${API_URL}/campaigns/${campaign._id}/image/${category}/${file._id}`,
        });
      }
    });
  });

  return images;
}

export default function Donate() {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();

  const [campaign, setCampaign] = useState(null);
  const [amount, setAmount] = useState("10");
  const [loading, setLoading] = useState(true);
  const [donating, setDonating] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState("");

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/campaigns/${id}`);
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Unable to load campaign");
        }

        setCampaign(data.campaign);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaign();
  }, [id]);

  const images = campaign ? getCampaignImages(campaign) : [];

  useEffect(() => {
    if (images.length > 0 && !selectedImage) {
      setSelectedImage(images[0].url);
    }
  }, [campaign]);

  const raisedAmount = campaign?.raisedAmount || 0;

  const progress =
    campaign?.targetAmount > 0
      ? Math.min(
          (raisedAmount / campaign.targetAmount) * 100,
          100
        )
      : 0;

  const formatMoney = (value) =>
    Number(value || 0).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const handleDonation = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!isAuthenticated) {
      setError("Please log in before making a donation.");
      return;
    }

    const donationAmount = Number(amount);

    if (!Number.isFinite(donationAmount) || donationAmount <= 0) {
      setError("Enter a valid donation amount greater than zero.");
      return;
    }

    const token = sessionStorage.getItem("token");

    if (!token) {
      setError("Your login session has expired. Please log in again.");
      return;
    }

    setDonating(true);

    let createdDonation;

    try {
      // Step 1: Create pending donation.
      const createResponse = await fetch(`${API_URL}/donations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          campaignId: campaign._id,
          amount: donationAmount,
        }),
      });

      const createData = await createResponse.json();

      if (!createResponse.ok || !createData.success) {
        throw new Error(
          createData.message || "Could not create donation"
        );
      }

      createdDonation = createData.donation;

      // Step 2: Confirm mock payment.
      const confirmResponse = await fetch(
        `${API_URL}/donations/${createdDonation._id}/confirm`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const confirmData = await confirmResponse.json();

      if (!confirmResponse.ok || !confirmData.success) {
        throw new Error(
          confirmData.message ||
            "Donation was created but confirmation failed. Check My Donations."
        );
      }

      setCampaign((previous) => ({
        ...previous,
        raisedAmount:
          (previous.raisedAmount || 0) + donationAmount,
      }));

      setMessage(
        `Thank you! Your mock donation of $${formatMoney(
          donationAmount
        )} has been confirmed successfully.`
      );

      setAmount("10");
    } catch (err) {
      console.error("Donation error:", err);
      setError(err.message);
    } finally {
      setDonating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center gap-3">
        <RefreshCw className="animate-spin text-emerald-700" size={26} />
        <p className="text-gray-600">Loading campaign details...</p>
      </div>
    );
  }

  if (error && !campaign) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-5">
        <p className="mb-5 text-center text-red-600">{error}</p>
        <Link
          to="/"
          className="rounded-lg bg-emerald-700 px-5 py-3 text-white"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  if (!campaign) return null;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-7xl">

        <Link
          to="/"
          className="mb-7 inline-flex items-center gap-2 font-medium text-emerald-700 hover:underline"
        >
          <ArrowLeft size={18} />
          Back to Campaigns
        </Link>

        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3">

          {/* Campaign information */}
          <div className="space-y-7 lg:col-span-2">

            <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
              {selectedImage ? (
                <img
                  src={selectedImage}
                  alt={campaign.title}
                  className="h-72 w-full object-cover sm:h-[420px]"
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <div className="flex h-72 items-center justify-center bg-emerald-100 text-emerald-800 sm:h-[420px]">
                  No campaign photos available
                </div>
              )}

              {images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto p-4">
                  {images.map((image) => (
                    <button
                      key={image.id}
                      type="button"
                      onClick={() => setSelectedImage(image.url)}
                      className={`h-20 w-28 shrink-0 overflow-hidden rounded-lg border-2 ${
                        selectedImage === image.url
                          ? "border-emerald-600"
                          : "border-transparent"
                      }`}
                    >
                      <img
                        src={image.url}
                        alt={image.name}
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-emerald-100 px-4 py-2 text-xs font-bold uppercase text-emerald-800">
                  {campaign.disasterType}
                </span>

                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700">
                  <ShieldCheck size={14} />
                  Approved Campaign
                </span>
              </div>

              <h1 className="text-2xl font-extrabold leading-tight text-gray-900 sm:text-3xl">
                {campaign.title}
              </h1>

              <p className="mt-4 flex items-center gap-2 text-sm text-gray-500">
                <MapPin size={17} />
                {campaign.location}
              </p>

              <div className="mt-8 border-t border-gray-100 pt-6">
                <h2 className="text-xl font-bold text-gray-900">
                  About this campaign
                </h2>

                <p className="mt-4 whitespace-pre-line leading-8 text-gray-600">
                  {campaign.description}
                </p>
              </div>

              <div className="mt-8 grid grid-cols-1 gap-4 border-t border-gray-100 pt-6 sm:grid-cols-2">
                <div className="rounded-xl bg-emerald-50 p-5">
                  <p className="text-sm text-gray-500">
                    Campaign creator
                  </p>
                  <p className="mt-2 font-semibold text-gray-900">
                    {campaign.creator?.name || "Verified creator"}
                  </p>
                </div>

                <div className="rounded-xl bg-blue-50 p-5">
                  <p className="text-sm text-gray-500">
                    Campaign status
                  </p>
                  <p className="mt-2 font-semibold capitalize text-blue-700">
                    {campaign.status}
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Donation panel */}
          <aside className="space-y-6 lg:sticky lg:top-24">

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-gray-500">
                Total raised
              </p>

              <h2 className="mt-2 text-3xl font-extrabold text-emerald-800">
                ${formatMoney(raisedAmount)}
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Goal: ${formatMoney(campaign.targetAmount)}
              </p>

              <div className="mt-5 h-3 overflow-hidden rounded-full bg-emerald-100">
                <div
                  className="h-full rounded-full bg-emerald-600 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <p className="mt-2 text-right text-sm font-semibold text-emerald-700">
                {progress.toFixed(1)}% funded
              </p>

              <div className="mt-6 grid grid-cols-2 gap-3 border-t border-gray-100 pt-5">
                <div>
                  <Target className="mb-2 text-emerald-700" size={21} />
                  <p className="text-xs text-gray-500">Target</p>
                  <p className="font-bold text-gray-900">
                    ${formatMoney(campaign.targetAmount)}
                  </p>
                </div>

                <div>
                  <Users className="mb-2 text-emerald-700" size={21} />
                  <p className="text-xs text-gray-500">Raised</p>
                  <p className="font-bold text-gray-900">
                    ${formatMoney(raisedAmount)}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-xl bg-emerald-100 p-3 text-emerald-700">
                  <Heart size={23} />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Make a Donation
                  </h2>
                  <p className="text-xs text-gray-500">
                    Support this relief campaign
                  </p>
                </div>
              </div>

              <form onSubmit={handleDonation}>
                <label
                  htmlFor="donationAmount"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Donation amount (USD)
                </label>

                <div className="flex items-center rounded-xl border border-gray-300 px-4 focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-100">
                  <span className="text-lg font-semibold text-gray-500">
                    $
                  </span>

                  <input
                    id="donationAmount"
                    type="number"
                    min="0.01"
                    step="0.01"
                    required
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                    className="w-full border-0 px-3 py-4 outline-none focus:ring-0"
                    placeholder="Enter amount"
                  />
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2">
                  {[10, 25, 50].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setAmount(String(value))}
                      className={`rounded-lg border px-2 py-2 text-sm font-semibold ${
                        Number(amount) === value
                          ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                          : "border-gray-200 text-gray-600 hover:border-emerald-400"
                      }`}
                    >
                      ${value}
                    </button>
                  ))}
                </div>

                {error && (
                  <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                    {error}
                  </p>
                )}

                {message && (
                  <p className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">
                    {message}
                  </p>
                )}

                {isAuthenticated ? (
                  <button
                    type="submit"
                    disabled={donating}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-4 font-bold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {donating ? (
                      <>
                        <RefreshCw className="animate-spin" size={18} />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Heart size={18} />
                        Donate Now
                      </>
                    )}
                  </button>
                ) : (
                  <Link
                    to="/login"
                    className="mt-5 block w-full rounded-xl bg-emerald-700 px-5 py-4 text-center font-bold text-white hover:bg-emerald-800"
                  >
                    Login to Donate
                  </Link>
                )}
              </form>

              <p className="mt-4 text-center text-xs leading-5 text-gray-500">
                Demo mode: donations use mock payment confirmation.
                No real money is transferred.
              </p>

              <Link
                to="/my-donations"
                className="mt-4 block text-center text-sm font-semibold text-emerald-700 hover:underline"
              >
                View My Donations
              </Link>
            </div>

          </aside>
        </div>
      </div>
    </div>
  );
}
