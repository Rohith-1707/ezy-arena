'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingBag, ChevronRight, MapPin, Truck, CheckCircle2, Loader2, Sparkles } from 'lucide-react';

interface Vendor {
  id: string;
  name: string;
  description: string;
  category: string;
  queueLength: number;
  avgPrepTime: number;
  rating: number;
}

interface MenuItem {
  id: string;
  vendorId: string;
  name: string;
  price: number;
  description: string;
  image?: string;
  isAvailable: boolean;
  isAIRecommended: boolean;
}

export const FoodOrdering: React.FC = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<{ [itemId: string]: number }>({});
  const [deliveryType, setDeliveryType] = useState<'PICKUP' | 'DELIVERY'>('DELIVERY');
  const [seatNumber, setSeatNumber] = useState('Section 104, Row K, Seat 12');
  const [activeOrder, setActiveOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Load vendors
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/food/vendors`);
        const data = await res.json();
        setVendors(data);
      } catch (err) {
        // Fallback mockup
        setVendors([
          { id: "vendor-1", name: "Arena Burgers & Co", description: "Premium flame-grilled gourmet beef burgers and fries.", category: "Burgers", queueLength: 12, avgPrepTime: 6, rating: 4.8 },
          { id: "vendor-2", name: "Pizza Pitch", description: "Stone-baked Italian artisan pizzas.", category: "Pizza", queueLength: 5, avgPrepTime: 4, rating: 4.6 },
          { id: "vendor-3", name: "Green Fields", description: "Healthy bowls, salads, and fresh organic juices.", category: "Salads & Juices", queueLength: 2, avgPrepTime: 3, rating: 4.5 },
          { id: "vendor-4", name: "Golden Cup Cafe", description: "Premium coffee, tea, and local stadium pastries.", category: "Beverages", queueLength: 18, avgPrepTime: 2, rating: 4.7 }
        ]);
      }
    };
    fetchVendors();
  }, []);

  // Load menu items when vendor is selected
  useEffect(() => {
    if (!selectedVendor) return;
    const fetchMenu = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/food/menu/${selectedVendor.id}`);
        const data = await res.json();
        setMenu(data);
      } catch (err) {
        // Fallback mockup menu items
        const dummyMenu: { [vid: string]: MenuItem[] } = {
          "vendor-1": [
            { id: "menu-1", vendorId: "vendor-1", name: "Champion Double Burger", price: 14.99, description: "Double beef patty, cheddar cheese, special arena sauce.", isAvailable: true, isAIRecommended: true },
            { id: "menu-2", vendorId: "vendor-1", name: "Stadium Crisp Fries", price: 5.99, description: "Seasoned golden crispy fries with garlic dip.", isAvailable: true, isAIRecommended: false }
          ],
          "vendor-2": [
            { id: "menu-3", vendorId: "vendor-2", name: "Kickoff Margherita Pizza", price: 16.50, description: "Classic tomato, fresh mozzarella, basil.", isAvailable: true, isAIRecommended: false },
            { id: "menu-4", vendorId: "vendor-2", name: "Pepperoni Penalty Pizza", price: 18.99, description: "Spicy pepperoni, mozzarella, dynamic hot honey.", isAvailable: true, isAIRecommended: true }
          ]
        };
        setMenu(dummyMenu[selectedVendor.id] || [
          { id: "menu-5", vendorId: selectedVendor.id, name: "Power Play Acai Bowl", price: 12.00, description: "Energy booster bowl.", isAvailable: true, isAIRecommended: true }
        ]);
      }
      setCart({});
    };
    fetchMenu();
  }, [selectedVendor]);

  const addToCart = (itemId: string) => {
    setCart(prev => ({ ...prev, [itemId]: (prev[itemId] || 0) + 1 }));
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => {
      const copy = { ...prev };
      if (copy[itemId] > 1) copy[itemId]--;
      else delete copy[itemId];
      return copy;
    });
  };

  const getCartTotal = () => {
    return Object.keys(cart).reduce((total, id) => {
      const item = menu.find(m => m.id === id);
      return total + (item ? item.price * cart[id] : 0);
    }, 0);
  };

  const placeOrder = async () => {
    if (!selectedVendor || Object.keys(cart).length === 0) return;
    setLoading(true);

    const orderItems = Object.keys(cart).map(id => {
      const item = menu.find(m => m.id === id);
      return {
        menuItemId: id,
        name: item?.name || '',
        quantity: cart[id],
        price: item?.price || 0
      };
    });

    const payload = {
      vendorId: selectedVendor.id,
      seatNumber,
      deliveryType,
      items: orderItems,
      totalAmount: getCartTotal()
    };

    try {
      const token = localStorage.getItem('ezy_arena_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/food/order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || ''}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        setActiveOrder(data.order);
        setCart({});
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      // Mock placement if offline
      const mockOrder = {
        id: `ord-${Date.now()}`,
        status: 'PENDING',
        seatNumber,
        type: deliveryType,
        totalAmount: getCartTotal(),
        items: orderItems,
        vendorName: selectedVendor.name,
        createdAt: new Date()
      };
      setActiveOrder(mockOrder);
      setCart({});

      // Mock live order status transition triggers
      setTimeout(() => {
        setActiveOrder((prev: any) => prev ? { ...prev, status: 'PREPARING' } : null);
      }, 5000);
      setTimeout(() => {
        setActiveOrder((prev: any) => prev ? { ...prev, status: 'READY' } : null);
      }, 10000);
      setTimeout(() => {
        setActiveOrder((prev: any) => prev ? { ...prev, status: 'COMPLETED' } : null);
      }, 15000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col bg-slate-950/80 rounded-2xl border border-white/10 overflow-hidden backdrop-blur-xl p-4">
      <div className="flex items-center gap-2 mb-4">
        <ShoppingBag className="w-5 h-5 text-arenaGreen" />
        <h3 className="font-semibold text-white tracking-wider text-sm md:text-base">Seat Food Ordering</h3>
      </div>

      {/* Case 1: Active Order Tracking Display */}
      {activeOrder && (
        <div className="glass-panel p-4 rounded-xl border border-arenaGreen/20">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs text-white/60">Order ID: {activeOrder.id}</span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-arenaGreen/20 text-arenaGreen tracking-wide border border-arenaGreen/30 animate-pulse">
              {activeOrder.status}
            </span>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-white/5 rounded-lg">
              {activeOrder.type === 'DELIVERY' ? <Truck className="w-5 h-5 text-arenaGold" /> : <MapPin className="w-5 h-5 text-arenaGreen" />}
            </div>
            <div>
              <p className="text-xs text-white font-medium">
                {activeOrder.type === 'DELIVERY' ? `Delivering to ${activeOrder.seatNumber}` : 'Ready for Counter Pickup'}
              </p>
              <p className="text-[10px] text-white/50">Est. completion: 4-6 minutes</p>
            </div>
          </div>

          {/* Progress timeline */}
          <div className="relative flex items-center justify-between w-full mt-6 mb-2 px-1">
            <div className="absolute left-0 right-0 h-[2px] bg-white/10 -z-10" />
            <div 
              className="absolute left-0 h-[2px] bg-arenaGreen -z-10 transition-all duration-1000"
              style={{
                width: 
                  activeOrder.status === 'PENDING' ? '15%' :
                  activeOrder.status === 'PREPARING' ? '50%' :
                  activeOrder.status === 'READY' ? '85%' : '100%'
              }}
            />
            {['Placed', 'Preparing', 'Ready', 'Done'].map((step, idx) => {
              const isActive = 
                (idx === 0) ||
                (idx === 1 && (activeOrder.status === 'PREPARING' || activeOrder.status === 'READY' || activeOrder.status === 'COMPLETED')) ||
                (idx === 2 && (activeOrder.status === 'READY' || activeOrder.status === 'COMPLETED')) ||
                (idx === 3 && activeOrder.status === 'COMPLETED');
              
              return (
                <div key={step} className="flex flex-col items-center">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] border transition ${
                    isActive ? 'bg-arenaGreen border-arenaGreen text-slate-950' : 'bg-slate-950 border-white/20 text-white/40'
                  }`}>
                    {idx + 1}
                  </div>
                  <span className={`text-[9px] mt-1 ${isActive ? 'text-white font-medium' : 'text-white/40'}`}>{step}</span>
                </div>
              );
            })}
          </div>

          <button 
            onClick={() => setActiveOrder(null)} 
            className="w-full mt-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-lg text-xs font-semibold transition"
          >
            Order New Food
          </button>
        </div>
      )}

      {/* Case 2: Browse Vendors List */}
      {!activeOrder && !selectedVendor && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {vendors.map(v => (
            <div 
              key={v.id}
              onClick={() => setSelectedVendor(v)}
              className="glass-panel p-3.5 rounded-xl border border-white/5 hover:border-white/20 cursor-pointer transition flex justify-between items-center group"
            >
              <div>
                <span className="text-[10px] text-arenaGold font-bold uppercase tracking-widest">{v.category}</span>
                <h4 className="text-sm font-semibold text-white mt-0.5 group-hover:text-arenaGreen transition">{v.name}</h4>
                <p className="text-xs text-white/50 mt-1 line-clamp-1">{v.description}</p>
                <div className="flex gap-3 mt-2 text-[10px] text-white/40 font-medium">
                  <span>★ {v.rating}</span>
                  <span>Queue: {v.queueLength} orders</span>
                  <span className="text-arenaGreen">Wait: ~{v.avgPrepTime}m</span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-white transition" />
            </div>
          ))}
        </div>
      )}

      {/* Case 3: Browse vendor menu and Add to cart */}
      {!activeOrder && selectedVendor && (
        <div className="flex flex-col h-full">
          {/* Vendor Details Back Bar */}
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
            <div>
              <button 
                onClick={() => setSelectedVendor(null)}
                className="text-xs text-arenaGreen font-medium hover:underline flex items-center gap-1"
              >
                ← Back to Vendors
              </button>
              <h4 className="text-sm md:text-base font-bold text-white mt-1">{selectedVendor.name}</h4>
            </div>
            <span className="text-xs text-white/50">{selectedVendor.avgPrepTime} mins prep</span>
          </div>

          {/* Menu items grid */}
          <div className="space-y-3 flex-1 overflow-y-auto max-h-[300px] pr-1">
            {menu.map(item => (
              <div 
                key={item.id} 
                className="glass-panel p-3 rounded-xl flex items-center justify-between border border-white/5 hover:border-white/10 transition"
              >
                <div className="flex-1 pr-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-white">{item.name}</span>
                    {item.isAIRecommended && (
                      <span className="px-1.5 py-0.5 rounded-full text-[8px] font-bold bg-arenaGold/20 border border-arenaGold/30 text-arenaGold flex items-center gap-0.5">
                        <Sparkles className="w-2.5 h-2.5" /> Best Seller
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-white/50 mt-1">{item.description}</p>
                  <span className="text-xs font-bold text-arenaGreen mt-2 block">${item.price.toFixed(2)}</span>
                </div>
                
                {/* Cart increment controls */}
                <div className="flex items-center gap-2.5">
                  {cart[item.id] ? (
                    <>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="w-7 h-7 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold text-xs flex items-center justify-center transition"
                      >
                        -
                      </button>
                      <span className="text-xs text-white font-semibold w-4 text-center">{cart[item.id]}</span>
                      <button 
                        onClick={() => addToCart(item.id)}
                        className="w-7 h-7 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold text-xs flex items-center justify-center transition"
                      >
                        +
                      </button>
                    </>
                  ) : (
                    <button 
                      onClick={() => addToCart(item.id)}
                      className="px-3.5 py-1.5 bg-arenaGreen hover:bg-arenaGreen/80 text-slate-950 font-bold rounded-lg text-xs transition"
                    >
                      Add
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Checkout footer */}
          {Object.keys(cart).length > 0 && (
            <div className="mt-4 pt-3 border-t border-white/5 bg-slate-900/60 p-3 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-white/60">Delivery options:</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setDeliveryType('DELIVERY')}
                    className={`px-3 py-1 text-[10px] rounded-full font-bold border transition ${
                      deliveryType === 'DELIVERY' 
                        ? 'bg-arenaGreen border-arenaGreen text-slate-950' 
                        : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    Seat Delivery
                  </button>
                  <button
                    onClick={() => setDeliveryType('PICKUP')}
                    className={`px-3 py-1 text-[10px] rounded-full font-bold border transition ${
                      deliveryType === 'PICKUP' 
                        ? 'bg-arenaGreen border-arenaGreen text-slate-950' 
                        : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    Stall Pickup
                  </button>
                </div>
              </div>

              {deliveryType === 'DELIVERY' && (
                <div className="mb-3">
                  <span className="text-[9px] text-white/40 block mb-1">Assigned Seat Destination</span>
                  <input
                    type="text"
                    value={seatNumber}
                    onChange={(e) => setSeatNumber(e.target.value)}
                    className="w-full px-2.5 py-1 bg-white/5 text-[10px] text-white border border-white/10 rounded focus:outline-none focus:border-arenaGreen"
                  />
                </div>
              )}

              <button
                onClick={placeOrder}
                disabled={loading}
                className="w-full py-2.5 bg-arenaGreen hover:bg-arenaGreen/90 disabled:opacity-50 text-slate-950 font-bold rounded-lg text-xs md:text-sm flex items-center justify-center gap-1.5 transition glow-green"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Pay & Place Order (${getCartTotal().toFixed(2)})
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
