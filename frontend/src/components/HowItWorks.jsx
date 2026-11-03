
import {
  FaSearch,
  FaWallet,
  FaHandHoldingHeart,
  FaChartLine,
  FaUserCheck,
  FaLink,
  FaEye,
  FaCheckCircle,
} from "react-icons/fa";

const steps = [
  {
    icon: FaSearch,
    title: "Discover Verified Campaigns",
    description:
      "Browse relief campaigns run by verified NGOs and choose the cause you want to support.",
  },
  {
    icon: FaWallet,
    title: "Connect Your Wallet",
    description:
      "Link your MetaMask wallet in a few clicks. No lengthy forms, and you stay in control of your funds.",
  },
  {
    icon: FaHandHoldingHeart,
    title: "Donate Securely",
    description:
      "Contribute any amount to your chosen campaign. The transaction is handled through a smart contract.",
  },
  {
    icon: FaChartLine,
    title: "Track Every Contribution",
    description:
      "Follow your donation on the blockchain and see how funds move toward the campaign goal.",
  },
];

const features = [
  {
    icon: FaUserCheck,
    title: "Verified NGOs",
    description:
      "Campaigns come from organisations that are checked before they can raise funds.",
  },
  {
    icon: FaLink,
    title: "Tamper-Proof Records",
    description:
      "Donations are recorded on the blockchain, so transaction history cannot be quietly changed.",
  },
  {
    icon: FaEye,
    title: "Complete Transparency",
    description:
      "Anyone can view donation records and check where support is going.",
  },
];

export default function HowItWorks() {
  return (
    <main
      id="how-it-works"
      className="scroll-mt-24 bg-white"
    >
      {/* Header */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-100 via-emerald-50 to-white px-4 py-20 sm:px-8 lg:py-28">
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-emerald-200/50 blur-3xl" />
        <div className="absolute -bottom-24 right-0 h-72 w-72 rounded-full bg-emerald-300/40 blur-3xl" />

        <div className="relative mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-xs font-bold tracking-wide text-white sm:text-sm">
            <FaCheckCircle aria-hidden="true" />
            HOW IT WORKS
          </span>

          <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight text-emerald-950 sm:text-5xl lg:text-6xl">
            Giving That You Can{" "}
            <span className="text-emerald-600">Actually Trace</span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-emerald-950/75 sm:text-lg">
            TrustChain connects you with verified relief campaigns and records
            every donation on the blockchain. Here is how your support goes from
            your wallet to the people who need it.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="px-4 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-emerald-950 sm:text-4xl">
              Four Simple Steps
            </h2>
            <p className="mt-3 text-emerald-950/70">
              From discovering a cause to tracking your impact.
            </p>
          </div>

          <div className="relative mt-14">
            {/* Connecting line (large screens) */}
            <div className="absolute left-[12.5%] right-[12.5%] top-10 hidden h-0.5 bg-gradient-to-r from-emerald-200 via-emerald-400 to-emerald-200 lg:block" />

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((step, index) => {
                const Icon = step.icon;

                return (
                  <div
                    key={step.title}
                    className="group relative rounded-2xl border border-emerald-100 bg-white p-6 pt-12 text-center shadow-sm transition duration-300 hover:-translate-y-2 hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-600/10"
                  >
                    {/* Icon circle */}
                    <div className="absolute -top-0 left-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 text-3xl text-white shadow-lg shadow-emerald-600/30 ring-8 ring-white transition duration-300 group-hover:scale-110">
                      <Icon aria-hidden="true" />
                    </div>

                    {/* Step number */}
                    <span className="inline-block rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold tracking-wider text-emerald-700">
                      STEP {index + 1}
                    </span>

                    <h3 className="mt-4 text-lg font-bold text-emerald-950">
                      {step.title}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-emerald-950/70">
                      {step.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Why trust us */}
      <section className="bg-emerald-950 px-4 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Why You Can Trust TrustChain
            </h2>

            <p className="mx-auto mt-3 max-w-2xl text-emerald-100/75">
              Transparency is built into how the platform works, not added on
              afterwards.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.title}
                  className="rounded-2xl border border-emerald-800 bg-emerald-900/60 p-7 transition duration-300 hover:-translate-y-1 hover:border-emerald-500 hover:bg-emerald-900"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-500/15 text-2xl text-emerald-300">
                    <Icon aria-hidden="true" />
                  </div>

                  <h3 className="mt-5 text-xl font-bold text-white">
                    {feature.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-emerald-100/75">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
