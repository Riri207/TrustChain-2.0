
import { useState } from "react";
import Navbar from "../components/Navbar";
import AboutUs from "../components/AboutUs";

import {
  FaShieldAlt,
  FaEye,
  FaHandsHelping,
  FaGlobeAsia,
  FaBullseye,
  FaLightbulb,
  FaHeart,
  FaCheckCircle,
  FaCode,
  FaServer,
  FaTasks,
  FaWallet,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaPaperPlane,
} from "react-icons/fa";

const CONTACT_EMAIL = "faizaaan217@gmail.com";
const CONTACT_PHONE = "7394883670";

const values = [
  {
    icon: FaEye,
    title: "Transparency",
    description:
      "We aim to make campaign information and donation records accessible so supporters can understand how contributions are collected.",
  },
  {
    icon: FaShieldAlt,
    title: "Trust & Security",
    description:
      "We focus on secure account access, campaign verification and responsible handling of platform information.",
  },
  {
    icon: FaHandsHelping,
    title: "Accountability",
    description:
      "We encourage campaign organisers to provide supporting evidence and keep donors informed about relief activities.",
  },
  {
    icon: FaHeart,
    title: "Compassion",
    description:
      "We believe technology should help people support communities affected by disasters and emergencies.",
  },
];

const team = [
  {
    member: "Riddhi Mishra",
    role: "Frontend Developer",
    icon: FaCode,
    description:
      "Responsible for developing the user interface, responsive layouts and interactive frontend experience of TrustChain.",
  },
  {
    member: "Faizan Akhtar",
    role: "Backend & Blockchain Developer",
    icon: FaServer,
    description:
      "Responsible for backend development, database integration, APIs and blockchain-related development.",
  },
  {
    member: "Abu Kashif Ansari",
    role: "Management & Verifier",
    icon: FaTasks,
    description:
      "Responsible for project coordination, campaign management and the verification workflow.",
  },
  {
    member: "Mohd. Tahir Ansari",
    role: "MetaMask Wallet Integration",
    icon: FaWallet,
    description:
      "Responsible for wallet integration and exploring secure wallet connectivity within the platform.",
  },
];

export default function About() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const subject = encodeURIComponent(
      formData.subject || "TrustChain Website Enquiry"
    );

    const body = encodeURIComponent(
      `Name: ${formData.name}\n` +
      `Email: ${formData.email}\n\n` +
      `Message:\n${formData.message}`
    );

    const mailtoLink =
      `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;

    window.location.href = mailtoLink;
  };

  return (
    <>
      <Navbar />

      <main className="bg-white">

        {/* HERO SECTION */}
        <section className="relative overflow-hidden bg-gradient-to-br from-emerald-100 via-emerald-50 to-white px-6 py-24 sm:py-28">
          <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-emerald-300/30 blur-3xl" />
          <div className="absolute -bottom-20 right-0 h-72 w-72 rounded-full bg-green-300/30 blur-3xl" />

          <div className="relative mx-auto max-w-5xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-2 text-sm font-bold tracking-wide text-white">
              <FaCheckCircle />
              ABOUT TRUSTCHAIN
            </span>

            <h1 className="mt-7 text-4xl font-extrabold leading-tight text-emerald-950 sm:text-5xl lg:text-6xl">
              Building Trust Through
              <span className="block text-emerald-600">
                Transparent Giving
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-emerald-950/75 sm:text-lg">
              TrustChain is a disaster-relief donation platform designed
              to connect people who want to help with campaigns that need
              support. Our goal is to make the donation process more
              transparent, accessible and accountable through technology.
            </p>

            <a
              href="#our-team"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-7 py-3.5 font-semibold text-white transition hover:bg-emerald-800"
            >
              Meet Our Team
              <FaHandsHelping />
            </a>
          </div>
        </section>

        {/* WHO WE ARE */}
        <section className="px-6 py-20">
          <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2">

            <div>
              <span className="font-bold uppercase tracking-widest text-emerald-600">
                Who We Are
              </span>

              <h2 className="mt-4 text-3xl font-bold leading-tight text-emerald-950 sm:text-4xl">
                Technology with a Purpose
              </h2>

              <p className="mt-6 leading-8 text-gray-600">
                During disasters and emergencies, people often come
                together to support affected communities. However,
                donors may find it difficult to identify reliable
                campaigns and understand how their contributions
                are being reported.
              </p>

              <p className="mt-4 leading-8 text-gray-600">
                TrustChain aims to address these challenges by
                providing a platform where campaign organisers
                can share their relief requirements and supporting
                documents, while donors can explore campaigns
                and review available information.
              </p>

              <p className="mt-4 leading-8 text-gray-600">
                We believe better access to information can encourage
                greater confidence and participation in disaster-relief
                initiatives.
              </p>
            </div>

            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=1000"
                alt="Volunteers working together to support communities"
                className="h-[420px] w-full rounded-3xl object-cover shadow-xl"
              />

              <div className="absolute -bottom-6 -left-4 rounded-2xl bg-emerald-600 p-6 text-white shadow-lg sm:-left-6">
                <FaHandsHelping className="text-3xl" />
                <p className="mt-2 font-bold">Giving with Purpose</p>
              </div>
            </div>

          </div>
        </section>

        {/* MISSION AND VISION */}
        <section className="bg-emerald-950 px-6 py-20">
          <div className="mx-auto max-w-6xl">

            <div className="mb-14 text-center">
              <span className="font-bold uppercase tracking-widest text-emerald-300">
                Our Purpose
              </span>

              <h2 className="mt-4 text-3xl font-bold text-white sm:text-4xl">
                Mission & Vision
              </h2>
            </div>

            <div className="grid gap-8 md:grid-cols-2">

              <div className="rounded-3xl border border-emerald-800 bg-emerald-900/60 p-8 sm:p-10">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/20 text-3xl text-emerald-300">
                  <FaBullseye />
                </div>

                <h3 className="mt-6 text-2xl font-bold text-white">
                  Our Mission
                </h3>

                <p className="mt-4 leading-8 text-emerald-100/75">
                  To make disaster-relief donations easier to discover,
                  understand and support by providing a platform that
                  encourages campaign verification, transparent
                  information and donor awareness.
                </p>
              </div>

              <div className="rounded-3xl border border-emerald-800 bg-emerald-900/60 p-8 sm:p-10">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/20 text-3xl text-emerald-300">
                  <FaGlobeAsia />
                </div>

                <h3 className="mt-6 text-2xl font-bold text-white">
                  Our Vision
                </h3>

                <p className="mt-4 leading-8 text-emerald-100/75">
                  To contribute towards a future where technology
                  helps communities, donors and relief organisations
                  work together with greater trust, accountability
                  and transparency.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* CORE VALUES */}
        <section className="px-6 py-20">
          <div className="mx-auto max-w-6xl">

            <div className="text-center">
              <span className="font-bold uppercase tracking-widest text-emerald-600">
                What Guides Us
              </span>

              <h2 className="mt-4 text-3xl font-bold text-emerald-950 sm:text-4xl">
                Our Core Values
              </h2>

              <p className="mx-auto mt-4 max-w-2xl leading-7 text-gray-600">
                The principles that guide our approach to building
                a responsible disaster-relief donation platform.
              </p>
            </div>

            <div className="mt-14 grid gap-7 sm:grid-cols-2 lg:grid-cols-4">
              {values.map((value) => {
                const Icon = value.icon;

                return (
                  <div
                    key={value.title}
                    className="rounded-2xl border border-emerald-100 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-xl"
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-100 text-2xl text-emerald-700">
                      <Icon />
                    </div>

                    <h3 className="mt-5 text-xl font-bold text-emerald-950">
                      {value.title}
                    </h3>

                    <p className="mt-3 text-sm leading-7 text-gray-600">
                      {value.description}
                    </p>
                  </div>
                );
              })}
            </div>

          </div>
        </section>

        {/* TECHNOLOGY */}
        <section className="bg-emerald-50 px-6 py-20">
          <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2">

            <div>
              <span className="font-bold uppercase tracking-widest text-emerald-600">
                Innovation for Impact
              </span>

              <h2 className="mt-4 text-3xl font-bold text-emerald-950 sm:text-4xl">
                Technology That Supports Trust
              </h2>

              <p className="mt-5 leading-8 text-gray-600">
                TrustChain uses modern web technologies to provide
                campaign management, user authentication, supporting
                document submissions and donation records.
              </p>

              <p className="mt-4 leading-8 text-gray-600">
                Our project also explores blockchain technology as
                a way to strengthen the transparency and traceability
                of donation records as the platform evolves.
              </p>
            </div>

            <div className="rounded-3xl bg-white p-8 shadow-lg">
              <div className="flex items-center gap-4 border-b border-gray-100 pb-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-100 text-2xl text-emerald-700">
                  <FaLightbulb />
                </div>

                <div>
                  <h3 className="text-xl font-bold text-emerald-950">
                    Our Approach
                  </h3>
                  <p className="text-sm text-gray-500">
                    Built around transparency
                  </p>
                </div>
              </div>

              <ul className="mt-6 space-y-5">
                {[
                  "Campaign submission and review",
                  "Supporting evidence for campaigns",
                  "Accessible donation records",
                  "Clear campaign progress information",
                  "Secure user authentication",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <FaCheckCircle className="mt-1 shrink-0 text-emerald-600" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </section>

        {/* TEAM */}
        <section id="our-team" className="scroll-mt-24 px-6 py-20">
          <div className="mx-auto max-w-6xl">

            <div className="text-center">
              <span className="font-bold uppercase tracking-widest text-emerald-600">
                The People Behind TrustChain
              </span>

              <h2 className="mt-4 text-3xl font-bold text-emerald-950 sm:text-4xl">
                Meet Our Team
              </h2>

              <p className="mx-auto mt-4 max-w-2xl leading-7 text-gray-600">
                A team of four working together to build a
                technology-driven disaster-relief donation platform.
              </p>
            </div>

            <div className="mt-14 grid gap-7 sm:grid-cols-2 lg:grid-cols-4">
              {team.map((person) => {
                const Icon = person.icon;

                return (
                  <div
                    key={person.member}
                    className="rounded-2xl border border-emerald-100 bg-white p-7 text-center shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-xl"
                  >
                    <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-800 text-4xl text-white shadow-lg">
                      <Icon />
                    </div>

                    <h3 className="mt-6 text-xl font-bold text-emerald-950">
                      {person.member}
                    </h3>

                    <p className="mt-2 font-semibold text-emerald-600">
                      {person.role}
                    </p>

                    <p className="mt-4 text-sm leading-7 text-gray-600">
                      {person.description}
                    </p>
                  </div>
                );
              })}
            </div>

          </div>
        </section>

        {/* CONTACT */}
        <section id="contact-us" className="scroll-mt-24 bg-emerald-950 px-6 py-20">
          <div className="mx-auto max-w-6xl">

            <div className="text-center">
              <span className="font-bold uppercase tracking-widest text-emerald-300">
                Get in Touch
              </span>

              <h2 className="mt-4 text-3xl font-bold text-white sm:text-4xl">
                Contact Us
              </h2>

              <p className="mx-auto mt-4 max-w-2xl leading-7 text-emerald-100/75">
                Have a question, suggestion or want to know more about
                TrustChain? We'd be happy to hear from you.
              </p>
            </div>

            <div className="mt-14 grid gap-10 md:grid-cols-2">

              {/* Contact details */}
              <div className="space-y-6">

                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="flex items-start gap-5 rounded-2xl border border-emerald-800 bg-emerald-900/60 p-6 transition hover:bg-emerald-900"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-xl text-emerald-300">
                    <FaEnvelope />
                  </div>

                  <div>
                    <h3 className="font-bold text-white">
                      Email Us
                    </h3>
                    <p className="mt-2 break-all text-emerald-200">
                      {CONTACT_EMAIL}
                    </p>
                    <p className="mt-1 text-sm text-emerald-100/60">
                      Click to send an email
                    </p>
                  </div>
                </a>

                <a
                  href={`tel:${CONTACT_PHONE}`}
                  className="flex items-start gap-5 rounded-2xl border border-emerald-800 bg-emerald-900/60 p-6 transition hover:bg-emerald-900"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-xl text-emerald-300">
                    <FaPhone />
                  </div>

                  <div>
                    <h3 className="font-bold text-white">
                      Call Us
                    </h3>
                    <p className="mt-2 text-emerald-200">
                      {CONTACT_PHONE}
                    </p>
                    <p className="mt-1 text-sm text-emerald-100/60">
                      Click to call
                    </p>
                  </div>
                </a>

                <div className="flex items-start gap-5 rounded-2xl border border-emerald-800 bg-emerald-900/60 p-6">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-xl text-emerald-300">
                    <FaMapMarkerAlt />
                  </div>

                  <div>
                    <h3 className="font-bold text-white">
                      Our Platform
                    </h3>
                    <p className="mt-2 text-emerald-200">
                      TrustChain – Disaster Relief Donation Platform
                    </p>
                    <p className="mt-1 text-sm text-emerald-100/60">
                      Supporting transparent relief initiatives
                    </p>
                  </div>
                </div>

              </div>

              {/* Contact form */}
              <form
                onSubmit={handleSubmit}
                className="rounded-3xl bg-white p-7 shadow-xl sm:p-9"
              >
                <h3 className="text-2xl font-bold text-emerald-950">
                  Send Us a Message
                </h3>

                <p className="mt-2 text-sm text-gray-500">
                  Fill in the details below to contact our team.
                </p>

                <div className="mt-7 space-y-5">

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      maxLength={100}
                      placeholder="Enter your name"
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Your Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      maxLength={254}
                      placeholder="Enter your email"
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Subject
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      maxLength={150}
                      placeholder="Enter subject"
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Message *
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      maxLength={3000}
                      rows={5}
                      placeholder="Write your message..."
                      className="w-full resize-y rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    />
                  </div>

                  <button
                    type="submit"
                    className="flex w-full items-center justify-center gap-3 rounded-xl bg-emerald-700 px-6 py-3.5 font-bold text-white transition hover:bg-emerald-800"
                  >
                    Send Message
                    <FaPaperPlane />
                  </button>

                  <p className="text-xs leading-5 text-gray-500">
                    This form opens your default email application with
                    your message prepared. You must send the email from
                    that application to complete the submission.
                  </p>

                </div>
              </form>

            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="px-6 py-20">
          <div className="mx-auto max-w-5xl rounded-3xl bg-gradient-to-r from-emerald-700 to-emerald-950 px-7 py-14 text-center shadow-xl sm:px-14">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Together, We Can Make a Difference
            </h2>

            <p className="mx-auto mt-5 max-w-2xl leading-7 text-emerald-100">
              Discover relief campaigns, learn about the causes and
              become part of a community that believes in helping others.
            </p>

            <a
              href="/campaigns"
              className="mt-8 inline-flex items-center gap-3 rounded-xl bg-white px-7 py-3.5 font-bold text-emerald-800 transition hover:bg-emerald-50"
            >
              Explore Campaigns
              <FaHandsHelping />
            </a>
          </div>
        </section>

      </main>

      <AboutUs />
    </>
  );
}
