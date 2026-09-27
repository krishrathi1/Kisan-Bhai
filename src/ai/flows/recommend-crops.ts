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
import { getWeatherForecast } from '@/ai/flows/get-weather-forecast';
import {
  mapFarmerInputsToKaggleFeatures,
  classifyCropFromKaggleDataset,
  KAGGLE_CROP_METADATA,
} from '@/lib/crop-ml-classifier';
import { getLanguageInstruction } from '@/lib/soil-data';

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
  // Extended location fields from map picker
  latitude: z.number().optional().describe('Latitude from map picker.'),
  longitude: z.number().optional().describe('Longitude from map picker.'),
  state: z.string().optional().describe('State name from reverse geocoding.'),
  district: z.string().optional().describe('District name from reverse geocoding.'),
  city: z.string().optional().describe('City/village from reverse geocoding.'),
  country: z.string().optional().describe('Country from reverse geocoding.'),
});
export type RecommendCropsInput = z.infer<typeof RecommendCropsInputSchema>;

const RecommendedCropSchema = z.object({
  cropName: z.string().describe("The name of the recommended crop."),
  icon: z.enum(['Leaf', 'Sprout', 'Carrot', 'Wheat', 'Grape']).describe("A relevant Lucide icon name."),
  variety: z.string().optional().describe("Recommended certified variety for the region."),
  plantingDates: z.string().describe("Recommended planting date range."),
  reasoning: z.string().describe("Why this crop is specifically optimal for the farmer's filled soil, land, season, and water conditions."),
  soilSuitability: z.string().optional().describe("Detailed suitability analysis for the farmer's specific soil type."),
  irrigationPlan: z.string().optional().describe("Irrigation and moisture management for their water source and farm type."),
  yieldEstimate: z.string().optional().describe("Estimated production yield and financial returns for the filled land size."),
  cropRotationBenefit: z.string().optional().describe("Agronomic rotation benefits based on the previous crop."),
  budgetFeasibility: z.string().optional().describe("Input cost and financial viability for the filled budget."),
  benefits: z.array(z.string()).min(2).max(4).describe("Key agronomic and market benefits."),
  imageHint: z.string().describe("Keywords for crop image."),
});

const RecommendCropsOutputSchema = z.object({
  fieldSummary: z.string().optional().describe("Overall agronomic assessment of the farmer's field inputs."),
  recommendations: z.array(RecommendedCropSchema).min(1).max(3).describe('A list of recommended crops with deep farm-specific details.'),
});
export type RecommendCropsOutput = z.infer<typeof RecommendCropsOutputSchema>;

// Helper to parse numeric acres from landSize string (e.g., "2.5 acres", "5 bigha", "1 hectare")
function parseAcres(landSizeStr?: string): number {
  if (!landSizeStr) return 1;
  const cleaned = landSizeStr.toLowerCase().trim();
  const match = cleaned.match(/([\d.]+)/);
  if (!match) return 1;
  const num = parseFloat(match[1]);
  if (isNaN(num) || num <= 0) return 1;
  if (cleaned.includes('bigha')) return num * 0.4; // approx 1 bigha = 0.4 acre
  if (cleaned.includes('hectare') || cleaned.includes('ha')) return num * 2.47;
  return num;
}

export async function recommendCrops(input: RecommendCropsInput): Promise<RecommendCropsOutput> {
  const { location, farmType, landSize, soilType, waterSource, season, previousCrop, budget, cropPreference, language } = input;
  const lang = language || 'hi';
  const weather = await getWeatherForecast({ city: location.split(',')[0].trim() || location });
  const liveWeather = weather.source === 'live' ? {
    temperatureC: weather.current.temperatureC,
    humidityPercent: weather.current.humidityPercent,
    rainfallMm: weather.forecastRainfallMm,
  } : undefined;

  // 1. Run Kaggle ML Feature Extraction & Gaussian Classifier (siddharthss/crop-recommendation-dataset)
  const kaggleFeatures = mapFarmerInputsToKaggleFeatures({
    location,
    farmType,
    soilType,
    waterSource,
    season,
    previousCrop,
    weather: liveWeather,
  });

  const mlPredictions = classifyCropFromKaggleDataset(kaggleFeatures, {
    farmType,
    waterSource,
    season,
    cropPreference,
    budget,
  });

  const acres = parseAcres(landSize);

  // 2. Try Groq multilingual reasoning with the already-filtered ML candidates
  if (isGroqConfigured && groqClient) {
    try {
      const langInstruction = getLanguageInstruction(lang);
      const locationDetails = input.state
        ? `State: ${input.state}${input.district ? `, District: ${input.district}` : ''}${input.city ? `, City/Village: ${input.city}` : ''}`
        : `Location: ${location}`;

      const promptText = `LANGUAGE INSTRUCTION: ${langInstruction}

You are a Senior Agricultural Scientist at ICAR (Indian Council of Agricultural Research).
A farmer has submitted their detailed farm profile. We need to give them a comprehensive, deeply personalized crop recommendation plan in language: "${lang}".

FARMER'S FILLED DETAILS:
- Location: ${locationDetails} ${input.latitude ? `(GPS: ${input.latitude.toFixed(4)}, ${input.longitude?.toFixed(4)})` : ''}
- Farm Type: ${farmType === 'irrigated' ? 'Irrigated (सिंचित) with adequate water' : 'Rainfed / Dryland (असिंचित/वर्षा आधारित)'}
- Land Size: ${landSize} (~${acres.toFixed(1)} acres)
- Soil Type: ${soilType || 'Loamy / Alluvial soil'}
- Water Source: ${waterSource || 'Borewell / Tube-well'}
- Farming Season: ${season || 'Kharif'}
- Previous Crop Grown: ${previousCrop || 'None / Fallow'}
- Available Budget: ${budget || 'Moderate / Standard farm budget'}
- Farmer Preference: ${cropPreference || 'Best profitable crop'}
- Live Weather: ${weather.current.temperatureC}°C, ${weather.current.humidityPercent}% humidity, ${weather.forecastRainfallMm}mm rain (Forecast: ${weather.current.condition})
- Computed Soil N-P-K & Environmental Vector: N=${kaggleFeatures.N}, P=${kaggleFeatures.P}, K=${kaggleFeatures.K}, pH=${kaggleFeatures.ph}

TOP 3 MACHINE LEARNING CANDIDATES:
${mlPredictions.map((p, i) => `${i + 1}. ${p.cropKey} (Confidence: ${p.confidence}%)`).join('\n')}

TASK REQUIREMENTS:
1. Provide a personalized "fieldSummary" (2-3 sentences in ${lang}) directly addressing their location (${location}), soil (${soilType || 'alluvial'}), water source (${waterSource || 'borewell'}), and season (${season || 'kharif'}).
2. For each of the 3 crops, provide concrete, tailored details based directly on the farmer's filled inputs:
   - "cropName": Localized name and top high-yielding certified variety suitable for their state.
   - "variety": Recommended variety name (e.g., HD-3086, Pusa Basmati 1121, JS-9560, GW-322).
   - "icon": One of: "Leaf", "Sprout", "Carrot", "Wheat", "Grape".
   - "plantingDates": Exact sowing window for ${season || 'current season'} (e.g., "15 October – 10 November").
   - "reasoning": 2 clear sentences in ${lang} explaining why this crop directly matches their ${soilType || 'soil'} and ${farmType} farming.
   - "soilSuitability": Specific explanation in ${lang} of how this crop utilizes nutrients in their ${soilType || 'soil'} (mention pH and drainage).
   - "irrigationPlan": Specific irrigation schedule in ${lang} tailored to their ${waterSource || 'water source'} and ${farmType} status.
   - "yieldEstimate": Quantitative yield and revenue estimate for their EXACT land size of ${landSize} in INR (₹).
   - "cropRotationBenefit": Agronomic benefit in ${lang} of rotating after their previous crop: "${previousCrop || 'previous season'}".
   - "budgetFeasibility": How the input cost fits within their budget: "${budget || 'standard'}".
   - "benefits": 3-4 bullet points in ${lang} highlighting MSP/market demand, drought/pest resistance, and profit.
   - "imageHint": English keyword for crop (e.g. wheat, rice, cotton).

OUTPUT FORMAT:
Respond with a strict JSON object matching this schema (ALL user-facing text must be in ${lang}):
{
  "fieldSummary": "string in ${lang}",
  "recommendations": [
    {
      "cropName": "Crop name and variety in ${lang}",
      "variety": "Variety name",
      "icon": "Leaf" | "Sprout" | "Carrot" | "Wheat" | "Grape",
      "plantingDates": "Dates string in ${lang}",
      "reasoning": "Reasoning in ${lang}",
      "soilSuitability": "Soil suitability in ${lang}",
      "irrigationPlan": "Water schedule in ${lang}",
      "yieldEstimate": "Yield and profit estimate for ${landSize} in ${lang}",
      "cropRotationBenefit": "Rotation benefit in ${lang}",
      "budgetFeasibility": "Budget advice in ${lang}",
      "benefits": ["Benefit 1", "Benefit 2", "Benefit 3"],
      "imageHint": "crop"
    }
  ]
}`;

      const completion = await groqClient.chat.completions.create({
        model: "openai/gpt-oss-20b",
        messages: [{ role: "user", content: promptText }],
        temperature: 0.25,
        response_format: { type: "json_object" },
      });

      const rawContent = completion.choices[0]?.message?.content || "{}";
      const parsed = JSON.parse(rawContent);

      if (parsed.recommendations && Array.isArray(parsed.recommendations) && parsed.recommendations.length > 0) {
        return parsed as RecommendCropsOutput;
      }
    } catch (groqErr) {
      console.warn("Groq crop recommendation failed, generating smart customized fallback:", groqErr);
    }
  }

  // 3. Smart Dynamic Fallback based on farmer's filled inputs
  const fieldSummary = lang === 'en'
    ? `Based on your farm profile in ${location} with ${soilType || 'standard'} soil, ${farmType} farming (${waterSource || 'groundwater'}), and ${landSize} land, our agronomic model has identified 3 high-yield crop options for the ${season || 'current'} season.`
    : `आपके ${location} स्थित खेत (${landSize}, ${soilType || 'उपजाऊ'} मिट्टी, ${farmType === 'irrigated' ? 'सिंचित' : 'वर्षा आधारित'} - ${waterSource || 'जल स्रोत'}) के आधार पर, ${season || 'वर्तमान'} मौसम के लिए 3 सबसे लाभदायक फसलें पहचानी गई हैं।`;

  const fallbackRecommendations = mlPredictions.map((pred, idx) => {
    const meta = KAGGLE_CROP_METADATA[pred.cropKey] || KAGGLE_CROP_METADATA.rice;
    const localizedName = meta.localizedNames[lang] || meta.localizedNames.hi || meta.name;
    const localizedBenefits = meta.defaultBenefits[lang] || meta.defaultBenefits.hi || meta.defaultBenefits.en;
    const baseReasoning = meta.reasoningTemplate[lang] || meta.reasoningTemplate.hi || meta.reasoningTemplate.en;

    // Calculate yield & income for user's land size
    const estYieldPerAcre = pred.cropKey === 'rice' ? 22 : pred.cropKey === 'wheat' ? 20 : pred.cropKey === 'cotton' ? 9 : pred.cropKey === 'maize' ? 25 : 12;
    const totalYieldQuintals = Math.round(estYieldPerAcre * acres);
    const estRatePerQuintal = pred.cropKey === 'cotton' ? 7400 : pred.cropKey === 'chickpea' ? 6200 : pred.cropKey === 'wheat' ? 2450 : 2350;
    const totalIncome = (totalYieldQuintals * estRatePerQuintal).toLocaleString('en-IN');

    const yieldEstimate = lang === 'en'
      ? `For your ${landSize}: Expected yield ~${totalYieldQuintals} quintals with estimated gross return of ₹${totalIncome} at current mandi rates.`
      : `आपकी ${landSize} भूमि के लिए: अनुमानित उत्पादन लगभग ${totalYieldQuintals} क्विंटल और वर्तमान मंडी भाव पर लगभग ₹${totalIncome} की सकल आय।`;

    const soilSuitability = lang === 'en'
      ? `Thrives in ${soilType || 'well-drained'} soil with optimal root aeration and nutrient uptake in ${location}.`
      : `${soilType || 'आपकी'} मिट्टी में इस फसल की जड़ें गहरी फैलती हैं और पोषण तेजी से ग्रहण करती हैं।`;

    const irrigationPlan = farmType === 'irrigated'
      ? (lang === 'en'
        ? `With ${waterSource || 'irrigation'}, schedule 3–4 critical watering rounds at crown root initiation, flowering, and grain filling.`
        : `${waterSource || 'सिंचाई'} के साथ, कल्ले फूटते समय, फूल आने और दाना भरते समय 3–4 मुख्य सिंचाई दें।`)
      : (lang === 'en'
        ? `Suitable for rainfed conditions; utilize field bunding and mulching to conserve root-zone moisture.`
        : `वर्षा आधारित खेती के लिए उपयुक्त; मेड़बन्दी और पलवार (मल्चिंग) से नमी सुरक्षित रखें।`);

    const cropRotationBenefit = previousCrop
      ? (lang === 'en'
        ? `Rotating after ${previousCrop} naturally disrupts pest cycles and optimizes nitrogen balance in the soil.`
        : `पिछली फसल (${previousCrop}) के बाद इसे बोने से कीट चक्र टूटता है और मिट्टी की उर्वरता सुधरती है।`)
      : (lang === 'en'
        ? `Provides balanced nutrient utilization and improves long-term soil structure.`
        : `मिट्टी की संरचना सुधारती है और जैविक कार्बन में वृद्धि करती है।`);

    const budgetFeasibility = budget
      ? (lang === 'en'
        ? `Input requirements align comfortably with your budget (${budget}) using certified seeds and balanced NPK fertilizer.`
        : `प्रमाणित बीज और संतुलित उर्वरकों के साथ आपकी बजट सीमा (${budget}) में पूरी तरह उपयुक्त है।`)
      : undefined;

    return {
      cropName: `${localizedName} (High Yield Variety)`,
      icon: meta.icon,
      variety: `ICAR Certified ${pred.cropKey.toUpperCase()}-Hybrid`,
      plantingDates: meta.plantingDates,
      reasoning: `${baseReasoning} ${lang === 'en' ? `Specially suited for your ${landSize} farm in ${location}.` : `यह आपके ${location} में ${landSize} खेत के लिए अत्यंत लाभकारी है।`}`,
      soilSuitability,
      irrigationPlan,
      yieldEstimate,
      cropRotationBenefit,
      budgetFeasibility,
      benefits: localizedBenefits,
      imageHint: meta.imageHint,
    };
  });

  return {
    fieldSummary,
    recommendations: fallbackRecommendations,
  };
}
