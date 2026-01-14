
export enum Role {
  USER = 'user',
  AGENT = 'agent',
  SYSTEM = 'system'
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: Date;
  attachments?: string[];
  groundingUrls?: Array<{ uri: string; title: string }>;
  isError?: boolean;
  isGuidance?: boolean;
  appointment?: Appointment;
  promotion?: Promotion;
  availableSlots?: string[];
  serviceOptions?: Service[];
  dateOptions?: string[];
}

export interface Appointment {
  id: string;
  customerName?: string;
  customerPhone?: string;
  service: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed';
  appliedPromo?: string;
}

export interface Promotion {
  id: string;
  code: string;
  title: string;
  description: string;
  discount: string;
  expiry: string;
  validUntil: string;
  type: 'Seasonal' | 'Loyalty' | 'First-Time';
}

export interface Service {
  id: string;
  name: string;
  price: string;
  duration: string;
  description?: string;
  icon?: string;
  category: 'Hair' | 'Skin' | 'Makeup' | 'Massage';
  isPopular?: boolean;
}

export interface AgentPersona {
  id: string;
  name: string;
  role: string;
  description: string;
  instruction: string;
  icon: string;
  color: string;
}

export enum ModelType {
  FLASH = 'gemini-3-flash-preview',
  PRO = 'gemini-3-pro-preview',
  IMAGE = 'gemini-2.5-flash-image'
}
