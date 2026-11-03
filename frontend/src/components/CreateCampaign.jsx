
import { Link } from "react-router-dom";

export default function CreateCampaign() {
  return (
    <section
      id="create-campaign"
      className="bg-white px-4 py-12 sm:px-8 lg:px-12"
    >
      <div className="relative mx-auto flex min-h-[320px] max-w-6xl items-center overflow-hidden border border-emerald-100 bg-gradient-to-r from-emerald-100 via-emerald-50 to-white lg:h-[410px]">

        {/* Text */}
        <div className="relative z-10 w-full px-6 py-10 sm:px-10 md:w-3/5 lg:px-12">
          <h2 className="text-3xl font-bold leading-tight text-gray-900 sm:text-4xl lg:text-5xl">
            Get involved in social change in India
          </h2>

          <p className="mt-3 text-lg text-gray-600 sm:text-xl">
            Donate to verified campaigns or start your own
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/create-campaign"
              className="rounded-md bg-emerald-600 px-5 py-3 text-base font-semibold text-white shadow-sm transition duration-300 hover:-translate-y-1 hover:bg-emerald-800 hover:shadow-lg hover:shadow-emerald-600/30"
            >
              Create a Campaign
            </Link>

            <Link
              to="/donate"
              className="rounded-md bg-emerald-600 px-5 py-3 text-base font-semibold text-white shadow-sm transition duration-300 hover:-translate-y-1 hover:bg-emerald-800 hover:shadow-lg hover:shadow-emerald-600/30"
            >
              Donate to a Campaign
            </Link>
          </div>
        </div>

        {/* Background Image */}
        <img
          src="/images/create campaign.png"
          alt=""
          aria-hidden="true"
          className="absolute right-0 top-0 hidden h-full w-3/5 object-cover md:block"
          style={{
            WebkitMaskImage:
              "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.4) 35%, black 85%)",
            maskImage:
              "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.4) 35%, black 85%)",
          }}
        />
      </div>
    </section>
  );
}
