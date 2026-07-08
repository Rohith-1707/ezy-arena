'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, Bot, Map, ShoppingBag, Bell, CloudSun, AlertTriangle, 
  Settings, LogOut, Clock, Compass, Sparkles, ShieldAlert 
} from 'lucide-react';
import { StadiumMap } from '@/components/StadiumMap';
import { AIAssistant } from '@/components/AIAssistant';
import { FoodOrdering } from '@/components/FoodOrdering';
import { ThemeCustomizer } from '@/components/ThemeCustomizer';

export default function FanDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [activePanel, setActivePanel] = useState<'map' | 'food' | 'ai' | 'theme'>('map');
  const [tickets, setTickets] = useState<any[]>([]);
  const [countdown, setCountdown] = useState('02:45:12');
  const [notifications, setNotifications] = useState<any[]>([
    { id: 1, title: "Gate Entry Starting Soon", message: "Your allocated entry slot begins in 15 minutes. Proceed to Gate B.", type: "warning" },
    { id: 2, title: "Weather Update", message: "Clear evening skies predicted. Perfect football match temperature (26°C).", type: "info" }
  ]);
  const [emergencySent, setEmergencySent] = useState(false);

  // Authenticate user
  useEffect(() => {
    const savedUser = localStorage.getItem('ezy_arena_user');
    if (!savedUser) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(savedUser));

    // Seed mock tickets
    setTickets([
      {
        id: "tkt-101",
        matchName: "Argentina vs France (World Cup Final)",
        stadiumName: "Lusail Iconic Stadium",
        matchDate: "2026-07-19",
        matchTime: "18:00",
        seatNumber: "Section 104, Row K, Seat 12",
        entryGate: "Gate B",
        entrySlot: "17:15 - 17:20",
        qrCodeToken: "EZY-QR-LUSAIL-MATCH-101-ARG-FRA-MOCK",
        status: "ACTIVE"
      }
    ]);

    // Countdown logic
    const interval = setInterval(() => {
      const now = new Date();
      const hours = 2 - now.getHours() % 3;
      const mins = 59 - now.getMinutes();
      const secs = 59 - now.getSeconds();
      setCountdown(
        `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('ezy_arena_user');
    localStorage.removeItem('ezy_arena_token');
    router.push('/login');
  };

  const triggerEmergency = () => {
    setEmergencySent(true);
    setNotifications(prev => [
      { id: Date.now(), title: "Emergency Broadcast Sent", message: "Medical responder crew dispatched to Section 104, Row K, Seat 12.", type: "emergency" },
      ...prev
    ]);

    // Emit live medical alert dispatch
    // Simulated Socket emit
    setTimeout(() => {
      setEmergencySent(false);
    }, 5000);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-6 max-w-7xl mx-auto w-full gap-6">
      {/* 1. Navbar */}
      <nav className="glass-panel p-4 rounded-2xl flex justify-between items-center w-full z-30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-arenaGreen/20 flex items-center justify-center border border-arenaGreen/30">
            <Bot className="w-5 h-5 text-arenaGreen" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-white tracking-wider">EZY FAN CENTRE</h2>
            <span className="text-[10px] text-white/50 tracking-wider">Permanent ID: {user.fanId || 'PENDING'}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-white">{user.name}</p>
            <span className="text-[9px] text-arenaGold uppercase tracking-widest font-semibold">{user.role}</span>
          </div>
          <button 
            onClick={handleLogout}
            className="p-2.5 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-red-400 text-white/70 rounded-xl transition"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </nav>

      {/* 2. Dashboard Grid Core */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Ticket QR Pass & Live Countdown */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Encrypted QR Pass Card */}
          <div className="glass-panel p-5 rounded-3xl border border-white/5 text-center relative overflow-hidden flex flex-col items-center">
            <div className="absolute top-[-50px] right-[-50px] w-24 h-24 bg-arenaGold/10 rounded-full blur-xl" />
            
            <span className="text-[9px] text-arenaGold uppercase font-bold tracking-widest block mb-1">Encrypted Match pass</span>
            <h3 className="text-sm font-extrabold text-white mb-4 line-clamp-1">{tickets[0]?.matchName || 'Match Kickoff'}</h3>

            {/* Simulated encrypted QR Canvas */}
            <div className="w-44 h-44 bg-white p-3 rounded-2xl shadow-xl relative group">
              <div className="w-full h-full bg-slate-950 flex items-center justify-center text-white text-[10px] font-mono tracking-widest relative overflow-hidden">
                {/* Visual QR bars */}
                <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#00FF66_1px,transparent_1px)] [background-size:16px_16px]" />
                <Compass className="w-10 h-10 text-arenaGreen animate-spin-slow z-10" />
                <span className="absolute bottom-2 inset-x-0 text-[8px] text-center z-10">{user.fanId}</span>
              </div>
            </div>

            <p className="text-[10px] text-white/50 mt-4">QR codes rotate automatically for safety locks.</p>

            <div className="grid grid-cols-2 gap-4 mt-6 border-t border-white/5 pt-4 w-full text-left">
              <div>
                <span className="text-[9px] text-white/40 block">Seat Location</span>
                <span className="text-xs text-white font-bold">{tickets[0]?.seatNumber || 'Section 104'}</span>
              </div>
              <div>
                <span className="text-[9px] text-white/40 block">Gate Allocation</span>
                <span className="text-xs text-arenaGreen font-bold">{tickets[0]?.entryGate || 'Gate B'}</span>
              </div>
            </div>
          </div>

          {/* countdown and Weather */}
          <div className="grid grid-cols-2 gap-4">
            <div className="glass-panel p-4.5 rounded-2xl border border-white/5 flex flex-col justify-between">
              <div className="flex items-center justify-between text-white/40">
                <Clock className="w-4 h-4" />
                <span className="text-[9px] font-bold uppercase tracking-widest">Entry Slot</span>
              </div>
              <div className="mt-4">
                <span className="text-xl md:text-2xl font-extrabold text-white block tracking-wider">{countdown}</span>
                <span className="text-[9px] text-arenaGreen font-semibold">{tickets[0]?.entrySlot}</span>
              </div>
            </div>

            <div className="glass-panel p-4.5 rounded-2xl border border-white/5 flex flex-col justify-between">
              <div className="flex items-center justify-between text-white/40">
                <CloudSun className="w-4 h-4" />
                <span className="text-[9px] font-bold uppercase tracking-widest">Weather</span>
              </div>
              <div className="mt-4">
                <span className="text-xl md:text-2xl font-extrabold text-white block">26°C</span>
                <span className="text-[9px] text-white/60 font-medium">Lusail Clear Night</span>
              </div>
            </div>
          </div>

          {/* Emergency Alert Button */}
          <button
            onClick={triggerEmergency}
            disabled={emergencySent}
            className={`w-full py-4.5 rounded-2xl border font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition ${
              emergencySent 
                ? 'bg-red-600/30 border-red-500 text-red-300' 
                : 'bg-red-500/10 border-red-500/20 hover:bg-red-500/20 text-red-400'
            }`}
          >
            <ShieldAlert className="w-5 h-5 animate-pulse" />
            {emergencySent ? 'Emergency Crew Notified' : 'Emergency Assistance Button'}
          </button>
        </div>

        {/* Right Side: Map, Concessions, Assistant panels switcher */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Main Action Tabs */}
          <div className="flex bg-white/5 p-1 rounded-2xl gap-1">
            {[
              { id: 'map', label: 'Stadium Map', icon: Map },
              { id: 'food', label: 'Order Food', icon: ShoppingBag },
              { id: 'ai', label: 'AI Buddy', icon: Bot },
              { id: 'theme', label: 'Aesthetics', icon: Settings }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActivePanel(tab.id as any)}
                className={`flex-1 py-3 rounded-xl text-xs font-semibold flex flex-col md:flex-row items-center justify-center gap-1.5 transition ${
                  activePanel === tab.id 
                    ? 'bg-arenaGreen text-slate-950 shadow-lg' 
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Loaded Panels Switch Box */}
          <div className="w-full">
            {activePanel === 'map' && <StadiumMap />}
            {activePanel === 'food' && <FoodOrdering />}
            {activePanel === 'ai' && <AIAssistant />}
            {activePanel === 'theme' && <ThemeCustomizer />}
          </div>

          {/* Notifications feed */}
          <div className="glass-panel p-4.5 rounded-2xl border border-white/5">
            <div className="flex items-center gap-2 mb-3.5 border-b border-white/5 pb-2">
              <Bell className="w-4 h-4 text-arenaGold animate-bounce" />
              <span className="font-semibold text-white tracking-wider text-xs md:text-sm">Dynamic Stadium Notifications</span>
            </div>

            <div className="space-y-3">
              {notifications.map(notif => (
                <div 
                  key={notif.id}
                  className={`p-3 rounded-xl border text-xs leading-relaxed ${
                    notif.type === 'emergency' 
                      ? 'bg-red-500/20 border-red-500/30 text-red-300' 
                      : notif.type === 'warning'
                      ? 'bg-arenaGold/20 border-arenaGold/30 text-arenaGold'
                      : 'bg-white/5 border-white/5 text-white/80'
                  }`}
                >
                  <p className="font-bold mb-0.5">{notif.title}</p>
                  <p>{notif.message}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
