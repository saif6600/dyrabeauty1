
import React, { useState, useRef, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar.tsx';
import ChatMessage from './components/ChatMessage.tsx';
import OfferModal from './components/OfferModal.tsx';
import OwnerDashboard from './components/OwnerDashboard.tsx';
import { Message, Role, AgentPersona, ModelType, Appointment, Promotion, Service } from './types.ts';
import { PERSONAS, INITIAL_PROMOTIONS, SERVICE_MENU, SALON_CONFIG } from './constants.tsx';
import { chatWithAgent, isApiKeyValid } from './services/geminiService.ts';

const STORAGE_KEY_BOOKINGS = 'dyra_bookings_v2'; 
const STORAGE_KEY_PROMOS = 'dyra_promos_v2';
const STORAGE_KEY_CONFIG = 'dyra_config_v2';

interface BookingState {
  service?: string;
  date?: string;
  time?: string;
  name?: string;
}

export default function App() {
  const [currentAgent, setCurrentAgent] = useState<AgentPersona>(PERSONAS[0]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [bookingState, setBookingState] = useState<BookingState>({});
  
  const [config, setConfig] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CONFIG);
      return saved ? JSON.parse(saved) : SALON_CONFIG;
    } catch { return SALON_CONFIG; }
  });

  const [bookings, setBookings] = useState<Appointment[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_BOOKINGS);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  
  const [promotions, setPromotions] = useState<Promotion[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PROMOS);
      return saved ? JSON.parse(saved) : INITIAL_PROMOTIONS;
    } catch { return INITIAL_PROMOTIONS; }
  });

  const [messages, setMessages] = useState<Message[]>(() => {
    const isReturning = bookings.length > 0;
    const keyMissing = !isApiKeyValid();
    
    if (keyMissing) {
      return [{
        id: 'error-key',
        role: Role.AGENT,
        content: `🚨 ATTENTION: API KEY NOT DETECTED\n\nI'm ready to assist you, but I cannot connect to Google's servers yet. \n\n1. Get your key from aistudio.google.com\n2. Add 'API_KEY' to your Vercel Environment Variables\n3. REDEPLOY your project on Vercel.\n\nOnce configured, I will be your luxury salon assistant! ✨`,
        timestamp: new Date(),
        isError: true
      }];
    }

    const name = isReturning ? bookings[bookings.length - 1].customerName : '';
    return [{
      id: 'welcome',
      role: Role.AGENT,
      content: isReturning 
        ? `Welcome back to Dyra, ${name}! ✨ Ready for your next session of pampering?\n\n1️⃣ Quick Re-book\n2️⃣ Browse New Services\n3️⃣ View Your Offers\n4️⃣ Connect with Support`
        : `Hello & Welcome to Dyra Beauty Parlour 🌸\n\nI'm Maya, your luxury salon assistant. Our systems are online and ready to assist you. How can I help you today?\n\n1️⃣ Reserve an Appointment\n2️⃣ Explore Services & Prices\n3️⃣ Exclusive Launch Offers\n4️⃣ Talk to Human Support`,
      timestamp: new Date()
    }];
  });

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [useSearch, setUseSearch] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PROMOS, JSON.stringify(promotions));
  }, [promotions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
  }, [config]);

  const handleAgentChange = useCallback((agent: AgentPersona) => {
    setCurrentAgent(agent);
    setIsSidebarOpen(false);
  }, []);

  const handleReset = useCallback(() => {
    if (window.confirm("This will clear your current session. Continue?")) {
      window.location.reload();
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isLoading]);

  const handleSend = useCallback(async (overrideInput?: string) => {
    const messageToSend = overrideInput || input;
    if (!messageToSend.trim() || isLoading) return;

    if (!isApiKeyValid()) {
      alert("Missing API Key! Please check the instructions in the first chat message.");
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: Role.USER,
      content: messageToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const rawHistory = messages
        .filter(m => !m.isError)
        .slice(-10)
        .map(m => ({
          role: m.role === Role.USER ? 'user' : 'model',
          parts: [{ text: m.content }]
        }));
      
      const firstUserIndex = rawHistory.findIndex(h => h.role === 'user');
      const history = firstUserIndex === -1 ? [] : rawHistory.slice(firstUserIndex);

      const currentService = SERVICE_MENU.find(s => messageToSend.toLowerCase().includes(s.name.toLowerCase()))?.name || bookingState.service;
      const currentDate = /\d{2}-\d{2}/.test(messageToSend) ? messageToSend : bookingState.date;
      const currentTime = (messageToSend.includes("AM") || messageToSend.includes("PM")) ? messageToSend : bookingState.time;
      
      const newBookingState = { 
        service: currentService, 
        date: currentDate, 
        time: currentTime 
      };
      setBookingState(newBookingState);

      const userContext = `[DEPLOYMENT_STATE]: LIVE\n[SALON_PHONE]: ${config.ownerPhone}\n[CURRENT_BOOKING_PROGRESS]: 
- Service: ${newBookingState.service || 'None'}
- Date: ${newBookingState.date || 'None'}
- Time: ${newBookingState.time || 'None'}
- Contact: Phone linked (Customer)`;

      const dynamicInstruction = `${currentAgent.instruction}\n\n${userContext}`;

      const result = await chatWithAgent(
        ModelType.FLASH,
        history,
        messageToSend,
        dynamicInstruction,
        useSearch
      );

      let agentResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: Role.AGENT,
        content: result.text,
        timestamp: new Date(),
        groundingUrls: result.groundingUrls,
      };

      const contentLower = result.text.toLowerCase();
      const now = new Date();

      if (!newBookingState.service && ["select", "choose", "pick", "service", "treatment"].some(t => contentLower.includes(t))) {
        agentResponse.serviceOptions = SERVICE_MENU;
      }
      
      if (newBookingState.service && !newBookingState.date && ["date", "(dd-mm)", "day"].some(t => contentLower.includes(t))) {
        const dates = [];
        for (let i = 0; i < 7; i++) {
          const d = new Date();
          d.setDate(now.getDate() + i);
          dates.push(d.toISOString().split('T')[0]);
        }
        agentResponse.dateOptions = dates;
      }

      if (result.toolCalls?.length) {
        for (const call of result.toolCalls) {
          if (call.name === 'book_appointment') {
            const { customerName, service, date, time } = call.args;
            const matchedService = SERVICE_MENU.find(s => s.name.toLowerCase() === service.toLowerCase());
            
            if (matchedService) {
              const appt: Appointment = {
                id: `BKG-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
                customerName,
                customerPhone: 'Linked',
                service: matchedService.name,
                date,
                time,
                status: 'confirmed',
                appliedPromo: call.args.promoCode
              };
              setBookings(prev => [...prev, appt]);
              setBookingState({});
              agentResponse.appointment = appt;
            }
          } else if (call.name === 'get_available_slots') {
            if (!newBookingState.time) {
              agentResponse.availableSlots = ["10:00 AM", "12:30 PM", "3:00 PM", "6:00 PM"];
            }
          }
        }
      }

      setMessages(prev => [...prev, agentResponse]);
    } catch (error: any) {
      console.error("Chat Error:", error);
      
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: Role.AGENT,
        content: `Error: ${error.message || "Failed to connect to AI server. Please check your internet and API key."}`,
        timestamp: new Date(),
        isError: true
      }]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }, [input, isLoading, messages, currentAgent, useSearch, bookingState, config]);

  const handleTicketAction = useCallback((action: 'reschedule' | 'reminder', data?: Appointment) => {
    if (action === 'reschedule') {
      setBookingState({});
      handleSend(`Modify booking ${data?.id}`);
    } else {
      handleSend(`Set reminder for ${data?.id}`);
    }
  }, [handleSend]);

  return (
    <div className="flex h-screen w-full bg-zinc-950 overflow-hidden font-['Inter'] relative text-zinc-100">
      <Sidebar 
        currentAgent={currentAgent} 
        promotions={promotions}
        bookings={bookings}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onSelectAgent={handleAgentChange} 
        onRemovePromotion={(id) => setPromotions(prev => prev.filter(p => p.id !== id))}
        onQuickBook={() => handleSend(`1`)} 
        onClearExpired={() => {}}
        onOpenOfferModal={() => setIsOfferModalOpen(true)}
        onOpenDashboard={() => setIsDashboardOpen(true)}
        config={config}
      />

      <OfferModal 
        isOpen={isOfferModalOpen} 
        onClose={() => setIsOfferModalOpen(false)} 
        onAdd={(p) => setPromotions(prev => [p, ...prev])} 
      />

      <OwnerDashboard 
        isOpen={isDashboardOpen}
        onClose={() => setIsDashboardOpen(false)}
        bookings={bookings}
        currentAgent={currentAgent}
        config={config}
        onUpdateConfig={setConfig}
      />

      <main className="flex-1 flex flex-col relative h-full min-w-0 bg-zinc-950">
        <header className="h-16 border-b border-zinc-800/50 flex items-center justify-between px-4 md:px-8 bg-zinc-950/80 backdrop-blur-xl z-10 sticky top-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden w-10 h-10 -ml-2 flex items-center justify-center text-zinc-400 hover:text-white transition-colors active:scale-90">
              <i className="fas fa-bars-staggered text-lg"></i>
            </button>
            <div className={`w-9 h-9 rounded-xl ${currentAgent.color} flex items-center justify-center text-white shadow-lg shadow-rose-500/10 ring-1 ring-white/10`}>
              <i className={`fas ${currentAgent.icon} text-sm`}></i>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-black text-zinc-100 truncate tracking-tight">{currentAgent.name}</h2>
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-[8px] text-emerald-500 font-black uppercase tracking-widest">Live</span>
                </div>
              </div>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider leading-none mt-0.5">{currentAgent.role}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={handleReset} className="w-9 h-9 flex items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-rose-500 transition-all hover:border-rose-500/30 active:scale-95">
              <i className="fas fa-rotate-right text-sm"></i>
            </button>
          </div>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 md:px-12 lg:px-32 xl:px-64 custom-scrollbar">
          {messages.map((msg) => (
            <ChatMessage 
              key={msg.id} 
              message={msg} 
              onSelectSlot={(s) => handleSend(s)}
              onSelectService={(s) => handleSend(s.name)}
              onActionClick={handleTicketAction}
              onSelectDate={(d) => {
                const dateObj = new Date(d);
                handleSend(`${String(dateObj.getDate()).padStart(2, '0')}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`);
              }}
              config={config}
            />
          ))}
          {isLoading && (
            <div className="flex gap-3 items-center text-zinc-500 text-[11px] font-bold tracking-widest uppercase ml-12 mb-8 animate-pulse-soft">
              <div className="flex gap-1">
                <div className="w-1 h-1 rounded-full bg-rose-500"></div>
                <div className="w-1 h-1 rounded-full bg-rose-400"></div>
                <div className="w-1 h-1 rounded-full bg-rose-300"></div>
              </div>
              {currentAgent.name} is thinking...
            </div>
          )}
        </div>

        <div className="p-4 md:p-8 bg-gradient-to-t from-zinc-950 via-zinc-950 to-transparent">
          <div className="max-w-4xl mx-auto relative">
            <div className="glass-effect rounded-3xl border border-zinc-800/50 p-2 flex items-center gap-2 shadow-2xl focus-within:ring-2 focus-within:ring-rose-500/20 transition-all ring-1 ring-white/5">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                placeholder={isApiKeyValid() ? `Tell ${currentAgent.name} what you're looking for...` : "Setup required - check instructions above"}
                rows={1}
                disabled={!isApiKeyValid()}
                className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-3 px-4 resize-none custom-scrollbar placeholder:text-zinc-600 font-medium disabled:opacity-50"
              />
              <button 
                onClick={() => handleSend()} 
                disabled={!input.trim() || isLoading || !isApiKeyValid()} 
                className="w-12 h-12 rounded-2xl bg-rose-600 flex items-center justify-center text-white hover:bg-rose-500 active:scale-90 transition-all shadow-lg shadow-rose-600/20 disabled:opacity-20 disabled:grayscale"
              >
                <i className="fas fa-paper-plane text-sm"></i>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
