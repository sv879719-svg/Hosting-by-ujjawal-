/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import HostingDashboard from "./components/HostingDashboard";
import AdminPanel from "./components/AdminPanel";
import { Plan } from "./types";

export default function App() {
  const [activeSection, setActiveSection] = useState<"home" | "dashboard" | "admin">("home");
  const [paymentStatus, setPaymentStatus] = useState<"none" | "pending" | "approved">("none");
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  const handleStatusChange = (status: "pending", plan: Plan) => {
    setPaymentStatus(status);
    setSelectedPlan(plan);
  };

  return (
    <div className="bg-slate-950 min-h-screen font-sans text-slate-100">
      <Navbar activeSection={activeSection} setActiveSection={setActiveSection} />
      {activeSection === "home" ? (
        <HomePage onGetStarted={() => setActiveSection("dashboard")} onStatusChange={handleStatusChange} />
      ) : activeSection === "dashboard" ? (
        <HostingDashboard paymentStatus={paymentStatus} selectedPlan={selectedPlan} />
      ) : (
        <AdminPanel onApprove={() => setPaymentStatus("approved")} />
      )}
    </div>
  );
}
