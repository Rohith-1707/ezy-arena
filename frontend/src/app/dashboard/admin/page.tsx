'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Settings, LogOut, Plus, ChevronRight, LayoutDashboard } from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();
  const [stadiums, setStadiums] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);

  useEffect(() => {
    setStadiums([
      { id: "stadium-1", name: "Lusail Iconic Stadium", city: "Lusail", capacity: 88900 },
      { id: "stadium-2", name: "MetLife Stadium", city: "East Rutherford", capacity: 82500 }
    ]);
    setMatches([
      { id: "match-1", name: "Argentina vs France (World Cup Final)", date: "2026-07-19", time: "18:00" },
      { id: "match-2", name: "USA vs England", date: "2026-07-12", time: "20:00" }
    ]);
  }, []);

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-6 max-w-5xl mx-auto w-full gap-6">
      {/* Navbar */}
      <nav className="glass-panel p-4 rounded-2xl flex justify-between items-center w-full z-30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-arenaGold/20 flex items-center justify-center border border-arenaGold/30">
            <Settings className="w-5 h-5 text-arenaGold" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-white tracking-wider">EZY SYSTEM ADMIN PANEL</h2>
            <span className="text-[10px] text-white/50 tracking-wider">Configure Stadiums, Matches, and Capacity Constraints</span>
          </div>
        </div>

        <button 
          onClick={() => router.push('/login')} 
          className="p-2.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl transition"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </nav>

      {/* Admin metrics panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Stadium Configuration */}
        <div className="glass-panel p-5 rounded-2xl border border-white/5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Manage Stadium Arenas</h3>
            <button className="p-1 bg-arenaGreen/20 text-arenaGreen rounded hover:bg-arenaGreen/30 transition">
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            {stadiums.map(s => (
              <div key={s.id} className="p-3 bg-white/5 rounded-xl border border-white/5 flex justify-between items-center text-xs">
                <div>
                  <p className="font-bold text-white">{s.name}</p>
                  <p className="text-[10px] text-white/50 mt-0.5">{s.city} • Cap: {s.capacity.toLocaleString()}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-white/40" />
              </div>
            ))}
          </div>
        </div>

        {/* Matches Settings */}
        <div className="glass-panel p-5 rounded-2xl border border-white/5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Scheduled Matches</h3>
            <button className="p-1 bg-arenaGreen/20 text-arenaGreen rounded hover:bg-arenaGreen/30 transition">
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            {matches.map(m => (
              <div key={m.id} className="p-3 bg-white/5 rounded-xl border border-white/5 flex justify-between items-center text-xs">
                <div>
                  <p className="font-bold text-white">{m.name}</p>
                  <p className="text-[10px] text-white/50 mt-0.5">{m.date} at {m.time}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-white/40" />
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
