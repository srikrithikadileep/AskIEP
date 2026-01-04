
import { GoogleGenAI, Type, Content } from "@google/genai";
import { SYSTEM_PROMPTS } from "../constants";

/**
 * Creates a fresh instance of the Gemini API client.
 * Strictly follows instructions to create a new instance right before making an API call.
 */
const createAI = () => {
  const apiKey = typeof process !== 'undefined' ? process.env.API_KEY : '';
  return new GoogleGenAI({ apiKey: apiKey || '' });
};

/**
 * Robustly cleans and parses JSON strings from Gemini responses.
 * Handles markdown code blocks often returned by the model.
 */
const cleanAndParseJson = (text: string | undefined) => {
  if (!text) throw new Error("AI returned an empty response.");
  try {
    // Remove markdown code blocks if present
    const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("JSON Parsing Error from AI:", e, text);
    throw new Error("The AI returned a response in an invalid format. Please try again.");
  }
};

export const analyzeIEPDirect = async (text: string) => {
  const ai = createAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [{ 
      parts: [{ text: `Analyze the following IEP document text and return a structured JSON response:\n\n${text}` }] 
    }],
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
          legalLens: { type: Type.STRING }
        },
        required: ["summary", "goals", "accommodations", "redFlags", "legalLens"]
      }
    }
  });
  
  return cleanAndParseJson(response.text);
};

export const getMeetingSimulationDirect = async (userMessage: string, childContext: string) => {
  const ai = createAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [{ 
      parts: [{ text: `Context: ${childContext}\nParent says: ${userMessage}` }] 
    }],
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

export const generateLetterDirect = async (context: string, letterType: string) => {
  const ai = createAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [{ 
      parts: [{ text: `Letter Type: ${letterType}\nDetails: ${context}` }] 
    }],
    config: {
      systemInstruction: SYSTEM_PROMPTS.LETTER_WRITER,
    }
  });
  return response.text || "Unable to generate letter draft.";
};

export const refineTextDirect = async (currentText: string, instruction: string) => {
  const ai = createAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [{ 
      parts: [{ text: `Original Text:\n${currentText}\n\nInstruction: Rewrite the text above to be ${instruction}. Keep the core meaning but change the length/tone as requested. Output ONLY the new text.` }] 
    }],
    config: {
      systemInstruction: "You are an expert editor for formal special education correspondence.",
    }
  });
  return response.text || currentText;
};
