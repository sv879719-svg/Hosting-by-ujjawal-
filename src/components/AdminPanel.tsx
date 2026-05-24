import { useState, useEffect } from "react";
import { Lock, X, Check, AlertTriangle } from "lucide-react";
import axios from "axios";

export default function AdminPanel({ onApprove }: { onApprove: () => void }) {
  const [password, setPassword] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [processes, setProcesses] = useState<{ pid: number; name: string }[]>([]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (unlocked) {
        const fetchProcesses = () => axios.get("/api/processes").then(res => setProcesses(res.data));
        fetchProcesses();
        interval = setInterval(fetchProcesses, 3000); // Poll every 3 seconds
    }
    return () => clearInterval(interval);
  }, [unlocked]);

  if (!unlocked) {
    return (
      <div className="bg-slate-900 border border-slate-700 p-8 rounded-3xl max-w-sm mx-auto mt-20">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Lock className="text-indigo-400" /> Admin Access
        </h2>
        <input 
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Admin Password"
          className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white mb-4"
        />
        <button 
          onClick={() => { if(password === "2244") setUnlocked(true); else alert("Wrong Password"); }}
          className="w-full py-3 bg-indigo-600 rounded-xl text-white font-semibold"
        >
          Unlock
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-6">
        <h2 className="text-3xl font-bold text-white mb-8">Admin Panel</h2>
        
        <h3 className="text-xl text-white mb-4">Pending Approvals</h3>
        <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 mb-8">
            <div className="flex justify-between items-center bg-slate-800 p-4 rounded-xl text-slate-300">
                <span>User: sv879719@gmail.com</span>
                <span>Plan: Pro</span>
                <button onClick={onApprove} className="text-emerald-400 flex items-center gap-1">
                    <Check /> Approve
                </button>
            </div>
        </div>

        <h3 className="text-xl text-white mb-4">Running Processes</h3>
        <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800">
            {processes.map(p => (
                <div key={p.pid} className="text-slate-300 p-2 border-b border-slate-800 flex justify-between">
                    <span>{p.name}</span>
                    <span className="text-slate-500">PID: {p.pid}</span>
                </div>
            ))}
        </div>
    </div>
  );
}
