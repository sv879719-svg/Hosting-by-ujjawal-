import { useState } from "react";
import { motion } from "motion/react";
import { Check, X } from "lucide-react";
import { Plan } from "../types";

export default function PricingPlans({ onStatusChange }: { onStatusChange: (s: "pending", p: Plan) => void }) {
  const [showModal, setShowModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  const plans: Plan[] = [
    { name: "Free", price: "$0", durationSeconds: 8 * 3600, features: ["1x Bot Deployment", "8h Uptime", "Limited RAM"] },
    { name: "Pro", price: "$9", durationSeconds: 30 * 24 * 3600, features: ["5x Deployments", "24/7 Uptime", "Better CPU/RAM"] },
    { name: "Elite", price: "$29", durationSeconds: 365 * 24 * 3600, features: ["Unlimited", "24/7 Uptime", "Dedicated Resources"] },
  ];

  return (
    <section id="plans" className="max-w-7xl mx-auto px-6 py-20">
      <h2 className="text-4xl font-bold text-center text-white mb-16">Choose Your Plan</h2>
      <div className="grid md:grid-cols-3 gap-8">
        {plans.map((plan, i) => (
          <motion.div key={i} whileHover={{ y: -5 }} className="p-8 rounded-3xl bg-slate-900 border border-slate-800">
            <h3 className="text-2xl font-bold text-white mb-4">{plan.name}</h3>
            <div className="text-4xl font-bold text-indigo-400 mb-6">{plan.price}<span className="text-sm text-slate-500 font-normal">/mo</span></div>
            <ul className="space-y-4 mb-8">
              {plan.features.map((feat) => (
                <li key={feat} className="flex items-center gap-2 text-slate-300">
                  <Check className="w-5 h-5 text-emerald-500" /> {feat}
                </li>
              ))}
            </ul>
            <button
               onClick={() => { setSelectedPlan(plan); setShowModal(true); }}
               className="w-full py-3 rounded-xl bg-slate-800 text-white font-semibold hover:bg-indigo-600">
              Select Plan
            </button>
          </motion.div>
        ))}
      </div>

      {showModal && selectedPlan && (
        <div className="fixed inset-0 bg-slate-950/90 z-50 flex items-center justify-center p-6">
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-slate-900 p-8 rounded-3xl border border-slate-700 max-w-sm w-full">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-white">Make Payment ({selectedPlan.name})</h3>
                <button onClick={() => setShowModal(false)}><X className="text-slate-400"/></button>
            </div>
            <div className="bg-white p-4 rounded-xl mb-6">
                 <img src="/qr_code.png" alt="Payment QR" className="mx-auto w-48 h-48 border-2 border-slate-300" onError={(e) => (e.currentTarget.src = "https://placehold.co/200x200?text=Upload+QR+Here")} />
            </div>
            <p className="text-sm text-slate-400 mb-6 text-center">Scan this QR. After payment, click "Confirm" to send to Admin for approval.</p>
            <button 
              onClick={() => { onStatusChange("pending", selectedPlan); setShowModal(false); }}
              className="w-full py-3 rounded-xl bg-indigo-600 text-white font-semibold">
              Confirm Payment
            </button>
          </motion.div>
        </div>
      )}
    </section>
  );
}
