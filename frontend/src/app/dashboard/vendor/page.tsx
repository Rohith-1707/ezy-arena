'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Loader2, CheckCircle2, ChevronRight, LogOut } from 'lucide-react';

export default function VendorDashboard() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrderId, setLoadingOrderId] = useState<string | null>(null);

  useEffect(() => {
    // Seed dummy incoming orders for vendor center
    setOrders([
      { id: "ord-1", seatNumber: "Section 104, Row K, Seat 12", type: "DELIVERY", status: "PENDING", totalAmount: 20.98, items: [{ name: "Champion Double Burger", quantity: 1, price: 14.99 }, { name: "Stadium Crisp Fries", quantity: 1, price: 5.99 }] },
      { id: "ord-2", seatNumber: "Section 108, Row B, Seat 4", type: "PICKUP", status: "PREPARING", totalAmount: 14.99, items: [{ name: "Champion Double Burger", quantity: 1, price: 14.99 }] }
    ]);
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    setLoadingOrderId(orderId);
    try {
      const token = localStorage.getItem('ezy_arena_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/food/order/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || ''}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      } else {
        throw new Error("API error");
      }
    } catch (err) {
      // Local mockup fallback
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } finally {
      setLoadingOrderId(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-6 max-w-4xl mx-auto w-full gap-6">
      {/* Navbar */}
      <nav className="glass-panel p-4 rounded-2xl flex justify-between items-center w-full z-30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-arenaGreen/20 flex items-center justify-center border border-arenaGreen/30">
            <ShoppingBag className="w-5 h-5 text-arenaGreen" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-white tracking-wider">EZY FOOD VENDOR CENTRE</h2>
            <span className="text-[10px] text-white/50 tracking-wider">Active Concessions Stall: Arena Burgers & Co</span>
          </div>
        </div>

        <button 
          onClick={() => router.push('/login')} 
          className="p-2.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl transition"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </nav>

      {/* Orders list */}
      <div className="glass-panel p-5 rounded-2xl border border-white/5">
        <h3 className="text-sm font-bold text-white mb-4">Incoming Concession Queue</h3>

        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="p-4 bg-white/5 rounded-xl border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-white uppercase">Order #{order.id}</span>
                  <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${
                    order.status === 'PENDING' ? 'bg-arenaGold/20 text-arenaGold' :
                    order.status === 'PREPARING' ? 'bg-sky-500/20 text-sky-400 animate-pulse' :
                    'bg-arenaGreen/20 text-arenaGreen'
                  }`}>{order.status}</span>
                </div>
                <p className="text-[11px] text-white/50 mt-1">{order.type} to {order.seatNumber}</p>
                <div className="mt-3 text-[11px] text-white/70 space-y-1">
                  {order.items.map((it: any, idx: number) => (
                    <span key={idx} className="block">{it.quantity}x {it.name} (${it.price})</span>
                  ))}
                </div>
              </div>

              {/* Status Update Button Drawer */}
              <div className="flex gap-2">
                {order.status === 'PENDING' && (
                  <button
                    onClick={() => handleUpdateStatus(order.id, 'PREPARING')}
                    disabled={loadingOrderId === order.id}
                    className="px-3.5 py-1.5 bg-arenaGold hover:bg-arenaGold/80 disabled:opacity-50 text-slate-950 font-bold rounded-lg text-xs transition"
                  >
                    Accept & Prepare
                  </button>
                )}
                {order.status === 'PREPARING' && (
                  <button
                    onClick={() => handleUpdateStatus(order.id, 'READY')}
                    disabled={loadingOrderId === order.id}
                    className="px-3.5 py-1.5 bg-arenaGreen hover:bg-arenaGreen/80 disabled:opacity-50 text-slate-950 font-bold rounded-lg text-xs transition"
                  >
                    Ready for Pick/Delivery
                  </button>
                )}
                {order.status === 'READY' && (
                  <button
                    onClick={() => handleUpdateStatus(order.id, 'COMPLETED')}
                    disabled={loadingOrderId === order.id}
                    className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 disabled:opacity-50 text-white font-bold rounded-lg text-xs transition"
                  >
                    Complete Order
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
