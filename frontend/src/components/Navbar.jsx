
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LanguageSelector from "./LanguageSelector";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const { isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Navigate to a Home page section
  const scrollToSection = (sectionId) => {
    setMenuOpen(false);

    if (location.pathname !== "/") {
      navigate("/", {
        state: { scrollTo: sectionId },
      });
      return;
    }

    if (sectionId === "home") {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
      return;
    }

    document.getElementById(sectionId)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  // Main navigation links
  const links = [
    { name: "Home", href: "#home", section: "home" },
    { name: "Campaigns", href: "/campaigns", route: true },
    { name: "Our Impact", href: "/impact", route: true },
    { name: "How it Works", section: "how-it-works" },
    { name: "About", href: "/about", route: true },
  ];

  // Active route styling
  const isActive = (link) => {
    if (link.route) {
      return location.pathname === link.href;
    }

    if (link.section === "home") {
      return location.pathname === "/";
    }

    return false;
  };

  // Common navigation renderer
  const renderNavLink = (link, className) => {
    const active = isActive(link);

    const activeClass = active
      ? "border-emerald-600 text-emerald-700"
      : "border-transparent text-gray-700 hover:border-emerald-500 hover:text-emerald-700";

    if (link.route) {
      return (
        <Link
          key={link.name}
          to={link.href}
          onClick={() => setMenuOpen(false)}
          aria-current={active ? "page" : undefined}
          className={`${className} ${activeClass}`}
        >
          {link.name}
        </Link>
      );
    }

    return (
      <button
        key={link.name}
        type="button"
        onClick={() => scrollToSection(link.section)}
        className={`${className} ${activeClass}`}
      >
        {link.name}
      </button>
    );
  };

  // Handle logout
  const handleLogout = () => {
    setMenuOpen(false);
    logout();
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-sm">
      <nav className="mx-auto flex max-w-[1500px] items-center justify-between px-5 py-3 sm:px-8 lg:px-12">

        {/* Logo */}
        <Link
          to="/"
          onClick={(e) => {
            setMenuOpen(false);

            if (location.pathname === "/") {
              e.preventDefault();
              window.scrollTo({
                top: 0,
                behavior: "smooth",
              });
            }
          }}
          className="flex shrink-0 items-center gap-3 text-left"
          aria-label="TrustChain Home"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-3xl sm:h-14 sm:w-14">
            🌿
          </div>

          <div translate="no">
            <h1 className="text-xl font-bold tracking-tight text-emerald-950 sm:text-2xl lg:text-3xl">
              TrustChain
            </h1>
            <p className="text-xs font-medium text-emerald-700 sm:text-sm">
              Giving with Trust
            </p>
          </div>
        </Link>

        {/* Desktop navigation */}
        <div className="hidden items-center gap-5 lg:flex xl:gap-8">
          {links.map((link) =>
            renderNavLink(
              link,
              "border-b-2 py-2 text-sm font-medium transition xl:text-base"
            )
          )}
        </div>

        {/* Authentication and language */}
        <div className="flex items-center gap-3">

          <div className="hidden shrink-0 items-center gap-3 md:flex">
            {isAuthenticated ? (
              <>
                <Link
                  to="/my-donations"
                  className={`rounded-full px-5 py-3 font-semibold transition ${
                    location.pathname === "/my-donations"
                      ? "bg-emerald-200 text-emerald-900"
                      : "bg-green-100 text-emerald-800 hover:bg-emerald-200"
                  }`}
                >
                  My Donations
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-full bg-emerald-700 px-5 py-3 font-semibold text-white transition hover:bg-emerald-800"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className={`rounded-full px-6 py-3 font-semibold transition ${
                  location.pathname === "/login"
                    ? "bg-emerald-200 text-emerald-900"
                    : "bg-green-100 text-emerald-800 hover:bg-emerald-200"
                }`}
              >
                ♙ Login
              </Link>
            )}
          </div>

          <LanguageSelector />

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setMenuOpen((previous) => !previous)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            className="rounded-lg border border-emerald-200 p-2 text-emerald-900 md:hidden"
          >
            {menuOpen ? (
              <span className="text-2xl">✕</span>
            ) : (
              <span className="text-2xl">☰</span>
            )}
          </button>
        </div>
      </nav>

      {/* Tablet navigation */}
      <div className="hidden items-center justify-center gap-5 border-t border-gray-100 px-4 py-3 md:flex lg:hidden">
        {links.map((link) =>
          renderNavLink(
            link,
            "border-b-2 py-1 text-sm font-medium transition"
          )
        )}

        {isAuthenticated && (
          <Link
            to="/my-donations"
            className={`text-sm font-semibold ${
              location.pathname === "/my-donations"
                ? "text-emerald-900"
                : "text-emerald-700"
            }`}
          >
            My Donations
          </Link>
        )}
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div
          id="mobile-navigation"
          className="absolute left-0 top-full w-full border-t border-gray-100 bg-white p-5 shadow-lg md:hidden"
        >
          <div className="flex flex-col gap-1">

            {links.map((link) =>
              renderNavLink(
                link,
                "rounded-lg border-l-4 px-4 py-3 text-left font-medium transition"
              )
            )}

            <div className="mt-3 border-t border-gray-100 pt-4">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/my-donations"
                    onClick={() => setMenuOpen(false)}
                    className="mb-2 block w-full rounded-full bg-green-100 px-4 py-3 text-center font-semibold text-emerald-800"
                  >
                    My Donations
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="block w-full rounded-full bg-emerald-700 px-4 py-3 text-center font-semibold text-white"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="block w-full rounded-full bg-emerald-700 px-4 py-3 text-center font-semibold text-white"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
