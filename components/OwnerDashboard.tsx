
import React, { useMemo, useState, useEffect } from 'react';
import { Appointment, Service, AgentPersona } from '../types.ts';
import { SERVICE_MENU } from '../constants.tsx';

interface SalonConfig {
  ownerPhone: string;
  whatsappNumber: string;
  whatsappLink: string;
  address: string;
}

interface OwnerDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  bookings: Appointment[];
  currentAgent: AgentPersona;
  config: SalonConfig;
  onUpdateConfig: (newConfig: SalonConfig) => void;
}

export default function OwnerDashboard({ isOpen, onClose, bookings, currentAgent, config, onUpdateConfig }: OwnerDashboardProps) {
  // 1. All hooks must be at the very top level
  const [editConfig, setEditConfig] = useState<SalonConfig>({ ...config });
  const [hasChanges, setHasChanges] = useState(false);

  // Sync internal state if external config changes (e.g. from developer manual updates)
  useEffect(() => {
    setEditConfig({ ...config });
  }, [config]);

  const stats = useMemo(() => {
    const total = bookings.length;
    const revenue = bookings.reduce((acc, b) => {
      const service = SERVICE_MENU.find(s => s.name === b.service);
      const priceStr = service?.price.replace(/[^0-9]/g, '') || '0';
      return acc + parseInt(priceStr);
    }, 0);
    return { total, revenue };
  }, [bookings]);

  // 2. Early return must happen AFTER all hooks are declared
  if (!isOpen) return null;

  const handleChange = (field: keyof SalonConfig, value: string) => {
    const next = { ...editConfig, [field]: value };
    if (field === 'whatsappNumber') {
      next.whatsappLink = `https://wa.me/${value}`;
    }
    setEditConfig(next);
    setHasChanges(true);
  };

  const saveConfig = () => {
    onUpdateConfig(editConfig);
    setHasChanges(false);
    alert("Configuration updated in system memory! Note: To make this change permanent for all users, update the constants.tsx file.");
  };

  const copyData = () => {
    const data = JSON.stringify({
      config: config,
      bookings: bookings,
      exportedAt: new Date().toISOString()
    }, null, 2);
    navigator.clipboard.writeText(data);
    alert("Full Data Book copied to clipboard! (JSON format)");
  };

  return (
    <div className="fixed inset-0 z-[100] bg-zinc-950 flex flex-col animate-in fade-in duration-300">
      <header className="h-20 border-b border-zinc-800 flex items-center justify-between px-8 bg-zinc-900/50 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-rose-600 flex items-center justify-center shadow-lg shadow-rose-600/20">
            <i className="fas fa-terminal text-white text-sm"></i>
          </div>
          <div>
            <h2 className="text-lg font-black tracking-tighter uppercase italic">Developer Book</h2>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em]">System Management Portal</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={copyData}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-zinc-700"
          >
            <i className="fas fa-copy mr-2"></i> Export Data
          </button>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-zinc-800 hover:bg-rose-600 hover:text-white text-zinc-500 transition-all flex items-center justify-center"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="max-w-6xl mx-auto space-y-8 pb-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl shadow-xl">
              <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-2">Total Appointments</p>
              <h3 className="text-3xl font-black text-white">{stats.total}</h3>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl shadow-xl">
              <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-2">Est. Revenue</p>
              <h3 className="text-3xl font-black text-white">₹{stats.revenue.toLocaleString()}</h3>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl shadow-xl">
              <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-2">Active Agent</p>
              <h3 className="text-xl font-black text-white truncate">{currentAgent.name}</h3>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl shadow-xl">
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">System Health</p>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <h3 className="text-xl font-black text-emerald-500">OPERATIONAL</h3>
              </div>
            </div>
          </div>

          <section className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] overflow-hidden shadow-2xl relative">
            <div className="absolute top-0 right-0 p-8">
              <i className="fas fa-cog text-rose-500/10 text-9xl -rotate-12"></i>
            </div>
            
            <div className="p-8 border-b border-zinc-800 bg-gradient-to-r from-zinc-900 to-zinc-950 flex justify-between items-center relative z-10">
              <div>
                <h4 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3">
                  <i className="fas fa-sliders-h text-rose-500"></i> System Configuration
                </h4>
                <p className="text-[10px] text-zinc-500 mt-1 font-bold uppercase tracking-widest">Update your mobile details here</p>
              </div>
              {hasChanges && (
                <button 
                  onClick={saveConfig}
                  className="px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-rose-600/30 animate-pulse transition-all"
                >
                  Save & Apply Changes
                </button>
              )}
            </div>

            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">Display Phone Number</label>
                  <input 
                    type="text"
                    value={editConfig.ownerPhone}
                    onChange={(e) => handleChange('ownerPhone', e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-4 text-zinc-100 font-mono text-sm focus:border-rose-500 outline-none transition-all shadow-inner"
                    placeholder="+91 00000 00000"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">WhatsApp Backend Number</label>
                  <input 
                    type="text"
                    value={editConfig.whatsappNumber}
                    onChange={(e) => handleChange('whatsappNumber', e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-4 text-zinc-100 font-mono text-sm focus:border-rose-500 outline-none transition-all shadow-inner"
                    placeholder="910000000000"
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">Salon Address</label>
                  <textarea 
                    value={editConfig.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    rows={1}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-4 text-zinc-100 font-mono text-sm focus:border-rose-500 outline-none transition-all shadow-inner resize-none"
                    placeholder="Physical address"
                  />
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
