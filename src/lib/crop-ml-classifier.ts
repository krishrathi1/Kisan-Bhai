/**
 * @fileOverview Kaggle Crop Recommendation Machine Learning Engine
 * Trained on: siddharthss/crop-recommendation-dataset (2,200 data points across 22 crops)
 * Features: N (Nitrogen), P (Phosphorus), K (Potassium), Temperature (°C), Humidity (%), pH, Rainfall (mm)
 */

import datasetProfiles from './crop-dataset-profiles.json';

export interface KaggleFeatures {
  N: number;
  P: number;
  K: number;
  temperature: number;
  humidity: number;
  ph: number;
  rainfall: number;
}

export interface KagglePrediction {
  cropKey: string;
  confidence: number;
  logLikelihood: number;
  standardCropName: string;
  icon: 'Leaf' | 'Sprout' | 'Carrot' | 'Wheat' | 'Grape';
  plantingDates: string;
  imageHint: string;
}

// 22 Kaggle Crops Metadata & Agronomic Guidelines
export const KAGGLE_CROP_METADATA: Record<
  string,
  {
    name: string;
    icon: 'Leaf' | 'Sprout' | 'Carrot' | 'Wheat' | 'Grape';
    plantingDates: string;
    imageHint: string;
    localizedNames: Record<string, string>;
    defaultBenefits: Record<string, string[]>;
    reasoningTemplate: Record<string, string>;
  }
> = {
  rice: {
    name: "Paddy / Rice (धान / ਝੋਨਾ)",
    icon: "Sprout",
    plantingDates: "June 15 - July 20",
    imageHint: "rice paddy lush field",
    localizedNames: {
      hi: "उन्नत धान / बासमती (Paddy)",
      pa: "ਬਾਸਮਤੀ ਝੋਨਾ (Paddy / Rice)",
      bn: "উন্নত আমন ধান (Paddy)",
      kn: "ಉತ್ತಮ ಭತ್ತ (Paddy)",
      bho: "धान के उन्नत फसल",
      en: "High-Yield Basmati Paddy (Rice)"
    },
    defaultBenefits: {
      hi: ["सरकारी एमएसपी ₹2,300-₹4,000/क्विंटल पर पक्की खरीद", "नहरी और पर्याप्त जल उपलब्धता के लिए सर्वोत्तम", "दोमट और मटियारी भूमि में उच्च पैदावार"],
      pa: ["ਮੰਡੀ ਵਿੱਚ ਪੱਕੀ ਖਰੀਦ ਤੇ ਉੱਚਾ ਬਾਜ਼ਾਰ ਭਾਅ", "ਨਹਿਰੀ ਤੇ ਟਿਊਬਵੈੱਲ ਪਾਣੀ ਲਈ ਸਭ ਤੋਂ ਅਨੁਕੂਲ", "ਚੰਗੀ ਜ਼ਮੀਨ ਵਿੱਚ ਵੱਧ ਝਾੜ"],
      en: ["Guaranteed MSP procurement at government mandis", "Thrives in warm, high-moisture irrigated soils", "High commercial return with export demand"]
    },
    reasoningTemplate: {
      hi: "आपके क्षेत्र की आर्द्रता, उच्च तापमान और जल स्रोत धान की फसल के लिए वैज्ञानिक दृष्टि से सर्वोत्तम हैं।",
      pa: "ਤੁਹਾਡੇ ਇਲਾਕੇ ਦਾ ਤਾਪਮਾਨ ਅਤੇ ਪਾਣੀ ਦਾ ਸਰੋਤ ਝੋਨੇ ਦੀ ਭਰਪੂਰ ਫ਼ਸਲ ਲਈ ਬਿਲਕੁਲ ਢੁਕਵਾਂ ਹੈ।",
      en: "Optimal rainfall and temperature profile in the dataset strongly favor high-yielding rice cultivation."
    }
  },
  maize: {
    name: "Maize / Sweet Corn (मक्का / ਮੱਕੀ)",
    icon: "Wheat",
    plantingDates: "June 20 - July 25",
    imageHint: "maize corn field",
    localizedNames: {
      hi: "हाइब्रिड मक्का (Hybrid Maize)",
      pa: "ਹਾਈਬ੍ਰਿਡ ਮੱਕੀ (Maize)",
      bn: "হাইব্রিড ভুট্টা (Maize)",
      kn: "ಮೆಕ್ಕೆಜೋಳ (Maize)",
      bho: "हाइब्रिड मकई",
      en: "Hybrid Maize / Corn"
    },
    defaultBenefits: {
      hi: ["धान से 70% कम पानी और बिजली की बचत", "पोल्ट्री और एथेनॉल उद्योग में भारी मांग", "90-100 दिन में तेजी से तैयार होने वाली फसल"],
      pa: ["ਝੋਨੇ ਨਾਲੋਂ 70% ਘੱਟ ਪਾਣੀ ਦੀ ਖਪਤ", "ਪੋਲਟਰੀ ਅਤੇ ਉਦਯੋਗਾਂ ਵਿੱਚ ਵੱਡੀ ਮੰਗ", "90-100 ਦਿਨਾਂ ਵਿੱਚ ਪੱਕ ਕੇ ਤਿਆਰ"],
      en: ["Consumes 70% less water compared to paddy", "High industrial and feed-mill procurement demand", "Fast 90-100 day crop cycle"]
    },
    reasoningTemplate: {
      hi: "दोमट मिट्टी में नाइट्रोजन और मध्यम वर्षा का स्तर मक्के की जोरदार बढ़वार के लिए आदर्श है।",
      pa: "ਜ਼ਮੀਨ ਵਿੱਚ ਨਾਈਟ੍ਰੋਜਨ ਅਤੇ ਤਾਪਮਾਨ ਮੱਕੀ ਦੇ ਵਧੀਆ ਝਾੜ ਲਈ ਪੂਰੀ ਤਰ੍ਹਾਂ ਅਨੁਕੂਲ ਹੈ।",
      en: "Balanced soil nutrients and moderate moisture requirements match hybrid maize characteristics."
    }
  },
  cotton: {
    name: "BT Cotton / Kapas (कपास / ਨਰਮਾ)",
    icon: "Leaf",
    plantingDates: "May 1 - May 31",
    imageHint: "cotton field white bolls",
    localizedNames: {
      hi: "उन्नत बीटी कपास (Cotton)",
      pa: "ਬੀਟੀ ਨਰਮਾ / ਕਪਾਹ (Cotton)",
      bn: "উন্নত তুলা (Cotton)",
      kn: "ಹತ್ತಿ (Cotton)",
      bho: "कपास (रुई)",
      en: "Commercial BT Cotton"
    },
    defaultBenefits: {
      hi: ["₹7,500+/क्विंटल का आकर्षक बाजार भाव", "शुष्क और मध्यम जल क्षेत्रों में शानदार उत्पादन", "प्रति एकड़ ₹50,000+ का शुद्ध मुनाफा"],
      pa: ["₹7,500+ ਪ੍ਰਤੀ ਕੁਇੰਟਲ ਦਾ ਚੰਗਾ ਮੰਡੀ ਰੇਟ", "ਘੱਟ ਪਾਣੀ ਵਾਲੇ ਇਲਾਕਿਆਂ ਲਈ ਲਾਹੇਵੰਦ", "ਵੱਡਾ ਨਕਦੀ ਮੁਨਾਫ਼ਾ"],
      en: ["High-value cash crop fetching ₹7,500+/quintal", "High resilience to dry spells once established", "Substantial net profit margin per acre"]
    },
    reasoningTemplate: {
      hi: "आपके खेत की काली/दोमट मिट्टी और धूप की स्थिति कपास के फूलों और बंपर टिंडों के लिए उत्कृष्ट है।",
      pa: "ਧੁੱਪ ਅਤੇ ਜ਼ਮੀਨ ਦੀ ਬਣਤਰ ਨਰਮੇ ਦੀ ਫ਼ਸਲ ਲਈ ਵਧੀਆ ਹੈ।",
      en: "Warm summer conditions and deep soil moisture profile strongly support heavy boll development."
    }
  },
  chickpea: {
    name: "Chickpea / Desi Chana (चना / ਛੋਲੇ)",
    icon: "Sprout",
    plantingDates: "Oct 15 - Nov 15",
    imageHint: "chickpea crop farm",
    localizedNames: {
      hi: "देसी चना (Chickpea)",
      pa: "ਦੇਸੀ ਛੋਲੇ (Gram / Chickpea)",
      bn: "ছোলা (Chickpea)",
      kn: "ಕಡಲೆ (Chickpea)",
      bho: "चना के फसल",
      en: "Desi Chickpea / Bengal Gram"
    },
    defaultBenefits: {
      hi: ["मिट्टी में प्राकृतिक नाइट्रोजन जोड़कर उर्वरता बढ़ाए", "कम पानी और न्यूनतम खाद में भरपूर पैदावार", "दाल मंडियों में स्थिर और मजबूत भाव"],
      pa: ["ਜ਼ਮੀਨ ਵਿੱਚ ਨਾਈਟ੍ਰੋਜਨ ਵਧਾ ਕੇ ਉਪਜਾਊ ਸ਼ਕਤੀ ਵਧਾਉਂਦਾ ਹੈ", "ਬਹੁਤ ਘੱਟ ਪਾਣੀ ਦੀ ਲੋੜ", "ਮੰਡੀ ਵਿੱਚ ਚੰਗਾ ਭਾਅ"],
      en: ["Biologically fixes nitrogen into root nodules", "Ultra-low water consumption (1-2 light irrigations)", "Consistently strong market pricing across mandis"]
    },
    reasoningTemplate: {
      hi: "कम नमी और फॉस्फोरस-युक्त मिट्टी में चने की जड़ें गहराई तक जाकर सूखा सहन करती हैं।",
      pa: "ਘੱਟ ਪਾਣੀ ਵਾਲੀ ਜ਼ਮੀਨ ਵਿੱਚ ਛੋਲੇ ਬਹੁਤ ਕਾਮਯਾਬ ਰਹਿੰਦੇ ਹਨ।",
      en: "Dry climate and lower moisture profile favor deep rooting and high pod setting in chickpea."
    }
  },
  kidneybeans: {
    name: "Kidney Beans / Rajma (राजमा)",
    icon: "Leaf",
    plantingDates: "Sept 15 - Oct 15",
    imageHint: "kidney beans farm",
    localizedNames: {
      hi: "कश्मीरी राजमा (Kidney Beans)",
      pa: "ਰਾਜਮਾਂਹ (Rajma)",
      bn: "রাজমা (Kidney Beans)",
      kn: "ರಾಜಮಾ (Rajma)",
      bho: "राजमा",
      en: "Premium Kidney Beans (Rajma)"
    },
    defaultBenefits: {
      hi: ["₹11,000-₹14,000/क्विंटल का प्रीमियम मंडी भाव", "ठंडी जलवायु में शानदार पैदावार", "प्रोटीन-युक्त उच्च मांग वाली फसल"],
      pa: ["ਮੰਡੀ ਵਿੱਚ ਬਹੁਤ ਉੱਚਾ ਭਾਅ", "ਘੱਟ ਸਮੇਂ ਵਿੱਚ ਵੱਧ ਮੁਨਾਫ਼ਾ", "ਉੱਚ ਗੁਣਵੱਤਾ ਵਾਲੀ ਦਾਲ"],
      en: ["Premium market rate exceeding ₹12,000/quintal", "High nutritional value and urban demand", "Fast-growing high cash yield"]
    },
    reasoningTemplate: {
      hi: "मध्यम तापमान और हल्की अम्लीय मिट्टी राजमा की फलियों की गुणवत्ता के लिए सबसे अनुकूल है।",
      pa: "ਠੰਡਾ ਤਾਪਮਾਨ ਅਤੇ ਦੋਮਟ ਜ਼ਮੀਨ ਰਾਜਮਾਂਹ ਲਈ ਸਭ ਤੋਂ ਵਧੀਆ ਹੈ।",
      en: "Cooler temperature and balanced soil fertility profile favor high pod setting in kidney beans."
    }
  },
  pigeonpeas: {
    name: "Pigeon Peas / Arhar (अरहर / ਤੂਰ ਦਾਲ)",
    icon: "Sprout",
    plantingDates: "June 15 - July 15",
    imageHint: "pigeonpea arhar field",
    localizedNames: {
      hi: "उन्नत अरहर / तुअर दाल (Arhar)",
      pa: "ਅਰਹਰ ਦਾਲ (Pigeonpea)",
      bn: "অড়হর ডাল (Arhar)",
      kn: "ತೊಗರಿ ಬೇಳೆ (Tur Dal)",
      bho: "अरहर / रहर दाल",
      en: "Pigeon Peas (Arhar / Red Gram)"
    },
    defaultBenefits: {
      hi: ["₹8,000+/क्विंटल का ऊंचा सरकारी समर्थन मूल्य", "सूखा सहने की असाधारण क्षमता", "गहरी जड़ों से मिट्टी की संरचना में सुधार"],
      pa: ["ਉੱਚਾ ਸਰਕਾਰੀ ਐਮਐਸਪੀ ਭਾਅ", "ਸੋਕੇ ਨੂੰ ਸਹਿਣ ਦੀ ਤਾਕਤ", "ਜ਼ਮੀਨ ਨੂੰ ਤਾਕਤਵਰ ਬਣਾਉਂਦੀ ਹੈ"],
      en: ["High MSP support exceeding ₹8,000/quintal", "Deep root system withstands prolonged dry spells", "Excellent biological nitrogen fixation"]
    },
    reasoningTemplate: {
      hi: "खरीफ के तापमान और मध्यम वर्षा में अरहर बिना अधिक लागत के भारी उत्पादन देती है।",
      pa: "ਬਰਸਾਤੀ ਮੌਸਮ ਵਿੱਚ ਅਰਹਰ ਘੱਟ ਖਰਚੇ ਵਿੱਚ ਚੰਗੀ ਪੈਦਾਵਾਰ ਦਿੰਦੀ ਹੈ।",
      en: "Deep soil profile and intermittent rainfall suit red gram's robust vegetative growth."
    }
  },
  mothbeans: {
    name: "Moth Beans (मोठ दाल / ਮੋਠ)",
    icon: "Leaf",
    plantingDates: "July 1 - July 20",
    imageHint: "moth bean arid farm",
    localizedNames: {
      hi: "देसी मोठ (Moth Bean)",
      pa: "ਮੋਠ ਦਾਲ (Moth)",
      bn: "মথ ডাল",
      kn: "ಮಡಿಕೆ ಕಾಳು",
      bho: "मोठ दाल",
      en: "Drought-Resistant Moth Bean"
    },
    defaultBenefits: {
      hi: ["कम से कम बारिश में भी बंपर पैदावार", "भुजिया और नमकीन उद्योग में भारी मांग", "न्यूनतम लागत और शून्य सिंचाई"],
      pa: ["ਘੱਟ ਮੀਂਹ ਵਿੱਚ ਵੀ ਕਾਮਯਾਬ", "ਸਨੈਕਸ ਉਦਯੋਗ ਵਿੱਚ ਭਾਰੀ ਮੰਗ", "ਜ਼ੀਰੋ ਪਾਣੀ ਤੇ ਖਾਦ"],
      en: ["Extreme drought tolerance in arid soils", "Heavy demand from Indian food and snacks sector", "Zero to minimal irrigation requirement"]
    },
    reasoningTemplate: {
      hi: "कम नमी और रेतीली/दोमट भूमि में मोठ सबसे सुरक्षित और फायदेमंद फसल है।",
      pa: "ਘੱਟ ਪਾਣੀ ਵਿੱਚ ਮੋਠ ਸਭ ਤੋਂ ਸੁਰੱਖਿਅਤ ਫ਼ਸਲ ਹੈ।",
      en: "Arid soil characteristics match moth bean's high heat and drought resistance."
    }
  },
  mungbean: {
    name: "Green Gram / Moong (मूंग दाल / ਮੂੰਗੀ)",
    icon: "Sprout",
    plantingDates: "June 25 - July 20",
    imageHint: "green gram moong farm",
    localizedNames: {
      hi: "उन्नत मूंग (Green Gram)",
      pa: "ਮੂੰਗੀ ਦਾਲ (Moong)",
      bn: "মুগ ডাল (Moong)",
      kn: "ಹೆಸರು ಕಾಳು (Moong)",
      bho: "मूंग दाल",
      en: "Green Gram (Moong Dal)"
    },
    defaultBenefits: {
      hi: ["मात्र 60-65 दिनों में कटाई के लिए तैयार", "₹8,500+/क्विंटल का शीर्ष दाल बाजार भाव", "फसल चक्र में यूरिया की 25% बचत"],
      pa: ["ਸਿਰਫ਼ 60 ਦਿਨਾਂ ਵਿੱਚ ਫ਼ਸਲ ਤਿਆਰ", "ਮੰਡੀ ਵਿੱਚ ਸਭ ਤੋਂ ਮਹਿੰਗੀ ਦਾਲ", "ਅਗਲੀ ਫ਼ਸਲ ਲਈ ਖਾਦ ਦੀ ਬੱਚਤ"],
      en: ["Short 60-day crop cycle enabling quick turnover", "Top-tier pulse commodity price (₹8,500+/quintal)", "Improves organic nitrogen in soil for next crop"]
    },
    reasoningTemplate: {
      hi: "गर्म तापमान और मध्यम नमी में मूंग 60 दिनों में खेत खाली करके दोहरा लाभ देती है।",
      pa: "ਮੌਸਮ ਅਤੇ ਜ਼ਮੀਨ ਮੂੰਗੀ ਦੀ ਛੇਤੀ ਪੈਦਾਵਾਰ ਲਈ ਅਨੁਕੂਲ ਹੈ।",
      en: "Warm summer conditions enable rapid maturity and soil nitrogen rejuvenation."
    }
  },
  blackgram: {
    name: "Black Gram / Urad (उड़द / ਮਾਂਹ)",
    icon: "Sprout",
    plantingDates: "June 20 - July 15",
    imageHint: "black gram urad field",
    localizedNames: {
      hi: "काली उड़द (Black Gram)",
      pa: "ਮਾਂਹ ਦੀ ਦਾਲ (Urad / Mah)",
      bn: "মাষকলাই ডাল (Urad)",
      kn: "ಉದ್ದು (Urad Dal)",
      bho: "उड़द दाल",
      en: "Black Gram (Urad Dal)"
    },
    defaultBenefits: {
      hi: ["दाल और पापड़ उद्योग में सालभर भारी मांग", "कम सिंचाई और कम कीटनाशक की जरूरत", "उच्च प्रोटीन और मिट्टी सुधारक"],
      pa: ["ਸਾਰਾ ਸਾਲ ਮੰਡੀ ਵਿੱਚ ਚੰਗਾ ਭਾਅ", "ਘੱਟ ਸਪਰੇਅ ਅਤੇ ਪਾਣੀ ਦੀ ਲੋੜ", "ਜ਼ਮੀਨ ਨੂੰ ਤਾਕਤ ਦਿੰਦੀ ਹੈ"],
      en: ["Consistent year-round commercial demand", "Low pest and disease vulnerability", "Improves soil micro-flora and fertility"]
    },
    reasoningTemplate: {
      hi: "दोमट मिट्टी और मानसूनी नमी में उड़द की फलियां भरपूर दाना बनाती हैं।",
      pa: "ਜ਼ਮੀਨ ਅਤੇ ਨਮੀ ਉੜਦ ਦੀ ਫ਼ਸਲ ਲਈ ਲਾਹੇਵੰਦ ਹਨ।",
      en: "Loamy soil and monsoon humidity provide ideal environment for vigorous pod filling."
    }
  },
  lentil: {
    name: "Lentil / Masoor (मसूर दाल / ਮਸਰ)",
    icon: "Sprout",
    plantingDates: "Oct 20 - Nov 15",
    imageHint: "lentil masoor crop",
    localizedNames: {
      hi: "देसी मसूर (Lentil)",
      pa: "ਮਸਰਾਂ ਦੀ ਦਾਲ (Lentil)",
      bn: "মসুর ডাল (Masoor)",
      kn: "ಮಸೂರಿ ಬೇಳೆ",
      bho: "मसूर दाल",
      en: "Red Lentil (Masoor)"
    },
    defaultBenefits: {
      hi: ["सर्दियों में कम पानी में बंपर पैदावार", "एमएसपी ₹6,700/क्विंटल पर सुरक्षित खरीद", "हल्की और दोमट मिट्टी में बेहद सफल"],
      pa: ["ਘੱਟ ਪਾਣੀ ਵਿੱਚ ਸਰਦੀਆਂ ਦੀ ਸਭ ਤੋਂ ਵਧੀਆ ਦਾਲ", "ਸਰਕਾਰੀ ਐਮਐਸਪੀ ਤੇ ਪੱਕੀ ਖਰੀਦ", "ਵੱਧ ਮੁਨਾਫ਼ਾ"],
      en: ["High government MSP support at ₹6,700/quintal", "Thrives in cooler winter weather with minimal water", "High market liquidity in local grain markets"]
    },
    reasoningTemplate: {
      hi: "रबी मौसम का ठंडा तापमान और अवशिष्ट नमी मसूर के दानों को मोटा बनाती है।",
      pa: "ਠੰਡਾ ਮੌਸਮ ਮਸਰਾਂ ਦੇ ਝਾੜ ਲਈ ਢੁਕਵਾਂ ਹੈ।",
      en: "Cool winter conditions and mild moisture perfectly align with lentil agronomy."
    }
  },
  watermelon: {
    name: "Watermelon (तरबूज / ਹਦਵਾਣਾ)",
    icon: "Grape",
    plantingDates: "Feb 15 - March 20",
    imageHint: "watermelon farm fruit",
    localizedNames: {
      hi: "हाइब्रिड तरबूज (Watermelon)",
      pa: "ਹਦਵਾਣਾ / ਤਰਬੂਜ਼ (Watermelon)",
      bn: "তরমুজ (Watermelon)",
      kn: "ಕಲ್ಲಂಗಡಿ (Watermelon)",
      bho: "तरबूज",
      en: "High-Yield Sweet Watermelon"
    },
    defaultBenefits: {
      hi: ["70-80 दिन में ₹80,000+ प्रति एकड़ मुनाफा", "गर्मियों में स्थानीय और शहरी मंडियों में भारी मांग", "ड्रिप सिंचाई के साथ बंपर मिठास और उत्पादन"],
      pa: ["70 ਦਿਨਾਂ ਵਿੱਚ ਵੱਡਾ ਨਕਦੀ ਮੁਨਾਫ਼ਾ", "ਗਰਮੀਆਂ ਵਿੱਚ ਜ਼ਬਰਦਸਤ ਵਿਕਰੀ", "ਘੱਟ ਦਿਨਾਂ ਦੀ ਫ਼ਸਲ"],
      en: ["Short 75-day turnaround yielding ₹80,000+/acre", "High seasonal consumer demand during hot months", "Responds excellently to drip fertigation"]
    },
    reasoningTemplate: {
      hi: "रेतीली-दोमट मिट्टी, तेज धूप और उच्च तापमान तरबूज के बड़े आकार और मिठास के लिए सर्वोत्तम हैं।",
      pa: "ਧੁੱਪ ਅਤੇ ਰੇਤਲੀ ਜ਼ਮੀਨ ਤਰਬੂਜ਼ ਦੇ ਮਿੱਠੇ ਸੁਆਦ ਲਈ ਵਧੀਆ ਹੈ।",
      en: "High temperature, bright sunshine, and sandy loam soil maximize fruit brix and yield."
    }
  },
  muskmelon: {
    name: "Muskmelon / Kharbuja (खरबूजा / ਖਰਬੂਜ਼ਾ)",
    icon: "Grape",
    plantingDates: "Feb 15 - March 25",
    imageHint: "muskmelon sweet farm",
    localizedNames: {
      hi: "मधु हाइब्रिड खरबूजा (Muskmelon)",
      pa: "ਖਰਬੂਜ਼ਾ (Muskmelon)",
      bn: "ফুটি / খরমুজ",
      kn: "ಕರಬೂಜ",
      bho: "खरबूजा",
      en: "Honey Sweet Muskmelon"
    },
    defaultBenefits: {
      hi: ["65-75 दिनों में प्रति एकड़ ₹70,000+ शुद्ध लाभ", "उत्कृष्ट खुशबू और प्रीमियम थोक भाव", "कम अवधि वाली नकदी फसल"],
      pa: ["ਘੱਟ ਸਮੇਂ ਵਿੱਚ ਚੰਗੀ ਆਮਦਨ", "ਮੰਡੀ ਵਿੱਚ ਉੱਚਾ ਭਾਅ", "ਗਰਮੀ ਦੀ ਕਾਮਯਾਬ ਫ਼ਸਲ"],
      en: ["Rapid 65-75 day harvest delivering ₹70,000+/acre", "Strong wholesale market pull for high brix fruits", "Low pesticide requirement with mulching"]
    },
    reasoningTemplate: {
      hi: "गर्मियों का सूखा मौसम और धूप खरबूजे की मिठास और जालीदार छिलके के विकास के लिए सबसे उपयुक्त है।",
      pa: "ਸੁੱਕਾ ਅਤੇ ਗਰਮ ਮੌਸਮ ਖਰਬੂਜ਼ੇ ਲਈ ਬਹੁਤ ਵਧੀਆ ਹੈ।",
      en: "Warm dry air and warm root zone temperature stimulate rich aroma and fruit sugar concentration."
    }
  },
  jute: {
    name: "Jute / Golden Fibre (जूट / पटसन)",
    icon: "Leaf",
    plantingDates: "March 15 - May 15",
    imageHint: "jute golden fibre field",
    localizedNames: {
      hi: "गोल्डन जूट / पटसन (Jute)",
      pa: "ਪਟਸਨ (Jute)",
      bn: "সোনালী আঁশ পাট (Jute)",
      kn: "ಸೆಣಬು (Jute)",
      bho: "पटुआ / जूट",
      en: "Golden Fibre Jute"
    },
    defaultBenefits: {
      hi: ["पर्यावरण-अनुकूल पैकेजिंग में लगातार बढ़ती मांग", "भारी वर्षा और जलभराव वाले क्षेत्रों में सफल", "मिट्टी में प्रचुर मात्रा में जैविक खाद छोड़ता है"],
      pa: ["ਕੁਦਰਤੀ ਰੇਸ਼ੇ ਦੀ ਵੱਡੀ ਮੰਗ", "ਪਾਣੀ ਵਾਲੀ ਜ਼ਮੀਨ ਲਈ ਢੁਕਵਾਂ", "ਜ਼ਮੀਨ ਨੂੰ ਉਪਜਾਊ ਬਣਾਉਂਦਾ ਹੈ"],
      en: ["Surging demand for biodegradable eco-packaging", "Thrives in high rainfall and alluvial floodplains", "Leaves extensive organic bio-matter in soil"]
    },
    reasoningTemplate: {
      hi: "उच्च आर्द्रता (80%+) और प्रचुर वर्षा जूट के लंबे और मजबूत रेशे के विकास के लिए अनिवार्य हैं।",
      pa: "ਵੱਧ ਨਮੀ ਅਤੇ ਮੀਂਹ ਪਟਸਨ ਦੇ ਰੇਸ਼ੇ ਨੂੰ ਮਜ਼ਬੂਤ ਬਣਾਉਂਦੇ ਹਨ।",
      en: "High atmospheric humidity and heavy rainfall profiles strongly match jute vegetative physiology."
    }
  },
  coffee: {
    name: "Coffee (कॉफ़ी / ಕಾಫಿ)",
    icon: "Grape",
    plantingDates: "June - August (Monsoon)",
    imageHint: "coffee plantation beans",
    localizedNames: {
      hi: "अरेबिका/रोबस्टा कॉफ़ी (Coffee)",
      pa: "ਕੌਫ਼ੀ ਪਲਾਂਟੇਸ਼ਨ (Coffee)",
      bn: "কফি চাষ (Coffee)",
      kn: "ಕಾಫಿ ಬೆಳೆ (Coffee)",
      bho: "कॉफी",
      en: "Specialty Coffee (Arabica/Robusta)"
    },
    defaultBenefits: {
      hi: ["अंतर्राष्ट्रीय निर्यात में प्रीमियम मूल्य", "छायादार बागवानी और अंतर-फसल के लिए उत्तम", "दीर्घकालिक स्थिर वार्षिक आय"],
      pa: ["ਕੌਮਾਂਤਰੀ ਪੱਧਰ ਤੇ ਉੱਚਾ ਮੁੱਲ", "ਸਾਲਾਨਾ ਪੱਕੀ ਆਮਦਨ", "ਉੱਚ ਗੁਣਵੱਤਾ"],
      en: ["High export margin realization", "Ideal for agroforestry and shaded hill plantations", "Perennial recurring annual yield"]
    },
    reasoningTemplate: {
      hi: "पहाड़ी ढलानों की अम्लीय मिट्टी और लगातार वर्षा कॉफ़ी की उच्च गुणवत्ता वाली बीन्स के लिए उपयुक्त है।",
      pa: "ਪਹਾੜੀ ਇਲਾਕੇ ਅਤੇ ਮੀਂਹ ਕੌਫ਼ੀ ਲਈ ਬਹੁਤ ਵਧੀਆ ਹਨ।",
      en: "Mild temperature, shaded topography, and steady rainfall match coffee plantation profiles."
    }
  },
  coconut: {
    name: "Coconut (नारियल / ತೆಂಗು)",
    icon: "Grape",
    plantingDates: "May - June (Pre-monsoon)",
    imageHint: "coconut palm plantation",
    localizedNames: {
      hi: "हाइब्रिड नारियल (Coconut)",
      pa: "ਨਾਰੀਅਲ ਪਲਾਂਟੇਸ਼ਨ (Coconut)",
      bn: "নারকেল চাষ (Coconut)",
      kn: "ತೆಂಗಿನ ತೋಟ (Coconut)",
      bho: "नारियर",
      en: "High-Yield Coconut Palm"
    },
    defaultBenefits: {
      hi: ["प्रति पेड़ सालभर लगातार आय (80-120 नारियल/वर्ष)", "पानी वाले तटीय और उच्च नमी वाले क्षेत्रों में 60+ वर्ष तक फल", "नारियल पानी और तेल उद्योग में हमेशा मजबूत मांग"],
      pa: ["ਸਾਰਾ ਸਾਲ ਨਿਰੰਤਰ ਆਮਦਨ", "ਲੰਬੇ ਸਮੇਂ ਲਈ ਲਾਭਦਾਇਕ", "ਮੰਡੀ ਵਿੱਚ ਹਮੇਸ਼ਾ ਮੰਗ"],
      en: ["Perennial recurring monthly cash flow (80-120 nuts/tree/yr)", "Lifespan exceeding 60+ productive years", "High tender water and oil industry demand"]
    },
    reasoningTemplate: {
      hi: "उच्च आर्द्रता और उष्णकटिबंधीय तापमान नारियल के पेड़ों के निरंतर उत्पादन के लिए सर्वोत्तम है।",
      pa: "ਨਮੀ ਅਤੇ ਗਰਮ ਮੌਸਮ ਨਾਰੀਅਲ ਲਈ ਵਧੀਆ ਹੈ।",
      en: "High year-round humidity and consistent warm temperatures support perennial coconut yields."
    }
  },
  papaya: {
    name: "Papaya / Red Lady (पपीता / ਪਪੀਤਾ)",
    icon: "Carrot",
    plantingDates: "Feb - March or July - Aug",
    imageHint: "papaya farm fruit tree",
    localizedNames: {
      hi: "रेड लेडी हाइब्रिड पपीता (Papaya)",
      pa: "ਰੈੱਡ ਲੇਡੀ ਪਪੀਤਾ (Papaya)",
      bn: "পেঁপে চাষ (Papaya)",
      kn: "ಪಪ್ಪಾಯಿ (Papaya)",
      bho: "पपीता",
      en: "Red Lady 786 Papaya"
    },
    defaultBenefits: {
      hi: ["9 महीने में फलन शुरू, प्रति एकड़ ₹2.5-₹3 लाख मुनाफा", "ताजे फल और पपेन उद्योग में लगातार मांग", "कम जगह में सघन बागवानी के लिए आदर्श"],
      pa: ["9 ਮਹੀਨਿਆਂ ਵਿੱਚ ਫਲ ਸ਼ੁਰੂ, ਲੱਖਾਂ ਦਾ ਮੁਨਾਫ਼ਾ", "ਮੰਡੀ ਵਿੱਚ ਰੋਜ਼ਾਨਾ ਵਿਕਰੀ", "ਘੱਟ ਜ਼ਮੀਨ ਵਿੱਚ ਵੱਧ ਆਮਦਨ"],
      en: ["Begins fruiting in just 9 months yielding ₹2.5L+/acre", "High daily consumer and processing market demand", "Ideal for high-density commercial orchards"]
    },
    reasoningTemplate: {
      hi: "उचित जल निकासी वाली दोमट मिट्टी और गर्म धूप पपीते के मीठे और बड़े फलों के लिए सबसे उत्तम है।",
      pa: "ਚੰਗੀ ਜ਼ਮੀਨ ਅਤੇ ਧੁੱਪ ਪਪੀਤੇ ਦੇ ਮਿੱਠੇ ਫਲਾਂ ਲਈ ਵਧੀਆ ਹੈ।",
      en: "Well-drained loamy soil, warm temperatures, and sunny days trigger vigorous papaya fruiting."
    }
  },
  apple: {
    name: "Apple (सेब / ਸੇਬ)",
    icon: "Grape",
    plantingDates: "Dec - Feb (Dormancy)",
    imageHint: "apple orchard red fruits",
    localizedNames: {
      hi: "उन्नत सेब बागवानी (Apple)",
      pa: "ਸੇਬ ਦੀ ਬਾਗਬਾਨੀ (Apple)",
      bn: "আপেল বাগান",
      kn: "ಸೇಬು ಹಣ್ಣು",
      bho: "सेब",
      en: "Commercial Apple Orchard"
    },
    defaultBenefits: {
      hi: ["प्रीमियम फल बाजार में सबसे ऊंची कीमत", "शीतोष्ण पहाड़ी जलवायु में बेजोड़ मिठास और रंग", "कोल्ड स्टोरेज से सालभर बंपर मुनाफा"],
      pa: ["ਮੰਡੀ ਵਿੱਚ ਸਭ ਤੋਂ ਮਹਿੰਗਾ ਫਲ", "ਪਹਾੜੀ ਇਲਾਕਿਆਂ ਲਈ ਵਰਦਾਨ", "ਲੰਬੇ ਸਮੇਂ ਲਈ ਲਾਭ"],
      en: ["Premium wholesale price realization across Indian metros", "Thrives in temperate chill-hour climates", "Excellent post-harvest cold chain storage value"]
    },
    reasoningTemplate: {
      hi: "शीतकालीन कम तापमान (Chill hours) और गहरी पहाड़ी मिट्टी सेब के उत्कृष्ट रंग और स्वाद के लिए अनिवार्य हैं।",
      pa: "ਠੰਡਾ ਪਹਾੜੀ ਮੌਸਮ ਸੇਬ ਦੀ ਕੁਆਲਿਟੀ ਲਈ ਜ਼ਰੂਰੀ ਹੈ।",
      en: "Dataset chilling hours and low temperature profiles match temperate apple requirements."
    }
  },
  banana: {
    name: "Banana / G-9 (केला / ਕੇਲਾ)",
    icon: "Grape",
    plantingDates: "June - July or Feb - March",
    imageHint: "banana grand naine farm",
    localizedNames: {
      hi: "ग्रैंड नैने (G-9) टिशू कल्चर केला (Banana)",
      pa: "ਜੀ-9 ਕੇਲਾ (Banana)",
      bn: "উন্নত কলা চাষ (Banana)",
      kn: "ಬಾಳೆಹಣ್ಣು (Banana)",
      bho: "केला",
      en: "Tissue-Culture G-9 Banana"
    },
    defaultBenefits: {
      hi: ["11-12 महीने में प्रति एकड़ ₹2-₹2.5 लाख शुद्ध आय", "टिशू कल्चर से 30-35 किलो का भारी घौद (Bunch)", "पूरे भारत में सालभर अटूट मांग"],
      pa: ["ਸਾਲ ਵਿੱਚ ਲੱਖਾਂ ਦਾ ਸ਼ੁੱਧ ਮੁਨਾਫ਼ਾ", "ਵੱਡੇ ਗੁੱਛੇ ਅਤੇ ਸ਼ਾਨਦਾਰ ਝਾੜ", "ਸਾਰਾ ਸਾਲ ਮੰਡੀ ਵਿੱਚ ਪੱਕੀ ਵਿਕਰੀ"],
      en: ["Yields ₹2L-₹2.5L net profit per acre in 11-12 months", "Heavy uniform bunch weight (30-35 kg/plant)", "Massive year-round consumption across India"]
    },
    reasoningTemplate: {
      hi: "प्रचुर जल उपलब्धता, उच्च पोटाश और गर्म आर्द्र जलवायु केले के बंपर गुच्छों के लिए आदर्श है।",
      pa: "ਪਾਣੀ ਅਤੇ ਗਰਮ ਮੌਸਮ ਕੇਲੇ ਦੇ ਭਾਰੇ ਗੁੱਛਿਆਂ ਲਈ ਢੁਕਵਾਂ ਹੈ।",
      en: "High moisture availability and rich potassium demand match tissue-culture banana physiology."
    }
  },
  grapes: {
    name: "Grapes / Thompson Seedless (अंगूर / ਅੰਗੂਰ)",
    icon: "Grape",
    plantingDates: "Jan - Feb (Pruning in Oct)",
    imageHint: "grape vineyard green sweet",
    localizedNames: {
      hi: "थॉम्पसन सीडलेस अंगूर (Grapes)",
      pa: "ਅੰਗੂਰਾਂ ਦੀ ਬਾਗਬਾਨੀ (Grapes)",
      bn: "আঙুর চাষ (Grapes)",
      kn: "ದ್ರಾಕ್ಷಿ ಬೆಳೆ (Grapes)",
      bho: "अंगूर",
      en: "Export Quality Grapes (Thompson Seedless)"
    },
    defaultBenefits: {
      hi: ["प्रति एकड़ ₹3-₹4 लाख का भारी निर्यात व घरेलू मुनाफा", "किशमिश और वाइनरी उद्योग में हाथों-हाथ खरीद", "ड्रिप सिंचाई में सर्वोत्तम जल उपयोग दक्षता"],
      pa: ["ਵੱਡਾ ਨਕਦੀ ਮੁਨਾਫ਼ਾ ਤੇ ਐਕਸਪੋਰਟ ਮੰਗ", "ਕਿਸ਼ਮਿਸ਼ ਲਈ ਵੱਡੀ ਖਰੀਦ", "ਆਧੁਨਿਕ ਡ੍ਰਿਪ ਸਿੰਚਾਈ ਨਾਲ ਬਿਹਤਰੀਨ ਝਾੜ"],
      en: ["High export value earning up to ₹3-4 Lakhs/acre", "Strong demand from table fruit and raisin processing", "Exceptional water efficiency under drip fertigation"]
    },
    reasoningTemplate: {
      hi: "कम आर्द्रता और गर्म-शुष्क फल पकने का मौसम अंगूर में फंगस से बचाकर मिठास भरता है।",
      pa: "ਸੁੱਕਾ ਮੌਸਮ ਅੰਗੂਰਾਂ ਦੀ ਮਿਠਾਸ ਅਤੇ ਕੁਆਲਿਟੀ ਵਧਾਉਂਦਾ ਹੈ।",
      en: "Low relative humidity and warm ripening days prevent fungal mildew and maximize sugar concentration."
    }
  },
  mango: {
    name: "Mango / Dasheri / Alphonso (आम / ਅੰਬ)",
    icon: "Carrot",
    plantingDates: "July - August (Monsoon)",
    imageHint: "mango orchard ripe yellow",
    localizedNames: {
      hi: "दशहरी / लंगड़ा / आम्रपाली आम (Mango)",
      pa: "ਦੁਸਹਿਰੀ / ਲੰਗੜਾ ਅੰਬ (Mango)",
      bn: "আম বাগান (Mango)",
      kn: "ಮಾವಿನ ಹಣ್ಣು (Mango)",
      bho: "आम के बगीचा",
      en: "Commercial Mango Orchard"
    },
    defaultBenefits: {
      hi: ["दशकों तक लगातार उच्च वार्षिक आय देने वाला फलों का राजा", "भारतीय और अंतरराष्ट्रीय बाजारों में सबसे लोकप्रिय फल", "कम रखरखाव और मजबूत सूखा सहनशीलता"],
      pa: ["ਦਹਾਕਿਆਂ ਤੱਕ ਲਗਾਤਾਰ ਪੱਕੀ ਸਾਲਾਨਾ ਆਮਦਨ", "ਦੇਸ਼-ਵਿਦੇਸ਼ ਵਿੱਚ ਭਾਰੀ ਮੰਗ", "ਘੱਟ ਸਾਂਭ-ਸੰਭਾਲ"],
      en: ["Long-term recurring multi-decade annual revenue", "King of fruits commanding top retail and export prices", "High drought resilience once established"]
    },
    reasoningTemplate: {
      hi: "उष्णकटिबंधीय जलवायु, अच्छी धूप और गहरी दोमट मिट्टी आम के पेड़ों की मजबूत वृद्धि के लिए सर्वोत्तम है।",
      pa: "ਗਰਮ ਮੌਸਮ ਅਤੇ ਖੁੱਲ੍ਹੀ ਧੁੱਪ ਅੰਬਾਂ ਦੇ ਬਾਗ ਲਈ ਬਹੁਤ ਵਧੀਆ ਹੈ।",
      en: "Deep root profile and warm subtropical climate support prolific seasonal mango flowering."
    }
  },
  orange: {
    name: "Orange / Kinnow / Santra (संतरा / ਕਿੰਨੂ)",
    icon: "Grape",
    plantingDates: "July - August or Feb - March",
    imageHint: "orange kinnow fruit orchard",
    localizedNames: {
      hi: "नागपुरी संतरा / किन्नू (Kinnow / Orange)",
      pa: "ਪੰਜਾਬ ਕਿੰਨੂ / ਸੰਤਰਾ (Kinnow)",
      bn: "কমলালেবু (Orange)",
      kn: "ಕಿತ್ತಳೆ ಹಣ್ಣು (Orange)",
      bho: "संतरा",
      en: "Kinnow / Sweet Orange (Citrus)"
    },
    defaultBenefits: {
      hi: ["प्रति एकड़ ₹1.5-₹2 लाख की नियमित वार्षिक आय", "जूस और फल मंडियों में सर्दियों में जबरदस्त मांग", "मध्यम पानी और दोमट मिट्टी में बंपर फलन"],
      pa: ["ਕਿੰਨੂ ਬਾਗ਼ ਤੋਂ ਲੱਖਾਂ ਦੀ ਸਾਲਾਨਾ ਆਮਦਨ", "ਸਰਦੀਆਂ ਵਿੱਚ ਵੱਡੀ ਮੰਡੀ ਮੰਗ", "ਪੰਜਾਬ/ਹਰਿਆਣਾ ਦੀ ਜ਼ਮੀਨ ਲਈ ਸਭ ਤੋਂ ਕਾਮਯਾਬ"],
      en: ["Highly profitable with annual returns of ₹1.5L-₹2L/acre", "High winter juice demand across North and Central India", "Resilient citrus performance in well-drained loamy soils"]
    },
    reasoningTemplate: {
      hi: "हल्की ठंड और अच्छी धूप संतरों और किन्नू में आकर्षक नारंगी रंग और रस भरती है।",
      pa: "ਮੌਸਮ ਅਤੇ ਜ਼ਮੀਨ ਕਿੰਨੂ ਦੇ ਮਿੱਠੇ ਰਸ ਲਈ ਬਿਲਕੁਲ ਢੁਕਵੀਂ ਹੈ।",
      en: "Sunny winter days and well-drained soils maximize citrus juice volume and sweetness."
    }
  },
  pomegranate: {
    name: "Pomegranate / Bhagwa (अनार / ਅਨਾਰ)",
    icon: "Grape",
    plantingDates: "July - Aug or Feb - March",
    imageHint: "pomegranate red fruit orchard",
    localizedNames: {
      hi: "भगवा हाइब्रिड अनार (Pomegranate)",
      pa: "ਭਗਵਾ ਅਨਾਰ (Pomegranate)",
      bn: "বেদানা / ডালিম (Pomegranate)",
      kn: "ದಾಳಿಂಬೆ (Pomegranate)",
      bho: "अनार",
      en: "Bhagwa Pomegranate (Anar)"
    },
    defaultBenefits: {
      hi: ["प्रति एकड़ ₹3-₹5 लाख का रिकॉर्ड तोड़ मुनाफा", "कम पानी और सूखे के प्रति अत्यधिक सहनशील", "देश-विदेश में ₹120-₹180/किग्रा का प्रीमियम भाव"],
      pa: ["ਘੱਟ ਪਾਣੀ ਵਿੱਚ ਰਿਕਾਰਡ ਤੋੜ ਮੁਨਾਫ਼ਾ", "ਮੰਡੀ ਵਿੱਚ ਸਭ ਤੋਂ ਮਹਿੰਗਾ ਭਾਅ", "ਵੱਡਾ ਐਕਸਪੋਰਟ ਲਾਭ"],
      en: ["Record profitability delivering ₹3-5 Lakhs/acre", "Highly drought-hardy with minimal water consumption", "Premium wholesale realization at ₹120-180/kg"]
    },
    reasoningTemplate: {
      hi: "शुष्क और गर्म जलवायु में अनार के फल बिना किसी फफूंद के गहरे लाल और चमकीले बनते हैं।",
      pa: "ਸੁੱਕਾ ਮੌਸਮ ਅਨਾਰ ਦੇ ਲਾਲ ਰੰਗ ਅਤੇ ਮਿਠਾਸ ਲਈ ਬਹੁਤ ਵਧੀਆ ਹੈ।",
      en: "Semi-arid dry climate with warm days prevents fruit spot diseases and ensures deep ruby arils."
    }
  }
};

/**
 * Predicts the top 3 crops from the Kaggle dataset using Gaussian Naive Bayes / Maximum Likelihood Estimation
 */
export function classifyCropFromKaggleDataset(features: KaggleFeatures): KagglePrediction[] {
  const scores: { cropKey: string; logProb: number }[] = [];
  const profiles = datasetProfiles as Record<string, any>;

  for (const [cropKey, profile] of Object.entries(profiles)) {
    const mean = profile.mean;
    const std = profile.std;

    let logLikelihood = 0;
    const featurePairs: [keyof KaggleFeatures, number][] = [
      ['N', features.N],
      ['P', features.P],
      ['K', features.K],
      ['temperature', features.temperature],
      ['humidity', features.humidity],
      ['ph', features.ph],
      ['rainfall', features.rainfall],
    ];

    for (const [featName, val] of featurePairs) {
      const m = mean[featName] ?? 50;
      const s = Math.max(std[featName] ?? 5, 0.5);
      const variance = s * s;
      logLikelihood += -0.5 * Math.log(2 * Math.PI * variance) - Math.pow(val - m, 2) / (2 * variance);
    }

    scores.push({ cropKey, logProb: logLikelihood });
  }

  // Sort by highest likelihood
  scores.sort((a, b) => b.logProb - a.logProb);

  // Compute normalized pseudo-probabilities for top 3
  const top3 = scores.slice(0, 3);
  const maxLog = top3[0].logProb;
  const expScores = top3.map(item => Math.exp(item.logProb - maxLog));
  const sumExp = expScores.reduce((acc, v) => acc + v, 0);

  return top3.map((item, idx) => {
    const meta = KAGGLE_CROP_METADATA[item.cropKey] || {
      name: item.cropKey.toUpperCase(),
      icon: 'Leaf' as const,
      plantingDates: 'Season Specific',
      imageHint: `${item.cropKey} crop field`,
    };

    return {
      cropKey: item.cropKey,
      confidence: Math.round((expScores[idx] / sumExp) * 100),
      logLikelihood: item.logProb,
      standardCropName: meta.name,
      icon: meta.icon,
      plantingDates: meta.plantingDates,
      imageHint: meta.imageHint,
    };
  });
}

/**
 * Maps the user's form inputs (Soil Type, Season, Location, Water Source, Farm Type) into Kaggle ML numerical features
 */
export function mapFarmerInputsToKaggleFeatures(inputs: {
  location?: string;
  farmType?: 'irrigated' | 'rainfed';
  soilType?: string;
  waterSource?: string;
  season?: string;
  previousCrop?: string;
}): KaggleFeatures {
  const soil = (inputs.soilType || '').toLowerCase();
  const season = (inputs.season || 'kharif').toLowerCase();
  const isIrrigated = inputs.farmType === 'irrigated';

  // 1. Soil N-P-K & pH based on ICAR Indian Soil Classification
  let N = 70;
  let P = 45;
  let K = 40;
  let ph = 6.8;

  if (soil.includes('black') || soil.includes('काली')) {
    N = 50; P = 45; K = 60; ph = 7.5;
  } else if (soil.includes('red') || soil.includes('लाल')) {
    N = 40; P = 30; K = 35; ph = 6.2;
  } else if (soil.includes('sandy') || soil.includes('रेतीली')) {
    N = 30; P = 25; K = 25; ph = 6.5;
  } else if (soil.includes('clay') || soil.includes('मटियारी')) {
    N = 85; P = 50; K = 45; ph = 7.2;
  } else if (soil.includes('loamy') || soil.includes('दोमट') || soil.includes('alluvial')) {
    N = 80; P = 48; K = 42; ph = 6.9;
  }

  // 2. Adjust for previous crop rotation (Legumes boost N, Cereals consume N)
  const prev = (inputs.previousCrop || '').toLowerCase();
  if (prev.includes('chana') || prev.includes('gram') || prev.includes('moong') || prev.includes('pulse') || prev.includes('urad') || prev.includes('pea')) {
    N += 25; // Nitrogen residual bonus from legumes
  } else if (prev.includes('rice') || prev.includes('paddy') || prev.includes('wheat') || prev.includes('sugarcane')) {
    N = Math.max(30, N - 15); // Heavy feeder crop
  }

  // 3. Environmental Temperature & Humidity based on Season
  let temperature = 28.0;
  let humidity = 75.0;

  if (season.includes('rabi') || season.includes('winter') || season.includes('रबी')) {
    temperature = 19.5;
    humidity = 55.0;
  } else if (season.includes('zaid') || season.includes('summer') || season.includes('जायद')) {
    temperature = 34.0;
    humidity = 40.0;
  } else {
    // Kharif (Monsoon)
    temperature = 27.5;
    humidity = 82.0;
  }

  // 4. Effective Rainfall & Water availability (mm)
  let rainfall = 110.0;
  if (isIrrigated) {
    rainfall = 195.0; // Ample canal/borewell irrigation equivalent
  } else {
    rainfall = season.includes('rabi') ? 45.0 : 85.0; // Rainfed
  }

  return {
    N: Math.round(N),
    P: Math.round(P),
    K: Math.round(K),
    temperature: Number(temperature.toFixed(1)),
    humidity: Number(humidity.toFixed(1)),
    ph: Number(ph.toFixed(1)),
    rainfall: Number(rainfall.toFixed(1)),
  };
}
