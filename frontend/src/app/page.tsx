'use client';

import React from 'react';
import Link from 'next/link';
import { Bot, Ticket, MapPin, Sparkles, User, ShoppingBag, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col justify-between p-6">
      {/* 1. Header Toolbar */}
      <header className="flex justify-between items-center max-w-6xl mx-auto w-full py-4">
        <div className="flex items-center gap-2">
          <Bot className="w-6 h-6 text-arenaGreen" />
          <span className="font-extrabold text-white tracking-widest text-lg">EZY ARENA</span>
        </div>
        <Link 
          href="/login" 
          className="px-4.5 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
        >
          <User className="w-3.5 h-3.5" /> Sign In
        </Link>
      </header>

      {/* 2. Hero Section */}
      <main className="max-w-4xl mx-auto w-full text-center flex-1 flex flex-col justify-center items-center py-12 md:py-24">
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-arenaGold/10 border border-arenaGold/20 rounded-full text-arenaGold text-[10px] font-bold uppercase tracking-widest mb-6">
          <Sparkles className="w-3.5 h-3.5" /> FIFA World Cup 2026 Ready
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight leading-tight max-w-3xl">
          AI-Powered Smart Stadium Platform
        </h1>

        <p className="text-sm md:text-lg text-white/60 mt-4 max-w-xl font-medium tracking-wide">
          One App. One Pass. One Arena. Discover live indoor mapping, smart slot reservations, seat food delivery, and customized stadium designs.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <Link
            href="/login"
            className="px-6 py-3.5 bg-arenaGreen hover:bg-arenaGreen/90 text-slate-950 font-bold rounded-xl text-xs md:text-sm flex items-center justify-center gap-2 transition glow-green"
          >
            Enter Arena Hub <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/login?mode=offline"
            className="px-6 py-3.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-semibold rounded-xl text-xs md:text-sm flex items-center justify-center gap-2 transition"
          >
            Claim Printed Ticket
          </Link>
        </div>

        {/* Dynamic Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-16 w-full max-w-5xl text-left">
          <div className="glass-panel p-5 rounded-2xl border border-white/5">
            <div className="w-10 h-10 rounded-xl bg-arenaGreen/10 flex items-center justify-center text-arenaGreen mb-3">
              <Ticket className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white tracking-wide">Smart Entry Slots</h3>
            <p className="text-[11px] text-white/50 mt-1">Reserve custom 5-minute capacity blocks to bypass lines with dynamic gate directions.</p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-white/5">
            <div className="w-10 h-10 rounded-xl bg-arenaGold/10 flex items-center justify-center text-arenaGold mb-3">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white tracking-wide">Indoor Navigation</h3>
            <p className="text-[11px] text-white/50 mt-1">Live vector seating grids tracking washrooms, concession stands, and medical hubs.</p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-white/5">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-400 mb-3">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white tracking-wide">In-Seat Delivery</h3>
            <p className="text-[11px] text-white/50 mt-1">Order food directly to your seat with real-time vendor orders tracking panels.</p>
          </div>
        </div>
      </main>

      {/* 3. Footer */}
      <footer className="max-w-6xl mx-auto w-full py-6 text-center border-t border-white/5 text-[10px] text-white/30 tracking-wider">
        © 2026 Ezy Arena platform. All rights reserved. Built for supreme arena logistics.
      </footer>
    </div>
  );
}
