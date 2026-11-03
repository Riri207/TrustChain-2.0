
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  UserRound,
  Mail,
  ShieldCheck,
  CalendarDays,
  RefreshCw,
} from "lucide-react";

export default function Profile() {
  const { user, loading } = useAuth();

  const formatDate = (date) => {
    if (!date) return "Not available";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCw className="animate-spin text-green-700" size={28} />
        <p className="ml-3 text-gray-600">Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Please log in to view your profile.</p>
      </div>
    );
  }

  const profileDetails = [
    {
      label: "Full Name",
      value: user.name,
      icon: UserRound,
    },
    {
      label: "Email Address",
      value: user.email,
      icon: Mail,
    },
    {
      label: "Account Role",
      value: user.role?.charAt(0).toUpperCase() + user.role?.slice(1),
      icon: ShieldCheck,
    },
    {
      label: "Member Since",
      value: formatDate(user.createdAt),
      icon: CalendarDays,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-4xl">

        <Link
          to="/"
          className="mb-8 inline-flex items-center gap-2 text-green-700 hover:underline"
        >
          <ArrowLeft size={18} />
          Back to Home
        </Link>

        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">

          <div className="bg-emerald-800 px-6 py-10 text-center text-white">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white text-emerald-800">
              <UserRound size={38} />
            </div>

            <h1 className="text-2xl font-bold">
              {user.name}
            </h1>

            <p className="mt-2 text-emerald-100">
              TrustChain Member
            </p>
          </div>

          <div className="p-6 sm:p-8">

            <h2 className="mb-6 text-xl font-semibold text-gray-900">
              Personal Information
            </h2>

            <div className="grid gap-5 sm:grid-cols-2">
              {profileDetails.map((detail) => {
                const Icon = detail.icon;

                return (
                  <div
                    key={detail.label}
                    className="rounded-xl border border-gray-100 bg-gray-50 p-5"
                  >
                    <div className="mb-3 flex items-center gap-2 text-emerald-700">
                      <Icon size={19} />
                      <span className="text-sm font-medium">
                        {detail.label}
                      </span>
                    </div>

                    <p className="break-words font-semibold text-gray-900">
                      {detail.value || "Not available"}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 border-t border-gray-100 pt-6">
              <Link
                to="/my-donations"
                className="inline-flex items-center justify-center rounded-full bg-emerald-700 px-6 py-3 font-semibold text-white transition hover:bg-emerald-800"
              >
                View My Donations
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
