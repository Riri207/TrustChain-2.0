
import MyCampaigns from "./pages/MyCampaigns";
import { Routes, Route } from "react-router-dom";
import Profile from "./pages/Profile";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MyDonations from "./pages/MyDonations";
import ProtectedRoute from "./components/ProtectedRoute";
import CreateCampaignPage from "./pages/CreateCampaignPage";
import VerifierDashboard from "./pages/VerifierDashboard";
import Donate from "./pages/Donate";
import CampaignsPage from "./pages/CampaignsPage";
import ImpactPage from "./pages/ImpactPage";
import About from "./pages/About";

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/campaigns" element={<CampaignsPage />} />
      <Route path="/impact" element={<ImpactPage />} />
      <Route path="/about" element={<About />} />

      {/* Public campaign details and donation page */}
      <Route path="/campaign/:id" element={<Donate />} />

      {/* Verifier Dashboard: verifier and admin only */}
      <Route
        path="/verifier/dashboard"
        element={
          <ProtectedRoute allowedRoles={["verifier", "admin"]} />
        }
      >
        <Route index element={<VerifierDashboard />} />
      </Route>

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/my-donations" element={<MyDonations />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/my-campaigns" element={<MyCampaigns />} />
      </Route>

      {/* Campaign creation: donor and creator only */}
      <Route
        path="/create-campaign"
        element={
          <ProtectedRoute allowedRoles={["donor", "creator"]} />
        }
      >
        <Route index element={<CreateCampaignPage />} />
      </Route>
    </Routes>
  );
}

export default App;
