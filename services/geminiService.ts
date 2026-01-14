
import { GoogleGenAI, GenerateContentResponse, Type, FunctionDeclaration } from "@google/genai";
import { ModelType } from "../types.ts";

const bookingTool: FunctionDeclaration = {
  name: 'book_appointment',
  parameters: {
    type: Type.OBJECT,
    description: 'Record an appointment request for the user. Call this ONLY when you have Name, Phone, Service, Date, and Time.',
    properties: {
      customerName: { type: Type.STRING, description: 'Full name of the customer' },
      customerPhone: { type: Type.STRING, description: '10-digit phone number' },
      service: { type: Type.STRING, description: 'Name of the service (exact name from menu)' },
      date: { type: Type.STRING, description: 'Date in DD-MM format' },
      time: { type: Type.STRING, description: 'Time slot (e.g. 10:00 AM)' },
      promoCode: { type: Type.STRING, description: 'Optional promo code to apply' },
    },
    required: ['service', 'date', 'time', 'customerName', 'customerPhone'],
  },
};

const slotsTool: FunctionDeclaration = {
  name: 'get_available_slots',
  parameters: {
    type: Type.OBJECT,
    description: 'Get available time slots for a specific date or service.',
    properties: {
      date: { type: Type.STRING, description: 'The date to check (DD-MM)' },
      service: { type: Type.STRING, description: 'The service name' },
    },
  },
};

const reminderTool: FunctionDeclaration = {
  name: 'add_calendar_reminder',
  parameters: {
    type: Type.OBJECT,
    description: 'Sync the appointment to the user calendar. Call this when user asks for a reminder.',
    properties: {
      appointmentId: { type: Type.STRING, description: 'The unique ID of the booking' },
    },
    required: ['appointmentId'],
  },
};

const promoTool: FunctionDeclaration = {
  name: 'get_active_promotions',
  parameters: {
    type: Type.OBJECT,
    description: 'Get a list of all current active offers and promo codes.',
    properties: {},
  },
};

export async function chatWithAgent(
  model: ModelType,
  history: { role: string; parts: { text: string }[] }[],
  message: string,
  instruction: string,
  useSearch: boolean = false
): Promise<{ text: string; groundingUrls?: { uri: string; title: string }[], toolCalls?: any[] }> {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey || apiKey === 'undefined') {
      throw new Error("API_KEY is missing. Please set the API_KEY environment variable in your project settings.");
    }

    const ai = new GoogleGenAI({ apiKey });

    const tools = useSearch 
      ? [{ googleSearch: {} }] 
      : [{ functionDeclarations: [bookingTool, promoTool, slotsTool, reminderTool] }];

    const config: any = {
      systemInstruction: instruction,
      temperature: 0.7,
      tools: tools,
    };

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: model,
      contents: [
        ...history,
        { role: 'user', parts: [{ text: message }] }
      ],
      config,
    });

    return {
      text: response.text || "",
      groundingUrls: response.candidates?.[0]?.groundingMetadata?.groundingChunks
        ?.map((chunk: any) => chunk.web ? { uri: chunk.web.uri, title: chunk.web.title } : null)
        .filter(Boolean),
      toolCalls: response.functionCalls,
    };
  } catch (error: any) {
    console.error("Gemini API Error Detail:", error);
    throw error;
  }
}

export async function generateImage(prompt: string): Promise<string> {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("API_KEY is missing");

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: ModelType.IMAGE,
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image data found");
  } catch (error) {
    console.error("Image Gen Error:", error);
    throw error;
  }
}
