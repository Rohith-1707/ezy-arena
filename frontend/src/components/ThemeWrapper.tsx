'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

export interface ThemeSettings {
  backgroundType: 'STATIC' | 'VIDEO' | 'DYNAMIC';
  themeName: string;
  customWallpaperUrl?: string;
  customVideoUrl?: string;
  blurIntensity: number;
  brightness: number;
  opacity: number;
  glassmorphism: boolean;
  animatedGradient: boolean;
  particleEffects: boolean;
  stadiumLightAnimation: boolean;
  primaryColor?: string;
  accentColor?: string;
  secondaryColor?: string;
}

interface ThemeContextType {
  settings: ThemeSettings;
  updateSettings: (newSettings: Partial<ThemeSettings>) => void;
  applyPresetTheme: (presetName: string) => void;
}

const defaultTheme: ThemeSettings = {
  backgroundType: 'DYNAMIC',
  themeName: 'Stadium Lights',
  blurIntensity: 20,
  brightness: 80,
  opacity: 40,
  glassmorphism: true,
  animatedGradient: true,
  particleEffects: true,
  stadiumLightAnimation: true,
  primaryColor: '#000B29',
  accentColor: '#00FF66',
  secondaryColor: '#D4AF37'
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<ThemeSettings>(defaultTheme);

  useEffect(() => {
    const saved = localStorage.getItem('ezy_arena_theme_settings');
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const updateSettings = (newSettings: Partial<ThemeSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem('ezy_arena_theme_settings', JSON.stringify(updated));
      return updated;
    });
  };

  const applyPresetTheme = (presetName: string) => {
    let preset: Partial<ThemeSettings> = {};
    switch (presetName) {
      case 'Cyber Blue':
        preset = {
          themeName: 'Cyber Blue',
          backgroundType: 'DYNAMIC',
          primaryColor: '#050014',
          accentColor: '#00F0FF',
          secondaryColor: '#7B00FF',
          blurIntensity: 25,
          brightness: 85,
          opacity: 45,
          animatedGradient: true,
          particleEffects: true,
          stadiumLightAnimation: true
        };
        break;
      case 'Stadium Lights':
        preset = {
          themeName: 'Stadium Lights',
          backgroundType: 'DYNAMIC',
          primaryColor: '#000B29',
          accentColor: '#00FF66',
          secondaryColor: '#D4AF37',
          blurIntensity: 20,
          brightness: 75,
          opacity: 40,
          animatedGradient: true,
          particleEffects: true,
          stadiumLightAnimation: true
        };
        break;
      case 'Trophy Celebration':
        preset = {
          themeName: 'Trophy Celebration',
          backgroundType: 'DYNAMIC',
          primaryColor: '#120D00',
          accentColor: '#D4AF37',
          secondaryColor: '#FFFFFF',
          blurIntensity: 15,
          brightness: 90,
          opacity: 50,
          animatedGradient: true,
          particleEffects: true,
          stadiumLightAnimation: false
        };
        break;
      case 'Match Night':
        preset = {
          themeName: 'Match Night',
          backgroundType: 'VIDEO',
          primaryColor: '#050912',
          accentColor: '#00FF66',
          secondaryColor: '#3388FF',
          blurIntensity: 30,
          brightness: 70,
          opacity: 35,
          animatedGradient: false,
          particleEffects: false,
          stadiumLightAnimation: false
        };
        break;
      case 'Minimal Dark':
        preset = {
          themeName: 'Minimal Dark',
          backgroundType: 'STATIC',
          primaryColor: '#07080a',
          accentColor: '#FFFFFF',
          secondaryColor: '#555555',
          blurIntensity: 10,
          brightness: 90,
          opacity: 60,
          animatedGradient: false,
          particleEffects: false,
          stadiumLightAnimation: false
        };
        break;
      default:
        break;
    }
    updateSettings(preset);
  };

  return (
    <ThemeContext.Provider value={{ settings, updateSettings, applyPresetTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const ThemeWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { settings } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Background particles canvas simulation
  useEffect(() => {
    if (!settings.particleEffects || settings.backgroundType === 'STATIC') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particle class definition
    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      color: string;

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 2 + 1;
        this.speedX = (Math.random() - 0.5) * 0.3;
        this.speedY = -Math.random() * 0.5 - 0.1; // rise up slowly

        // Color maps to accent or secondary color
        this.color = Math.random() > 0.5 ? settings.accentColor || '#00FF66' : settings.secondaryColor || '#D4AF37';
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.y < 0) {
          this.y = height;
          this.x = Math.random() * width;
        }
        if (this.x < 0 || this.x > width) {
          this.speedX = -this.speedX;
        }
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color + '55'; // semi-transparent
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.fill();
        ctx.shadowBlur = 0; // reset
      }
    }

    const particleCount = 60;
    const particles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach(p => {
        p.update();
        p.draw();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [settings.particleEffects, settings.backgroundType, settings.accentColor, settings.secondaryColor]);

  // Determine background styling
  const getBackgroundStyle = (): React.CSSProperties => {
    const filterString = `brightness(${settings.brightness}%)`;

    if (settings.backgroundType === 'STATIC') {
      return {
        backgroundColor: settings.primaryColor || '#000B29',
        filter: filterString,
        transition: 'all 0.5s ease'
      };
    }

    // Dynamic linear gradients blending
    const g1 = settings.primaryColor || '#000B29';
    const g2 = settings.secondaryColor || '#D4AF37';
    return {
      background: `linear-gradient(135deg, ${g1} 0%, #030a1c 60%, ${g2}22 100%)`,
      filter: filterString,
      transition: 'all 0.5s ease'
    };
  };

  return (
    <div className="relative min-height-screen overflow-hidden" style={getBackgroundStyle()}>
      {/* 1. Animated Gradient Pulse Overlay */}
      {settings.animatedGradient && settings.backgroundType !== 'STATIC' && (
        <div className="absolute inset-0 pointer-events-none opacity-40 mix-blend-screen">
          <div 
            className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full blur-[120px] animate-pulse-slow"
            style={{ backgroundColor: `${settings.accentColor || '#00FF66'}22` }}
          />
          <div 
            className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[100px] animate-pulse-slow"
            style={{ backgroundColor: `${settings.secondaryColor || '#D4AF37'}11` }}
          />
        </div>
      )}

      {/* 2. Live Video Background simulation */}
      {settings.backgroundType === 'VIDEO' && (
        <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute inset-0 bg-black/60 z-10" /> {/* Dimming layer */}
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-30"
          >
            <source src="https://assets.mixkit.co/videos/preview/mixkit-cheering-crowd-at-a-soccer-stadium-39906-large.mp4" type="video/mp4" />
          </video>
        </div>
      )}

      {/* 3. Live Particle Canvas */}
      {settings.particleEffects && settings.backgroundType !== 'STATIC' && (
        <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-10" />
      )}

      {/* 4. Stadium Light Lens Flares Animation */}
      {settings.stadiumLightAnimation && settings.backgroundType !== 'STATIC' && (
        <div className="absolute top-0 inset-x-0 h-40 pointer-events-none flex justify-around opacity-30 z-0">
          <div className="w-40 h-40 bg-white/40 rounded-full blur-[60px] transform translate-y-[-50%]" />
          <div className="w-56 h-40 bg-white/30 rounded-full blur-[80px] transform translate-y-[-50%]" />
          <div className="w-40 h-40 bg-white/40 rounded-full blur-[60px] transform translate-y-[-50%]" />
        </div>
      )}

      {/* 5. Client Pages Content Wrapper */}
      <div 
        className="relative min-h-screen z-20"
        style={{
          backdropFilter: settings.glassmorphism ? `blur(${settings.blurIntensity}px)` : 'none',
          WebkitBackdropFilter: settings.glassmorphism ? `blur(${settings.blurIntensity}px)` : 'none'
        }}
      >
        {children}
      </div>
    </div>
  );
};
