'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, LogOut, Info } from 'lucide-react';

export default function VolunteerDashboard() {
  const router = useRouter();
  const [tasks, setTasks] = useState<any[]>([]);

  useEffect(() => {
    setTasks([
      { id: "task-1", title: "Assist Gate B Attendees", location: "Gate B Entrance Corridor", status: "PENDING", description: "Bypass ticket barcodes check error helper." },
      { id: "task-2", title: "Merch Store Line Control", location: "North Concourse Merch Stand", status: "ACTIVE", description: "Direct fans queue towards overflow checkout." }
    ]);
  }, []);

  const completeTask = (taskId: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: "COMPLETED" } : t));
  };

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-6 max-w-4xl mx-auto w-full gap-6">
      {/* Navbar */}
      <nav className="glass-panel p-4 rounded-2xl flex justify-between items-center w-full z-30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-arenaGreen/20 flex items-center justify-center border border-arenaGreen/30">
            <ShieldCheck className="w-5 h-5 text-arenaGreen" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-white tracking-wider">EZY VOLUNTEER ASSIST CENTRE</h2>
            <span className="text-[10px] text-white/50 tracking-wider">Active Service Zone: South Concourse</span>
          </div>
        </div>

        <button 
          onClick={() => router.push('/login')} 
          className="p-2.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl transition"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </nav>

      {/* Tasks Queue */}
      <div className="glass-panel p-5 rounded-2xl border border-white/5">
        <h3 className="text-sm font-bold text-white mb-4">Assigned Assist Tickets</h3>

        <div className="space-y-4">
          {tasks.map(t => (
            <div key={t.id} className="p-4 bg-white/5 rounded-xl border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h4 className="text-xs font-bold text-white uppercase">{t.title}</h4>
                  <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${
                    t.status === 'PENDING' ? 'bg-arenaGold/20 text-arenaGold' :
                    t.status === 'ACTIVE' ? 'bg-sky-500/20 text-sky-400 animate-pulse' :
                    'bg-arenaGreen/20 text-arenaGreen'
                  }`}>{t.status}</span>
                </div>
                <p className="text-[10px] text-white/50 mt-1">Location: {t.location}</p>
                <p className="text-xs text-white/70 mt-2">{t.description}</p>
              </div>

              {t.status !== 'COMPLETED' && (
                <button
                  onClick={() => completeTask(t.id)}
                  className="px-3.5 py-1.5 bg-arenaGreen hover:bg-arenaGreen/80 text-slate-950 font-bold rounded-lg text-xs transition"
                >
                  Mark Completed
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
