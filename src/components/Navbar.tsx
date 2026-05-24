import { Cloud } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const location = useLocation();

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-indigo-500/10 shadow-[0_0_15px_rgba(99,102,241,0.3)]">
            <Cloud className="w-8 h-8 text-indigo-400" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">Nebula</span>
        </Link>
        <div className="flex items-center gap-6 text-sm font-medium text-slate-400">
          <Link to="/" className={`hover:text-indigo-400 transition-colors ${location.pathname === '/' ? 'text-indigo-400' : ''}`}>Hosting</Link>
          <Link to="/dashboard" className={`px-5 py-2.5 rounded-full bg-slate-900 border border-slate-700 hover:border-indigo-500 hover:text-white transition-all shadow-[0_0_10px_rgba(0,0,0,0.5)] ${location.pathname === '/dashboard' ? 'border-indigo-500' : ''}`}>
            Dashboard
          </Link>
          <Link to="/admin" className={`hover:text-indigo-400 transition-colors ${location.pathname === '/admin' ? 'text-indigo-400' : ''}`}>Admin</Link>
        </div>
      </div>
    </nav>
  );
}
