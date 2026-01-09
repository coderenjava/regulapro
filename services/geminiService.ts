
import { GoogleGenAI, Type } from "@google/genai";
import { Expense, Insight, Language, Category } from "../types";

export const getSmartInsights = async (expenses: Expense[], lang: Language): Promise<Insight | null> => {
  if (expenses.length === 0) return null;

  // Instanciation à la volée pour utiliser la clé active process.env.API_KEY
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const langNames: Record<Language, string> = {
    fr: "français",
    en: "english",
    es: "spanish",
    ar: "arabic"
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze these expenses and provide financial advice in ${langNames[lang]}: ${JSON.stringify(expenses)}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tip: { type: Type.STRING, description: "A short and impactful tip." },
            analysis: { type: Type.STRING, description: "A concise analysis of spending habits." },
            recommendations: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "A list of 3 concrete actions to save money."
            }
          },
          required: ["tip", "analysis", "recommendations"]
        },
        systemInstruction: `You are a benevolent personal finance expert. Analyze the provided JSON data and give strategic advice to optimize the user's budget. ALWAYS respond in ${langNames[lang]}.`
      }
    });

    if (response.text) {
      return JSON.parse(response.text.trim());
    }
    return null;
  } catch (error) {
    console.error("Gemini Insight Error:", error);
    return null;
  }
};

export const parseExpenseFromVoice = async (base64Audio: string, mimeType: string, lang: Language): Promise<Partial<Expense> | null> => {
  // Instanciation à la volée pour utiliser la clé active process.env.API_KEY
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const systemPrompt = `You are an expense assistant. Extract expense details from the audio.
  Return a JSON object with:
  - title: string (the main subject of the expense)
  - amount: number (the numeric value)
  - category: one of ['Courses', 'Shopping', 'Loisirs', 'Transport', 'Santé', 'Logement', 'Autres']
  - date: YYYY-MM-DD (if mentioned, otherwise current date)
  If information is missing, provide a best guess based on the context.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        {
          inlineData: {
            data: base64Audio,
            mimeType: mimeType
          }
        },
        {
          text: "Extract expense details from this audio recording."
        }
      ],
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            amount: { type: Type.NUMBER },
            category: { type: Type.STRING },
            date: { type: Type.STRING }
          },
          required: ["title", "amount", "category", "date"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text.trim());
    }
    return null;
  } catch (error) {
    console.error("Gemini Voice Parsing Error:", error);
    return null;
  }
};
