import { useEffect, useRef, useState } from "react";

const languages = [
  { code: "en", name: "English" },
  { code: "zh-CN", name: "中文 (Chinese)" },
  { code: "hi", name: "हिन्दी (Hindi)" },
  { code: "es", name: "Español (Spanish)" },
  { code: "fr", name: "Français (French)" },
  { code: "ar", name: "العربية (Arabic)" },
  { code: "bn", name: "বাংলা (Bengali)" },
  { code: "pt", name: "Português (Portuguese)" },
  { code: "ru", name: "Русский (Russian)" },
  { code: "ur", name: "اردو (Urdu)" },
  { code: "id", name: "Bahasa Indonesia" },
  { code: "de", name: "Deutsch (German)" },
  { code: "ja", name: "日本語 (Japanese)" },
  { code: "sw", name: "Kiswahili (Swahili)" },
  { code: "mr", name: "मराठी (Marathi)" },
  { code: "te", name: "తెలుగు (Telugu)" },
  { code: "tr", name: "Türkçe (Turkish)" },
  { code: "ta", name: "தமிழ் (Tamil)" },
  { code: "vi", name: "Tiếng Việt (Vietnamese)" },
  { code: "ko", name: "한국어 (Korean)" },
  { code: "it", name: "Italiano (Italian)" },
  { code: "th", name: "ไทย (Thai)" },
  { code: "gu", name: "ગુજરાતી (Gujarati)" },
  { code: "fa", name: "فارسی (Persian)" },
  { code: "pl", name: "Polski (Polish)" },
  { code: "uk", name: "Українська (Ukrainian)" },
  { code: "kn", name: "ಕನ್ನಡ (Kannada)" },
  { code: "ml", name: "മലയാളം (Malayalam)" },
  { code: "pa", name: "ਪੰਜਾਬੀ (Punjabi)" },
  { code: "my", name: "မြန်မာ (Burmese)" },
  { code: "ha", name: "Hausa" },
  { code: "jw", name: "Basa Jawa (Javanese)" },
  { code: "nl", name: "Nederlands (Dutch)" },
  { code: "ro", name: "Română (Romanian)" },
  { code: "ne", name: "नेपाली (Nepali)" },
  { code: "sd", name: "سنڌي (Sindhi)" },
  { code: "am", name: "አማርኛ (Amharic)" },
  { code: "yo", name: "Yorùbá (Yoruba)" },
  { code: "ig", name: "Igbo" },
  { code: "uz", name: "Oʻzbek (Uzbek)" },
  { code: "si", name: "සිංහල (Sinhala)" },
  { code: "ps", name: "پښتو (Pashto)" },
  { code: "ms", name: "Bahasa Melayu (Malay)" },
  { code: "km", name: "ខ្មែរ (Khmer)" },
  { code: "az", name: "Azərbaycan (Azerbaijani)" },
  { code: "kk", name: "Қазақша (Kazakh)" },
  { code: "cs", name: "Čeština (Czech)" },
  { code: "el", name: "Ελληνικά (Greek)" },
  { code: "hu", name: "Magyar (Hungarian)" },
  { code: "or", name: "ଓଡ଼ିଆ (Odia)" },
];

const getCookieLang = () => {
  const match = document.cookie.match(/googtrans=\/[^/]+\/([^;]+)/);
  return match ? decodeURIComponent(match[1]) : "en";
};

const setTranslateCookie = (code) => {
  const value = `/en/${code}`;
  document.cookie = `googtrans=${value}; path=/`;
  if (window.location.hostname !== "localhost") {
    document.cookie = `googtrans=${value}; path=/; domain=${window.location.hostname}`;
  }
};

const clearTranslateCookie = () => {
  const expire = "expires=Thu, 01 Jan 1970 00:00:00 GMT";
  document.cookie = `googtrans=; ${expire}; path=/`;
  if (window.location.hostname !== "localhost") {
    document.cookie = `googtrans=; ${expire}; path=/; domain=${window.location.hostname}`;
  }
};

export default function LanguageSelector() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState("en");
  const wrapperRef = useRef(null);

  // Load Google Translate once
  useEffect(() => {
    setCurrent(getCookieLang());

    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        { pageLanguage: "en", autoDisplay: false },
        "google_translate_element"
      );
    };

    if (!document.getElementById("google-translate-script")) {
      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.src =
        "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const changeLanguage = (code) => {
    setOpen(false);
    setCurrent(code);

    // Back to original English
    if (code === "en") {
      clearTranslateCookie();
      window.location.reload();
      return;
    }

    // Use Google's hidden dropdown if it is ready
    const combo = document.querySelector("select.goog-te-combo");
    if (combo) {
      combo.value = code;
      combo.dispatchEvent(new Event("change"));
    } else {
      // Fallback: set cookie and reload
      setTranslateCookie(code);
      window.location.reload();
    }
  };

  return (
    <div ref={wrapperRef} className="relative" translate="no">
      {/* Hide Google's default banner and widget */}
      <style>{`
        .goog-te-banner-frame, .skiptranslate iframe, #goog-gt-tt,
        .goog-te-balloon-frame { display: none !important; }
        .skiptranslate { display: none !important; }
        body { top: 0 !important; }
        .goog-text-highlight { background: none !important; box-shadow: none !important; }
      `}</style>
      <div id="google_translate_element" className="hidden" />

      {/* Globe button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label="Change language"
        aria-expanded={open}
        className={`flex h-11 w-11 items-center justify-center rounded-full border transition-all duration-300 hover:bg-green-100 hover:text-emerald-700 hover:border-emerald-400 ${
          open
            ? "bg-green-100 text-emerald-700 border-emerald-400"
            : "border-emerald-200 text-emerald-900"
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18" />
          <path d="M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.500 5.700 12 3z" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full z-50 mt-3 w-64 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl">
          <p className="border-b border-gray-100 px-4 py-3 text-sm font-semibold text-emerald-900">
            Select Language
          </p>
          <ul className="max-h-72 overflow-y-auto py-2">
            {languages.map((lang) => (
              <li key={lang.code}>
                <button
                  type="button"
                  onClick={() => changeLanguage(lang.code)}
                  className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-colors duration-200 hover:bg-emerald-50 hover:text-emerald-700 ${
                    current === lang.code
                      ? "bg-green-50 font-semibold text-emerald-700"
                      : "text-gray-700"
                  }`}
                >
                  <span>{lang.name}</span>
                  {current === lang.code && <span>✓</span>}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}