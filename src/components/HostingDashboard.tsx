import { useState, useEffect, useRef } from "react";
import { Lock, Upload, Server, Clock, AlertTriangle, Play } from "lucide-react";
import axios from "axios";
import { Plan } from "../types";

export default function HostingDashboard({ paymentStatus, selectedPlan }: { paymentStatus: "none" | "pending" | "approved", selectedPlan: Plan | null }) {
  const [botName, setBotName] = useState("");
  const [panelUnlocked, setPanelUnlocked] = useState(false);
  const [viewMode, setViewMode] = useState<"dashboard" | "bot_detail">("dashboard");
  const [selectedBotPid, setSelectedBotPid] = useState<number | null>(null);
  const [createPassword, setCreatePassword] = useState("");
  const [accessPassword, setAccessPassword] = useState("");
  const [runningBots, setRunningBots] = useState<{ pid: number; name: string }[]>([]);

  const [isDeploying, setIsDeploying] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [appType, setAppType] = useState("python");
  const [timeLeft, setTimeLeft] = useState(selectedPlan?.durationSeconds || 8 * 3600);
  const [logs, setLogs] = useState<string[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const logTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchBots = async () => {
        const res = await axios.get("/api/processes");
        setRunningBots(res.data);
    };
    fetchBots();
    const interval = setInterval(fetchBots, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (viewMode === "bot_detail" && selectedBotPid) {
        logTimerRef.current = setInterval(async () => {
            const response = await axios.get(`/api/logs/${selectedBotPid}`);
            setLogs(response.data);
        }, 1000);
    }
    return () => {
        if (logTimerRef.current) clearInterval(logTimerRef.current);
    };
  }, [viewMode, selectedBotPid]);

  const verifyPassword = async (pid: number) => {
      try {
          await axios.post("/api/verify-password", { pid, password: accessPassword });
          setSelectedBotPid(pid);
          setViewMode("bot_detail");
      } catch (e) {
          alert("Incorrect password");
      }
  };

  const handleStopBot = async (pid: number) => {
          try {
              await axios.post("/api/stop", { pid });
              setViewMode("dashboard");
              setSelectedBotPid(null);
          } catch(e) {
              alert("Error stopping bot");
          }
  };

  const handleStart = async () => {
    if (!createPassword) {
      alert("Please set a password for this server.");
      return;
    }
    
    if (!file) return;
    
    setIsDeploying(true);

    const formData = new FormData();
    formData.append("appFile", file);
    formData.append("appType", appType);
    formData.append("name", botName);
    formData.append("password", createPassword);

    try {
        await axios.post("/api/deploy", formData);
        alert("Deployment initialized!");
    } catch (e) {
        alert("Deployment failed.");
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
    <div className="max-w-6xl mx-auto py-10 px-6">
      <h2 className="text-3xl font-bold text-white mb-8">
        {viewMode === "dashboard" ? "RS Cloud Hosting - Dashboard" : `Bot Detail: ${runningBots.find(b => b.pid === selectedBotPid)?.name || "Unknown"}`}
      </h2>

      {viewMode === "dashboard" ? (
      <div className="grid md:grid-cols-3 gap-8">
        {/* Runnig Bots */}
        <div className="md:col-span-2 p-8 rounded-3xl bg-slate-900 border border-slate-800">
          <h3 className="text-xl font-semibold text-white mb-6">Running Bots</h3>
          <div className="space-y-4">
              {runningBots.map(bot => (
                  <div key={bot.pid} className="p-4 bg-slate-950 rounded-xl flex items-center justify-between border border-slate-800">
                      <span className="text-white font-medium">{bot.name} (PID: {bot.pid})</span>
                      <div className="flex gap-2">
                        <input type="password" placeholder="Password" onChange={(e) => setAccessPassword(e.target.value)} className="bg-slate-900 border border-slate-700 p-2 rounded text-white" />
                        <button onClick={() => verifyPassword(bot.pid)} className="bg-indigo-600 px-4 py-2 rounded-lg text-white">Access</button>
                      </div>
                  </div>
              ))}
          </div>
        </div>

        {/* Deploy New Bot */}
        <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800">
          <h3 className="text-xl font-semibold text-white mb-6">Deploy New Bot</h3>
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
          </select>
          <input
            type="text"
            value={botName}
            onChange={(e) => setBotName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white mb-4"
            placeholder="Bot Display Name"
          />
          <input
            type="password"
            value={createPassword}
            onChange={(e) => setCreatePassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white mb-4"
            placeholder="Password for this bot"
          />
          <button
            onClick={handleStart}
            disabled={!file || isDeploying}
            className="w-full py-3 rounded-xl bg-purple-600 text-white font-semibold flex items-center justify-center gap-2 hover:bg-purple-500 disabled:opacity-50"
          >
            <Play className="w-4 h-4" /> {isDeploying ? "Deploying..." : "Start Deployment"}
          </button>
        </div>
      </div>
      ) : (
          <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800">
              <div className="flex justify-between items-center mb-6">
                <button onClick={() => setViewMode("dashboard")} className="text-slate-400 hover:text-white">← Back to Dashboard</button>
                <button onClick={() => selectedBotPid && handleStopBot(selectedBotPid)} className="bg-red-600 text-white px-4 py-2 rounded-lg">Stop Bot</button>
              </div>
              <div className="bg-slate-950 p-6 rounded-2xl h-96 overflow-y-auto font-mono text-sm text-slate-300">
                  {logs.map((log, i) => <div key={i}>{log}</div>)}
              </div>
          </div>
      )}
    </div>
  );
}
