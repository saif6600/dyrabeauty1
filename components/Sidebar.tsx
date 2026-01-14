
import React from 'react';
import { PERSONAS } from '../constants.tsx';
import { AgentPersona, Promotion, Appointment } from '../types.ts';
import { isApiKeyValid } from '../services/geminiService.ts';

interface SidebarProps {
  currentAgent: AgentPersona;
  promotions: Promotion[];
  bookings: Appointment[];
  isOpen: boolean;
  onClose: () => void;
  onSelectAgent: (agent: AgentPersona) => void;
  onRemovePromotion: (id: string) => void;
  onQuickBook: (serviceName: string) => void;
  onClearExpired: () => void;
  onOpenOfferModal: () => void;
  onOpenDashboard: () => void;
  config: {
    ownerPhone: string;
    whatsappLink: string;
  };
}

export default function Sidebar({ 
  currentAgent, 
  promotions, 
  bookings,
  isOpen,
  onClose,
  onSelectAgent, 
  onRemovePromotion,
  onQuickBook,
  onClearExpired,
  onOpenOfferModal,
  onOpenDashboard,
  config
}: SidebarProps) {
  const lastBooking = bookings.length > 0 ? bookings[bookings.length - 1] : null;
  const customerInfo = lastBooking && lastBooking.customerName ? {
    name: lastBooking.customerName,
    phone: lastBooking.customerPhone
  } : null;

  const keyValid = isApiKeyValid();

  const handleClearData = () => {
    if (window.confirm("Delete all locally saved bookings and offers? This cannot be undone.")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[30] md:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      <div className={`
        fixed md:relative z-[40] md:z-20
        w-72 md:w-80 h-full bg-zinc-900 border-r border-zinc-800 
        flex flex-col p-4 transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="flex items-center justify-between mb-8 px-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-rose-700 flex items-center justify-center shadow-lg shadow-rose-500/20">
              <i className="fas fa-crown text-white text-lg"></i>
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-white uppercase italic leading-none">Dyra</h1>
              <p className="text-[9px] text-rose-500 font-bold uppercase tracking-[0.2em] mt-0.5">Luxury Beauty AI</p>
            </div>
          </div>
          <button onClick={onClose} className="md:hidden text-zinc-500 hover:text-white">
            <i className="fas fa-chevron-left"></i>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-8 custom-scrollbar pb-6 pr-2">
          
          <div>
             <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.15em] px-2 mb-3">System Health</h3>
             <div className={`p-3 rounded-2xl border flex items-center gap-3 ${keyValid ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
                <div className={`w-2 h-2 rounded-full animate-pulse ${keyValid ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`}></div>
                <div className="flex-1 min-w-0">
                   <p className={`text-[10px] font-black uppercase tracking-widest ${keyValid ? 'text-emerald-500' : 'text-red-500'}`}>
                      API: {keyValid ? 'Connected' : 'Missing Key'}
                   </p>
                   <p className="text-[9px] text-zinc-500 truncate">
                      {keyValid ? 'Gemini 3 Flash Ready' : 'Setup Required in Vercel'}
                   </p>
                </div>
             </div>
          </div>

          <div>
            <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.15em] px-2 mb-3">Customer Status</h3>
            {customerInfo ? (
              <div className="p-4 bg-zinc-800/60 rounded-2xl border border-white/5 shadow-2xl flex items-center gap-4 group hover:bg-zinc-800 transition-colors">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-rose-600 to-rose-400 flex items-center justify-center text-white text-xl shadow-lg border border-white/10">
                    <i className="fas fa-user-circle"></i>
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-zinc-900 rounded-full"></span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-0.5">Gold Member</p>
                  <h4 className="text-sm font-bold text-zinc-100 truncate">{customerInfo.name}</h4>
                  <p className="text-[10px] text-zinc-500 font-medium truncate">{customerInfo.phone}</p>
                </div>
              </div>
            ) : (
              <div className="p-4 border border-dashed border-zinc-800 rounded-2xl flex flex-col items-center justify-center text-center">
                <div className="w-10 h-10 rounded-full bg-zinc-950 flex items-center justify-center text-zinc-700 mb-2">
                  <i className="fas fa-user-plus text-sm"></i>
                </div>
                <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">New Guest</p>
                <p className="text-[9px] text-zinc-700 mt-1">Book to create profile</p>
              </div>
            )}
          </div>

          <div>
            <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.15em] px-2 mb-3">Owner Shortcuts</h3>
            <div className="grid grid-cols-1 gap-2">
              <button 
                onClick={onOpenDashboard}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-rose-600/10 border border-rose-500/20 text-rose-500 hover:bg-rose-600/20 transition-all text-left group"
              >
                <i className="fas fa-book-medical group-hover:scale-110 transition-transform"></i>
                <span className="text-[11px] font-black uppercase tracking-widest">Open Developer Book</span>
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.15em] px-2 mb-3">Beauty Experts</h3>
            <div className="space-y-1">
              {PERSONAS.map((agent) => (
                <button
                  key={agent.id}
                  onClick={() => onSelectAgent(agent)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                    currentAgent.id === agent.id ? 'bg-zinc-800 border border-white/5 shadow-xl' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/40'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg ${agent.color} flex items-center justify-center text-white shadow-md shrink-0`}>
                    <i className={`fas ${agent.icon} text-xs`}></i>
                  </div>
                  <div className="text-left min-w-0">
                    <p className="text-xs font-bold leading-none truncate">{agent.name}</p>
                    <p className="text-[9px] mt-1 opacity-60 truncate">{agent.role}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4">
            <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.15em] px-2 mb-3">Data & Privacy</h3>
            <div className="bg-zinc-950/50 rounded-2xl p-4 border border-zinc-800 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                  <i className="fas fa-database text-zinc-600 text-xs"></i>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-zinc-300">Local Storage</p>
                  <p className="text-[9px] text-zinc-600">{bookings.length} Bookings Saved</p>
                </div>
              </div>
              <button 
                onClick={handleClearData}
                className="w-full py-2 rounded-lg bg-zinc-900 hover:bg-red-500/10 hover:text-red-500 text-zinc-600 text-[9px] font-black uppercase transition-all border border-zinc-800"
              >
                Reset Database
              </button>
            </div>
          </div>

        </div>

        <div className="pt-4 mt-auto border-t border-zinc-800">
          <a 
            href={config.whatsappLink} 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-3 bg-zinc-800/40 hover:bg-emerald-500/10 transition-colors rounded-2xl flex items-center gap-3 border border-zinc-800 group"
          >
            <div className="w-8 h-8 rounded-full bg-rose-500/20 group-hover:bg-emerald-500/20 flex items-center justify-center text-rose-500 group-hover:text-emerald-500 border border-rose-500/20 group-hover:border-emerald-500/20 transition-all">
               <i className="fas fa-headset text-xs"></i>
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-[11px] font-bold text-zinc-200 truncate group-hover:text-emerald-500 transition-colors">Direct Support</p>
              <p className="text-[9px] text-zinc-500 truncate">Speak with the Salon Owner</p>
            </div>
            <i className="fab fa-whatsapp text-emerald-500 text-lg group-hover:scale-110 transition-transform"></i>
          </a>
        </div>
      </div>
    </>
  );
}
