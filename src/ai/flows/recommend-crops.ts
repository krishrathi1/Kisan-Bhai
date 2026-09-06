'use server';

/**
 * @fileOverview Recommends crops using Kaggle Crop Recommendation Machine Learning Dataset
 * (siddharthss/crop-recommendation-dataset) with Groq LLM multilingual reasoning and ICAR Agronomy guidelines.
 *
 * - recommendCrops - A function that handles the crop recommendation process.
 * - RecommendCropsInput - The input type for the recommendCrops function.
 * - RecommendCropsOutput - The return type for the recommendCrops function.
 */

import { z } from 'genkit';
import { isGroqConfigured, groqClient } from '@/ai/groq';
import {
  mapFarmerInputsToKaggleFeatures,
  classifyCropFromKaggleDataset,
  KAGGLE_CROP_METADATA,
} from '@/lib/crop-ml-classifier';

const RecommendCropsInputSchema = z.object({
  location: z.string().describe("The user's location (e.g., district, state)."),
  farmType: z.enum(['irrigated', 'rainfed']).describe('The type of farm (irrigated or rainfed/dry).'),
  landSize: z.string().describe('The size of the land (e.g., "2 acres").'),
  soilType: z.string().optional().describe('The type of soil (e.g., "black soil", "red soil").'),
  waterSource: z.string().optional().describe('The primary source of water (e.g., "borewell", "canal", "rain-only").'),
  season: z.string().optional().describe('The current farming season (e.g., "Kharif", "Rabi").'),
  previousCrop: z.string().optional().describe('The crop grown in the previous season.'),
  budget: z.string().optional().describe('The approximate budget for cultivation.'),
  cropPreference: z.string().optional().describe('Any specific crop preference the user might have.'),
  language: z.string().describe('The language for the response (e.g., "en", "hi", "kn", "bn", "bho", "pa").'),
});
export type RecommendCropsInput = z.infer<typeof RecommendCropsInputSchema>;

const RecommendedCropSchema = z.object({
  cropName: z.string().describe("The name of the recommended crop."),
  icon: z.enum(['Leaf', 'Sprout', 'Carrot', 'Wheat', 'Grape']).describe("A relevant Lucide icon name."),
  plantingDates: z.string().describe("Recommended planting date range."),
  reasoning: z.string().describe("Why this crop is a good choice."),
  benefits: z.array(z.string()).min(2).max(3).describe("Key benefits."),
  imageHint: z.string().describe("Keywords for crop image."),
});

const RecommendCropsOutputSchema = z.object({
  recommendations: z.array(RecommendedCropSchema).length(3).describe('A list of exactly 3 recommended crops.'),
});
export type RecommendCropsOutput = z.infer<typeof RecommendCropsOutputSchema>;

export async function recommendCrops(input: RecommendCropsInput): Promise<RecommendCropsOutput> {
  const { location, farmType, landSize, soilType, waterSource, season, previousCrop, budget, cropPreference, language } = input;
  const lang = language || 'hi';

  // 1. Run Kaggle ML Feature Extraction & Gaussian Classifier (siddharthss/crop-recommendation-dataset)
  const kaggleFeatures = mapFarmerInputsToKaggleFeatures({
    location,
    farmType,
    soilType,
    waterSource,
    season,
    previousCrop,
  });

  const mlPredictions = classifyCropFromKaggleDataset(kaggleFeatures);

  // 2. Try Groq Multilingual Reasoning with ML Candidates
  if (isGroqConfigured && groqClient) {
    try {
      const promptText = `You are a chief agronomist in India. 
We executed a Machine Learning model trained on the Kaggle Crop Recommendation Dataset (siddharthss/crop-recommendation-dataset).
The ML model identified these top 3 optimal crop candidates for the farmer:
${mlPredictions.map((p, i) => `${i + 1}. ${p.cropKey} (ML Model Match: ${p.confidence}%)`).join('\n')}

Farmer Profile & Field Sensor Features:
- Location: ${location}
- Farm Type: ${farmType} (${farmType === 'irrigated' ? 'Adequate canal/borewell irrigation' : 'Rainfed / dependent on monsoon'})
- Land Size: ${landSize}
- Soil Type: ${soilType || 'Loamy / Alluvial'}
- Water Source: ${waterSource || 'Canal / Tube-well'}
- Season: ${season || 'Kharif'}
- Previous Crop: ${previousCrop || 'None'}
- Budget: ${budget || 'Standard'}
- Farmer Preference: ${cropPreference || 'None'}
- Computed Soil N-P-K & Environmental Vector: N=${kaggleFeatures.N}, P=${kaggleFeatures.P}, K=${kaggleFeatures.K}, Temp=${kaggleFeatures.temperature}°C, Humidity=${kaggleFeatures.humidity}%, pH=${kaggleFeatures.ph}, Rainfall=${kaggleFeatures.rainfall}mm
- Target Language: ${lang}

TASK:
For each of the 3 ML-predicted crops (${mlPredictions.map(p => p.cropKey).join(', ')}), generate a localized crop recommendation in the target language "${lang}".
CRITICAL:
1. All text (cropName, reasoning, benefits) MUST be written in language: "${lang}".
2. cropName should be the authentic local Indian agricultural name (e.g. for rice in Hindi: "उन्नत बासमती धान", in Punjabi: "ਬਾਸਮਤੀ ਝੋਨਾ", in English: "Basmati Paddy / Rice").
3. Output MUST be strictly valid JSON matching this schema:
{
  "recommendations": [
    {
      "cropName": "Crop Name in ${lang}",
      "icon": "Leaf" | "Sprout" | "Carrot" | "Wheat" | "Grape",
      "plantingDates": "e.g. June 15 - July 20",
      "reasoning": "1 clear sentence explaining why the soil nutrients (N-P-K) and climate in ${location} make this crop ideal.",
      "benefits": ["Benefit 1 with realistic numbers/MSP", "Benefit 2", "Benefit 3"],
      "imageHint": "crop keyword"
    }
  ]
}`;

      const completion = await groqClient.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: promptText }],
        temperature: 0.2,
        response_format: { type: "json_object" },
      });

      const parsed = JSON.parse(completion.choices[0]?.message?.content || "{}");
      if (parsed.recommendations && Array.isArray(parsed.recommendations) && parsed.recommendations.length === 3) {
        return parsed as RecommendCropsOutput;
      }
    } catch (groqErr) {
      console.warn("Groq crop recommendation failed, falling back to direct Kaggle ML metadata:", groqErr);
    }
  }

  // 3. Fallback: Direct Kaggle ML Metadata Output
  const fallbackRecommendations = mlPredictions.map((pred) => {
    const meta = KAGGLE_CROP_METADATA[pred.cropKey] || KAGGLE_CROP_METADATA.rice;
    const localizedName = meta.localizedNames[lang] || meta.localizedNames.hi || meta.name;
    const localizedBenefits = meta.defaultBenefits[lang] || meta.defaultBenefits.hi || meta.defaultBenefits.en;
    const reasoning = meta.reasoningTemplate[lang] || meta.reasoningTemplate.hi || meta.reasoningTemplate.en;

    return {
      cropName: localizedName,
      icon: meta.icon,
      plantingDates: meta.plantingDates,
      reasoning: reasoning,
      benefits: localizedBenefits,
      imageHint: meta.imageHint,
    };
  });

  return {
    recommendations: fallbackRecommendations,
  };
}
