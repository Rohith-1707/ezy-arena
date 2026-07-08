'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Activity, Users, ShieldAlert, ShoppingBag, Info, Compass, 
  Leaf, AlertTriangle, RefreshCw, BarChart2, Plus, Clock, Compass as WindIcon 
} from 'lucide-react';
import { io } from 'socket.io-client';

export default function OrganizerDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'entry' | 'security' | 'crowd' | 'food' | 'washroom' | 'medical' | 'transit' | 'sustainability'>('entry');
  const [entryData, setEntryData] = useState<any>({ gates: [], avgWaitTime: 5 });
  const [crowdData, setCrowdData] = useState<any>({ zones: [] });
  const [securityData, setSecurityData] = useState<any>({ lanes: [] });
  const [vendorData, setVendorData] = useState<any>({ vendors: [] });
  const [parkingData, setParkingData] = useState<any>({ lots: [] });
  const [sustainabilityData, setSustainabilityData] = useState<any>({
    electricity: 1850, water: 480, plasticWasteKg: 124, foodWasteKg: 88, carbonGrams: 990
  });

  // Socket client listeners for real time updates
  useEffect(() => {
    const savedUser = localStorage.getItem('ezy_arena_user');
    if (!savedUser) {
      router.push('/login');
      return;
    }
    const user = JSON.parse(savedUser);
    if (user.role !== 'ORGANIZER' && user.role !== 'ADMIN') {
      router.push('/login');
      return;
    }

    // Connect to Express Socket.IO server
    const socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000');

    socket.emit('join_room', 'organizer');

    socket.on('entry_telemetry', (data) => setEntryData(data));
    socket.on('crowd_telemetry', (data) => setCrowdData(data));
    socket.on('security_telemetry', (data) => setSecurityData(data));
    socket.on('vendor_telemetry', (data) => setVendorData(data));
    socket.on('parking_telemetry', (data) => setParkingData(data));
    socket.on('sustainability_telemetry', (data) => setSustainabilityData(data));

    return () => {
      socket.disconnect();
    };
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-6 max-w-7xl mx-auto w-full gap-6">
      {/* Top Operations Header */}
      <nav className="glass-panel p-4 rounded-2xl flex justify-between items-center w-full z-30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-arenaGreen/20 flex items-center justify-center border border-arenaGreen/30">
            <Activity className="w-5 h-5 text-arenaGreen" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-white tracking-wider">EZY ARENA OPERATIONS CONTROL (HQ)</h2>
            <span className="text-[10px] text-white/50 tracking-wider">FIFA World Cup 2026 Live Telemetry Feed</span>
          </div>
        </div>

        <button 
          onClick={() => router.push('/login')} 
          className="px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl text-xs font-semibold transition"
        >
          Exit Ops Room
        </button>
      </nav>

      {/* Tabs list */}
      <div className="flex flex-wrap gap-2 bg-white/5 p-1.5 rounded-2xl">
        {[
          { id: 'entry', label: 'Entry Queues', icon: Clock },
          { id: 'security', label: 'Security Lanes', icon: ShieldAlert },
          { id: 'crowd', label: 'Crowd Heatmap', icon: Users },
          { id: 'food', label: 'Food Demand', icon: ShoppingBag },
          { id: 'washroom', label: 'Restrooms', icon: Info },
          { id: 'medical', label: 'Medical Alert', icon: AlertTriangle },
          { id: 'transit', label: 'Parking & Transit', icon: Compass },
          { id: 'sustainability', label: 'Sustainability', icon: Leaf }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
              activeTab === tab.id 
                ? 'bg-arenaGreen text-slate-950 shadow-md' 
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Active screen rendering */}
      <div className="w-full">
        
        {/* TAB 1: Entry Queues */}
        {activeTab === 'entry' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-8 glass-panel p-5 rounded-2xl border border-white/5">
              <h3 className="text-sm font-bold text-white mb-4">Gate Status & Capacity Utilization</h3>
              <div className="space-y-4">
                {entryData.gates.length > 0 ? entryData.gates.map((g: any) => (
                  <div key={g.name} className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-white">{g.name}</span>
                      <span className={`${
                        g.status === 'FULL' ? 'text-red-400' : g.status === 'WARNING' ? 'text-arenaGold' : 'text-arenaGreen'
                      }`}>{g.currentCount}/{g.capacity} spectators ({g.status})</span>
                    </div>
                    <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-1000 ${
                          g.status === 'FULL' ? 'bg-red-500' : g.status === 'WARNING' ? 'bg-arenaGold' : 'bg-arenaGreen'
                        }`}
                        style={{ width: `${(g.currentCount / g.capacity) * 100}%` }}
                      />
                    </div>
                  </div>
                )) : (
                  <p className="text-xs text-white/50 animate-pulse">Waiting for backend telemetry broadcast...</p>
                )}
              </div>
            </div>

            <div className="md:col-span-4 glass-panel p-5 rounded-2xl border border-white/5 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-white mb-2">Operational Wait Times</h3>
                <p className="text-3xl font-extrabold text-arenaGreen">{entryData.avgWaitTime || 4} mins</p>
                <p className="text-[10px] text-white/50 mt-1">Average wait index across active gates A-E.</p>
              </div>

              <div className="border-t border-white/5 pt-4 mt-6">
                <span className="text-[9px] text-arenaGold font-bold uppercase tracking-wider block mb-1">AI Redirect Recommendation</span>
                <p className="text-xs text-white/80 leading-relaxed">
                  Gate D is nearing full occupancy capacity slot block. Redirect upcoming arrivals towards Gate E using push alerts to balance capacity.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Security Lanes */}
        {activeTab === 'security' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {securityData.lanes?.map((lane: any) => (
              <div key={lane.id} className="glass-panel p-4.5 rounded-2xl border border-white/5">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-bold text-white">{lane.name}</span>
                  <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${
                    lane.status === 'ACTIVE' ? 'bg-arenaGreen/20 text-arenaGreen' : 'bg-white/5 text-white/40'
                  }`}>{lane.status}</span>
                </div>
                <div className="space-y-2 mt-4 text-xs">
                  <div className="flex justify-between">
                    <span className="text-white/50">Screening Time:</span>
                    <span className="text-white font-bold">{lane.screeningTimeSec} seconds</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/50">Lane Staff:</span>
                    <span className="text-white font-semibold">{lane.staff}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: Crowd Heatmaps */}
        {activeTab === 'crowd' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-8 glass-panel p-5 rounded-2xl border border-white/5">
              <h3 className="text-sm font-bold text-white mb-4">Crowd Density Zones</h3>
              <div className="space-y-4">
                {crowdData.zones?.map((zone: any) => (
                  <div key={zone.zoneId} className="flex justify-between items-center text-xs">
                    <div>
                      <span className="text-white font-semibold block">{zone.name}</span>
                      <span className="text-[10px] text-white/50">{zone.zoneId}</span>
                    </div>
                    <span className={`px-2.5 py-1 rounded-lg font-bold ${
                      zone.color === 'red' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                      zone.color === 'orange' ? 'bg-arenaGold/20 text-arenaGold border border-arenaGold/30' :
                      'bg-arenaGreen/20 text-arenaGreen border border-arenaGreen/30'
                    }`}>
                      {Math.floor(zone.density * 100)}% density
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="md:col-span-4 glass-panel p-5 rounded-2xl border border-white/5 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-white mb-1">AI Predictive Flow</h3>
                <span className="text-[9px] text-arenaGold font-bold uppercase tracking-wider block mb-3">Next 15 Minutes</span>
                <p className="text-xs text-white/70 leading-relaxed">
                  Concourse crowding near Gate B is expected to increase by 18% as the entry slot block starts. Deploy volunteers to East outer corridor.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Food Demand */}
        {activeTab === 'food' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {vendorData.vendors?.map((v: any) => (
              <div key={v.id} className="glass-panel p-4.5 rounded-2xl border border-white/5">
                <span className="text-[9px] text-white/40 block">VENDOR ID: {v.id}</span>
                <h4 className="text-xs font-bold text-white mt-1">Concession Queue</h4>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-white/50">Queue Length:</span>
                    <span className="text-white font-bold">{v.queueLength} orders</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-white/50">Avg Prep Delay:</span>
                    <span className="text-arenaGreen font-bold">{v.avgPrepTime} minutes</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 5: Restrooms occupancy */}
        {activeTab === 'washroom' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "Restroom Concourse North", capacity: 85, status: "WARNING", cleaning: "Cleaning complete" },
              { name: "Restroom Concourse East", capacity: 30, status: "OPTIMAL", cleaning: "Cleaning due in 20m" },
              { name: "Restroom Concourse West", capacity: 98, status: "CRITICAL", cleaning: "Maintenance alert sent" }
            ].map(r => (
              <div key={r.name} className="glass-panel p-4.5 rounded-2xl border border-white/5">
                <h4 className="text-xs font-bold text-white mb-3">{r.name}</h4>
                <div className="flex justify-between items-center text-xs mt-4">
                  <span className="text-white/50">Load capacity:</span>
                  <span className={`font-bold ${
                    r.status === 'CRITICAL' ? 'text-red-400' : r.status === 'WARNING' ? 'text-arenaGold' : 'text-arenaGreen'
                  }`}>{r.capacity}%</span>
                </div>
                <span className="text-[10px] text-white/40 block mt-2">{r.cleaning}</span>
              </div>
            ))}
          </div>
        )}

        {/* TAB 6: Medical requests dispatch */}
        {activeTab === 'medical' && (
          <div className="glass-panel p-5 rounded-2xl border border-white/5 text-center py-10">
            <ShieldAlert className="w-12 h-12 text-red-500 mx-auto animate-pulse mb-4" />
            <h3 className="text-base font-bold text-white mb-2">Emergency Medical Dispatch Desk</h3>
            <p className="text-xs text-white/60 max-w-md mx-auto mb-6">
              Track emergency beacon requests dispatched from spectator seats. Response crew channels remain active.
            </p>
            <div className="bg-white/5 border border-white/5 max-w-lg mx-auto rounded-xl p-3.5 text-left text-xs">
              <span className="text-[10px] text-red-400 font-bold block mb-1">LIVE DISPATCH COORDINATES</span>
              <p className="text-white font-medium">Alert location: Section 104, Row K, Seat 12</p>
              <p className="text-white/60 mt-1">Status: Medical team responder route computed (20m distance, ETA 1m 15s)</p>
            </div>
          </div>
        )}

        {/* TAB 7: Transit */}
        {activeTab === 'transit' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {parkingData.lots?.map((lot: any) => (
              <div key={lot.id} className="glass-panel p-4.5 rounded-2xl border border-white/5">
                <span className="text-[9px] text-arenaGold font-bold uppercase tracking-wider block">{lot.name}</span>
                <div className="mt-4 flex justify-between items-center text-xs">
                  <span className="text-white/60">Occupancy status:</span>
                  <span className="text-white font-extrabold">{lot.occupied}/{lot.total} ({Math.floor((lot.occupied / lot.total) * 100)}%)</span>
                </div>
                <div className="w-full h-1.5 bg-white/10 rounded-full mt-2 overflow-hidden">
                  <div className="h-full bg-arenaGold" style={{ width: `${(lot.occupied / lot.total) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 8: Sustainability telemetry */}
        {activeTab === 'sustainability' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-8 glass-panel p-5 rounded-2xl border border-white/5 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-center">
                <span className="text-[9px] text-white/50 block">ELECTRICITY</span>
                <span className="text-lg font-extrabold text-white block mt-1">{sustainabilityData.electricity} kW</span>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-center">
                <span className="text-[9px] text-white/50 block">WATER FLOW</span>
                <span className="text-lg font-extrabold text-white block mt-1">{sustainabilityData.water} L/m</span>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-center">
                <span className="text-[9px] text-white/50 block">PLASTIC WASTE</span>
                <span className="text-lg font-extrabold text-white block mt-1">{sustainabilityData.plasticWasteKg} kg</span>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-center">
                <span className="text-[9px] text-white/50 block">CARBON FOOTPRINT</span>
                <span className="text-lg font-extrabold text-white block mt-1">{sustainabilityData.carbonGrams} g</span>
              </div>
            </div>

            <div className="md:col-span-4 glass-panel p-5 rounded-2xl border border-white/5">
              <span className="text-[9px] text-arenaGreen font-bold uppercase tracking-wider block mb-1">AI Sustainability suggestion</span>
              <p className="text-xs text-white/80 leading-relaxed">
                Water recycling flow is at maximum capacity. Dim stadium outer rings floodlights by 10% after 22:00 to reduce carbon footprint by estimated 45kg.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
