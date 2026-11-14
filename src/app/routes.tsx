import { Navigate, Route, Routes } from "react-router-dom";
import DashboardPage from "../components/dashboard/DashboardPage";
import LandingPage from "../components/landing/LandingPage";
import MissionDetailPage from "../components/mission/MissionDetailPage";
import MissionLaunchPage from "../components/mission/MissionLaunchPage";
import MissionSelectionPage from "../components/mission/MissionSelectionPage";
import MissionResultsPage from "../components/results/MissionResultsPage";
import WorldMapPage from "../components/world/WorldMapPage";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/worlds" element={<WorldMapPage />} />
      <Route path="/missions" element={<MissionSelectionPage />} />
      <Route path="/missions/:id" element={<MissionDetailPage />} />
      <Route path="/missions/:id/launch" element={<MissionLaunchPage />} />
      <Route path="/missions/:id/results" element={<MissionResultsPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
