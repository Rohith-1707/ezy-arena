'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, AlertTriangle, Crosshair, LogOut } from 'lucide-react';

export default function MedicalDashboard() {
  const router = useRouter();
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    setAlerts([
      { id: "alert-1", location: "Section 104, Row K, Seat 12", type: "Chest Pain / Shortness of breath", status: "RESPONDING", timestamp: "5 mins ago" }
    ]);
  }, []);

  const resolveAlert = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: "RESOLVED" } : a));
  };

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-6 max-w-4xl mx-auto w-full gap-6">
      {/* Navbar */}
      <nav className="glass-panel p-4 rounded-2xl flex justify-between items-center w-full z-30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center border border-red-500/30">
            <AlertTriangle className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-white tracking-wider">EZY MEDICAL RESPONDER HQ</h2>
            <span className="text-[10px] text-white/50 tracking-wider">First Aid Station 2 Active Dispatch</span>
          </div>
        </div>

        <button 
          onClick={() => router.push('/login')} 
          className="p-2.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl transition"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </nav>

      {/* Emergency Alerts Feed */}
      <div className="glass-panel p-5 rounded-2xl border border-white/5">
        <h3 className="text-sm font-bold text-white mb-4">Emergency Incident Beacons</h3>

        <div className="space-y-4">
          {alerts.map(a => (
            <div key={a.id} className="p-4 bg-white/5 rounded-xl border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 rounded text-[8px] font-bold bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse">{a.status}</span>
                  <span className="text-xs font-bold text-white">{a.type}</span>
                </div>
                <p className="text-[10px] text-white/50 mt-1">Location: {a.location} ({a.timestamp})</p>
              </div>

              {a.status !== 'RESOLVED' && (
                <button
                  onClick={() => resolveAlert(a.id)}
                  className="px-3.5 py-1.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg text-xs transition"
                >
                  Mark Resolved
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
