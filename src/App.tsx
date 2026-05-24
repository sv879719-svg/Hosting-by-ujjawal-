/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import HostingDashboard from "./components/HostingDashboard";
import AdminPanel from "./components/AdminPanel";
import { Plan } from "./types";

export default function App() {
  const [paymentStatus, setPaymentStatus] = useState<"none" | "pending" | "approved">("none");
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  const handleStatusChange = (status: "pending", plan: Plan) => {
    setPaymentStatus(status);
    setSelectedPlan(plan);
  };

  return (
    <BrowserRouter>
      <div className="bg-slate-950 min-h-screen font-sans text-slate-100">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage onStatusChange={handleStatusChange} />} />
          <Route path="/dashboard" element={<HostingDashboard paymentStatus={paymentStatus} selectedPlan={selectedPlan} />} />
          <Route path="/admin" element={<AdminPanel onApprove={() => setPaymentStatus("approved")} />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
