import React from "react";

const fundraisers = [
  {
    id: 1,
    image: "/images/Bihar flood.jpg",
    title: "Bihar floods have displaced thousands of families. Help them rebuild their lives",
    by: "Your Organisation Name",
    raised: 12500000,
    goal: 30000000,
    taxBenefit: true,
  },
  {
    id: 2,
    image: "/images/japan eathquke.jpg",
    title: "Japan earthquake survivors need urgent shelter, food & medical aid",
    by: "Your Organisation Name",
    raised: 8200000,
    goal: 20000000,
    taxBenefit: true,
  },
  {
    id: 3,
    image: "/images/TurkeySyriaEarthquake.jpg",
    title: "Turkey-Syria earthquake: help families who lost everything",
    by: "Your Organisation Name",
    raised: 21500000,
    goal: 40000000,
    taxBenefit: true,
  },
  {
    id: 4,
    image: "/images/nepall flood.jpg",
    title: "Nepal floods have washed away homes & livelihoods. Donate now",
    by: "Your Organisation Name",
    raised: 6400000,
    goal: 15000000,
    taxBenefit: true,
  },
  {
    id: 5,
    image: "/images/girls.jpg",
    title: "Shiksha Na Ruke: help underprivileged girl students continue their education",
    by: "Simile Foundation",
    raised: 3100000,
    goal: 10000000,
    taxBenefit: true,
  },
  {
    id: 6,
    image: "/images/akshyapartra.jpg",
    title: "Unlimited food for education",
    by: "Akshaya Patra",
    raised: 6100000,
    goal: 10000000,
    taxBenefit: true,
  },
];

const formatINR = (n) => "₹" + n.toLocaleString("en-IN");

const formatGoal = (n) => {
  if (n >= 10000000) return "₹" + +(n / 10000000).toFixed(2) + "Cr";
  if (n >= 100000) return "₹" + +(n / 100000).toFixed(2) + "L";
  return formatINR(n);
};

const FundraiserCard = ({ item }) => {
  const percent = Math.min(100, Math.round((item.raised / item.goal) * 100));

  return (
    <div className="group bg-white rounded-2xl shadow-md overflow-hidden flex flex-col cursor-pointer transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-2xl">
      {/* Image section */}
      <div className="relative h-60 w-full bg-gray-200 overflow-hidden">
        {item.image ? (
          <img
            src={item.image}
            alt={item.title}
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-gray-400 text-sm">
            Add image here
          </div>
        )}

        {/* Dark overlay on hover */}
        <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/20" />

        {item.taxBenefit && (
          <span className="absolute bottom-3 left-3 bg-orange-100 text-gray-800 text-sm font-medium px-3 py-1.5 rounded-lg flex items-center gap-1.5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0L3.3 9.7a1 1 0 011.4-1.4l3.8 3.8 6.8-6.8a1 1 0 011.4 0z"
                clipRule="evenodd"
              />
            </svg>
            Tax Benefits
          </span>
        )}
      </div>

      {/* Content section */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-lg font-semibold text-gray-900 leading-snug line-clamp-3 transition-colors duration-300 group-hover:text-green-600">
          {item.title}
        </h3>

        <p className="mt-2 text-gray-500 text-sm truncate transition-colors duration-300 group-hover:text-green-600">
          by {item.by}
        </p>

        <div className="mt-auto pt-5">
          <p className="text-gray-900 font-semibold">
            {formatINR(item.raised)}{" "}
            <span className="font-normal text-gray-500">
              raised of {formatGoal(item.goal)}
            </span>
          </p>

          <div className="mt-2 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-600 rounded-full transition-all duration-500 group-hover:bg-green-500"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const OurImpact = () => {
  return (
    <section className="bg-gray-50 py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-center text-4xl md:text-5xl font-bold text-gray-900">
          Support a fundraiser
        </h2>
        <p className="text-center text-gray-500 text-lg mt-3">
          Pick a cause close to your heart and donate now
        </p>

        <div className="mt-12 grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {fundraisers.map((item) => (
            <FundraiserCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default OurImpact;