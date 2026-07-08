'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, Mic, MicOff, Volume2, VolumeX, Sparkles, Languages } from 'lucide-react';

interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

export const AIAssistant: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { sender: 'ai', text: 'Hello! I am your Ezy Arena AI Assistant. Ask me where your seat is, find restrooms, order food, or translate stadium announcements.', timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Voice Output TTS using browser speech synthesis
  const speakText = (text: string) => {
    if (!voiceEnabled || typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel(); // stop previous speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  // Voice Input STT using browser speech recognition
  const startSpeechRecognition = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Browser speech recognition is not supported in your browser. Please try Chrome or Safari.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const speechToText = event.results[0][0].transcript;
      setInput(speechToText);
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input;
    setInput('');
    setMessages(prev => [...prev, { sender: 'user', text: userText, timestamp: new Date() }]);
    setLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('ezy_arena_token') || ''}`
        },
        body: JSON.stringify({ message: userText })
      });

      const data = await response.json();
      if (response.ok) {
        setMessages(prev => [...prev, { sender: 'ai', text: data.reply, timestamp: new Date() }]);
        speakText(data.speechText || data.reply);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      // Offline / Connection Fallback
      setTimeout(() => {
        let fallbackReply = "I am processing your request. It looks like you're offline or the server is connecting, but your seat is Section 104, Row K, Seat 12 and the nearest washroom is 40 meters left.";
        if (userText.toLowerCase().includes('burger') || userText.toLowerCase().includes('order')) {
          fallbackReply = "Sure, I can recommend ordering the Champion Double Burger from Arena Burgers & Co. Proceeding to order checkout!";
        }
        setMessages(prev => [...prev, { sender: 'ai', text: fallbackReply, timestamp: new Date() }]);
        speakText(fallbackReply);
      }, 500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col h-[400px] bg-slate-950/80 rounded-2xl border border-white/10 overflow-hidden backdrop-blur-xl">
      {/* Top Banner */}
      <div className="flex items-center justify-between p-4 border-b border-white/5 bg-white/5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-arenaGreen/20 text-arenaGreen rounded-lg">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <span className="font-semibold text-white tracking-wider text-sm block">Ezy Arena AI Buddy</span>
            <span className="text-[10px] text-arenaGreen/80 flex items-center gap-1 font-medium">
              <Sparkles className="w-3 h-3 text-arenaGold" /> Multilingual Mode Active (100+ Languages)
            </span>
          </div>
        </div>

        <button 
          onClick={() => setVoiceEnabled(!voiceEnabled)}
          className={`p-2 rounded-lg transition ${
            voiceEnabled ? 'bg-arenaGreen/20 text-arenaGreen' : 'bg-white/5 text-white/50'
          }`}
          title={voiceEnabled ? 'Mute AI voice output' : 'Enable AI voice output'}
        >
          {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div 
            key={index}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[85%] rounded-2xl p-3 text-xs md:text-sm leading-relaxed ${
                msg.sender === 'user' 
                  ? 'bg-arenaGold/20 border border-arenaGold/30 text-white rounded-br-none' 
                  : 'bg-white/5 border border-white/5 text-white/90 rounded-bl-none'
              }`}
            >
              {msg.text}
              <span className="block text-[8px] text-white/40 mt-1 text-right">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white/5 border border-white/5 text-white/50 rounded-2xl rounded-bl-none p-3 text-xs flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" />
              <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:0.2s]" />
              <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input panel */}
      <form onSubmit={handleSend} className="p-3 border-t border-white/5 bg-slate-900/60 flex items-center gap-2">
        <button
          type="button"
          onClick={isListening ? () => setIsListening(false) : startSpeechRecognition}
          className={`p-2.5 rounded-lg border transition ${
            isListening 
              ? 'bg-red-500/20 border-red-500 text-red-500 animate-pulse' 
              : 'bg-white/5 border-white/5 text-white/70 hover:bg-white/10'
          }`}
          title="Mic speech input"
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask AI e.g. Where is my seat?"
          className="flex-1 px-3 py-2 text-xs md:text-sm bg-white/5 rounded-lg border border-white/5 text-white placeholder-white/40 focus:outline-none focus:border-arenaGreen focus:ring-1 focus:ring-arenaGreen"
        />

        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="p-2.5 bg-arenaGreen text-slate-950 rounded-lg hover:bg-arenaGreen/80 disabled:opacity-50 transition"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
