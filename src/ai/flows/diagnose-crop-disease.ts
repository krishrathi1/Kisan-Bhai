// diagnose-crop-disease.ts
'use server';

/**
 * @fileOverview Diagnoses crop diseases from an image and/or text description, and provides solutions.
 *
 * - diagnoseCropDisease - A function that handles the crop disease diagnosis process.
 * - DiagnoseCropDiseaseInput - The input type for the diagnoseCropDisease function.
 * - DiagnoseCropDiseaseOutput - The return type for the diagnoseCropDisease function.
 */

import { z } from 'genkit';
import { isGroqConfigured, groqClient } from '@/ai/groq';
import { getLanguageInstruction } from '@/lib/soil-data';

const DiagnoseCropDiseaseInputSchema = z.object({
  photoDataUri: z
    .string()
    .optional()
    .describe(
      "A photo of a crop, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  description: z.string().optional().describe('A text or voice-based description of the crop issue.'),
  language: z.string().describe('The language for the response (e.g., "en", "hi", "kn", "bn", "bho", "pa").'),
});
export type DiagnoseCropDiseaseInput = z.infer<typeof DiagnoseCropDiseaseInputSchema>;

const DiagnoseCropDiseaseOutputSchema = z.object({
  isPlant: z.boolean().describe('Whether or not the input is a plant or a plant-related issue.'),
  diagnosis: z.string().describe('The diagnosis of the crop disease.'),
  solutions: z.string().describe('Suggested solutions with local product links.'),
  documentationLink: z.string().optional().describe('A search engine link to find relevant documentation.'),
  youtubeLink: z.string().optional().describe('A YouTube search link to find a relevant visual guide.'),
});
export type DiagnoseCropDiseaseOutput = z.infer<typeof DiagnoseCropDiseaseOutputSchema>;

const groqVisionModel = process.env.GROQ_VISION_MODEL?.trim() || '';

function getSmartFallbackDiagnosis(description?: string, language: string = "en"): DiagnoseCropDiseaseOutput {
  const desc = (description || "").toLowerCase();

  // 1. Wheat / Gehun
  if (desc.includes("wheat") || desc.includes("gehun") || desc.includes("gehu") || desc.includes("गेहूं") || desc.includes("ਕਣਕ") || desc.includes("rust") || desc.includes("peela") || desc.includes("rattua")) {
    return {
      isPlant: true,
      diagnosis: language === "hi" 
        ? "गेहूं का पीला रतुआ (Yellow/Stripe Rust - Puccinia striiformis)" 
        : language === "pa" 
        ? "ਕਣਕ ਦਾ ਪੀਲਾ ਰਤੂਆ (Yellow Rust)"
        : "Wheat Yellow Stripe Rust (Puccinia striiformis)",
      solutions: language === "hi" 
        ? "1. जैविक उपचार: खट्टी छाछ (5%) या नीम का तेल (5ml/लीटर पानी) का छिड़काव करें।\n2. रासायनिक उपचार: प्रोपिकोनाज़ोल 25% EC (Tilt) 1ml प्रति लीटर पानी में मिलाकर तुरंत छिड़कें।\n3. रोकथाम: खेत में अत्यधिक नमी और यूरिया का अधिक प्रयोग न करें।"
        : language === "pa"
        ? "1. ਜੈਵਿਕ ਰੋਕਥਾਮ: ਨਿੰਮ ਦੇ ਤੇਲ (5ml/ਲਿਟਰ) ਦਾ ਛਿੜਕਾਅ ਕਰੋ।\n2. ਰਸਾਇਣਕ ਰੋਕਥਾਮ: ਪ੍ਰੋਪੀਕੋਨਾਜ਼ੋਲ 25% EC (1ml ਪ੍ਰਤੀ ਲਿਟਰ ਪਾਣੀ) ਦਾ ਛਿੜਕਾਅ ਕਰੋ।\n3. ਸਾਵਧਾਨੀ: ਯੂਰੀਆ ਦੀ ਵੱਧ ਵਰਤੋਂ ਤੋਂ ਬਚੋ।"
        : "1. Organic Remedy: Spray 5% fermented buttermilk solution or Neem Oil (5ml/L of water).\n2. Chemical Treatment: Spray Propiconazole 25% EC @ 1ml per litre of water at first symptom.\n3. Preventive Tips: Avoid excess nitrogen/urea application and improve field aeration.",
      documentationLink: "https://icar.org.in/",
      youtubeLink: "https://www.youtube.com/results?search_query=wheat+yellow+rust+treatment",
    };
  }

  // 2. Rice / Paddy / Dhan
  if (desc.includes("rice") || desc.includes("paddy") || desc.includes("dhan") || desc.includes("धान") || desc.includes("ਚੌਲ") || desc.includes("blast") || desc.includes("sheath")) {
    return {
      isPlant: true,
      diagnosis: language === "hi"
        ? "धान का झुलसा रोग (Paddy Blast - Pyricularia oryzae) व शीथ ब्लाइट"
        : language === "pa"
        ? "ਝੋਨੇ ਦਾ ਝੁਲਸ ਰੋਗ (Paddy Blast & Sheath Blight)"
        : "Paddy Blast & Sheath Blight (Pyricularia oryzae)",
      solutions: language === "hi"
        ? "1. जैविक उपचार: स्यूडोमोनास फ्लोरेसेंस (10g/लीटर) का पर्णीय छिड़काव करें।\n2. रासायनिक उपचार: ट्राइसाइक्लाज़ोल 75% WP (0.6g/लीटर पानी) या हेक्साकोनाज़ोल 5% SC (2ml/लीटर पानी) का छिड़काव करें।\n3. रोकथाम: खेत में यूरिया की अत्यधिक खुराक न दें और पानी की निकासी ठीक रखें।"
        : "1. Organic Remedy: Foliar spray of Pseudomonas fluorescens @ 10g/L.\n2. Chemical Treatment: Spray Tricyclazole 75% WP @ 0.6g/L or Hexaconazole 5% SC @ 2ml/L of water.\n3. Preventive Tips: Avoid excess nitrogen, burn stubble of infected fields, ensure drain management.",
      documentationLink: "https://icar.org.in/",
      youtubeLink: "https://www.youtube.com/results?search_query=paddy+blast+disease+treatment",
    };
  }

  // 3. Cotton / Kapas / Narma
  if (desc.includes("cotton") || desc.includes("kapas") || desc.includes("narma") || desc.includes("कपास") || desc.includes("ਨਰਮਾ") || desc.includes("bollworm") || desc.includes("whitefly")) {
    return {
      isPlant: true,
      diagnosis: language === "hi" 
        ? "कपास की गुलाबी सुंडी और सफेद मक्खी (Pink Bollworm & Whitefly)"
        : language === "pa" 
        ? "ਨਰਮੇ ਦੀ ਗੁਲਾਬੀ ਸੁੰਡੀ ਅਤੇ ਚਿੱਟੀ ਮੱਖੀ (Bollworm / Whitefly)"
        : "Cotton Pink Bollworm & Whitefly Infestation",
      solutions: language === "hi"
        ? "1. जैविक उपचार: फेरोमोन ट्रैप (8-10 प्रति एकड़) लगाएं और नीम तेल (1500 ppm) 5ml/लीटर छिड़कें।\n2. रासायनिक उपचार: स्पाइनेटोरम 11.7% SC (0.8ml/लीटर) या एसिटामिप्रिड 20% SP (0.5g/लीटर) का छिड़काव करें।\n3. रोकथाम: खेत की नियमित निगरानी रखें और ग्रसित फूलों को तोड़कर नष्ट करें।"
        : "1. Organic Remedy: Install 8-10 Pheromone traps per acre and spray Neem Oil (5ml/L).\n2. Chemical Treatment: Spray Spinetoram 11.7% SC @ 0.8ml/L or Acetamiprid 20% SP @ 0.5g/L.\n3. Preventive Tips: Regularly inspect squaring and remove infested rosetted flowers.",
      documentationLink: "https://icar.org.in/",
      youtubeLink: "https://www.youtube.com/results?search_query=cotton+pink+bollworm+whitefly+control",
    };
  }

  // 4. Chilli / Mirch
  if (desc.includes("chilli") || desc.includes("mirch") || desc.includes("मिर्च") || desc.includes("ਮਿਰਚ") || desc.includes("curl") || desc.includes("murda")) {
    return {
      isPlant: true,
      diagnosis: language === "hi"
        ? "मिर्च का मरोड़िया / पर्ण कुंचन रोग (Chilli Leaf Curl Virus & Thrips/Mites)"
        : "Chilli Leaf Curl Virus (Gemini Virus) & Vector Infestation",
      solutions: language === "hi"
        ? "1. जैविक उपचार: पीले व नीले स्टिकी ट्रैप (15-20 प्रति एकड़) लगाएं और नीम तेल (5ml/लीटर) का छिड़काव करें।\n2. रासायनिक उपचार: थियामेथोक्सम 25% WG (0.5g/लीटर) या डायफेन्थियूरोन 50% WP (1g/लीटर) का छिड़काव करें।\n3. रोकथाम: रोगग्रस्त पौधों को उखाड़कर नष्ट करें ताकि रसचूसक कीट इसे दूसरे पौधों में न फैलाएं।"
        : "1. Organic Remedy: Install yellow and blue sticky traps (15-20/acre) and spray Neem oil (5ml/L).\n2. Chemical Treatment: Spray Thiamethoxam 25% WG @ 0.5g/L or Diafenthiuron 50% WP @ 1g/L for vector control.\n3. Preventive Tips: Rogue out and destroy infected viral plants immediately.",
      documentationLink: "https://icar.org.in/",
      youtubeLink: "https://www.youtube.com/results?search_query=chilli+leaf+curl+virus+treatment",
    };
  }

  // 5. Mustard / Sarson
  if (desc.includes("mustard") || desc.includes("sarson") || desc.includes("सरसों") || desc.includes("aphid") || desc.includes("chepa") || desc.includes("mahun")) {
    return {
      isPlant: true,
      diagnosis: language === "hi"
        ? "सरसों का माहू (चेपा / Aphid) व सफेद रतुआ (White Rust - Albugo candida)"
        : "Mustard Aphids (Lipaphis erysimi) & White Rust (Albugo candida)",
      solutions: language === "hi"
        ? "1. जैविक उपचार: नीम के बीज का अर्क (NSKE 5%) या नीम तेल 5ml/लीटर पानी में घोलकर छिड़कें।\n2. रासायनिक उपचार: इमिडाक्लोप्रिड 17.8% SL (0.5ml/लीटर) या मेटालेक्सिल 8% + मैंकोज़ेब 64% WP (2g/लीटर) का छिड़काव करें।\n3. रोकथाम: समय पर बुवाई करें और खेत में मित्र कीटों (लेडीबर्ड बीटल) का संरक्षण करें।"
        : "1. Organic Remedy: Spray NSKE 5% or Neem oil @ 5ml/L.\n2. Chemical Treatment: Spray Imidacloprid 17.8% SL @ 0.5ml/L or Metalaxyl 8% + Mancozeb 64% WP @ 2g/L.\n3. Preventive Tips: Early sowing avoids peak aphid flight; preserve natural predators.",
      documentationLink: "https://icar.org.in/",
      youtubeLink: "https://www.youtube.com/results?search_query=sarson+aphids+white+rust+treatment",
    };
  }

  // 6. Potato / Aloo
  if (desc.includes("potato") || desc.includes("aloo") || desc.includes("आलू") || desc.includes("ਆਲੂ")) {
    return {
      isPlant: true,
      diagnosis: language === "hi"
        ? "आलू का पछेती झुलसा (Potato Late Blight - Phytophthora infestans)"
        : "Potato Late Blight (Phytophthora infestans)",
      solutions: language === "hi"
        ? "1. जैविक उपचार: ट्राइकोडर्मा विरिडी (5g/लीटर) का छिड़काव करें और खेत में जलभराव रोकें।\n2. रासायनिक उपचार: साइमोक्सानिल 8% + मैंकोज़ेब 64% WP (2.5g/लीटर) या कॉपर हाइड्रॉक्साइड 53.8% DF (2g/लीटर) का छिड़काव करें।\n3. रोकथाम: प्रमाणित रोगमुक्त बीज का उपयोग करें और कंदों को अच्छी तरह मिट्टी से ढकें।"
        : "1. Organic Remedy: Spray Trichoderma viride @ 5g/L and avoid damp waterlogged beds.\n2. Chemical Treatment: Spray Cymoxanil 8% + Mancozeb 64% WP @ 2.5g/L or Copper Hydroxide 53.8% DF @ 2g/L.\n3. Preventive Tips: Use certified blight-free seed tubers and ensure complete earthing up.",
      documentationLink: "https://icar.org.in/",
      youtubeLink: "https://www.youtube.com/results?search_query=potato+late+blight+treatment",
    };
  }

  // 7. General Caterpillar / Bollworm / Stem Borer (कीड़ा / सुंडी / तना छेदक)
  if (desc.includes("keeda") || desc.includes("keede") || desc.includes("कीड़ा") || desc.includes("कीड़े") || desc.includes("sundi") || desc.includes("सुंडी") || desc.includes("borer") || desc.includes("caterpillar") || desc.includes("worm") || desc.includes("chhed")) {
    return {
      isPlant: true,
      diagnosis: language === "hi"
        ? "फसल में कीट व इल्ली / सुंडी का प्रकोप (Caterpillar / Stem Borer / Lepidopteran Pest)"
        : "Crop Caterpillar & Stem Borer Infestation",
      solutions: language === "hi"
        ? "1. जैविक उपचार: नीम तेल (10,000 ppm) 3ml/लीटर या बैसिलस थुरिंजिएंसिस (Bt) 2g/लीटर का छिड़काव करें।\n2. रासायनिक उपचार: कोराजन (क्लोरेंट्रानिलिप्रोल 18.5% SC) 0.4ml प्रति लीटर या एमामेक्टिन बेंजोएट 5% SG 0.5g प्रति लीटर पानी में मिलाकर छिड़कें।\n3. रोकथाम: शाम के समय छिड़काव करें और खेत में प्रकाश प्रपंच (Light Traps) लगाएं।"
        : "1. Organic Remedy: Spray Neem Oil (10,000 ppm) @ 3ml/L or Bacillus thuringiensis (Bt) @ 2g/L.\n2. Chemical Treatment: Spray Chlorantraniliprole 18.5% SC (Coragen) @ 0.4ml/L or Emamectin Benzoate 5% SG @ 0.5g/L.\n3. Preventive Tips: Apply sprays in late afternoon; set up solar light traps.",
      documentationLink: "https://icar.org.in/",
      youtubeLink: "https://www.youtube.com/results?search_query=stem+borer+caterpillar+control+farming",
    };
  }

  // 8. General Leaf Spot / Fungal Blight / Tikka (पत्तियों पर धब्बे / फफूंद)
  if (desc.includes("dhabba") || desc.includes("धब्बा") || desc.includes("धब्बे") || desc.includes("spot") || desc.includes("fungus") || desc.includes("फफूंद") || desc.includes("tikka") || desc.includes("sukha")) {
    return {
      isPlant: true,
      diagnosis: language === "hi"
        ? "पत्तियों का धब्बा रोग व फफूंद संक्रमण (Cercospora / Alternaria Leaf Spot & Fungal Blight)"
        : "Fungal Leaf Spot & Blight Complex",
      solutions: language === "hi"
        ? "1. जैविक उपचार: ट्राइकोडर्मा हरजिएनम (5g/लीटर) का छिड़काव करें।\n2. रासायनिक उपचार: कार्बेन्डाजिम 12% + मैंकोज़ेब 63% WP (Saaf) 2g प्रति लीटर पानी में मिलाकर छिड़कें।\n3. रोकथाम: संक्रमित निचली पत्तियों को तोड़कर खेत से दूर करें और पानी का ठहराव रोकें।"
        : "1. Organic Remedy: Foliar spray of Trichoderma harzianum @ 5g/L.\n2. Chemical Treatment: Spray Carbendazim 12% + Mancozeb 63% WP (Saaf) @ 2g/L of water.\n3. Preventive Tips: Remove severely spotted lower leaves to reduce inoculum.",
      documentationLink: "https://icar.org.in/",
      youtubeLink: "https://www.youtube.com/results?search_query=leaf+spot+fungal+disease+treatment",
    };
  }

  // 9. Default: Tomato / Vegetable Late Blight & Fruit Rot
  return {
    isPlant: true,
    diagnosis: language === "hi" 
      ? "टमाटर और सब्जियों का पछेती झुलसा व फल सड़न (Late Blight & Fruit Rot - Phytophthora infestans)"
      : language === "pa"
      ? "ਟਮਾਟਰ ਦਾ ਪਿਛੇਤਾ ਝੁਲਸ ਰੋਗ ਅਤੇ ਫਲ ਗਲਣਾ (Late Blight & Fruit Rot)"
      : language === "bn"
      ? "টমেটোর নাবী ধসা ও ফল পচা রোগ (Late Blight & Fruit Rot)"
      : language === "kn"
      ? "ಟೊಮೆಟೊ ತುಕ್ಕು ಮತ್ತು ಹಣ್ಣು ಕೊಳೆತ ರೋಗ (Late Blight & Fruit Rot)"
      : language === "bho"
      ? "टमाटर के पिछेती झुलसा आ फल सड़न रोग (Late Blight & Fruit Rot)"
      : "Tomato Late Blight & Fruit Rot (Phytophthora infestans)",
    solutions: language === "hi"
      ? "1. जैविक उपचार: ट्राइकोडर्मा विरिडी (5g/लीटर) और नीम तेल (5ml/लीटर पानी) का छिड़काव करें। संक्रमित फलों और पत्तियों को तुरंत तोड़कर खेत से दूर नष्ट करें।\n2. रासायनिक उपचार: कॉपर ऑक्सीक्लोराइड 50% WP (2.5g प्रति लीटर) या मैंकोज़ेब 75% WP (2g प्रति लीटर पानी) का तुरंत छिड़काव करें।\n3. रोकथाम: पत्तियों पर ऊपर से पानी देने से बचें, पौधों के बीच हवा का प्रवाह बनाए रखें और खेत में जलभराव न होने दें।"
      : language === "pa"
      ? "1. ਜੈਵਿਕ ਇਲਾਜ: ਨਿੰਮ ਦਾ ਤੇਲ (5ml/ਲਿਟਰ) ਛਿੜਕੋ। ਖਰਾਬ ਫਲ ਤੋੜ ਕੇ ਖੇਤ ਤੋਂ ਬਾਹਰ ਨਸ਼ਟ ਕਰੋ।\n2. ਰਸਾਇਣਕ ਇਲਾਜ: ਕਾਪਰ ਆਕਸੀਕਲੋਰਾਈਡ 50% WP (2.5 ਗ੍ਰਾਮ ਪ੍ਰਤੀ ਲਿਟਰ) ਜਾਂ ਮੈਂਕੋਜ਼ੇਬ 75% WP (2 ਗ੍ਰਾਮ/ਲਿਟਰ) ਦਾ ਛਿੜਕਾਅ ਕਰੋ।\n3. ਬਚਾਅ: ਖੇਤ ਵਿੱਚ ਪਾਣੀ ਖੜ੍ਹਾ ਨਾ ਹੋਣ ਦਿਓ।"
      : language === "bn"
      ? "১. জৈব প্রতিকার: নিম তেল (৫ মিলি/লিটার) স্প্রে করুন। আক্রান্ত ফল ছিঁড়ে নষ্ট করুন।\n২. রাসায়নিক প্রতিকার: কপার অক্সিক্লোরাইড ৫০% ডব্লিউপি (২.৫ গ্রাম/লিটার) বা ম্যানকোজেব ৭৫% ডব্লিউপি (২ গ্রাম/লিটার) স্প্রে করুন।"
      : language === "kn"
      ? "೧. ಜೈವಿಕ ಪರಿಹಾರ: ಬೇವಿನ ಎಣ್ಣೆ (೫ಮಿಲಿ/ಲೀಟರ್) ಸಿಂಪಡಿಸಿ. ರೋಗಪೀಡಿತ ಹಣ್ಣುಗಳನ್ನು ನಾಶಮಾಡಿ.\n೨. ರಾಸಾಯನಿಕ ಪರಿಹಾರ: ತಾಮ್ರದ ಆಕ್ಸಿಕ್ಲೋರೈಡ್ (೨.೫ಗ್ರಾಂ/ಲೀಟರ್) ಸಿಂಪಡಿಸಿ."
      : language === "bho"
      ? "1. जैविक उपचार: नीम के तेल (5ml/लीटर) के छिड़काव करीं। सड़ल फल तूड़ के खेत से दूर फेंकीं।\n2. रासायनिक उपचार: कॉपर ऑक्सीक्लोराइड 50% WP (2.5 ग्राम प्रति लीटर पानी) के छिड़काव करीं।"
      : "1. Organic Remedy: Spray Neem Oil (5ml/L) and apply Trichoderma viride. Remove and destroy all infected fruits and lower leaves immediately.\n2. Chemical Treatment: Spray Copper Oxychloride 50% WP @ 2.5g/L of water or Mancozeb 75% WP @ 2g/L.\n3. Preventive Tips: Avoid overhead irrigation, ensure proper air circulation between vines, and maintain well-drained soil.",
    documentationLink: "https://www.google.com/search?q=tomato+late+blight+fruit+rot+treatment+icar",
    youtubeLink: "https://www.youtube.com/results?search_query=tomato+late+blight+treatment+hindi",
  };
}

// Helper: wait for ms
function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function callGeminiAPI(input: DiagnoseCropDiseaseInput): Promise<DiagnoseCropDiseaseOutput | null> {
  const apiKey = process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY || '';
  if (!apiKey || apiKey.trim().length === 0 || apiKey.trim() === 'YOUR_GEMINI_API_KEY_HERE') {
    console.warn("[CropDoctor] No Gemini API key configured. Set GOOGLE_GENAI_API_KEY in .env.local");
    return null;
  }

  console.log("[CropDoctor] Calling Gemini API...", {
    hasImage: !!input.photoDataUri,
    hasDescription: !!input.description,
    language: input.language,
  });

  const promptText = `${getLanguageInstruction(input.language)}

You are an expert plant pathologist and agronomist in India.
Analyze the provided crop image carefully. Look at leaf color, spots, patterns, texture, wilting signs, pest marks, and any visible symptoms.
Diagnose the exact crop disease from the provided image and/or description.
User's preferred language: "${input.language}".
ALL text in your output (diagnosis, solutions) MUST be strictly in language: "${input.language}".

IMPORTANT: Base your diagnosis primarily on what you SEE in the image. Do NOT give generic answers. Identify the specific disease, pest, or deficiency visible in the image.

Provide your response strictly as a JSON object:
{
  "isPlant": true,
  "diagnosis": "Crop Name & Disease Name with scientific name — in ${input.language}",
  "solutions": "1. Organic Remedy (in ${input.language}): detailed remedy with exact dosage...\\n2. Chemical Remedy with exact product name and dosage per litre (in ${input.language}): ...\\n3. Field Prevention Tips (in ${input.language}): ...",
  "documentationSearchQuery": "search query for documentation or ICAR guide",
  "youtubeSearchQuery": "youtube video search query for disease management in Hindi/English"
}

If the image does not contain a plant or crop, set "isPlant" to false and explain what you see instead.

${input.description ? `Farmer's Observation/Description: "${input.description}"` : ''}`;

  const parts: any[] = [{ text: promptText }];

  if (input.photoDataUri && input.photoDataUri.startsWith('data:')) {
    const match = input.photoDataUri.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
    if (match) {
      parts.push({
        inlineData: {
          mimeType: match[1],
          data: match[2],
        },
      });
      console.log("[CropDoctor] Image attached to request, MIME:", match[1]);
    }
  }

  const requestBody = JSON.stringify({
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.2,
    },
    contents: [{ parts }],
  });

  // Models to try — latest Gemini 3 preview vision models
  const models = ['gemini-3.5-flash', 'gemini-3.8-flash', 'gemini-3.8-flash-lite'];
  const MAX_RETRIES = 3;

  for (const model of models) {
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        console.log(`[CropDoctor] Trying model: ${model} (attempt ${attempt}/${MAX_RETRIES})...`);
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: requestBody,
          }
        );

        // Rate limited (429) — wait and retry same model
        if (res.status === 429) {
          const retryAfter = res.headers.get('retry-after');
          const waitMs = retryAfter ? parseInt(retryAfter) * 1000 : Math.min(2000 * Math.pow(2, attempt - 1), 15000);
          console.warn(`[CropDoctor] Rate limited (429) on ${model}. Waiting ${waitMs}ms before retry...`);
          await sleep(waitMs);
          continue;
        }

        // Service overloaded (503) — wait and retry
        if (res.status === 503) {
          const waitMs = Math.min(3000 * Math.pow(2, attempt - 1), 20000);
          console.warn(`[CropDoctor] Service overloaded (503) on ${model}. Waiting ${waitMs}ms...`);
          await sleep(waitMs);
          continue;
        }

        // Auth error — key is bad, stop entirely
        if (res.status === 401 || res.status === 403) {
          const errorBody = await res.text().catch(() => '');
          console.error(`[CropDoctor] ❌ API key error (${res.status}): ${errorBody.slice(0, 300)}`);
          console.error("[CropDoctor] Your GOOGLE_GENAI_API_KEY may be invalid. Get a new key from https://aistudio.google.com/apikey");
          return null;
        }

        // Model not found — skip to next model
        if (res.status === 404) {
          console.warn(`[CropDoctor] Model ${model} not found (404), trying next...`);
          break;
        }

        // Other server errors — retry if 5xx
        if (!res.ok) {
          const errorBody = await res.text().catch(() => '');
          console.warn(`[CropDoctor] Model ${model} returned ${res.status}: ${errorBody.slice(0, 200)}`);
          if (res.status >= 500 && attempt < MAX_RETRIES) {
            await sleep(2000 * attempt);
            continue;
          }
          break;
        }

        const data = await res.json();

        // Safety-filtered
        if (data.candidates?.[0]?.finishReason === 'SAFETY') {
          console.warn(`[CropDoctor] Response safety-filtered on ${model}, trying next model...`);
          break;
        }

        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!rawText) {
          console.warn(`[CropDoctor] Model ${model} returned empty response`);
          break;
        }

        console.log(`[CropDoctor] ✅ Got response from ${model} (attempt ${attempt})`);

        // Parse JSON — strip markdown code fences if present
        let jsonText = rawText.trim();
        if (jsonText.startsWith('```')) {
          jsonText = jsonText.replace(/^```json?\s*\n?/, '').replace(/\n?```\s*$/, '');
        }

        const parsed = JSON.parse(jsonText);
        if (parsed.diagnosis && parsed.solutions) {
          return {
            isPlant: parsed.isPlant ?? true,
            diagnosis: parsed.diagnosis,
            solutions: parsed.solutions,
            documentationLink: parsed.documentationSearchQuery
              ? `https://www.google.com/search?q=${encodeURIComponent(parsed.documentationSearchQuery)}`
              : 'https://icar.org.in/',
            youtubeLink: parsed.youtubeSearchQuery
              ? `https://www.youtube.com/results?search_query=${encodeURIComponent(parsed.youtubeSearchQuery)}`
              : 'https://www.youtube.com/results?search_query=crop+disease+management',
          };
        }

        console.warn(`[CropDoctor] Model ${model} response missing diagnosis/solutions`);
        break;
      } catch (err) {
        console.warn(`[CropDoctor] Error with ${model} (attempt ${attempt}):`, err);
        if (attempt < MAX_RETRIES) {
          await sleep(1500 * attempt);
        }
      }
    }
  }

  console.warn("[CropDoctor] All Gemini models failed after retries, will try fallbacks");
  return null;
}

export async function diagnoseCropDisease(input: DiagnoseCropDiseaseInput): Promise<DiagnoseCropDiseaseOutput> {
  // Ensure that at least one input is provided
  if (!input.photoDataUri && !input.description) {
    throw new Error('Either a photo or a description must be provided for diagnosis.');
  }

  console.log("[CropDoctor] === Starting Diagnosis ===", {
    hasImage: !!input.photoDataUri,
    hasDescription: !!input.description,
    language: input.language,
  });

  // 1. Try Direct Google Gemini API Key (Multimodal Image + Language Diagnosis)
  try {
    const geminiResult = await callGeminiAPI(input);
    if (geminiResult && geminiResult.diagnosis && geminiResult.solutions) {
      console.log("[CropDoctor] ✅ Gemini AI diagnosis successful");
      return geminiResult;
    }
  } catch (geminiErr) {
    console.warn("[CropDoctor] Direct Gemini API call failed:", geminiErr);
  }

  // 2. If description is provided and Groq is configured, diagnose via Groq
  if (input.description && isGroqConfigured && groqClient) {
    console.log("[CropDoctor] Trying Groq text-based fallback...");
    try {
      const completion = await groqClient.chat.completions.create({
        model: 'openai/gpt-oss-20b',
        messages: [
          {
            role: 'system',
            content: `You are an expert plant pathologist and agricultural scientist in India.
Diagnose the crop problem described by the farmer.
Respond strictly in language: "${input.language}".
Provide the output strictly as a JSON object with:
{
  "isPlant": true,
  "diagnosis": "Crop Name & Disease Name — in ${input.language}",
  "solutions": "1. Organic Remedy (in ${input.language}): ...\\n2. Chemical Remedy with exact dosage (in ${input.language}): ...\\n3. Field Prevention Tips (in ${input.language}): ...",
  "documentationSearchQuery": "search query for documentation",
  "youtubeSearchQuery": "search query for video guide"
}`
          },
          {
            role: 'user',
            content: `Farmer crop issue description: ${input.description}`
          }
        ],
        temperature: 0.2,
        response_format: { type: 'json_object' }
      });

      const parsed = JSON.parse(completion.choices[0]?.message?.content || '{}');
      if (parsed.diagnosis && parsed.solutions) {
        console.log("[CropDoctor] ✅ Groq diagnosis successful");
        return {
          isPlant: parsed.isPlant ?? true,
          diagnosis: parsed.diagnosis,
          solutions: parsed.solutions,
          documentationLink: parsed.documentationSearchQuery 
            ? `https://www.google.com/search?q=${encodeURIComponent(parsed.documentationSearchQuery)}`
            : "https://icar.org.in/",
          youtubeLink: parsed.youtubeSearchQuery 
            ? `https://www.youtube.com/results?search_query=${encodeURIComponent(parsed.youtubeSearchQuery)}`
            : "https://www.youtube.com/results?search_query=crop+disease+management",
        };
      }
    } catch (groqErr) {
      console.warn("[CropDoctor] Groq fallback failed:", groqErr);
    }
  }

  // 3. Guaranteed Smart Pathology Fallback (ICAR domain knowledge)
  console.warn("[CropDoctor] ⚠️ Using HARDCODED fallback — no AI analysis was performed. Add your GOOGLE_GENAI_API_KEY in .env.local to enable real image analysis.");
  return getSmartFallbackDiagnosis(input.description, input.language);
}


