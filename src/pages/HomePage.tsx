import { motion } from "motion/react";
import { ArrowRight, Server, ShieldCheck, Zap } from "lucide-react";
import PricingPlans from "../components/PricingPlans";
import { Plan } from "../types";

interface HomePageProps {
  onGetStarted: () => void;
  onStatusChange: (s: "pending", p: Plan) => void;
}

export default function HomePage({ onGetStarted, onStatusChange }: HomePageProps) {
  return (
    <div className="min-h-screen bg-slate-950 pt-10">
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter text-white mb-8">
            The Future of <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-400 to-purple-500">Cloud Hosting</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10">
            Deploy your apps in seconds with our high-performance, containerized infrastructure. Secure, scalable, and powered by neon-fast technology.
          </p>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={onGetStarted}
              className="px-8 py-4 rounded-full bg-indigo-600 text-white font-semibold hover:bg-indigo-500 transition-all shadow-[0_0_20px_rgba(79,70,229,0.4)]"
            >
              Get Started Free
            </button>
            <button className="px-8 py-4 rounded-full bg-slate-800 text-slate-200 font-semibold hover:bg-slate-700 transition-all border border-slate-700">
              View Plans
            </button>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-20 grid md:grid-cols-3 gap-8">
        {[
          { icon: Server, title: "High Availability", desc: "99.99% uptime guarantee with load balancing.", glow: "indigo" },
          { icon: ShieldCheck, title: "Ironclad Security", desc: "DDoS protection and isolated environment.", glow: "purple" },
          { icon: Zap, title: "Lightning Fast", desc: "NVMe storage and global edge network.", glow: "blue" },
        ].map((feat, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -10 }}
            className="p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl"
          >
            <div className={`p-4 rounded-2xl w-fit mb-6 bg-${feat.glow}-500/10`}>
              <feat.icon className={`w-8 h-8 text-${feat.glow}-400`} />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">{feat.title}</h3>
            <p className="text-slate-400 text-sm">{feat.desc}</p>
          </motion.div>
        ))}
      </section>
      
      <PricingPlans onStatusChange={onStatusChange} />
    </div>
  );
}
