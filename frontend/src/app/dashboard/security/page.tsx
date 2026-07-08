'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, ShieldAlert, Scan, Loader2, LogOut } from 'lucide-react';

export default function SecurityDashboard() {
  const router = useRouter();
  const [tokenInput, setTokenInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [scanError, setScanError] = useState('');

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim() || loading) return;
    setLoading(true);
    setScanResult(null);
    setScanError('');

    try {
      const token = localStorage.getItem('ezy_arena_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/tickets/scan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || ''}`
        },
        body: JSON.stringify({ qrCodeToken: tokenInput })
      });

      const data = await res.json();
      if (res.ok) {
        setScanResult(data);
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      setScanError(err.message || "Invalid Ticket Pass Token.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-6 max-w-4xl mx-auto w-full gap-6">
      {/* Navbar */}
      <nav className="glass-panel p-4 rounded-2xl flex justify-between items-center w-full z-30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-arenaGreen/20 flex items-center justify-center border border-arenaGreen/30">
            <Scan className="w-5 h-5 text-arenaGreen" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-white tracking-wider">EZY SECURITY ACCESS CENTRE</h2>
            <span className="text-[10px] text-white/50 tracking-wider">Active Entrance Scanning Gate B</span>
          </div>
        </div>

        <button 
          onClick={() => router.push('/login')} 
          className="p-2.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl transition"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </nav>

      {/* Validator scanner card */}
      <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-6">
        <div className="text-center max-w-sm mx-auto">
          <Scan className="w-8 h-8 text-arenaGreen mx-auto mb-3 animate-pulse" />
          <h3 className="text-sm font-bold text-white mb-1">Spectator QR Pass Scanner</h3>
          <p className="text-[11px] text-white/50">Verify spectator tickets slot assignments and authorize entry gate access.</p>
        </div>

        <form onSubmit={handleScan} className="flex flex-col gap-3 max-w-md mx-auto">
          <div>
            <label className="text-[10px] text-white/40 font-bold block mb-1.5 uppercase">QR Pass Verification Code</label>
            <input
              type="text"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="e.g. EZY-QR-LUSAIL-MATCH-101-ARG-FRA-MOCK"
              required
              className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs md:text-sm font-mono text-center"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !tokenInput.trim()}
            className="w-full py-2.5 bg-arenaGreen hover:bg-arenaGreen/90 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs md:text-sm flex items-center justify-center gap-1.5 transition glow-green"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Verify & Validate Access Pass
          </button>
        </form>

        {/* Scan Results Display */}
        {scanResult && (
          <div className="max-w-md mx-auto p-4 bg-arenaGreen/10 border border-arenaGreen/20 rounded-2xl flex items-start gap-3">
            <ShieldCheck className="w-6 h-6 text-arenaGreen flex-shrink-0" />
            <div>
              <p className="text-xs text-white font-bold uppercase tracking-wider">{scanResult.message}</p>
              <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1.5 text-[11px] text-white/70">
                <span>Ticket ID: {scanResult.ticket?.ticketNumber}</span>
                <span>Gate: {scanResult.ticket?.entryGate}</span>
                <span>Seat: {scanResult.ticket?.seatNumber}</span>
                <span>Slot: {scanResult.ticket?.entrySlot}</span>
              </div>
            </div>
          </div>
        )}

        {scanError && (
          <div className="max-w-md mx-auto p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3">
            <ShieldAlert className="w-6 h-6 text-red-400 flex-shrink-0" />
            <div>
              <p className="text-xs text-white font-bold uppercase tracking-wider">Access Blocked</p>
              <p className="text-[11px] text-red-300 mt-1">{scanError}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
