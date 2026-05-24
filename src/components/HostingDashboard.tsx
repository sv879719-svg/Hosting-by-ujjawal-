import { useState, useEffect, useRef } from "react";
import { Lock, Upload, Server, Clock, AlertTriangle, Play } from "lucide-react";
import axios from "axios";
import { Plan } from "../types";

export default function HostingDashboard({ paymentStatus, selectedPlan }: { paymentStatus: "none" | "pending" | "approved", selectedPlan: Plan | null }) {
  const [password, setPassword] = useState("");
  const [panelUnlocked, setPanelUnlocked] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [appType, setAppType] = useState("python");
  const [timeLeft, setTimeLeft] = useState(selectedPlan?.durationSeconds || 8 * 3600);
  const [runningPid, setRunningPid] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  if (paymentStatus === "pending") {
      return (
        <div className="max-w-4xl mx-auto py-20 px-6 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Payment Pending</h2>
            <p className="text-slate-400">Your payment is being reviewed by the admin. Please wait.</p>
        </div>
      );
  }

  useEffect(() => {
    if (panelUnlocked && timeLeft > 0) {
        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current!);
                    handleStopBot();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [panelUnlocked, timeLeft]);

  const handleStopBot = async () => {
      if (runningPid) {
          try {
              await axios.post("/api/stop", { pid: runningPid });
              setRunningPid(null);
              setPanelUnlocked(false);
              alert("Bot stopped successfully (Uptime limit reached).");
          } catch(e) {
              alert("Error stopping bot");
          }
      }
  };

  const handleStart = async () => {
    if (!password || password !== "nebula123") {
      alert("Please enter correct panel password to start.");
      return;
    }
    
    if (!file) return;
    
    setPanelUnlocked(true);
    setIsDeploying(true);

    const formData = new FormData();
    formData.append("appFile", file);
    formData.append("appType", appType);

    try {
        const response = await axios.post("/api/deploy", formData);
        setRunningPid(response.data.pid);
        alert("Deployment initialized successfully on your infrastructure!");
    } catch (e) {
        alert("Deployment failed.");
        setPanelUnlocked(false);
    } finally {
        setIsDeploying(false);
    }
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-6">
      <h2 className="text-3xl font-bold text-white mb-8">Deploy Infrastructure</h2>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Upload & Config */}
        <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <Upload className="w-5 h-5 text-indigo-400" /> Upload Application
          </h3>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-slate-700 file:text-indigo-300 hover:file:bg-slate-600 mb-4"
          />
          <select 
            value={appType} 
            onChange={(e) => setAppType(e.target.value)}
            className="w-full p-3 mb-4 rounded-xl bg-slate-800 border border-slate-700 text-white"
          >
            <option value="python">Python Bot</option>
            <option value="node">Node.js App</option>
            <option value="telegram">Telegram Bot</option>
            <option value="static">Static Web</option>
          </select>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white mb-4"
            placeholder="Panel Password"
          />
          <button
            onClick={handleStart}
            disabled={!file || isDeploying || panelUnlocked}
            className="w-full py-3 rounded-xl bg-purple-600 text-white font-semibold flex items-center justify-center gap-2 hover:bg-purple-500 disabled:opacity-50"
          >
            <Play className="w-4 h-4" /> {isDeploying ? "Deploying..." : panelUnlocked ? "Running" : "Start Deployment"}
          </button>
        </div>

        {/* Status */}
        <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <Server className="w-5 h-5 text-emerald-400" /> {panelUnlocked ? "Active Deployment" : "Idle Status"}
          </h3>
          <div className="flex items-center gap-4 text-sm text-slate-400 mb-2">
            <Clock className="w-4 h-4 text-indigo-400" /> 8h uptime limit
          </div>
          <div className="text-center py-6 border border-slate-800 rounded-2xl bg-slate-950">
            <div className="text-4xl font-mono text-emerald-500">
                {panelUnlocked ? formatTime(timeLeft) : "--:--:--"}
            </div>
            <div className="text-xs text-slate-500 mt-2">Time remaining ({selectedPlan?.name || "Free"} Plan)</div>
          </div>
        </div>
      </div>
    </div>
  );
}
