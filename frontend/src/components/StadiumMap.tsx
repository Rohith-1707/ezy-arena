'use client';

import React, { useState, useRef } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, MapPin, Compass, Search, Navigation } from 'lucide-react';

interface MapPoint {
  id: string;
  name: string;
  type: 'seat' | 'gate' | 'washroom' | 'food' | 'merch' | 'medical' | 'parking' | 'exit';
  x: number; // percentage coordinate on SVG
  y: number;
}

export const StadiumMap: React.FC = () => {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [selectedRoute, setSelectedRoute] = useState<'shortest' | 'crowd' | 'wheelchair' | null>(null);
  const [highlightType, setHighlightType] = useState<string>('all');
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });

  // Map markers positions (Lusail Arena template layout coordinate mappings)
  const locations: MapPoint[] = [
    { id: 'user-loc', name: 'Your Location (Gate B)', type: 'gate', x: 50, y: 88 },
    { id: 'user-seat', name: 'Seat Section 104, Row K', type: 'seat', x: 30, y: 40 },
    { id: 'gate-a', name: 'Gate A (North)', type: 'gate', x: 50, y: 12 },
    { id: 'gate-b', name: 'Gate B (South)', type: 'gate', x: 50, y: 88 },
    { id: 'gate-c', name: 'Gate C (East)', type: 'gate', x: 88, y: 50 },
    { id: 'gate-d', name: 'Gate D (West)', type: 'gate', x: 12, y: 50 },
    { id: 'restroom-1', name: 'Restroom Zone East', type: 'washroom', x: 70, y: 30 },
    { id: 'restroom-2', name: 'Restroom Zone West', type: 'washroom', x: 30, y: 70 },
    { id: 'food-court-1', name: 'Burgers & Pizzas', type: 'food', x: 75, y: 65 },
    { id: 'food-court-2', name: 'Cafe & Organic Salad Bar', type: 'food', x: 25, y: 30 },
    { id: 'medical-center', name: 'First Aid Center', type: 'medical', x: 18, y: 65 },
    { id: 'parking-a', name: 'Parking Lot A (VIP)', type: 'parking', x: 92, y: 85 }
  ];

  // Drag Pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    dragStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    setPan({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y
    });
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const resetMap = () => {
    setScale(1);
    setRotation(0);
    setPan({ x: 0, y: 0 });
    setSelectedRoute(null);
  };

  // Renders the route path depending on selection
  const renderRoutePath = () => {
    if (!selectedRoute) return null;

    let pathD = "";
    let strokeColor = "#00FF66"; // short = green
    let dashed = false;

    if (selectedRoute === 'shortest') {
      // Direct Gate B -> Food Court 2 / Seat
      pathD = "M 250,440 Q 230,300 150,200";
      strokeColor = "#00FF66";
    } else if (selectedRoute === 'crowd') {
      // Diverted Route through outer circle to avoid congestion at inner ring
      pathD = "M 250,440 A 180,180 0 0,1 375,325 T 150,200";
      strokeColor = "#D4AF37"; // gold
      dashed = true;
    } else if (selectedRoute === 'wheelchair') {
      // Accessible ramp route
      pathD = "M 250,440 L 250,380 A 120,120 0 0,0 150,200";
      strokeColor = "#00F0FF"; // Blue
    }

    return (
      <path
        d={pathD}
        fill="none"
        stroke={strokeColor}
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray={dashed ? "8, 6" : "none"}
        className="transition-all duration-500"
      />
    );
  };

  return (
    <div className="w-full flex flex-col h-full bg-slate-950/80 rounded-2xl border border-white/10 overflow-hidden backdrop-blur-xl">
      {/* 1. Header Toolbar Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-white/5 bg-white/5">
        <div className="flex items-center gap-2">
          <Compass className="w-5 h-5 text-arenaGold animate-spin-slow" />
          <span className="font-semibold text-white tracking-wider text-sm md:text-base">Lusail Arena Smart Indoor Map</span>
        </div>

        {/* Filter categories */}
        <div className="flex gap-2 overflow-x-auto max-w-full pb-1 md:pb-0">
          {['all', 'seat', 'food', 'washroom', 'medical', 'parking'].map((category) => (
            <button
              key={category}
              onClick={() => setHighlightType(category)}
              className={`px-3 py-1 text-xs rounded-full font-medium transition ${
                highlightType === category 
                  ? 'bg-arenaGreen text-slate-950 shadow-md' 
                  : 'bg-white/5 text-white/70 hover:bg-white/10'
              }`}
            >
              {category.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Interactive SVG Canvas Window */}
      <div 
        className="flex-1 relative cursor-grab active:cursor-grabbing overflow-hidden min-h-[300px] md:min-h-[400px]"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <svg 
          viewBox="0 0 500 500" 
          className="w-full h-full select-none origin-center"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale}) rotate(${rotation}deg)`,
            transition: isDragging.current ? 'none' : 'transform 0.15s ease-out'
          }}
        >
          {/* Inner Field Layout (Green pitch simulation) */}
          <rect x="175" y="175" width="150" height="150" rx="75" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="2" />
          <rect x="195" y="210" width="110" height="80" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
          <circle cx="250" cy="250" r="25" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />

          {/* Outer Seating Rings */}
          <circle cx="250" cy="250" r="160" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="25" />
          <circle cx="250" cy="250" r="210" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="30" />

          {/* Route path */}
          {renderRoutePath()}

          {/* Points overlay */}
          {locations
            .filter(loc => highlightType === 'all' || loc.type === highlightType || loc.id === 'user-loc' || loc.id === 'user-seat')
            .map(loc => {
              const pixelX = (loc.x / 100) * 500;
              const pixelY = (loc.y / 100) * 500;
              
              let markerColor = "#FFFFFF";
              if (loc.id === 'user-loc') markerColor = "#00FF66"; // green
              else if (loc.id === 'user-seat') markerColor = "#D4AF37"; // gold
              else if (loc.type === 'food') markerColor = "#FF8800"; // orange
              else if (loc.type === 'washroom') markerColor = "#00F0FF"; // cyan
              else if (loc.type === 'medical') markerColor = "#FF3B30"; // red

              return (
                <g key={loc.id} className="cursor-pointer group">
                  <circle 
                    cx={pixelX} 
                    cy={pixelY} 
                    r={loc.id.includes('user') ? "8" : "5"} 
                    fill={markerColor}
                    className="animate-pulse"
                  />
                  {loc.id.includes('user') && (
                    <circle 
                      cx={pixelX} 
                      cy={pixelY} 
                      r="16" 
                      fill="none" 
                      stroke={markerColor} 
                      strokeWidth="2" 
                      className="animate-ping"
                      style={{ transformOrigin: `${pixelX}px ${pixelY}px` }}
                    />
                  )}
                  {/* Hover tooltip */}
                  <text 
                    x={pixelX} 
                    y={pixelY - 14} 
                    fill="#fff" 
                    fontSize="9" 
                    textAnchor="middle"
                    className="opacity-0 group-hover:opacity-100 transition-opacity font-semibold bg-black px-1 pointer-events-none"
                    style={{ textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}
                  >
                    {loc.name}
                  </text>
                </g>
              );
            })}
        </svg>

        {/* Dynamic Float Map Controls */}
        <div className="absolute right-4 bottom-4 flex flex-col gap-2 z-30">
          <button 
            onClick={() => setScale(s => Math.min(s + 0.2, 3))}
            className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-lg backdrop-blur border border-white/10"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setScale(s => Math.max(s - 0.2, 0.6))}
            className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-lg backdrop-blur border border-white/10"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setRotation(r => (r + 45) % 360)}
            className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-lg backdrop-blur border border-white/10"
          >
            <Compass className="w-5 h-5" />
          </button>
          <button 
            onClick={resetMap}
            className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-lg backdrop-blur border border-white/10"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>

        {/* Bottom Route Panel */}
        <div className="absolute left-4 bottom-4 glass-panel p-3 rounded-xl border border-white/10 max-w-[280px] z-30">
          <p className="text-xs text-white/50 mb-2 uppercase tracking-widest font-semibold">AI Routing Engine</p>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => setSelectedRoute('shortest')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                selectedRoute === 'shortest' 
                  ? 'bg-arenaGreen/20 border-arenaGreen text-arenaGreen' 
                  : 'bg-white/5 border-white/5 text-white/70 hover:bg-white/10'
              }`}
            >
              <Navigation className="w-3.5 h-3.5" />
              Shortest Route (3m)
            </button>
            <button
              onClick={() => setSelectedRoute('crowd')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                selectedRoute === 'crowd' 
                  ? 'bg-arenaGold/20 border-arenaGold text-arenaGold' 
                  : 'bg-white/5 border-white/5 text-white/70 hover:bg-white/10'
              }`}
            >
              <Navigation className="w-3.5 h-3.5 text-arenaGold" />
              Least Congested Route (5m)
            </button>
            <button
              onClick={() => setSelectedRoute('wheelchair')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                selectedRoute === 'wheelchair' 
                  ? 'bg-sky-500/20 border-sky-400 text-sky-400' 
                  : 'bg-white/5 border-white/5 text-white/70 hover:bg-white/10'
              }`}
            >
              <Navigation className="w-3.5 h-3.5" />
              Wheelchair Accessible
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
