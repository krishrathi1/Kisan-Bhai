import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

const apiKey =
  process.env.GOOGLE_GENAI_API_KEY ||
  process.env.GEMINI_API_KEY ||
  process.env.GOOGLE_API_KEY ||
  '';

export const ai = genkit({
  plugins: [
    googleAI(
      apiKey && apiKey.trim().length > 0
        ? { apiKey: apiKey.trim() }
        : { apiKey: 'dummy_api_key_for_fallback' }
    ),
  ],
  model: 'googleai/gemini-2.0-flash',
});
