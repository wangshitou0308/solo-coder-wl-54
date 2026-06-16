
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useAppStore } from "./store/appStore";
import Sidebar from "./components/Layout/Sidebar";
import Home from "./pages/Home";
import Report from "./pages/Report";
import WorkOrders from "./pages/WorkOrders";
import Dashboard from "./pages/Dashboard";
import CleanerView from "./pages/CleanerView";
import AdminView from "./pages/AdminView";

function AppContent() {
  const { currentRole } = useAppStore();

  const showSidebar = true;

  return (
    <div className="flex h-screen bg-smoke-100 overflow-hidden">
      {showSidebar && <Sidebar />}
      <main className="flex-1 overflow-hidden">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/report" element={<Report />} />
          <Route path="/workorders" element={<WorkOrders />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/cleaner" element={<CleanerView />} />
          <Route path="/admin" element={<AdminView />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
