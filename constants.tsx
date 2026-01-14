
import { AgentPersona, Service, Promotion } from './types';

// ============================================================
// 👑 SALON OWNER: INPUT YOUR DETAILS HERE
// ============================================================

export const SALON_CONFIG = {
  // 1. YOUR WHATSAPP NUMBER (To receive booking messages)
  // Format: CountryCode + Number (Example: 919876543210)
  // IMPORTANT: No '+' sign, no spaces, only digits.
  whatsappNumber: '917057656600', 

  // 2. YOUR DISPLAY PHONE (What customers see in text)
  ownerPhone: '+91 7057656600', 

  // 3. YOUR WHATSAPP LINK (Used for the support button)
  // Replace the number part with your digits only number
  whatsappLink: 'https://wa.me/917057656600',

  // 4. YOUR BUSINESS ADDRESS
  address: 'Luxury Square, Mumbai, India'
};

// ============================================================

export const SERVICE_MENU: Service[] = [
  { 
    id: '1', 
    name: 'Hydra-Facial', 
    price: '₹1,500', 
    duration: '60 min', 
    category: 'Skin',
    icon: 'fa-droplet',
    description: 'Medical-grade resurfacing that deeply cleanses pores and infuses skin with hydration. Perfect for an instant red-carpet glow with zero downtime.',
    isPopular: true
  },
  { 
    id: '2', 
    name: 'Gold Glow Facial', 
    price: '₹1,200', 
    duration: '75 min', 
    category: 'Skin',
    icon: 'fa-sparkles',
    description: 'Luxury brightening treatment using pure 24K gold extracts to stimulate collagen and improve elasticity. Leaves your skin firm and regally radiant.'
  },
  { 
    id: '3', 
    name: 'Signature Haircut', 
    price: '₹500', 
    duration: '45 min', 
    category: 'Hair',
    icon: 'fa-scissors',
    description: 'Precision cut tailored to your face shape. Includes a therapeutic scalp massage, organic wash, and a professional blowout for a runway-ready finish.',
    isPopular: true
  },
  { 
    id: '4', 
    name: 'Keratin Smoothing', 
    price: '₹4,500', 
    duration: '180 min', 
    category: 'Hair',
    icon: 'fa-wind',
    description: 'Elite frizz-control using a formaldehyde-free formula. Deeply repairs the hair cuticle for mirror-like shine and cuts daily styling time in half.'
  },
  { 
    id: '5', 
    name: 'Full Body Waxing', 
    price: '₹1,200', 
    duration: '90 min', 
    category: 'Skin',
    icon: 'fa-leaf',
    description: 'Smooth results redefined using premium Italian chocolate wax. Gentle on skin but tough on hair, ensuring velvet-smooth results that last for 4+ weeks.'
  },
  { 
    id: '6', 
    name: 'Party Makeup', 
    price: '₹2,500', 
    duration: '60 min', 
    category: 'Makeup',
    icon: 'fa-wand-magic-sparkles',
    description: 'Glamorous, high-definition look using long-wear luxury products. Expertly blended for a flawless finish that looks stunning in person and on camera.'
  },
  { 
    id: '7', 
    name: 'Bridal Couture', 
    price: '₹15,000', 
    duration: '240 min', 
    category: 'Makeup',
    icon: 'fa-gem',
    description: 'Bespoke bridal makeover featuring waterproof HD makeup and designer hairstyling. Includes sari/dupatta draping for a breathtaking 12-hour stay.',
    isPopular: true
  },
];

export const INITIAL_PROMOTIONS: Promotion[] = [
  {
    id: 'promo-1',
    code: 'GLOW10',
    title: 'Hydra-Facial Special',
    description: 'Get 10% OFF on our Signature Hydra-Facial this week! 💖',
    discount: '10% OFF',
    expiry: 'Valid this week',
    validUntil: '2025-12-31T23:59:59Z',
    type: 'Seasonal'
  }
];

export const PERSONAS: AgentPersona[] = [
  {
    id: 'manager',
    name: 'Maya',
    role: 'Salon Manager',
    description: 'Booking & Operations Specialist.',
    instruction: `You are Maya, the expert manager of Dyra Beauty Parlour.

CORE SYSTEM:
- Guide the user through the 4-step roadmap (Treatment -> Date -> Time -> Name).
- Once the booking is confirmed, tell the user: "Your appointment is saved here! To finalize and notify our team, please click the 'Finalize on WhatsApp' button on your ticket below."

DATA PRIVACY:
- If asked "Where does my data go?", explain: "Your bookings are saved privately in your own browser's memory. To ensure the salon owner sees your request, use the WhatsApp button to send a quick notification."

TONE: Professional, sophisticated, luxury.`,
    icon: 'fa-calendar-check',
    color: 'bg-rose-500'
  },
  {
    id: 'skin',
    name: 'Zara',
    role: 'Skin Expert',
    description: 'Expert in facials and skincare routines.',
    instruction: 'You are Zara, a certified skincare specialist. Provide numbered recommendations for skin treatments.',
    icon: 'fa-sparkles',
    color: 'bg-pink-400'
  },
  {
    id: 'hair',
    name: 'Elena',
    role: 'Style Consultant',
    description: 'Visualizes bridal looks and hair styles.',
    instruction: 'You are Elena, a creative hair and bridal expert. Use numbered lists for styling.',
    icon: 'fa-scissors',
    color: 'bg-amber-400'
  }
];
