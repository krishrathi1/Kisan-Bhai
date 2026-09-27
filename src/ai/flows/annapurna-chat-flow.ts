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
import { getLanguageInstruction } from '@/lib/soil-data';

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

const SYSTEM_PROMPT = `You are Annapurna, an empathetic, highly knowledgeable AI agricultural assistant for Krishi Mitra (a farmer operating system in India).
Your goal is to understand what the farmer needs and provide a clear, concise, actionable response.

CRITICAL LANGUAGE REQUIREMENT:
{{language_instruction}}
You MUST strictly obey the language instruction above. Never mix languages. Output all response text solely in the target language.

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
            content: SYSTEM_PROMPT.replace("{{language_instruction}}", getLanguageInstruction(language)),
          },
          {
            role: "user",
            content: query,
          },
        ],
      });

      const parsed = JSON.parse(groqResponse);
      return {
        response: parsed.response || (language === 'hi' ? "नमस्ते! मैं आपकी क्या सहायता कर सकती हूँ?" : "Hello! How can I help your farm today?"),
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
  prompt: `You are Annapurna, a friendly and helpful AI farming assistant for Krishi Mitra.
  CRITICAL LANGUAGE REQUIREMENT: The user is interacting in '{{language}}'. You MUST respond ENTIRELY in this language without mixing words from any other language.
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

  const responses: Record<string, Record<string, string>> = {
    general: {
      en: "I am here to help you with crop doctor, mandi prices, weather, government schemes, and verified farming records. What would you like to explore?",
      hi: "नमस्ते! मैं फसल डॉक्टर, मंडी भाव, मौसम, सरकारी योजनाओं और किसान पहचान में आपकी सहायता कर सकती हूँ। आप क्या जानना चाहते हैं?",
      pa: "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਫ਼ਸਲ ਡਾਕਟਰ, ਮੰਡੀ ਭਾਅ, ਮੌਸਮ ਅਤੇ ਸਰਕਾਰੀ ਸਕੀਮਾਂ ਵਿੱਚ ਤੁਹਾਡੀ ਮਦਦ ਕਰ ਸਕਦੀ ਹਾਂ।",
      bn: "নমস্কার! আমি ফসল ডাক্তার, মান্ডি দর, আবহাওয়া এবং সরকারি প্রকল্পে আপনাকে সাহায্য করতে পারি।",
      kn: "ನಮಸ್ಕಾರ! ನಾನು ಬೆಳೆ ವೈದ್ಯ, ಮಾರುಕಟ್ಟೆ ಬೆಲೆಗಳು, ಹವಾಮಾನ ಮತ್ತು ಸರ್ಕಾರಿ ಯೋಜನೆಗಳಲ್ಲಿ ನಿಮಗೆ ಸಹಾಯ ಮಾಡಬಲ್ಲೆ.",
      bho: "प्रणाम! हम फसल डॉक्टर, मंडी भाव, मौसम आ सरकारी योजना में रउआ सहायता कर सकीं।"
    },
    doctor: {
      en: "I can help you diagnose crop diseases. Would you like to open the Crop Doctor?",
      hi: "मैं आपकी फसल की बीमारी पहचानने में मदद कर सकती हूँ। क्या आप फसल डॉक्टर खोलना चाहते हैं?",
      pa: "ਮੈਂ ਫ਼ਸਲ ਦੀ ਬਿਮਾਰੀ ਪਛਾਣਨ ਵਿੱਚ ਮਦਦ ਕਰ ਸਕਦੀ ਹਾਂ। ਕੀ ਤੁਸੀਂ ਫ਼ਸਲ ਡਾਕਟਰ ਖੋਲ੍ਹਣਾ ਚਾਹੁੰਦੇ ਹੋ?",
      bn: "আমি ফসলের রোগ নির্ণয় করতে সাহায্য করতে পারি। আপনি কি ফসল ডাক্তার খুলতে চান?",
      kn: "ಬೆಳೆ ರೋಗಗಳನ್ನು ಪತ್ತೆಹಚ್ಚಲು ನಾನು ಸಹಾಯ ಮಾಡಬಲ್ಲೆ. ನೀವು ಬೆಳೆ ವೈದ್ಯರನ್ನು ತೆರೆಯಲು ಬಯಸುವಿರಾ?",
      bho: "हम रउआ फसल के बेमारी पहचाने में मदद कर सकीं। का रउआ फसल डॉक्टर खोलल चाहत बानी?"
    },
    mandi: {
      en: "You can view live mandi prices and commodity trends in the Market Analyst. Shall I take you there?",
      hi: "आप मंडी विश्लेषक में आज के ताज़ा मंडी भाव देख सकते हैं। क्या मैं आपको वहाँ ले चलूँ?",
      pa: "ਤੁਸੀਂ ਮੰਡੀ ਵਿਸ਼ਲੇਸ਼ਕ ਵਿੱਚ ਤਾਜ਼ਾ ਮੰਡੀ ਰੇਟ ਦੇਖ ਸਕਦੇ ਹੋ। ਕੀ ਉੱਥੇ ਚੱਲੀਏ?",
      bn: "আপনি মার্কেট অ্যানালিস্টে সরাসরি মান্ডির দর দেখতে পারেন।",
      kn: "ಮಾರುಕಟ್ಟೆ ವಿಶ್ಲೇಷಕದಲ್ಲಿ ನೀವು ಲೈವ್ ಮಂಡಿ ಬೆಲೆಗಳನ್ನು ನೋಡಬಹುದು.",
      bho: "रउआ मंडी विश्लेषक में आज के ताजा मंडी भाव देख सकीं।"
    },
    weather: {
      en: "I can show you today's weather forecast and farming advisory. Shall we open Weather?",
      hi: "मैं आपको आज का मौसम और कृषि सलाह दिखा सकती हूँ। क्या मौसम पेज खोलें?",
      pa: "ਮੈਂ ਤੁਹਾਨੂੰ ਅੱਜ ਦਾ ਮੌਸਮ ਅਤੇ ਖੇਤੀ ਸਲਾਹ ਦਿਖਾ ਸਕਦੀ ਹਾਂ।",
      bn: "আমি আপনাকে আজকের আবহাওয়ার পূর্বাভাস দেখাতে পারি।",
      kn: "ಇಂದಿನ ಹವಾಮಾನ ಮುನ್ಸೂಚನೆಯನ್ನು ನಾನು ತೋರಿಸಬಲ್ಲೆ.",
      bho: "हम आज के मौसम आ खेती के सलाह देखा सकीं।"
    },
    schemes: {
      en: "You can check PM-KISAN and agricultural subsidies in Government Schemes. Would you like to check them?",
      hi: "आप सरकारी योजनाएं सेक्शन में पीएम किसान और सब्सिडी की जानकारी देख सकते हैं।",
      pa: "ਤੁਸੀਂ ਸਰਕਾਰੀ ਸਕੀਮਾਂ ਵਿੱਚ ਪੀਐਮ-ਕਿਸਾਨ ਅਤੇ ਸਬਸਿਡੀਆਂ ਦੇਖ ਸਕਦੇ ਹੋ।",
      bn: "আপনি সরকারি প্রকল্পে পিএম-কিসান ও ভর্তুকি দেখতে পারেন।",
      kn: "ಸರ್ಕಾರಿ ಯೋಜನೆಗಳಲ್ಲಿ ನೀವು ಸಬ್ಸಿಡಿಗಳನ್ನು ಪರಿಶೀಲಿಸಬಹುದು.",
      bho: "रउआ सरकारी योजना में पीएम-किसान आ सब्सिडी के जानकारी देख सकीं।"
    },
    certificate: {
      en: "You can generate a blockchain-verified digital Fasal Certificate with QR code. Shall we open Fasal Certificate?",
      hi: "आप ब्लॉकचेन सत्यापित डिजिटल फसल प्रमाणपत्र तैयार कर सकते हैं। क्या फसल प्रमाणपत्र खोलें?",
      pa: "ਤੁਸੀਂ ਬਲਾਕਚੇਨ ਪ੍ਰਮਾਣਿਤ ਡਿਜੀਟਲ ਫ਼ਸਲ ਸਰਟੀਫਿਕੇਟ ਤਿਆਰ ਕਰ ਸਕਦੇ ਹੋ।",
      bn: "আপনি ব্লকচেইন যাচাইকৃত ডিজিটাল ফসল শংসাপত্র তৈরি করতে পারেন।",
      kn: "ನೀವು ಬ್ಲಾಕ್‌ಚೈನ್ ಪರಿಶೀಲಿತ ಡಿಜಿಟಲ್ ಬೆಳೆ ಪ್ರಮಾಣಪತ್ರವನ್ನು ರಚಿಸಬಹುದು.",
      bho: "रउआ ब्लॉकचेन सत्यापित डिजिटल फसल प्रमाणपत्र बना सकीं।"
    },
    profile: {
      en: "You can view and download your Kisan Digital ID Card in your profile. Shall we go to Profile?",
      hi: "आप अपनी प्रोफ़ाइल में किसान डिजिटल आईडी कार्ड देख और डाउनलोड कर सकते हैं।",
      pa: "ਤੁਸੀਂ ਆਪਣੀ ਪ੍ਰੋਫਾਈਲ ਵਿੱਚ ਕਿਸਾਨ ਡਿਜੀਟਲ ਆਈਡੀ ਕਾਰਡ ਦੇਖ ਸਕਦੇ ਹੋ।",
      bn: "আপনি আপনার প্রোফাইলে কিষাণ ডিজিটাল আইডি কার্ড দেখতে পারেন।",
      kn: "ನಿಮ್ಮ ಪ್ರೊಫೈಲ್‌ನಲ್ಲಿ ಕಿಸಾನ್ ಡಿಜಿಟಲ್ ಗುರುತಿನ ಚੀಟಿ ನೋಡಬಹುದು.",
      bho: "रउआ आपन प्रोफाइल में किसान डिजिटल आईडी कार्ड देख सकीं।"
    }
  };

  let category = 'general';
  if (q.includes("doctor") || q.includes("disease") || q.includes("bimari") || q.includes("keeda") || q.includes("pest")) {
    intent = "navigate_crop_doctor";
    category = "doctor";
  } else if (q.includes("mandi") || q.includes("bhav") || q.includes("price") || q.includes("rate") || q.includes("market")) {
    intent = "query_market_prices";
    category = "mandi";
  } else if (q.includes("weather") || q.includes("mausam") || q.includes("barish") || q.includes("rain")) {
    intent = "navigate_weather";
    category = "weather";
  } else if (q.includes("yojana") || q.includes("scheme") || q.includes("kisan") || q.includes("subsidy")) {
    intent = "navigate_schemes";
    category = "schemes";
  } else if (q.includes("certificate") || q.includes("fasal") || q.includes("blockchain") || q.includes("praman")) {
    intent = "navigate_fasal_certificate";
    category = "certificate";
  } else if (q.includes("id") || q.includes("card") || q.includes("profile")) {
    intent = "navigate_profile";
    category = "profile";
  }

  const categoryResponses = responses[category] || responses.general;
  const responseText = categoryResponses[language] || categoryResponses.en;

  return {
    response: responseText,
    intent,
    entities: {},
  };
}
