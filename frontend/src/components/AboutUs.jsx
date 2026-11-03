import React, { useState } from "react";

const columns = [
  {
    title: "About Us",
    links: [
      { label: "About TrustChain", href: "/about" },
      { label: "How It Works", href: "/#how-it-works" },
      { label: "Blog", href: "/#blog" },
      { label: "Our Team", href: "/about#our-team" },
      { label: "Contact us", href: "/about#contact-us" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "FAQs", href: "/#faqs" },
      { label: "Wallet Setup Guide", href: "/#wallet-guide" },
      { label: "Reach out", href: "/about#contact-us" },
    ],
  },
  {
    title: "Start a Campaign for",
    links: [
      { label: "NGO", href: "#create-campaign" },
      { label: "Disaster Relief", href: "#create-campaign" },
    ],
  },
  {
    title: "Donate to",
    links: [
      { label: "Disaster Relief", href: "#donate" },
      { label: "Education", href: "#donate" },
      { label: "NGOs", href: "#donate" },
    ],
  },
];

const socials = [
  {
    name: "Facebook",
    href: "#",
    path: "M22 12a10 10 0 10-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.3v7A10 10 0 0022 12z",
  },
  {
    name: "Twitter",
    href: "#",
    path: "M22 5.9c-.7.3-1.5.5-2.4.6.9-.5 1.5-1.3 1.8-2.3-.8.5-1.7.8-2.6 1a4.1 4.1 0 00-7 3.7A11.6 11.6 0 013.4 4.600a4.100 4.100 0 001.300 5.500c-.7 0-1.300-.2-1.900-.5v.1c0 2 1.400 3.700 3.300 4.100-.6.2-1.200.2-1.800.1.500 1.600 2 2.800 3.800 2.800A8.200 8.200 0 012 18.300a11.600 11.600 0 006.300 1.800c7.500 0 11.700-6.300 11.700-11.700v-.5c.8-.6 1.500-1.300 2-2z",
  },
  {
    name: "Instagram",
    href: "#",
    path: "M12 7.700A4.300 4.300 0 1012 16.300 4.300 4.300 0 0012 7.700zm0 7.100a2.800 2.800 0 110-5.600 2.800 2.800 0 010 5.600zM16.800 6a1 1 0 100 2 1 1 0 000-2zM12 2.500c-2.600 0-2.900 0-3.900.1-1 0-1.700.2-2.300.4a4.700 4.700 0 00-1.700 1.100A4.700 4.700 0 003 5.800c-.2.600-.4 1.300-.4 2.300-.1 1-.1 1.300-.1 3.900s0 2.900.1 3.900c0 1 .2 1.700.4 2.300.2.700.6 1.200 1.100 1.700.5.500 1.100.9 1.700 1.100.6.200 1.300.4 2.300.4 1 .1 1.300.1 3.900.1s2.900 0 3.900-.1c1 0 1.700-.2 2.300-.4a4.700 4.700 0 002.800-2.800c.2-.6.4-1.300.4-2.300.1-1 .1-1.300.1-3.900s0-2.900-.1-3.900c0-1-.2-1.700-.4-2.300a4.700 4.700 0 00-1.100-1.700A4.700 4.700 0 0018.200 3c-.6-.2-1.300-.4-2.300-.4-1-.1-1.300-.1-3.900-.1z",
  },
  {
    name: "LinkedIn",
    href: "#",
    path: "M20.400 2H3.600A1.600 1.600 0 002 3.600v16.800A1.600 1.600 0 003.600 22h16.800a1.600 1.600 0 001.600-1.600V3.600A1.600 1.600 0 0020.400 2zM8 19H5V9.800h3V19zM6.500 8.500a1.700 1.700 0 110-3.500 1.700 1.700 0 010 3.500zM19 19h-3v-4.500c0-1.100 0-2.500-1.500-2.500s-1.800 1.200-1.800 2.400V19h-3V9.800h2.800v1.300a3.100 3.100 0 012.800-1.500c3 0 3.600 2 3.600 4.600V19z",
  },
  {
    name: "GitHub",
    href: "#",
    path: "M12 2a10 10 0 00-3.200 19.500c.5.100.7-.2.7-.5v-1.700c-2.800.6-3.400-1.300-3.400-1.300-.5-1.100-1.100-1.400-1.100-1.400-.9-.6.100-.6.100-.6 1 .1 1.500 1 1.500 1 .9 1.500 2.300 1.100 2.900.8.1-.7.3-1.100.6-1.300-2.200-.3-4.600-1.100-4.600-5 0-1.100.4-2 1-2.700-.1-.3-.4-1.300.1-2.700 0 0 .8-.3 2.800 1a9.600 9.600 0 015 0c1.900-1.300 2.800-1 2.800-1 .5 1.400.2 2.400.1 2.700.6.700 1 1.600 1 2.700 0 3.900-2.400 4.700-4.600 5 .4.300.7.900.7 1.800v2.700c0 .3.200.6.700.5A10 10 0 0012 2z",
  },
];

const AboutUs = () => {
  const [currency, setCurrency] = useState("INR");

  return (
    <footer className="bg-green-50 pt-16 pb-8 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Top area: link columns + currency/social */}
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="text-xl font-semibold text-gray-900">
                {col.title}
              </h3>
              <ul className="mt-6 flex flex-col gap-4">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="inline-block text-lg text-gray-600 transition-all duration-300 hover:text-green-600 hover:translate-x-1"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Currency + social icons */}
          <div className="flex flex-col gap-6">
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full max-w-[160px] bg-white border border-gray-200 rounded-lg px-4 py-3 text-gray-900 cursor-pointer transition-all duration-300 hover:border-green-500 focus:outline-none focus:border-green-500"
            >
              <option value="INR">INR (₹)</option>
              <option value="ETH">ETH (Ξ)</option>
              <option value="USD">USD ($)</option>
            </select>

            <div className="flex items-center gap-4">
              {socials.map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  aria-label={s.name}
                  className="text-gray-700 transition-all duration-300 hover:text-green-600 hover:-translate-y-1"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-6 w-6"
                  >
                    <path d={s.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-14 bg-green-100/70 rounded-2xl p-6 md:p-8">
          <h4 className="font-semibold text-gray-900">Disclaimer</h4>
          <p className="mt-3 text-sm text-gray-600 leading-relaxed">
            Donations made through TrustChain are recorded on the blockchain
            and are irreversible once confirmed. Please verify the campaign
            details and your wallet address before donating. A small network
            (gas) fee is charged by the blockchain for every transaction, and
            it is not collected by TrustChain. Information about campaigns is
            provided by the organisations who create them and is used only to
            create awareness about the cause.
          </p>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-6 border-t border-green-200 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-700">© TrustChain</p>

          <div className="flex flex-wrap items-center justify-center gap-4 text-gray-700">
            <a
              href="#terms"
              className="transition-colors duration-300 hover:text-green-600"
            >
              Terms
            </a>
            <span className="text-sm bg-green-100 px-3 py-1 rounded-md text-gray-600">
              Updated on 30 October, 2026
            </span>
            <span className="hidden md:inline text-gray-400">•</span>
            <a
              href="#privacy"
              className="transition-colors duration-300 hover:text-green-600"
            >
              Privacy Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default AboutUs;