
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import CampaignSection from "../components/CampaignSection";
import CreateCampaign from "../components/CreateCampaign";
import HowItWorks from "../components/HowItWorks";
import OurImpact from "../components/OurImpact";
import Blog from "../components/Blog";
import FAQsSection from "../components/FAQs";
import AboutUs from "../components/AboutUs";

export default function Home() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const sectionId = location.state?.scrollTo;

    if (!sectionId) return;

    requestAnimationFrame(() => {
      document.getElementById(sectionId)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });

    // Clear navigation state after handling the scroll
    navigate("/", { replace: true, state: null });
  }, [location, navigate]);

  return (
    <>
      <Navbar />
      <Hero />
      <CampaignSection limit={6} />
      <CreateCampaign />
      <HowItWorks />
      <OurImpact />
      <Blog />
      <FAQsSection />
      <AboutUs />
    </>
  );
}
