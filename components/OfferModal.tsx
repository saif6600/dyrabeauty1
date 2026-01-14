
import React, { useState } from 'react';
import { Promotion } from '../types.ts';

interface OfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (promo: Promotion) => void;
}

export default function OfferModal({ isOpen, onClose, onAdd }: OfferModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    discount: '',
    code: '',
    validUntil: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newPromo: Promotion = {
      id: `promo-${Date.now()}`,
      title: formData.title,
      description: formData.description,
      discount: formData.discount,
      code: formData.code.toUpperCase(),
      expiry: `Until ${new Date(formData.validUntil).toLocaleDateString()}`,
      validUntil: new Date(formData.validUntil).toISOString(),
      type: 'Seasonal'
    };
    onAdd(newPromo);
    onClose();
    setFormData({ title: '', description: '', discount: '', code: '', validUntil: '' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-gradient-to-r from-rose-500/10 to-transparent">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <i className="fas fa-plus-circle text-rose-500"></i>
            Create New Offer
          </h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
            <i className="fas fa-times text-lg"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-black text-zinc-500 tracking-widest ml-1">Offer Title</label>
            <input
              required
              type="text"
              placeholder="e.g. Summer Glow Special"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:border-rose-500 outline-none transition-all"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-black text-zinc-500 tracking-widest ml-1">Description</label>
            <textarea
              required
              placeholder="Describe the offer..."
              rows={2}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:border-rose-500 outline-none transition-all resize-none"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-black text-zinc-500 tracking-widest ml-1">Discount</label>
              <input
                required
                type="text"
                placeholder="e.g. 20% OFF"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:border-rose-500 outline-none transition-all"
                value={formData.discount}
                onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-black text-zinc-500 tracking-widest ml-1">Promo Code</label>
              <input
                required
                type="text"
                placeholder="e.g. GLOW20"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:border-rose-500 outline-none transition-all font-mono uppercase"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-black text-zinc-500 tracking-widest ml-1">Expiry Date</label>
            <input
              required
              type="date"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:border-rose-500 outline-none transition-all color-scheme-dark"
              style={{ colorScheme: 'dark' }}
              value={formData.validUntil}
              onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-rose-600/20 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <i className="fas fa-rocket"></i>
              Launch Promotion
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
