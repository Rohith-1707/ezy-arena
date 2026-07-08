'use client';

import React, { useState } from 'react';
import { useTheme } from './ThemeWrapper';
import { Palette, Sparkles, Sliders, Image, Video, Check, Loader2, Search } from 'lucide-react';

export const ThemeCustomizer: React.FC = () => {
  const { settings, updateSettings, applyPresetTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<'preset' | 'effects' | 'ai'>('preset');
  const [aiPrompt, setAiPrompt] = useState('');
  const [playerQuery, setPlayerQuery] = useState('');
  const [generating, setGenerating] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any>(null);

  // Pre-configured premium cinematic style tags
  const presets = ["Cyber Blue", "Stadium Lights", "Trophy Celebration", "Match Night", "Minimal Dark"];

  // Search player theme suggestions database mock
  const searchPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerQuery.trim()) return;

    setGenerating(true);
    // Simulating search lookup
    setTimeout(() => {
      const q = playerQuery.toLowerCase();
      let accent = "#00FF66";
      let secondary = "#D4AF37";
      let primary = "#000B29";
      let reasoning = "";

      if (q.includes("messi") || q.includes("lionel")) {
        accent = "#00F0FF"; // Neon cyan
        secondary = "#FFFFFF"; // Sky blue white accents
        primary = "#050F26";
        reasoning = "Found: 'Lionel Messi Celebration Theme' - Sky blue color theme with star dust effect.";
      } else if (q.includes("ronaldo") || q.includes("cristiano")) {
        accent = "#FFD700"; // Signature Gold
        secondary = "#FF0000"; // Red
        primary = "#0E0101";
        reasoning = "Found: 'Cristiano Ronaldo CR7 Theme' - Red and Gold gradient canvas.";
      } else {
        reasoning = `Found customized dynamic layout concept matching: "${playerQuery}".`;
      }

      setAiSuggestions({ reasoning, primary, accent, secondary });
      setGenerating(false);
    }, 1200);
  };

  const generateAIWallpaper = async () => {
    if (!aiPrompt.trim()) return;
    setGenerating(true);

    try {
      const token = localStorage.getItem('ezy_arena_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/ai/theme-wallpaper`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || ''}`
        },
        body: JSON.stringify({ prompt: aiPrompt })
      });
      const data = await res.json();
      if (res.ok) {
        updateSettings({
          themeName: `AI: ${aiPrompt.substring(0, 12)}...`,
          primaryColor: data.themeConfig.primaryColor,
          accentColor: data.themeConfig.accentColor,
          secondaryColor: data.themeConfig.secondaryColor,
          backgroundType: 'DYNAMIC'
        });
      }
    } catch (err) {
      // Local fallback
      updateSettings({
        themeName: `AI: Custom`,
        primaryColor: '#050f0f',
        accentColor: '#00ffcc',
        secondaryColor: '#0077ff',
        backgroundType: 'DYNAMIC'
      });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="w-full flex flex-col bg-slate-950/80 rounded-2xl border border-white/10 overflow-hidden backdrop-blur-xl p-4">
      {/* Selector tab bar */}
      <div className="flex border-b border-white/5 pb-3 mb-4 gap-2">
        <button
          onClick={() => setActiveTab('preset')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
            activeTab === 'preset' ? 'bg-arenaGreen/20 text-arenaGreen border border-arenaGreen/30' : 'text-white/60 hover:text-white'
          }`}
        >
          <Palette className="w-3.5 h-3.5" /> Preset Gallery
        </button>
        <button
          onClick={() => setActiveTab('effects')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
            activeTab === 'effects' ? 'bg-arenaGreen/20 text-arenaGreen border border-arenaGreen/30' : 'text-white/60 hover:text-white'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" /> Theme Effects
        </button>
        <button
          onClick={() => setActiveTab('ai')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
            activeTab === 'ai' ? 'bg-arenaGreen/20 text-arenaGreen border border-arenaGreen/30' : 'text-white/60 hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" /> AI Engine
        </button>
      </div>

      {/* Preset Gallery tab */}
      {activeTab === 'preset' && (
        <div className="space-y-2.5">
          <p className="text-[10px] text-white/50 uppercase tracking-widest font-semibold mb-2">Cinematic Sports Presets</p>
          <div className="grid grid-cols-2 gap-2.5">
            {presets.map(p => (
              <button
                key={p}
                onClick={() => applyPresetTheme(p)}
                className={`p-3 rounded-xl border text-left flex justify-between items-center transition group relative overflow-hidden ${
                  settings.themeName === p 
                    ? 'border-arenaGreen bg-arenaGreen/10 text-arenaGreen' 
                    : 'border-white/5 bg-white/5 hover:border-white/20 text-white'
                }`}
              >
                <div className="z-10">
                  <span className="text-xs font-bold block">{p}</span>
                  <span className="text-[9px] text-white/40 block mt-0.5 group-hover:text-white/60">
                    {p === 'Match Night' ? 'Live Video' : 'Fluid Gradient'}
                  </span>
                </div>
                {settings.themeName === p && <Check className="w-4 h-4 text-arenaGreen z-10" />}
              </button>
            ))}
          </div>

          <div className="border border-white/5 bg-white/5 rounded-xl p-3.5 mt-4">
            <span className="text-[10px] text-arenaGold font-bold uppercase tracking-widest block mb-1">Active Concept Profile</span>
            <p className="text-xs text-white font-medium">{settings.themeName}</p>
            <p className="text-[10px] text-white/50 mt-1">Adaptive color-spaces: {settings.primaryColor} • {settings.accentColor} • {settings.secondaryColor}</p>
          </div>
        </div>
      )}

      {/* Theme Effects sliders tab */}
      {activeTab === 'effects' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3.5">
            {/* Opacity slider */}
            <div className="flex flex-col">
              <label className="text-[10px] text-white/50 font-bold mb-1.5 uppercase">Glass Opacity ({settings.opacity}%)</label>
              <input
                type="range"
                min="10"
                max="80"
                value={settings.opacity}
                onChange={(e) => updateSettings({ opacity: parseInt(e.target.value) })}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-arenaGreen"
              />
            </div>

            {/* Blur slider */}
            <div className="flex flex-col">
              <label className="text-[10px] text-white/50 font-bold mb-1.5 uppercase">Blur Intensity ({settings.blurIntensity}px)</label>
              <input
                type="range"
                min="5"
                max="40"
                value={settings.blurIntensity}
                onChange={(e) => updateSettings({ blurIntensity: parseInt(e.target.value) })}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-arenaGreen"
              />
            </div>

            {/* Brightness slider */}
            <div className="flex flex-col">
              <label className="text-[10px] text-white/50 font-bold mb-1.5 uppercase">Dimmer ({settings.brightness}%)</label>
              <input
                type="range"
                min="40"
                max="100"
                value={settings.brightness}
                onChange={(e) => updateSettings({ brightness: parseInt(e.target.value) })}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-arenaGreen"
              />
            </div>
          </div>

          <div className="border-t border-white/5 pt-3 grid grid-cols-2 gap-3">
            {[
              { label: "Glassmorphic Panels", key: "glassmorphism" },
              { label: "Animated Gradients", key: "animatedGradient" },
              { label: "Floating Particles", key: "particleEffects" },
              { label: "Stadium Lights Lens", key: "stadiumLightAnimation" }
            ].map(item => (
              <label key={item.key} className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={!!(settings as any)[item.key]}
                  onChange={(e) => updateSettings({ [item.key]: e.target.checked })}
                  className="rounded border-white/20 bg-slate-900 text-arenaGreen focus:ring-arenaGreen w-4 h-4 cursor-pointer"
                />
                <span className="text-[11px] text-white/70 font-semibold">{item.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* AI generator / Player Search tab */}
      {activeTab === 'ai' && (
        <div className="space-y-4">
          {/* Player Theme Search */}
          <form onSubmit={searchPlayer} className="flex flex-col gap-2 pb-3.5 border-b border-white/5">
            <label className="text-[10px] text-white/50 font-bold uppercase">Search Player / Team Theme</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={playerQuery}
                onChange={(e) => setPlayerQuery(e.target.value)}
                placeholder="e.g. Lionel Messi"
                className="flex-1 px-3 py-1.5 text-xs bg-white/5 rounded-lg border border-white/5 text-white placeholder-white/30 focus:outline-none focus:border-arenaGreen"
              />
              <button
                type="submit"
                disabled={generating}
                className="px-3 bg-white/5 border border-white/5 hover:bg-white/10 text-white rounded-lg text-xs font-semibold flex items-center justify-center transition"
              >
                <Search className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>

          {/* AI generated wallpaper prompts */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] text-white/50 font-bold uppercase">AI Theme Concept Prompt</label>
            <textarea
              rows={2}
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="e.g. Create a blue futuristic football stadium theme with neon lines"
              className="w-full px-3 py-2 text-xs bg-white/5 rounded-lg border border-white/5 text-white placeholder-white/30 focus:outline-none focus:border-arenaGreen"
            />
            <button
              onClick={generateAIWallpaper}
              disabled={generating || !aiPrompt.trim()}
              className="w-full py-2 bg-arenaGreen hover:bg-arenaGreen/90 disabled:opacity-50 text-slate-950 font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 transition glow-green"
            >
              {generating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              Generate AI Wallpaper
            </button>
          </div>

          {/* AI Search preview settings */}
          {aiSuggestions && (
            <div className="glass-panel p-3.5 rounded-xl border border-arenaGold/20 mt-2">
              <span className="text-[10px] text-arenaGold font-bold uppercase tracking-widest block mb-1">AI Recommendation System</span>
              <p className="text-xs text-white/80">{aiSuggestions.reasoning}</p>
              <button
                onClick={() => {
                  updateSettings({
                    themeName: `Profile: ${playerQuery}`,
                    primaryColor: aiSuggestions.primary,
                    accentColor: aiSuggestions.accent,
                    secondaryColor: aiSuggestions.secondary,
                    backgroundType: 'DYNAMIC'
                  });
                  setAiSuggestions(null);
                  setPlayerQuery('');
                }}
                className="mt-3.5 py-1.5 px-3 bg-arenaGold hover:bg-arenaGold/90 text-slate-950 font-bold rounded-lg text-[10px] transition"
              >
                Apply Custom Palette
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
