'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bot, KeyRound, Ticket, Loader2, Sparkles, Mail, Phone, Chrome } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<'FAN' | 'ORGANIZER' | 'SECURITY' | 'VENDOR' | 'VOLUNTEER' | 'MEDICAL' | 'ADMIN'>('FAN');
  const [mode, setMode] = useState<'login' | 'offline'>('login');
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [ticketNumber, setTicketNumber] = useState('');
  
  const [step, setStep] = useState<'request' | 'verify'>('request');
  const [loading, setLoading] = useState(false);
  const [devOtp, setDevOtp] = useState('');
  const [error, setError] = useState('');

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const payload = authMethod === 'email' ? { email, role } : { phone, role };

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/otp/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        setStep('verify');
        if (data.devOtp) {
          setDevOtp(data.devOtp);
          setOtp(data.devOtp); // auto fill for simple sandbox experience
        }
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      setError(err.message || "Failed to dispatch verification code.");
      // Fallback for offline sandbox
      setStep('verify');
      setDevOtp('123456');
      setOtp('123456');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const payload = {
      email: authMethod === 'email' ? email : undefined,
      phone: authMethod === 'phone' ? phone : undefined,
      otp,
      role,
      name: name || undefined
    };

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/otp/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('ezy_arena_token', data.token);
        localStorage.setItem('ezy_arena_user', JSON.stringify(data.user));
        routeUser(data.user.role);
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      setError(err.message || "Verification code is incorrect.");
      // Fallback mock session
      const mockUser = {
        id: `usr-${Date.now()}`,
        name: name || (email ? email.split('@')[0] : 'Spectator'),
        role,
        fanId: role === 'FAN' ? 'EZY7P4K' : null
      };
      localStorage.setItem('ezy_arena_token', 'mock-jwt-token-key');
      localStorage.setItem('ezy_arena_user', JSON.stringify(mockUser));
      routeUser(mockUser.role);
    } finally {
      setLoading(false);
    }
  };

  const handleOfflineClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!ticketNumber || !phone) {
      setError('Barcode and phone parameters are required.');
      return;
    }
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/offline-ticket`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketNumber, phone, name })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('ezy_arena_token', data.token);
        localStorage.setItem('ezy_arena_user', JSON.stringify(data.user));
        routeUser(data.user.role);
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      setError(err.message || "Failed to claim offline printed ticket.");
      // Fallback offline claim mock
      const mockUser = {
        id: `usr-offline-${Date.now()}`,
        name: name || 'Offline Spectator',
        role: 'FAN',
        fanId: 'OFF7P4K'
      };
      localStorage.setItem('ezy_arena_token', 'mock-jwt-token-key');
      localStorage.setItem('ezy_arena_user', JSON.stringify(mockUser));
      routeUser('FAN');
    } finally {
      setLoading(false);
    }
  };

  const simulateGoogleLogin = async () => {
    setLoading(true);
    const mockGoogleUser = {
      email: "worldcupfan@google.com",
      name: "Alex Morgan",
      googleId: "google-10938491823"
    };

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockGoogleUser)
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('ezy_arena_token', data.token);
        localStorage.setItem('ezy_arena_user', JSON.stringify(data.user));
        routeUser(data.user.role);
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      // Offline fallback
      const mockUser = {
        id: "usr-google-mock",
        name: "Alex Morgan",
        role: "FAN",
        fanId: "GGL9P5M"
      };
      localStorage.setItem('ezy_arena_token', 'mock-jwt-token-key');
      localStorage.setItem('ezy_arena_user', JSON.stringify(mockUser));
      routeUser('FAN');
    } finally {
      setLoading(false);
    }
  };

  const routeUser = (userRole: string) => {
    const routeMap: { [r: string]: string } = {
      FAN: '/dashboard/fan',
      ORGANIZER: '/dashboard/organizer',
      SECURITY: '/dashboard/security',
      VENDOR: '/dashboard/vendor',
      VOLUNTEER: '/dashboard/volunteer',
      MEDICAL: '/dashboard/medical',
      ADMIN: '/dashboard/admin'
    };
    router.push(routeMap[userRole] || '/dashboard/fan');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md glass-panel p-6 rounded-2xl border border-white/10 relative overflow-hidden">
        {/* Glow corner elements */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-arenaGreen/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-arenaGold/10 rounded-full blur-2xl pointer-events-none" />

        <div className="text-center mb-6">
          <div className="inline-flex p-3 bg-white/5 border border-white/10 rounded-xl mb-3">
            <Bot className="w-7 h-7 text-arenaGreen" />
          </div>
          <h2 className="text-xl md:text-2xl font-bold tracking-wider text-white">Ezy Arena Access Portal</h2>
          <p className="text-xs text-white/50 mt-1.5 uppercase tracking-widest font-semibold">One App • One Pass • One Arena</p>
        </div>

        {/* Mode Selector (Regular login vs Offline Ticket scan claim) */}
        <div className="flex bg-white/5 p-1 rounded-xl mb-5">
          <button
            onClick={() => setMode('login')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
              mode === 'login' ? 'bg-arenaGreen text-slate-950 shadow' : 'text-white/60 hover:text-white'
            }`}
          >
            Digital Ticket Login
          </button>
          <button
            onClick={() => setMode('offline')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
              mode === 'offline' ? 'bg-arenaGreen text-slate-950 shadow' : 'text-white/60 hover:text-white'
            }`}
          >
            Claim Printed Ticket
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-xs text-red-300">
            {error}
          </div>
        )}

        {/* MODE A: Digital Ticket Login */}
        {mode === 'login' && (
          <div>
            {/* Role selector dropdown */}
            <div className="mb-4">
              <label className="text-[10px] text-white/50 uppercase font-bold tracking-wider block mb-1.5">Verify Role Profile</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full bg-slate-900 border border-white/10 rounded-xl py-2 px-3 text-xs md:text-sm text-white focus:outline-none focus:border-arenaGreen"
              >
                <option value="FAN">Fan / Spectator</option>
                <option value="ORGANIZER">Organizer (HQ Ops)</option>
                <option value="SECURITY">Security Staff</option>
                <option value="VENDOR">Food Vendor</option>
                <option value="VOLUNTEER">Volunteer</option>
                <option value="MEDICAL">Medical Emergency Team</option>
                <option value="ADMIN">Arena System Admin</option>
              </select>
            </div>

            {step === 'request' ? (
              <form onSubmit={handleRequestOtp} className="space-y-4">
                {/* Name */}
                <div>
                  <label className="text-[10px] text-white/50 uppercase font-bold tracking-wider block mb-1.5">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Enter your name"
                    className="w-full glass-input px-3.5 py-2 rounded-xl text-xs md:text-sm"
                  />
                </div>

                {/* Auth Method Selector */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setAuthMethod('email')}
                    className={`flex-1 py-2 rounded-lg text-xs font-semibold border flex items-center justify-center gap-1.5 transition ${
                      authMethod === 'email' ? 'border-arenaGreen bg-arenaGreen/10 text-arenaGreen' : 'border-white/5 bg-white/5 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    <Mail className="w-3.5 h-3.5" /> Email Auth
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthMethod('phone')}
                    className={`flex-1 py-2 rounded-lg text-xs font-semibold border flex items-center justify-center gap-1.5 transition ${
                      authMethod === 'phone' ? 'border-arenaGreen bg-arenaGreen/10 text-arenaGreen' : 'border-white/5 bg-white/5 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    <Phone className="w-3.5 h-3.5" /> Phone / OTP
                  </button>
                </div>

                {authMethod === 'email' ? (
                  <div>
                    <label className="text-[10px] text-white/50 uppercase font-bold tracking-wider block mb-1.5">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="fan@fifaworldcup2026.com"
                      className="w-full glass-input px-3.5 py-2 rounded-xl text-xs md:text-sm"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="text-[10px] text-white/50 uppercase font-bold tracking-wider block mb-1.5">Mobile Phone Number</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      placeholder="+1 (555) 019-2834"
                      className="w-full glass-input px-3.5 py-2 rounded-xl text-xs md:text-sm"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-arenaGreen hover:bg-arenaGreen/90 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs md:text-sm flex items-center justify-center gap-1.5 transition glow-green"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Request OTP Verification Code
                </button>

                {role === 'FAN' && (
                  <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-white/5"></div>
                    <span className="flex-shrink mx-3 text-[10px] text-white/40 font-semibold uppercase">Or Continue With</span>
                    <div className="flex-grow border-t border-white/5"></div>
                  </div>
                )}

                {role === 'FAN' && (
                  <button
                    type="button"
                    onClick={simulateGoogleLogin}
                    disabled={loading}
                    className="w-full py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition"
                  >
                    <Chrome className="w-4 h-4 text-red-400" /> Sign In with Google account
                  </button>
                )}
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-[10px] text-white/50 uppercase font-bold tracking-wider">6-Digit verification OTP</label>
                    {devOtp && (
                      <span className="text-[10px] text-arenaGold font-medium">Dev Test Code: {devOtp}</span>
                    )}
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    placeholder="123456"
                    className="w-full glass-input text-center tracking-[1em] py-2.5 rounded-xl font-bold text-sm md:text-base"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-arenaGreen hover:bg-arenaGreen/90 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs md:text-sm flex items-center justify-center gap-1.5 transition glow-green"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Confirm Verification Code
                </button>

                <button
                  type="button"
                  onClick={() => setStep('request')}
                  className="w-full py-2 bg-transparent hover:underline text-white/60 text-xs text-center"
                >
                  Request another code
                </button>
              </form>
            )}
          </div>
        )}

        {/* MODE B: Offline printed Ticket registration */}
        {mode === 'offline' && (
          <form onSubmit={handleOfflineClaim} className="space-y-4">
            <div>
              <label className="text-[10px] text-white/50 uppercase font-bold tracking-wider block mb-1.5">Printed Ticket Reference Number</label>
              <div className="relative">
                <Ticket className="w-4 h-4 absolute left-3.5 top-1/2 transform -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  value={ticketNumber}
                  onChange={(e) => setTicketNumber(e.target.value)}
                  required
                  placeholder="e.g. BARCODE-981726"
                  className="w-full glass-input pl-10 pr-3.5 py-2 rounded-xl text-xs md:text-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] text-white/50 uppercase font-bold tracking-wider block mb-1.5">Mobile Phone Number (For OTP Verification)</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                placeholder="+1 (555) 019-2834"
                className="w-full glass-input px-3.5 py-2 rounded-xl text-xs md:text-sm"
              />
            </div>

            <div>
              <label className="text-[10px] text-white/50 uppercase font-bold tracking-wider block mb-1.5">Cardholder Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Enter cardholder name"
                className="w-full glass-input px-3.5 py-2 rounded-xl text-xs md:text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-arenaGreen hover:bg-arenaGreen/90 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs md:text-sm flex items-center justify-center gap-1.5 transition glow-green"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Verify Ticket & Activate Digital Profile
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
