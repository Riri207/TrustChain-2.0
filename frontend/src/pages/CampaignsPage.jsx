
import Navbar from "../components/Navbar";
import CampaignSection from "../components/CampaignSection";

export default function CampaignsPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <CampaignSection />
      </main>
    </>
  );
}
