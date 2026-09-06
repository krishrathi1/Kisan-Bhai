'use server';

/**
 * @fileOverview The main AI flow for the Annapurna chatbot assistant, powered by Groq with Gemini fallback.
 *
 * - annapurnaChat - Analyzes user query to determine intent and entities.
 * - AnnapurnaChatInput - The input type for the annapurnaChat function.
 * - AnnapurnaChatOutput - The return type for the annapurnaChat function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { callGroqChat, isGroqConfigured, DEFAULT_GROQ_MODEL } from '@/ai/groq';

const AnnapurnaChatInputSchema = z.object({
  query: z.string().describe("The user's message to the chatbot."),
  language: z.string().describe('The language of the user\'s query (e.g., "en", "hi", "kn", "bn", "bho").'),
});
export type AnnapurnaChatInput = z.infer<typeof AnnapurnaChatInputSchema>;

export type AnnapurnaIntent =
  | 'navigate_dashboard'
  | 'navigate_crop_doctor'
  | 'navigate_market_analyst'
  | 'navigate_schemes'
  | 'navigate_weather'
  | 'navigate_community'
  | 'navigate_shop'
  | 'navigate_learn'
  | 'navigate_tracker'
  | 'navigate_recommender'
  | 'navigate_profile'
  | 'navigate_settings'
  | 'navigate_fasal_certificate'
  | 'navigate_traceability'
  | 'query_market_prices'
  | 'query_schemes'
  | 'query_crop_recommendation'
  | 'general_question'
  | 'form_filling_help'
  | 'unknown';

const AnnapurnaChatOutputSchema = z.object({
  response: z.string().describe("A helpful, conversational response to the user's query, in their specified language."),
  intent: z.enum([
    'navigate_dashboard',
    'navigate_crop_doctor',
    'navigate_market_analyst',
    'navigate_schemes',
    'navigate_weather',
    'navigate_community',
    'navigate_shop',
    'navigate_learn',
    'navigate_tracker',
    'navigate_recommender',
    'navigate_profile',
    'navigate_settings',
    'navigate_fasal_certificate',
    'navigate_traceability',
    'query_market_prices',
    'query_schemes',
    'query_crop_recommendation',
    'general_question',
    'form_filling_help',
    'unknown',
  ]).describe("The user's primary goal or intent."),
  entities: z.object({
    crop: z.string().optional().describe("The crop name mentioned, e.g., 'tomato'."),
    city: z.string().optional().describe("The city name mentioned, e.g., 'pune'."),
    topic: z.string().optional().describe("The general topic mentioned, e.g., 'fertilizer'."),
  }).optional().describe("A map of extracted entities from the query."),
});
export type AnnapurnaChatOutput = z.infer<typeof AnnapurnaChatOutputSchema>;

const SYSTEM_PROMPT = `You are Annapurna, an empathetic, highly knowledgeable AI agricultural assistant for BeejMantra (a farmer operating system in India).
Your goal is to understand what the farmer needs and provide a clear, concise, actionable response.

Language Requirement:
The user is speaking in language code: "{{language}}".
If language is "hi", respond in friendly Hindi (Devanagari).
If language is "pa", respond in friendly Punjabi (Gurmukhi).
If language is "kn", respond in Kannada.
If language is "bn", respond in Bengali.
If language is "bho", respond in Bhojpuri.
If language is "en", respond in English.

Available Intents:
- "navigate_dashboard": Return to main dashboard.
- "navigate_crop_doctor": Crop diseases, pest identification, plant doctor.
- "navigate_market_analyst": Mandi prices, APMC rates, commodity prices.
- "navigate_schemes": Government subsidies, PM-KISAN, PMFBY, KCC loans.
- "navigate_weather": Weather forecast, rainfall advisory, temperature.
- "navigate_community": Farmer chat rooms, discussions.
- "navigate_shop": Buying seeds, fertilizers, government/private store.
- "navigate_learn": Video tutorials, farming guides.
- "navigate_tracker": Farm expenses, income, profit tracker.
- "navigate_recommender": Crop recommendation for season/soil.
- "navigate_profile": Farmer profile, Kisan Digital ID Card.
- "navigate_settings": App settings, theme, language.
- "navigate_fasal_certificate": Blockchain verified crop certificate, digital proof.
- "navigate_traceability": Produce lots, harvest batch supply chain.
- "query_market_prices": Asking price of specific crops/mandi.
- "query_schemes": Specific scheme inquiries.
- "query_crop_recommendation": Asking which crop to sow.
- "general_question": General farming, irrigation, organic methods question.
- "unknown": Unclear query.

You must respond ONLY with a valid JSON object in this format:
{
  "response": "<friendly short conversational answer in requested language>",
  "intent": "<one of the intents above>",
  "entities": {
    "crop": "<crop name if any or null>",
    "city": "<city/district if any or null>",
    "topic": "<topic if any or null>"
  }
}`;

/**
 * Execute Annapurna chat using Groq first, with Gemini and rule-based fallbacks
 */
export async function annapurnaChat(input: AnnapurnaChatInput): Promise<AnnapurnaChatOutput> {
  const { query, language } = input;

  // 1. Try Groq if configured
  if (isGroqConfigured) {
    try {
      const groqResponse = await callGroqChat({
        model: DEFAULT_GROQ_MODEL,
        temperature: 0.2,
        jsonMode: true,
        messages: [
          {
            role: "system",
            content: SYSTEM_PROMPT.replace("{{language}}", language),
          },
          {
            role: "user",
            content: query,
          },
        ],
      });

      const parsed = JSON.parse(groqResponse);
      return {
        response: parsed.response || "Namaste! How can I help your farm today?",
        intent: (parsed.intent as AnnapurnaIntent) || "general_question",
        entities: parsed.entities || {},
      };
    } catch (groqErr) {
      console.warn("Groq assistant call failed, falling back to GenAI/local:", groqErr);
    }
  }

  // 2. Try Gemini GenAI via Genkit
  try {
    return await annapurnaChatFlow(input);
  } catch (geminiErr) {
    console.warn("Genkit flow failed, using smart rule-based response:", geminiErr);
  }

  // 3. Smart offline rule-based fallback
  return getOfflineFallbackResponse(query, language);
}

const annapurnaPrompt = ai.definePrompt({
  name: 'annapurnaPrompt',
  input: { schema: AnnapurnaChatInputSchema },
  output: { schema: AnnapurnaChatOutputSchema },
  prompt: `You are Annapurna, a friendly and helpful AI farming assistant for BeejMantra.
  The user is interacting in '{{language}}'. Your response must be in this language.
  Analyze the user's query: "{{query}}"
  Determine intent and extract entities, and formulate a helpful short response.`,
});

const annapurnaChatFlow = ai.defineFlow(
  {
    name: 'annapurnaChatFlow',
    inputSchema: AnnapurnaChatInputSchema,
    outputSchema: AnnapurnaChatOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await annapurnaPrompt(input);
      if (!output) throw new Error('Chatbot returned empty output.');
      return output;
    } catch (error) {
      return getOfflineFallbackResponse(input.query, input.language);
    }
  }
);

function getOfflineFallbackResponse(query: string, language: string): AnnapurnaChatOutput {
  const q = query.toLowerCase();

  let intent: AnnapurnaIntent = 'general_question';
  let responseEn = "I am here to help you with crop doctor, mandi prices, weather, government schemes, and verified farming records. What would you like to explore?";
  let responseHi = "नमस्ते! मैं फसल डॉक्टर, मंडी भाव, मौसम, सरकारी योजनाओं और किसान पहचान में आपकी सहायता कर सकती हूँ। आप क्या जानना चाहते हैं?";

  if (q.includes("doctor") || q.includes("disease") || q.includes("bimari") || q.includes("keeda") || q.includes("pest")) {
    intent = "navigate_crop_doctor";
    responseEn = "I can help you diagnose crop diseases. Would you like to open the Crop Doctor?";
    responseHi = "मैं आपकी फसल की बीमारी पहचानने में मदद कर सकती हूँ। क्या आप फसल डॉक्टर खोलना चाहते हैं?";
  } else if (q.includes("mandi") || q.includes("bhav") || q.includes("price") || q.includes("rate") || q.includes("market")) {
    intent = "query_market_prices";
    responseEn = "You can view live mandi prices and commodity trends in the Market Analyst. Shall I take you there?";
    responseHi = "आप मंडी विश्लेषक में आज के ताज़ा मंडी भाव देख सकते हैं। क्या मैं आपको वहाँ ले चलूँ?";
  } else if (q.includes("weather") || q.includes("mausam") || q.includes("barish") || q.includes("rain")) {
    intent = "navigate_weather";
    responseEn = "I can show you today's weather forecast and farming advisory. Shall we open Weather?";
    responseHi = "मैं आपको आज का मौसम और कृषि सलाह दिखा सकती हूँ। क्या मौसम पेज खोलें?";
  } else if (q.includes("yojana") || q.includes("scheme") || q.includes("kisan") || q.includes("subsidy")) {
    intent = "navigate_schemes";
    responseEn = "You can check PM-KISAN and agricultural subsidies in Government Schemes. Would you like to check them?";
    responseHi = "आप सरकारी योजनाएं सेक्शन में पीएम किसान और सब्सिडी की जानकारी देख सकते हैं।";
  } else if (q.includes("certificate") || q.includes("fasal") || q.includes("blockchain") || q.includes("praman")) {
    intent = "navigate_fasal_certificate";
    responseEn = "You can generate a blockchain-verified digital Fasal Certificate with QR code. Shall we open Fasal Certificate?";
    responseHi = "आप ब्लॉकचेन सत्यापित डिजिटल फसल प्रमाणपत्र तैयार कर सकते हैं। क्या फसल प्रमाणपत्र खोलें?";
  } else if (q.includes("id") || q.includes("card") || q.includes("profile")) {
    intent = "navigate_profile";
    responseEn = "You can view and download your Kisan Digital ID Card in your profile. Shall we go to Profile?";
    responseHi = "आप अपनी प्रोफ़ाइल में किसान डिजिटल आईडी कार्ड देख और डाउनलोड कर सकते हैं।";
  }

  const responseMap: Record<string, string> = {
    hi: responseHi,
    en: responseEn,
    pa: responseHi,
    bho: responseHi,
    bn: responseEn,
    kn: responseEn,
  };

  return {
    response: responseMap[language] || responseEn,
    intent,
    entities: {},
  };
}
