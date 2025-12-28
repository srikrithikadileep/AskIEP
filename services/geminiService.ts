import { GoogleGenAI, Type, Content } from "@google/genai";
import { SYSTEM_PROMPTS } from "../constants";

// Fix: Initializing GoogleGenAI directly with process.env.API_KEY as per guidelines
const createAI = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY as string });
};

const cleanAndParseJson = (text: string | undefined) => {
  if (!text) throw new Error("AI returned an empty response.");
  try {
    const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("JSON Parsing Error from AI:", e, text);
    throw new Error("The AI returned a response in an invalid format. Please try again.");
  }
};

export const analyzeIEPDirect = async (text: string) => {
  const ai = createAI();
  // Fix: Using direct string for contents and ensuring response property access is correct
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze the following IEP document text and return a structured JSON response:\n\n${text}`,
    config: {
      systemInstruction: SYSTEM_PROMPTS.ANALYZER,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          goals: { type: Type.ARRAY, items: { type: Type.STRING } },
          accommodations: { type: Type.ARRAY, items: { type: Type.STRING } },
          redFlags: { type: Type.ARRAY, items: { type: Type.STRING } },
          legalLens: { type: Type.STRING },
          serviceGrid: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                service: { type: Type.STRING },
                frequency: { type: Type.STRING },
                setting: { type: Type.STRING }
              },
              required: ["service", "frequency"]
            }
          }
        },
        required: ["summary", "goals", "accommodations", "redFlags", "legalLens", "serviceGrid"]
      }
    }
  });
  
  return cleanAndParseJson(response.text);
};

export const compareIEPsDirect = async (oldIep: string, newIep: string) => {
  const ai = createAI();
  // Fix: Using direct string for contents
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `COMPARE THESE TWO IEPS.\n\nOLD IEP:\n${oldIep}\n\nNEW IEP:\n${newIep}\n\nIdentify specifically: 1. Service reductions. 2. Goals removed. 3. New accommodations. 4. Concerns.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          reductions: { type: Type.ARRAY, items: { type: Type.STRING } },
          removedGoals: { type: Type.ARRAY, items: { type: Type.STRING } },
          newSupports: { type: Type.ARRAY, items: { type: Type.STRING } },
          criticalDifferences: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["reductions", "removedGoals", "newSupports", "criticalDifferences"]
      }
    }
  });
  return cleanAndParseJson(response.text);
};

export const generateConcernLetterDirect = async (analysis: any, childName: string) => {
  const ai = createAI();
  // Fix: Using direct string for contents
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Write a professional Parent Concern Letter for ${childName} based on these IEP findings: ${JSON.stringify(analysis.redFlags)}. Cite IDEA rights.`,
    config: {
      systemInstruction: "You are a senior educational advocate. Write a firm but collaborative letter from a parent to a school district. Use professional formatting."
    }
  });
  return response.text;
};

export const reviseConcernLetterDirect = async (currentLetter: string, instruction: string) => {
  const ai = createAI();
  // Fix: Using direct string for contents
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `CURRENT LETTER:\n${currentLetter}\n\nINSTRUCTION: ${instruction}\n\nPlease rewrite the letter according to the instruction while maintaining a professional advocacy tone.`,
    config: {
      systemInstruction: "You are an expert educational advocate re-drafting a formal letter. Focus on clarity, tone, and legal accuracy."
    }
  });
  return response.text;
};

export const getMeetingSimulationDirect = async (userMessage: string, childContext: string) => {
  const ai = createAI();
  // Fix: Using direct string for contents
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Context: ${childContext}\nParent says: ${userMessage}`,
    config: {
      systemInstruction: SYSTEM_PROMPTS.MEETING_PREP,
    }
  });
  return response.text || "I'm sorry, I couldn't generate a response.";
};

export const chatWithLegalDirect = async (query: string, history: Content[] = []) => {
  const ai = createAI();
  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: SYSTEM_PROMPTS.LEGAL_SUPPORT,
    },
    history: history
  });
  
  const response = await chat.sendMessage({ message: query });
  return response.text || "I'm sorry, I couldn't find an answer for that.";
};