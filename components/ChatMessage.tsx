
import React, { useState } from 'react';
import { Message, Role, Service, Appointment } from '../types.ts';

interface ChatMessageProps {
  message: Message;
  onSelectSlot?: (slot: string) => void;
  onSelectService?: (service: Service) => void;
  onSelectDate?: (date: string) => void;
  onActionClick?: (action: 'reschedule' | 'reminder', data?: Appointment) => void;
  config: {
    whatsappNumber: string;
  };
}

export default function ChatMessage({ 
  message, 
  onSelectSlot, 
  onSelectService, 
  onSelectDate,
  onActionClick,
  config
}: ChatMessageProps) {
  const isAgent = message.role === Role.AGENT;
  const isGuidance = message.isGuidance;
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const groupedServices = message.serviceOptions?.reduce((acc, s) => {
    if (!acc[s.category]) acc[s.category] = [];
    acc[s.category].push(s);
    return acc;
  }, {} as Record<string, Service[]>);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Skin': return 'fa-sparkles text-rose-400';
      case 'Hair': return 'fa-scissors text-amber-400';
      case 'Makeup': return 'fa-wand-magic-sparkles text-purple-400';
      case 'Massage': return 'fa-spa text-emerald-400';
      default: return 'fa-star text-rose-400';
    }
  };

  const handleAction = (type: 'reschedule' | 'reminder') => {
    setActionLoading(type);
    setTimeout(() => {
      onActionClick?.(type, message.appointment);
      setActionLoading(null);
    }, 600);
  };

  const getWhatsAppLink = (appt: Appointment) => {
    const text = `Hi Dyra Salon! I'd like to confirm my booking:%0A%0A✨ Service: ${appt.service}%0A📅 Date: ${appt.date}%0A🕒 Time: ${appt.time}%0A👤 Name: ${appt.customerName}%0A🆔 Ref: ${appt.id.slice(-6).toUpperCase()}`;
    return `https://wa.me/${config.whatsappNumber}?text=${text}`;
  };

  const showRoadmap = isAgent && (message.serviceOptions || message.dateOptions || message.availableSlots);
  const currentStep = message.serviceOptions ? 1 : message.dateOptions ? 2 : message.availableSlots ? 3 : 0;
  
  return (
    <div className={`flex w-full mb-6 ${isAgent ? 'justify-start' : 'justify-end'}`}>
      <div className={`max-w-[94%] sm:max-w-[85%] flex gap-3 ${isAgent ? 'flex-row' : 'flex-row-reverse'}`}>
        {isAgent && (
          <div className={`w-8 h-8 rounded-xl ${isGuidance ? 'bg-amber-500' : 'bg-rose-600'} flex items-center justify-center text-white shadow-xl flex-shrink-0 mt-1 ring-2 ring-white/10`}>
            <i className={`fas ${isGuidance ? 'fa-lightbulb' : 'fa-spa'} text-xs`}></i>
          </div>
        )}
        
        <div className="flex flex-col min-w-0 flex-1">
          <div className={`px-5 py-4 rounded-3xl text-sm shadow-2xl transition-all border ${
            isAgent 
              ? `bg-zinc-900 border-zinc-800/80 text-zinc-200 rounded-tl-none` 
              : 'bg-rose-600 text-white rounded-tr-none border-none'
          }`}>
            
            {showRoadmap && (
              <div className="flex items-center justify-between mb-5 px-1 gap-2">
                {[1, 2, 3, 4].map((step) => (
                  <div key={step} className="flex flex-1 items-center gap-1.5">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black border transition-all ${
                      step === currentStep 
                        ? 'bg-rose-600 border-rose-600 text-white shadow-lg shadow-rose-600/30 scale-110' 
                        : step < currentStep 
                          ? 'bg-emerald-500 border-emerald-500 text-white' 
                          : 'bg-zinc-800 border-zinc-700 text-zinc-500'
                    }`}>
                      {step < currentStep ? <i className="fas fa-check"></i> : step}
                    </div>
                    {step < 4 && <div className={`flex-1 h-[2px] rounded-full transition-all ${step < currentStep ? 'bg-emerald-500' : 'bg-zinc-800'}`}></div>}
                  </div>
                ))}
              </div>
            )}

            <p className="leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>
            
            {groupedServices && (
              <div className="mt-5 space-y-6">
                {Object.entries(groupedServices).map(([category, services]) => (
                  <div key={category} className="space-y-4">
                    <div className="flex items-center gap-2 px-2">
                      <i className={`fas ${getCategoryIcon(category)} text-xs`}></i>
                      <h5 className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500">{category} Menu</h5>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      {services.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => onSelectService?.(s)}
                          className="group flex flex-col p-4 rounded-2xl bg-zinc-950/40 border border-zinc-800 hover:border-rose-500/50 hover:bg-zinc-950 transition-all text-left relative overflow-hidden"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex gap-4 min-w-0">
                              <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center border border-white/5 text-rose-400 group-hover:bg-rose-600 group-hover:text-white transition-all shadow-lg">
                                <i className={`fas ${s.icon || 'fa-tag'} text-sm`}></i>
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-bold text-zinc-100 truncate group-hover:text-rose-400">{s.name}</p>
                                <p className="text-[10px] font-black text-rose-500 tracking-wider uppercase mt-1">{s.price}</p>
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {message.dateOptions && (
              <div className="mt-5">
                 <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 px-1">
                   {message.dateOptions.map((date) => {
                     const d = new Date(date);
                     return (
                       <button
                         key={date}
                         onClick={() => onSelectDate?.(date)}
                         className="flex-shrink-0 w-16 h-20 rounded-2xl bg-zinc-950/50 border border-zinc-800 flex flex-col items-center justify-center hover:bg-rose-600 hover:border-rose-600 transition-all ring-1 ring-white/5 group"
                       >
                         <span className="text-[9px] uppercase text-zinc-500 group-hover:text-rose-100 font-bold">{d.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                         <span className="text-lg font-black group-hover:text-white">{d.getDate()}</span>
                         <span className="text-[10px] uppercase text-rose-500 group-hover:text-white font-black">{d.toLocaleDateString('en-US', { month: 'short' })}</span>
                       </button>
                     );
                   })}
                 </div>
              </div>
            )}

            {message.availableSlots && (
              <div className="mt-5 grid grid-cols-2 gap-3">
                {message.availableSlots.map((slot) => (
                  <button
                    key={slot}
                    onClick={() => onSelectSlot?.(slot)}
                    className="group px-4 py-4 rounded-2xl bg-zinc-950/50 border border-zinc-800 hover:bg-rose-600 hover:border-rose-600 hover:text-white transition-all text-center relative overflow-hidden active:scale-95 shadow-lg"
                  >
                    <span className="text-[11px] font-black tracking-widest uppercase">{slot}</span>
                  </button>
                ))}
              </div>
            )}

            {message.appointment && (
              <div className="mt-6 bg-zinc-950 rounded-[2rem] border border-zinc-800 shadow-2xl relative overflow-hidden ring-1 ring-white/5">
                <div className="p-6 bg-gradient-to-br from-zinc-900 to-zinc-950 border-b border-dashed border-zinc-800 relative">
                  <div className="absolute top-4 right-6 w-12 h-12 bg-white/5 rounded-xl border border-white/5 flex items-center justify-center rotate-3">
                    <i className="fas fa-qrcode text-xl text-zinc-500 opacity-40"></i>
                  </div>
                  <div className="flex items-center gap-2.5 text-emerald-500 font-black text-[9px] uppercase mb-4 tracking-widest">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse"></div>
                    Appointment Verified
                  </div>
                  <h4 className="font-bold text-xl text-zinc-100 truncate mb-1">{message.appointment.service}</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Booking ID:</span>
                    <span className="text-[10px] font-mono text-rose-500 font-black">{message.appointment.id.slice(-6).toUpperCase()}</span>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Date</p>
                      <div className="flex items-center gap-2">
                        <i className="far fa-calendar-alt text-rose-500 text-xs"></i>
                        <p className="text-xs font-bold text-zinc-200">{message.appointment.date}</p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Time</p>
                      <div className="flex items-center gap-2">
                        <i className="far fa-clock text-rose-500 text-xs"></i>
                        <p className="text-xs font-bold text-zinc-200">{message.appointment.time}</p>
                      </div>
                    </div>
                  </div>

                  <a 
                    href={getWhatsAppLink(message.appointment)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-[11px] font-black uppercase flex items-center justify-center gap-2 shadow-xl shadow-emerald-600/20 transition-all active:scale-95 group"
                  >
                    <i className="fab fa-whatsapp text-lg"></i>
                    Finalize on WhatsApp
                  </a>
                </div>

                <div className="p-3 bg-zinc-900/50 flex gap-2 border-t border-zinc-800">
                  <button 
                    onClick={() => handleAction('reschedule')}
                    disabled={actionLoading !== null}
                    className="flex-1 py-3 bg-zinc-800 rounded-xl text-[10px] font-black uppercase hover:bg-zinc-700 transition-all border border-white/5 disabled:opacity-50"
                  >
                    {actionLoading === 'reschedule' ? <i className="fas fa-circle-notch animate-spin"></i> : 'Modify'}
                  </button>
                  <button 
                    onClick={() => handleAction('reminder')}
                    disabled={actionLoading !== null}
                    className="flex-1 py-3 bg-rose-600/20 text-rose-500 rounded-xl text-[10px] font-black uppercase hover:bg-rose-500/30 transition-all disabled:opacity-50"
                  >
                    {actionLoading === 'reminder' ? <i className="fas fa-sync animate-spin"></i> : 'Remind'}
                  </button>
                </div>
              </div>
            )}
          </div>
          <span className="text-[10px] text-zinc-600 mt-2 px-2 flex items-center gap-2 opacity-60">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            {isAgent && <i className="fas fa-check-double text-rose-600 text-[9px]"></i>}
          </span>
        </div>
      </div>
    </div>
  );
}
