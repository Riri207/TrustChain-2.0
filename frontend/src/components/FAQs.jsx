import React, { useState } from "react";

const faqs = [
  {
    id: 1,
    question: "What is TrustChain?",
    answer:
      "TrustChain is a blockchain-based donation platform built for disaster relief. Every donation is recorded on the blockchain, so donors can see exactly where their money goes.",
  },
  {
    id: 2,
    question: "How does blockchain make donations transparent?",
    answer:
      "Each donation is stored as a transaction on the blockchain through a smart contract. These records cannot be edited or deleted, so anyone can verify the amount received and how it was used.",
  },
  {
    id: 3,
    question: "Do I need a crypto wallet to donate?",
    answer:
      "Yes, you need a wallet such as MetaMask to connect to TrustChain and confirm your donation. Once connected, you can donate in a few clicks.",
  },
  {
    id: 4,
    question: "Is my donation safe and secure?",
    answer:
      "Yes. Donations are handled by smart contracts, so funds are not controlled by any single person. Your wallet keys always stay with you and are never stored on our platform.",
  },
  {
    id: 5,
    question: "How can I track where my donation was used?",
    answer:
      "Every transaction has a unique hash. You can use it to check the full history of your donation, from the moment it was sent to when it reached the relief campaign.",
  },
  {
    id: 6,
    question: "Which disasters or causes can I support?",
    answer:
      "You can support relief campaigns for floods, earthquakes and other emergencies, as well as education drives for underprivileged students. New campaigns are added regularly.",
  },
  {
    id: 7,
    question: "Can an NGO or organisation create a campaign?",
    answer:
      "Yes. Organisations can create a campaign by filling in the details, the funding goal and supporting information. Once it goes live, donors can contribute directly.",
  },
  {
    id: 8,
    question: "Are there any extra charges on my donation?",
    answer:
      "TrustChain does not take any commission from donations. The only cost is the small network (gas) fee charged by the blockchain for processing the transaction.",
  },
];

const FaqItem = ({ faq, isOpen, onToggle }) => (
  <div
    className={`bg-white rounded-2xl border transition-all duration-300 hover:shadow-lg ${
      isOpen ? "border-green-500 shadow-md" : "border-gray-200"
    }`}
  >
    <button
      onClick={onToggle}
      aria-expanded={isOpen}
      className="group w-full flex items-center justify-between gap-4 text-left px-6 py-5"
    >
      <span
        className={`text-lg font-semibold transition-colors duration-300 group-hover:text-green-600 ${
          isOpen ? "text-green-600" : "text-gray-900"
        }`}
      >
        {faq.question}
      </span>

      <span
        className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center transition-all duration-300 ${
          isOpen
            ? "bg-green-500 text-white rotate-180"
            : "bg-gray-100 text-gray-600 group-hover:bg-green-100 group-hover:text-green-600"
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.3 7.3a1 1 0 011.4 0L10 10.6l3.3-3.3a1 1 0 111.4 1.4l-4 4a1 1 0 01-1.4 0l-4-4a1 1 0 010-1.4z"
            clipRule="evenodd"
          />
        </svg>
      </span>
    </button>

    {/* Smooth open / close */}
    <div
      className={`grid transition-all duration-300 ease-out ${
        isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
      }`}
    >
      <div className="overflow-hidden">
        <p className="px-6 pb-6 text-gray-600 leading-relaxed">{faq.answer}</p>
      </div>
    </div>
  </div>
);

const FAQsSection = () => {
  const [openId, setOpenId] = useState(1);

  return (
    <section className="bg-gray-50 py-16 px-6">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-center text-4xl md:text-5xl font-bold text-gray-900">
          Frequently Asked Questions
        </h2>
        <p className="text-center text-gray-500 text-lg mt-3">
          Everything you need to know about donating with TrustChain
        </p>

        <div className="mt-12 flex flex-col gap-4">
          {faqs.map((faq) => (
            <FaqItem
              key={faq.id}
              faq={faq}
              isOpen={openId === faq.id}
              onToggle={() => setOpenId(openId === faq.id ? null : faq.id)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQsSection;