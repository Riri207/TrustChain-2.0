import { useEffect, useState } from "react";

const slides = [
  {
    image: "/images/Earthquake.jpg",
    label: "EARTHQUAKE RELIEF",
    title: "Rebuilding Lives Begins With Trust.",
    description:
      "Help verified relief campaigns bring hope and essential support to communities affected by disasters.",
    button: "Support Verified Relief",
  },
  {
    image: "/images/Education.jpg",
    label: "EDUCATION",
    title: "Every Child Deserves a Chance to Shine.",
    description:
      "Connect with verified initiatives working to create better opportunities for children and underserved communities.",
    button: "Explore Verified Campaigns",
  },
  {
    image: "/images/Flood.jpg",
    label: "FLOOD RELIEF",
    title: "In Every Crisis, Let Compassion Reach Further.",
    description:
      "Help trusted relief initiatives reach families facing emergencies with timely support.",
    button: "Help Families Recover",
  },
  {
    image: "/images/Trustgiving.jpg",
    label: "TRANSPARENT GIVING",
    title: "Give With Confidence. Make Every Contribution Count.",
    description:
      "Discover verified campaigns and follow available donation records for greater transparency.",
    button: "Give With Trust",
  },
  {
    image: "/images/Volunteergivingfood.jpg",
    label: "SUPPORTING NGOs",
    title: "Empower NGOs. Deliver Hope. Build Trust.",
    description:
      "We help people discover verified NGOs and relief campaigns, making it easier to support meaningful work.",
    button: "Discover Trusted Causes",
  },
];

export default function Hero() {
  const [activeSlide, setActiveSlide] = useState(0);
  const currentSlide = slides[activeSlide];

  const previousSlide = () => {
    setActiveSlide((current) =>
      (current - 1 + slides.length) % slides.length
    );
  };

  const nextSlide = () => {
    setActiveSlide((current) =>
      (current + 1) % slides.length
    );
  };

  useEffect(() => {
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      id="home"
      className="relative isolate mx-auto h-[440px] w-full overflow-hidden bg-emerald-50 sm:h-[480px] lg:h-[510px]"
    >
      {/* Background images: cover the full hero */}
      {slides.map((slide, index) => (
        <img
          key={slide.image}
          src={slide.image}
          alt=""
          aria-hidden="true"
          className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-700 ${
            index === activeSlide ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}

      {/* Soft overlay behind the text */}
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-50/95 via-emerald-50/80 to-emerald-50/20 sm:from-emerald-50/90 sm:via-emerald-50/65 sm:to-transparent" />

      {/* Content */}
      <div className="relative z-[1] mx-auto flex h-full max-w-[1500px] items-center px-12 py-8 sm:px-16 lg:px-20">
        <div className="w-full max-w-xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-xs font-bold tracking-wide text-white sm:text-sm">
            <span aria-hidden="true">✦</span>
            {currentSlide.label}
          </span>

          <h1
            key={currentSlide.title}
            className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-emerald-950 sm:text-4xl lg:text-5xl"
          >
            {currentSlide.title}
          </h1>

          <p className="mt-4 max-w-lg text-sm leading-6 text-emerald-950/85 sm:text-base sm:leading-7">
            {currentSlide.description}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="#campaigns"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-emerald-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 sm:px-6"
            >
              {currentSlide.button}
              <span aria-hidden="true">→</span>
            </a>

            
          </div>

          <p className="mt-4 text-xs font-medium text-emerald-950/75 sm:text-sm">
            Verified campaigns. Transparent donations. Stronger communities.
          </p>
        </div>
      </div>

      {/* Previous slide */}
      <button
        type="button"
        onClick={previousSlide}
        aria-label="Previous slide"
        className="absolute left-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-emerald-800/40 bg-white/90 text-xl text-emerald-900 shadow-sm hover:bg-white sm:left-5 sm:h-11 sm:w-11"
      >
        ‹
      </button>

      {/* Next slide */}
      <button
        type="button"
        onClick={nextSlide}
        aria-label="Next slide"
        className="absolute right-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-emerald-800/40 bg-white/90 text-xl text-emerald-900 shadow-sm hover:bg-white sm:right-5 sm:h-11 sm:w-11"
      >
        ›
      </button>

      {/* Slide indicators */}
      <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full bg-white/90 px-3 py-2 shadow-sm">
        {slides.map((slide, index) => (
          <button
            key={slide.image}
            type="button"
            onClick={() => setActiveSlide(index)}
            aria-label={`Show slide ${index + 1}: ${slide.label}`}
            aria-current={index === activeSlide ? "true" : undefined}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              index === activeSlide
                ? "w-6 bg-emerald-700"
                : "w-2.5 bg-emerald-900/25 hover:bg-emerald-700/50"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
