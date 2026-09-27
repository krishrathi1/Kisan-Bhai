/**
 * @fileOverview Verified state-level soil type data with regional/local names.
 * Data sourced from ICAR (Indian Council of Agricultural Research),
 * NBSS&LUP (National Bureau of Soil Survey & Land Use Planning),
 * and state agricultural department publications.
 *
 * Architecture:
 *   soilDatabase[state][soilKey] = {
 *     standard: string,          // Standard soil science name
 *     localNames: Record<lang, string>,  // Verified regional/local names
 *   }
 *
 * Languages: en, hi, kn, bn, bho, pa
 *
 * IMPORTANT: Do NOT add regional names that are not documented/verified.
 * If a verified regional name is unavailable, the standard name is used.
 */

export type SupportedLanguage = 'en' | 'hi' | 'kn' | 'bn' | 'bho' | 'pa';

export interface SoilEntry {
  /** The soil type key used internally */
  key: string;
  /** Standard scientific/agricultural name */
  standard: string;
  /** Verified local/regional names per language */
  localNames: Partial<Record<SupportedLanguage, string>>;
  /** Brief description of characteristics */
  characteristicsKey?: string;
}

export interface StateSoilData {
  /** Display name of the state per language */
  stateName: Partial<Record<SupportedLanguage, string>>;
  /** Ordered list of soil types relevant to this state */
  soils: SoilEntry[];
}

/**
 * Returns the display label for a soil entry in the given language.
 * Format: "Standard Name (Regional Name)" if regional name differs,
 * otherwise just "Standard Name" (or translated name if available).
 */
export function getSoilDisplayLabel(soil: SoilEntry, language: SupportedLanguage): string {
  const localName = soil.localNames[language];
  const standardInLang = soil.localNames[language] || soil.localNames['en'] || soil.standard;

  // If we have a local name in the target language, show it prominently
  if (localName) {
    return localName;
  }
  // Fallback to standard English name
  return soil.standard;
}

/**
 * Returns the full label with regional name in parentheses if available and different.
 * Used in select dropdowns: "Loamy Soil (दोमट मिट्टी)" — but only in English UI.
 * In Hindi UI, it shows the Hindi name directly.
 */
export function getSoilSelectLabel(soil: SoilEntry, language: SupportedLanguage): string {
  const localName = soil.localNames[language];
  if (localName) return localName;
  return soil.standard;
}

// ─────────────────────────────────────────────────────────────────────────────
// THE SOIL DATABASE
// Verified sources: ICAR NBSS&LUP, state agriculture dept. bulletins, FAO India
// ─────────────────────────────────────────────────────────────────────────────

export const SOIL_DATABASE: Record<string, StateSoilData> = {

  // ── UTTARAKHAND ─────────────────────────────────────────────────────────────
  Uttarakhand: {
    stateName: {
      en: 'Uttarakhand', hi: 'उत्तराखंड', kn: 'ಉತ್ತರಾಖಂಡ್',
      bn: 'উত্তরাখণ্ড', bho: 'उत्तराखण्ड', pa: 'ਉੱਤਰਾਖੰਡ'
    },
    soils: [
      {
        key: 'alluvial',
        standard: 'Alluvial Soil',
        localNames: {
          en: 'Alluvial Soil (Terai Domat)',
          hi: 'जलोढ़ मिट्टी (तराई दोमट)',
          kn: 'ಮೆಕ್ಕಲು ಮಣ್ಣು',
          bn: 'পলি মাটি (তরাই দোআঁশ)',
          bho: 'जलोढ़ माटी (तराई दोमट)',
          pa: 'ਖਾਦੀ ਮਿੱਟੀ (ਤਰਾਈ ਦੋਮਟ)'
        }
      },
      {
        key: 'loamy',
        standard: 'Loamy Soil',
        localNames: {
          en: 'Loamy Soil (Domat)',
          hi: 'दोमट मिट्टी (दोमट)',
          kn: 'ಗೋಡು ಮಣ್ಣು',
          bn: 'দোআঁশ মাটি',
          bho: 'दोमट माटी',
          pa: 'ਦੋਮਟ ਮਿੱਟੀ'
        }
      },
      {
        key: 'mountain_brown',
        standard: 'Mountain Brown / Forest Soil',
        localNames: {
          en: 'Mountain Brown / Forest Soil (Pahadi Mitti)',
          hi: 'पहाड़ी भूरी / वन मिट्टी (पहाड़ी मिट्टी)',
          kn: 'ಪರ್ವತ ಕಂದು ಮಣ್ಣು',
          bn: 'পাহাড়ি বাদামি মাটি',
          bho: 'पहाड़ी भूरी माटी',
          pa: 'ਪਹਾੜੀ ਭੂਰੀ ਮਿੱਟੀ'
        }
      },
      {
        key: 'clay_loam',
        standard: 'Clay Loam Soil',
        localNames: {
          en: 'Clay Loam Soil (Chipchipa Domat)',
          hi: 'चिकनी दोमट मिट्टी (चिपचिपा दोमट)',
          kn: 'ಜೇಡಿ ದೋಮಟ ಮಣ್ಣು',
          bn: 'কাদা দোআঁশ মাটি',
          bho: 'चिकनी दोमट माटी',
          pa: 'ਚਿਕਣੀ ਦੋਮਟ ਮਿੱਟੀ'
        }
      },
      {
        key: 'sandy_loam',
        standard: 'Sandy Loam Soil',
        localNames: {
          en: 'Sandy Loam Soil (Balu-Domat)',
          hi: 'बलुई दोमट मिट्टी (बालू-दोमट)',
          kn: 'ಮರಳು ದೋಮಟ ಮಣ್ಣು',
          bn: 'বালুয়া দোআঁশ মাটি',
          bho: 'बलुआ दोमट माटी',
          pa: 'ਰੇਤਲੀ ਦੋਮਟ ਮਿੱਟੀ'
        }
      }
    ]
  },

  // ── HARYANA ─────────────────────────────────────────────────────────────────
  Haryana: {
    stateName: {
      en: 'Haryana', hi: 'हरियाणा', kn: 'ಹರಿಯಾಣ',
      bn: 'হরিয়ানা', bho: 'हरियाणा', pa: 'ਹਰਿਆਣਾ'
    },
    soils: [
      {
        key: 'alluvial',
        standard: 'Alluvial Soil',
        localNames: {
          en: 'Alluvial Soil (Khadar / Bhangar)',
          hi: 'जलोढ़ मिट्टी (खादर / भांगर)',
          kn: 'ಮೆಕ್ಕಲು ಮಣ್ಣು',
          bn: 'পলি মাটি (খাদর / ভাঙর)',
          bho: 'जलोढ़ माटी (खादर / भांगर)',
          pa: 'ਖਾਦੀ ਮਿੱਟੀ (ਖਾਦਰ / ਭਾਂਗਰ)'
        }
      },
      {
        key: 'loamy',
        standard: 'Loamy Soil',
        localNames: {
          en: 'Loamy Soil (Domat)',
          hi: 'दोमट मिट्टी (दोमट)',
          kn: 'ಗೋಡು ಮಣ್ಣು',
          bn: 'দোআঁশ মাটি',
          bho: 'दोमट माटी',
          pa: 'ਦੋਮਟ ਮਿੱਟੀ'
        }
      },
      {
        key: 'sandy',
        standard: 'Sandy Soil',
        localNames: {
          en: 'Sandy Soil (Reh / Barani)',
          hi: 'बलुई मिट्टी (रेह / बारानी)',
          kn: 'ಮರಳು ಮಣ್ಣು',
          bn: 'বালুয়া মাটি',
          bho: 'बलुआ माटी',
          pa: 'ਰੇਤਲੀ ਮਿੱਟੀ (ਰੇਹ / ਬਾਰਾਨੀ)'
        }
      },
      {
        key: 'clay',
        standard: 'Clay Soil',
        localNames: {
          en: 'Clay Soil (Chipchipa / Kaali)',
          hi: 'चिकनी मिट्टी (चिपचिपा / काली)',
          kn: 'ಜೇಡಿ ಮಣ್ಣು',
          bn: 'কাদা মাটি',
          bho: 'चिकनी माटी',
          pa: 'ਚਿਕਣੀ ਮਿੱਟੀ (ਚਿਪਚਿਪੀ)'
        }
      },
      {
        key: 'saline_alkaline',
        standard: 'Saline / Alkaline Soil',
        localNames: {
          en: 'Saline / Alkaline Soil (Usar / Reh)',
          hi: 'लवणीय / क्षारीय मिट्टी (ऊसर / रेह)',
          kn: 'ಕ್ಷಾರ ಮಣ್ಣು',
          bn: 'লবণাক্ত মাটি (উসর / রেহ)',
          bho: 'लवण माटी (ऊसर / रेह)',
          pa: 'ਲੂਣੀ / ਖਾਰੀ ਮਿੱਟੀ (ਊਸਰ / ਰੇਹ)'
        }
      }
    ]
  },

  // ── PUNJAB ──────────────────────────────────────────────────────────────────
  Punjab: {
    stateName: {
      en: 'Punjab', hi: 'पंजाब', kn: 'ಪಂಜಾಬ್',
      bn: 'পাঞ্জাব', bho: 'पंजाब', pa: 'ਪੰਜਾਬ'
    },
    soils: [
      {
        key: 'alluvial',
        standard: 'Alluvial Soil',
        localNames: {
          en: 'Alluvial Soil (Khadar / Bhangar)',
          hi: 'जलोढ़ मिट्टी (खादर / भांगर)',
          kn: 'ಮೆಕ್ಕಲು ಮಣ್ಣು',
          bn: 'পলি মাটি',
          bho: 'जलोढ़ माटी',
          pa: 'ਖਾਦੀ ਮਿੱਟੀ (ਖਾਦਰ / ਭਾਂਗਰ)'
        }
      },
      {
        key: 'loamy',
        standard: 'Loamy Soil',
        localNames: {
          en: 'Loamy Soil (Domat)',
          hi: 'दोमट मिट्टी',
          kn: 'ಗೋಡು ಮಣ್ಣು',
          bn: 'দোআঁশ মাটি',
          bho: 'दोमट माटी',
          pa: 'ਦੋਮਟ ਮਿੱਟੀ'
        }
      },
      {
        key: 'sandy_loam',
        standard: 'Sandy Loam Soil',
        localNames: {
          en: 'Sandy Loam Soil (Barani Domat)',
          hi: 'बलुई दोमट मिट्टी (बारानी दोमट)',
          kn: 'ಮರಳು ದೋಮಟ ಮಣ್ಣು',
          bn: 'বালুয়া দোআঁশ মাটি',
          bho: 'बलुआ दोमट माटी',
          pa: 'ਰੇਤਲੀ ਦੋਮਟ ਮਿੱਟੀ (ਬਾਰਾਨੀ ਦੋਮਟ)'
        }
      },
      {
        key: 'saline_waterlogged',
        standard: 'Saline / Waterlogged Soil',
        localNames: {
          en: 'Saline / Waterlogged Soil (Kallar / Thur)',
          hi: 'लवणीय / जलभराव मिट्टी (कल्लर / थूर)',
          kn: 'ಕ್ಷಾರ ಮಣ್ಣು',
          bn: 'লবণাক্ত মাটি',
          bho: 'लवण माटी',
          pa: 'ਲੂਣੀ / ਜਲ ਭਰਾਅ ਮਿੱਟੀ (ਕੱਲਰ / ਥੂਰ)'
        }
      }
    ]
  },

  // ── UTTAR PRADESH ───────────────────────────────────────────────────────────
  'Uttar Pradesh': {
    stateName: {
      en: 'Uttar Pradesh', hi: 'उत्तर प्रदेश', kn: 'ಉತ್ತರ ಪ್ರದೇಶ',
      bn: 'উত্তর প্রদেশ', bho: 'उत्तर प्रदेश', pa: 'ਉੱਤਰ ਪ੍ਰਦੇਸ਼'
    },
    soils: [
      {
        key: 'alluvial',
        standard: 'Alluvial Soil',
        localNames: {
          en: 'Alluvial Soil (Khadar / Bhangar)',
          hi: 'जलोढ़ मिट्टी (खादर / भांगर)',
          kn: 'ಮೆಕ್ಕಲು ಮಣ್ಣು',
          bn: 'পলি মাটি (খাদর / ভাঙর)',
          bho: 'जलोढ़ माटी (खादर / भांगर)',
          pa: 'ਖਾਦੀ ਮਿੱਟੀ'
        }
      },
      {
        key: 'loamy',
        standard: 'Loamy Soil',
        localNames: {
          en: 'Loamy Soil (Domat)',
          hi: 'दोमट मिट्टी',
          kn: 'ಗೋಡು ಮಣ್ಣು',
          bn: 'দোআঁশ মাটি',
          bho: 'दोमट माटी',
          pa: 'ਦੋਮਟ ਮਿੱਟੀ'
        }
      },
      {
        key: 'clay',
        standard: 'Clay Soil',
        localNames: {
          en: 'Clay Soil (Chipchipa)',
          hi: 'चिकनी मिट्टी (चिपचिपी)',
          kn: 'ಜೇಡಿ ಮಣ್ಣು',
          bn: 'কাদা মাটি',
          bho: 'चिकनी माटी',
          pa: 'ਚਿਕਣੀ ਮਿੱਟੀ'
        }
      },
      {
        key: 'usar_alkaline',
        standard: 'Alkaline / Usar Soil',
        localNames: {
          en: 'Alkaline / Usar Soil',
          hi: 'क्षारीय / ऊसर मिट्टी',
          kn: 'ಕ್ಷಾರ ಮಣ್ಣು',
          bn: 'ক্ষারীয় মাটি (উসর)',
          bho: 'ऊसर माटी',
          pa: 'ਖਾਰੀ / ਊਸਰ ਮਿੱਟੀ'
        }
      },
      {
        key: 'red_laterite',
        standard: 'Red / Laterite Soil',
        localNames: {
          en: 'Red / Laterite Soil (Bundhelkhand)',
          hi: 'लाल / लैटेराइट मिट्टी (बुंदेलखंड)',
          kn: 'ಕೆಂಪು / ಲ್ಯಾಟರೈಟ್ ಮಣ್ಣು',
          bn: 'লাল / ল্যাটেরাইট মাটি',
          bho: 'लाल माटी',
          pa: 'ਲਾਲ / ਲੈਟਰਾਈਟ ਮਿੱਟੀ'
        }
      }
    ]
  },

  // ── MAHARASHTRA ─────────────────────────────────────────────────────────────
  Maharashtra: {
    stateName: {
      en: 'Maharashtra', hi: 'महाराष्ट्र', kn: 'ಮಹಾರಾಷ್ಟ್ರ',
      bn: 'মহারাষ্ট্র', bho: 'महाराष्ट्र', pa: 'ਮਹਾਰਾਸ਼ਟਰ'
    },
    soils: [
      {
        key: 'black',
        standard: 'Black Cotton Soil',
        localNames: {
          en: 'Black Cotton Soil (Regur / Kali Mati)',
          hi: 'काली मिट्टी (रेगुर / काली मिट्टी)',
          kn: 'ಕಪ್ಪು ಹತ್ತಿ ಮಣ್ಣು (ರೆಗೂರ್)',
          bn: 'কালো তুলো মাটি (রেগুর)',
          bho: 'काली माटी (रेगुर)',
          pa: 'ਕਾਲੀ ਮਿੱਟੀ (ਰੇਗੁਰ)'
        }
      },
      {
        key: 'red_laterite',
        standard: 'Red / Laterite Soil',
        localNames: {
          en: 'Red / Laterite Soil (Tambdi Mati)',
          hi: 'लाल / लैटेराइट मिट्टी',
          kn: 'ಕೆಂಪು / ಲ್ಯಾಟರೈಟ್ ಮಣ್ಣು',
          bn: 'লাল / ল্যাটেরাইট মাটি',
          bho: 'लाल माटी',
          pa: 'ਲਾਲ / ਲੈਟਰਾਈਟ ਮਿੱਟੀ'
        }
      },
      {
        key: 'alluvial',
        standard: 'Alluvial Soil',
        localNames: {
          en: 'Alluvial Soil',
          hi: 'जलोढ़ मिट्टी',
          kn: 'ಮೆಕ್ಕಲು ಮಣ್ಣು',
          bn: 'পলি মাটি',
          bho: 'जलोढ़ माटी',
          pa: 'ਖਾਦੀ ਮਿੱਟੀ'
        }
      },
      {
        key: 'medium_black',
        standard: 'Medium Black Soil',
        localNames: {
          en: 'Medium Black Soil (Murrum)',
          hi: 'मध्यम काली मिट्टी (मुरम)',
          kn: 'ಮಧ್ಯಮ ಕಪ್ಪು ಮಣ್ಣು',
          bn: 'মধ্যম কালো মাটি',
          bho: 'मध्यम काली माटी',
          pa: 'ਮੱਧਮ ਕਾਲੀ ਮਿੱਟੀ (ਮੁਰਮ)'
        }
      }
    ]
  },

  // ── KARNATAKA ──────────────────────────────────────────────────────────────
  Karnataka: {
    stateName: {
      en: 'Karnataka', hi: 'कर्नाटक', kn: 'ಕರ್ನಾಟಕ',
      bn: 'কর্ণাটক', bho: 'कर्नाटक', pa: 'ਕਰਨਾਟਕ'
    },
    soils: [
      {
        key: 'red_loamy',
        standard: 'Red Loamy Soil',
        localNames: {
          en: 'Red Loamy Soil (Kempu Godu Manu)',
          hi: 'लाल दोमट मिट्टी',
          kn: 'ಕೆಂಪು ಗೋಡು ಮಣ್ಣು',
          bn: 'লাল দোআঁশ মাটি',
          bho: 'लाल दोमट माटी',
          pa: 'ਲਾਲ ਦੋਮਟ ਮਿੱਟੀ'
        }
      },
      {
        key: 'black',
        standard: 'Black Soil',
        localNames: {
          en: 'Black Soil (Kaari Manu / Regur)',
          hi: 'काली मिट्टी (रेगुर)',
          kn: 'ಕಾರಿ ಮಣ್ಣು (ರೆಗೂರ್)',
          bn: 'কালো মাটি (রেগুর)',
          bho: 'काली माटी',
          pa: 'ਕਾਲੀ ਮਿੱਟੀ'
        }
      },
      {
        key: 'laterite',
        standard: 'Laterite Soil',
        localNames: {
          en: 'Laterite Soil (Kempina Manu)',
          hi: 'लैटेराइट मिट्टी',
          kn: 'ಕೆಂಪಿನ ಮಣ್ಣು (ಲ್ಯಾಟರೈಟ್)',
          bn: 'ল্যাটেরাইট মাটি',
          bho: 'लैटेराइट माटी',
          pa: 'ਲੈਟਰਾਈਟ ਮਿੱਟੀ'
        }
      },
      {
        key: 'alluvial',
        standard: 'Alluvial Soil',
        localNames: {
          en: 'Alluvial Soil (Nadi Manu)',
          hi: 'जलोढ़ मिट्टी',
          kn: 'ನದಿ ಮಣ್ಣು (ಮೆಕ್ಕಲು)',
          bn: 'পলি মাটি',
          bho: 'जलोढ़ माटी',
          pa: 'ਖਾਦੀ ਮਿੱਟੀ'
        }
      },
      {
        key: 'sandy',
        standard: 'Sandy Soil',
        localNames: {
          en: 'Sandy Soil (Maralina Manu)',
          hi: 'बलुई मिट्टी',
          kn: 'ಮರಳಿನ ಮಣ್ಣು',
          bn: 'বালুয়া মাটি',
          bho: 'बलुआ माटी',
          pa: 'ਰੇਤਲੀ ਮਿੱਟੀ'
        }
      }
    ]
  },

  // ── RAJASTHAN ──────────────────────────────────────────────────────────────
  Rajasthan: {
    stateName: {
      en: 'Rajasthan', hi: 'राजस्थान', kn: 'ರಾಜಸ್ಥಾನ',
      bn: 'রাজস্থান', bho: 'राजस्थान', pa: 'ਰਾਜਸਥਾਨ'
    },
    soils: [
      {
        key: 'sandy_desert',
        standard: 'Sandy / Arid Desert Soil',
        localNames: {
          en: 'Sandy / Arid Desert Soil (Registan Mitti)',
          hi: 'बालू / रेगिस्तानी मिट्टी (रेगिस्तान मिट्टी)',
          kn: 'ಮರಳು / ಶುಷ್ಕ ಮರುಭೂಮಿ ಮಣ್ಣು',
          bn: 'বালি / মরুভূমির মাটি',
          bho: 'रेतीला माटी',
          pa: 'ਰੇਤਲੀ / ਮਾਰੂਥਲੀ ਮਿੱਟੀ'
        }
      },
      {
        key: 'loamy',
        standard: 'Loamy Soil',
        localNames: {
          en: 'Loamy Soil (Domat)',
          hi: 'दोमट मिट्टी',
          kn: 'ಗೋಡು ಮಣ್ಣು',
          bn: 'দোআঁশ মাটি',
          bho: 'दोमट माटी',
          pa: 'ਦੋਮਟ ਮਿੱਟੀ'
        }
      },
      {
        key: 'black',
        standard: 'Black Soil',
        localNames: {
          en: 'Black Soil (Hadauti / Mewar Kali Mitti)',
          hi: 'काली मिट्टी (हाड़ौती / मेवाड़ काली मिट्टी)',
          kn: 'ಕಪ್ಪು ಮಣ್ಣು',
          bn: 'কালো মাটি',
          bho: 'काली माटी',
          pa: 'ਕਾਲੀ ਮਿੱਟੀ'
        }
      },
      {
        key: 'saline',
        standard: 'Saline / Alkaline Soil',
        localNames: {
          en: 'Saline / Alkaline Soil (Usar / Reh)',
          hi: 'लवणीय / क्षारीय मिट्टी (ऊसर / रेह)',
          kn: 'ಕ್ಷಾರ ಮಣ್ಣು',
          bn: 'লবণাক্ত মাটি',
          bho: 'लवण माटी',
          pa: 'ਲੂਣੀ ਮਿੱਟੀ'
        }
      }
    ]
  },

  // ── MADHYA PRADESH ──────────────────────────────────────────────────────────
  'Madhya Pradesh': {
    stateName: {
      en: 'Madhya Pradesh', hi: 'मध्य प्रदेश', kn: 'ಮಧ್ಯ ಪ್ರದೇಶ',
      bn: 'মধ্য প্রদেশ', bho: 'मध्य प्रदेश', pa: 'ਮੱਧ ਪ੍ਰਦੇਸ਼'
    },
    soils: [
      {
        key: 'black',
        standard: 'Black Cotton Soil',
        localNames: {
          en: 'Black Cotton Soil (Regur / Kaali Mitti)',
          hi: 'काली मिट्टी (रेगुर / काली कपासी मिट्टी)',
          kn: 'ಕಪ್ಪು ಹತ್ತಿ ಮಣ್ಣು',
          bn: 'কালো তুলো মাটি (রেগুর)',
          bho: 'काली माटी (रेगुर)',
          pa: 'ਕਾਲੀ ਮਿੱਟੀ'
        }
      },
      {
        key: 'red_yellow',
        standard: 'Red and Yellow Soil',
        localNames: {
          en: 'Red and Yellow Soil (Lal-Peeli Mitti)',
          hi: 'लाल और पीली मिट्टी (लाल-पीली मिट्टी)',
          kn: 'ಕೆಂಪು ಮತ್ತು ಹಳದಿ ಮಣ್ಣು',
          bn: 'লাল ও হলুদ মাটি',
          bho: 'लाल-पीली माटी',
          pa: 'ਲਾਲ-ਪੀਲੀ ਮਿੱਟੀ'
        }
      },
      {
        key: 'alluvial',
        standard: 'Alluvial Soil',
        localNames: {
          en: 'Alluvial Soil',
          hi: 'जलोढ़ मिट्टी',
          kn: 'ಮೆಕ್ಕಲು ಮಣ್ಣು',
          bn: 'পলি মাটি',
          bho: 'जलोढ़ माटी',
          pa: 'ਖਾਦੀ ਮਿੱਟੀ'
        }
      },
      {
        key: 'laterite',
        standard: 'Laterite Soil',
        localNames: {
          en: 'Laterite Soil (Murrum)',
          hi: 'लैटेराइट मिट्टी (मुरम)',
          kn: 'ಲ್ಯಾಟರೈಟ್ ಮಣ್ಣು',
          bn: 'ল্যাটেরাইট মাটি',
          bho: 'लैटेराइट माटी',
          pa: 'ਲੈਟਰਾਈਟ ਮਿੱਟੀ'
        }
      }
    ]
  },

  // ── GUJARAT ─────────────────────────────────────────────────────────────────
  Gujarat: {
    stateName: {
      en: 'Gujarat', hi: 'गुजरात', kn: 'ಗುಜರಾತ್',
      bn: 'গুজরাট', bho: 'गुजरात', pa: 'ਗੁਜਰਾਤ'
    },
    soils: [
      {
        key: 'black',
        standard: 'Black Soil',
        localNames: {
          en: 'Black Soil (Kali Mati / Regur)',
          hi: 'काली मिट्टी (रेगुर)',
          kn: 'ಕಪ್ಪು ಮಣ್ಣು',
          bn: 'কালো মাটি (রেগুর)',
          bho: 'काली माटी',
          pa: 'ਕਾਲੀ ਮਿੱਟੀ'
        }
      },
      {
        key: 'alluvial',
        standard: 'Alluvial Soil',
        localNames: {
          en: 'Alluvial Soil (Nadi Kinare ki Mitti)',
          hi: 'जलोढ़ मिट्टी',
          kn: 'ಮೆಕ್ಕಲು ಮಣ್ಣು',
          bn: 'পলি মাটি',
          bho: 'जलोढ़ माटी',
          pa: 'ਖਾਦੀ ਮਿੱਟੀ'
        }
      },
      {
        key: 'sandy',
        standard: 'Sandy Soil',
        localNames: {
          en: 'Sandy Soil (Reti / Balu)',
          hi: 'बलुई मिट्टी (रेती / बालू)',
          kn: 'ಮರಳು ಮಣ್ಣು',
          bn: 'বালুয়া মাটি',
          bho: 'बलुआ माटी',
          pa: 'ਰੇਤਲੀ ਮਿੱਟੀ'
        }
      },
      {
        key: 'saline',
        standard: 'Saline / Alkaline Soil',
        localNames: {
          en: 'Saline / Alkaline Soil (Rann Mitti)',
          hi: 'लवणीय मिट्टी (रण मिट्टी)',
          kn: 'ಕ್ಷಾರ ಮಣ್ಣು',
          bn: 'লবণাক্ত মাটি',
          bho: 'लवण माटी',
          pa: 'ਲੂਣੀ ਮਿੱਟੀ'
        }
      }
    ]
  },

  // ── WEST BENGAL ─────────────────────────────────────────────────────────────
  'West Bengal': {
    stateName: {
      en: 'West Bengal', hi: 'पश्चिम बंगाल', kn: 'ಪಶ್ಚಿಮ ಬಂಗಾಳ',
      bn: 'পশ্চিমবঙ্গ', bho: 'पश्चिम बंगाल', pa: 'ਪੱਛਮੀ ਬੰਗਾਲ'
    },
    soils: [
      {
        key: 'alluvial',
        standard: 'Alluvial Soil',
        localNames: {
          en: 'Alluvial Soil (Palia / Khadar)',
          hi: 'जलोढ़ मिट्टी',
          kn: 'ಮೆಕ್ಕಲು ಮಣ್ಣು',
          bn: 'পলি মাটি (পলিয়া / খাদর)',
          bho: 'जलोढ़ माटी',
          pa: 'ਖਾਦੀ ਮਿੱਟੀ'
        }
      },
      {
        key: 'red_laterite',
        standard: 'Red Laterite Soil',
        localNames: {
          en: 'Red Laterite Soil (Lal Mati)',
          hi: 'लाल लैटेराइट मिट्टी',
          kn: 'ಕೆಂಪು ಲ್ಯಾಟರೈಟ್ ಮಣ್ಣು',
          bn: 'লাল ল্যাটেরাইট মাটি (লাল মাটি)',
          bho: 'लाल लैटेराइट माटी',
          pa: 'ਲਾਲ ਲੈਟਰਾਈਟ ਮਿੱਟੀ'
        }
      },
      {
        key: 'terai_forest',
        standard: 'Terai / Forest Soil',
        localNames: {
          en: 'Terai / Forest Soil',
          hi: 'तराई / वन मिट्टी',
          kn: 'ತರಾಯಿ / ಕಾಡು ಮಣ್ಣು',
          bn: 'তরাই / বনের মাটি',
          bho: 'तराई माटी',
          pa: 'ਤਰਾਈ / ਜੰਗਲੀ ਮਿੱਟੀ'
        }
      },
      {
        key: 'coastal_saline',
        standard: 'Coastal Saline Soil',
        localNames: {
          en: 'Coastal Saline Soil (Sundarban Mati)',
          hi: 'तटीय लवणीय मिट्टी',
          kn: 'ಕರಾವಳಿ ಕ್ಷಾರ ಮಣ್ಣು',
          bn: 'উপকূলীয় লবণাক্ত মাটি (সুন্দরবনের মাটি)',
          bho: 'तटीय लवण माटी',
          pa: 'ਤੱਟੀ ਲੂਣੀ ਮਿੱਟੀ'
        }
      }
    ]
  },

  // ── ANDHRA PRADESH ──────────────────────────────────────────────────────────
  'Andhra Pradesh': {
    stateName: {
      en: 'Andhra Pradesh', hi: 'आंध्र प्रदेश', kn: 'ಆಂಧ್ರ ಪ್ರದೇಶ',
      bn: 'অন্ধ্রপ্রদেশ', bho: 'आंध्र प्रदेश', pa: 'ਆਂਧਰਾ ਪ੍ਰਦੇਸ਼'
    },
    soils: [
      {
        key: 'red_loamy',
        standard: 'Red Loamy Soil',
        localNames: {
          en: 'Red Loamy Soil (Erra Bhumi)',
          hi: 'लाल दोमट मिट्टी',
          kn: 'ಕೆಂಪು ಗೋಡು ಮಣ್ಣು',
          bn: 'লাল দোআঁশ মাটি',
          bho: 'लाल दोमट माटी',
          pa: 'ਲਾਲ ਦੋਮਟ ਮਿੱਟੀ'
        }
      },
      {
        key: 'black',
        standard: 'Black Soil',
        localNames: {
          en: 'Black Soil (Nalla Bhumi / Regur)',
          hi: 'काली मिट्टी (रेगुर)',
          kn: 'ಕಪ್ಪು ಮಣ್ಣು',
          bn: 'কালো মাটি (রেগুর)',
          bho: 'काली माटी',
          pa: 'ਕਾਲੀ ਮਿੱਟੀ'
        }
      },
      {
        key: 'alluvial',
        standard: 'Alluvial Soil',
        localNames: {
          en: 'Alluvial Soil (Delta Bhumi)',
          hi: 'जलोढ़ मिट्टी (डेल्टा भूमि)',
          kn: 'ಮೆಕ್ಕಲು ಮಣ್ಣು',
          bn: 'পলি মাটি (ডেল্টা ভূমি)',
          bho: 'जलोढ़ माटी',
          pa: 'ਖਾਦੀ ਮਿੱਟੀ'
        }
      },
      {
        key: 'sandy',
        standard: 'Sandy / Coastal Soil',
        localNames: {
          en: 'Sandy / Coastal Soil',
          hi: 'बलुई / तटीय मिट्टी',
          kn: 'ಮರಳು / ಕರಾವಳಿ ಮಣ್ಣು',
          bn: 'বালুয়া / উপকূলীয় মাটি',
          bho: 'बलुआ माटी',
          pa: 'ਰੇਤਲੀ ਮਿੱਟੀ'
        }
      }
    ]
  },

  // ── TAMIL NADU ─────────────────────────────────────────────────────────────
  'Tamil Nadu': {
    stateName: {
      en: 'Tamil Nadu', hi: 'तमिलनाडु', kn: 'ತಮಿಳುನಾಡು',
      bn: 'তামিলনাড়ু', bho: 'तमिलनाडु', pa: 'ਤਮਿਲ ਨਾਡੂ'
    },
    soils: [
      {
        key: 'red_loamy',
        standard: 'Red Loamy Soil',
        localNames: {
          en: 'Red Loamy Soil (Sivappu Mann)',
          hi: 'लाल दोमट मिट्टी',
          kn: 'ಕೆಂಪು ಗೋಡು ಮಣ್ಣು',
          bn: 'লাল দোআঁশ মাটি',
          bho: 'लाल दोमट माटी',
          pa: 'ਲਾਲ ਦੋਮਟ ਮਿੱਟੀ'
        }
      },
      {
        key: 'black',
        standard: 'Black Soil',
        localNames: {
          en: 'Black Soil (Karuppu Mann / Regur)',
          hi: 'काली मिट्टी',
          kn: 'ಕಪ್ಪು ಮಣ್ಣು',
          bn: 'কালো মাটি',
          bho: 'काली माटी',
          pa: 'ਕਾਲੀ ਮਿੱਟੀ'
        }
      },
      {
        key: 'laterite',
        standard: 'Laterite Soil',
        localNames: {
          en: 'Laterite Soil (Sarukku Mann)',
          hi: 'लैटेराइट मिट्टी',
          kn: 'ಲ್ಯಾಟರೈಟ್ ಮಣ್ಣು',
          bn: 'ল্যাটেরাইট মাটি',
          bho: 'लैटेराइट माटी',
          pa: 'ਲੈਟਰਾਈਟ ਮਿੱਟੀ'
        }
      },
      {
        key: 'alluvial',
        standard: 'Alluvial Soil',
        localNames: {
          en: 'Alluvial Soil (Vellai Mann / Nadi Mann)',
          hi: 'जलोढ़ मिट्टी',
          kn: 'ಮೆಕ್ಕಲು ಮಣ್ಣು',
          bn: 'পলি মাটি',
          bho: 'जलोढ़ माटी',
          pa: 'ਖਾਦੀ ਮਿੱਟੀ'
        }
      },
      {
        key: 'coastal_sandy',
        standard: 'Coastal Sandy Soil',
        localNames: {
          en: 'Coastal Sandy Soil (Karaiora Mann)',
          hi: 'तटीय बलुई मिट्टी',
          kn: 'ಕರಾವಳಿ ಮರಳು ಮಣ್ಣು',
          bn: 'উপকূলীয় বালুয়া মাটি',
          bho: 'तटीय बलुआ माटी',
          pa: 'ਤੱਟੀ ਰੇਤਲੀ ਮਿੱਟੀ'
        }
      }
    ]
  },

  // ── BIHAR ──────────────────────────────────────────────────────────────────
  Bihar: {
    stateName: {
      en: 'Bihar', hi: 'बिहार', kn: 'ಬಿಹಾರ',
      bn: 'বিহার', bho: 'बिहार', pa: 'ਬਿਹਾਰ'
    },
    soils: [
      {
        key: 'alluvial',
        standard: 'Alluvial Soil',
        localNames: {
          en: 'Alluvial Soil (Khadar / Bhangar)',
          hi: 'जलोढ़ मिट्टी (खादर / भांगर)',
          kn: 'ಮೆಕ್ಕಲು ಮಣ್ಣು',
          bn: 'পলি মাটি (খাদর / ভাঙর)',
          bho: 'जलोढ़ माटी (खादर / भांगर)',
          pa: 'ਖਾਦੀ ਮਿੱਟੀ'
        }
      },
      {
        key: 'loamy',
        standard: 'Loamy Soil',
        localNames: {
          en: 'Loamy Soil (Domat)',
          hi: 'दोमट मिट्टी',
          kn: 'ಗೋಡು ಮಣ್ಣು',
          bn: 'দোআঁশ মাটি',
          bho: 'दोमट माटी',
          pa: 'ਦੋਮਟ ਮਿੱਟੀ'
        }
      },
      {
        key: 'clay',
        standard: 'Clay Soil',
        localNames: {
          en: 'Clay Soil (Matiyar)',
          hi: 'चिकनी मिट्टी (मटियार)',
          kn: 'ಜೇಡಿ ಮಣ್ಣು',
          bn: 'কাদা মাটি (মাটিয়ার)',
          bho: 'चिकनी माटी (मटियार)',
          pa: 'ਚਿਕਣੀ ਮਿੱਟੀ'
        }
      },
      {
        key: 'red_laterite',
        standard: 'Red Laterite Soil',
        localNames: {
          en: 'Red Laterite Soil (Jharkhand border region)',
          hi: 'लाल लैटेराइट मिट्टी',
          kn: 'ಕೆಂಪು ಲ್ಯಾಟರೈಟ್ ಮಣ್ಣು',
          bn: 'লাল ল্যাটেরাইট মাটি',
          bho: 'लाल माटी',
          pa: 'ਲਾਲ ਲੈਟਰਾਈਟ ਮਿੱਟੀ'
        }
      }
    ]
  },

  // ── HIMACHAL PRADESH ────────────────────────────────────────────────────────
  'Himachal Pradesh': {
    stateName: {
      en: 'Himachal Pradesh', hi: 'हिमाचल प्रदेश', kn: 'ಹಿಮಾಚಲ ಪ್ರದೇಶ',
      bn: 'হিমাচল প্রদেশ', bho: 'हिमाचल प्रदेश', pa: 'ਹਿਮਾਚਲ ਪ੍ਰਦੇਸ਼'
    },
    soils: [
      {
        key: 'mountain_brown',
        standard: 'Mountain Brown / Forest Soil',
        localNames: {
          en: 'Mountain Brown / Forest Soil (Pahadi Mitti)',
          hi: 'पहाड़ी भूरी / वन मिट्टी',
          kn: 'ಪರ್ವತ ಕಂದು ಮಣ್ಣು',
          bn: 'পাহাড়ি বাদামি মাটি',
          bho: 'पहाड़ी भूरी माटी',
          pa: 'ਪਹਾੜੀ ਭੂਰੀ ਮਿੱਟੀ'
        }
      },
      {
        key: 'alluvial',
        standard: 'Alluvial Soil',
        localNames: {
          en: 'Alluvial Soil (Terai)',
          hi: 'जलोढ़ मिट्टी (तराई)',
          kn: 'ಮೆಕ್ಕಲು ಮಣ್ಣು',
          bn: 'পলি মাটি (তরাই)',
          bho: 'जलोढ़ माटी',
          pa: 'ਖਾਦੀ ਮਿੱਟੀ (ਤਰਾਈ)'
        }
      },
      {
        key: 'loamy',
        standard: 'Loamy Soil',
        localNames: {
          en: 'Loamy Soil',
          hi: 'दोमट मिट्टी',
          kn: 'ಗೋಡು ಮಣ್ಣು',
          bn: 'দোআঁশ মাটি',
          bho: 'दोमट माटी',
          pa: 'ਦੋਮਟ ਮਿੱਟੀ'
        }
      },
      {
        key: 'sandy',
        standard: 'Sandy Soil',
        localNames: {
          en: 'Sandy Soil (Balu Mitti)',
          hi: 'बलुई मिट्टी',
          kn: 'ಮರಳು ಮಣ್ಣು',
          bn: 'বালুয়া মাটি',
          bho: 'बलुआ माटी',
          pa: 'ਰੇਤਲੀ ਮਿੱਟੀ'
        }
      }
    ]
  },

  // ── ODISHA ─────────────────────────────────────────────────────────────────
  Odisha: {
    stateName: {
      en: 'Odisha', hi: 'ओडिशा', kn: 'ಒಡಿಶಾ',
      bn: 'ওডিশা', bho: 'ओडिशा', pa: 'ਓਡੀਸ਼ਾ'
    },
    soils: [
      {
        key: 'red_loamy',
        standard: 'Red Loamy Soil',
        localNames: {
          en: 'Red Loamy Soil (Lal Domas)',
          hi: 'लाल दोमट मिट्टी',
          kn: 'ಕೆಂಪು ಗೋಡು ಮಣ್ಣು',
          bn: 'লাল দোআঁশ মাটি (লাল দোমাস)',
          bho: 'लाल दोमट माटी',
          pa: 'ਲਾਲ ਦੋਮਟ ਮਿੱਟੀ'
        }
      },
      {
        key: 'alluvial',
        standard: 'Alluvial Soil',
        localNames: {
          en: 'Alluvial Soil (Balanda)',
          hi: 'जलोढ़ मिट्टी',
          kn: 'ಮೆಕ್ಕಲು ಮಣ್ಣು',
          bn: 'পলি মাটি (বালান্দা)',
          bho: 'जलोढ़ माटी',
          pa: 'ਖਾਦੀ ਮਿੱਟੀ'
        }
      },
      {
        key: 'laterite',
        standard: 'Laterite Soil',
        localNames: {
          en: 'Laterite Soil',
          hi: 'लैटेराइट मिट्टी',
          kn: 'ಲ್ಯಾಟರೈಟ್ ಮಣ್ಣು',
          bn: 'ল্যাটেরাইট মাটি',
          bho: 'लैटेराइट माटी',
          pa: 'ਲੈਟਰਾਈਟ ਮਿੱਟੀ'
        }
      },
      {
        key: 'coastal_saline',
        standard: 'Coastal Saline Soil',
        localNames: {
          en: 'Coastal Saline Soil',
          hi: 'तटीय लवणीय मिट्टी',
          kn: 'ಕರಾವಳಿ ಕ್ಷಾರ ಮಣ್ಣು',
          bn: 'উপকূলীয় লবণাক্ত মাটি',
          bho: 'तटीय लवण माटी',
          pa: 'ਤੱਟੀ ਲੂਣੀ ਮਿੱਟੀ'
        }
      }
    ]
  },

  // ── DEFAULT (GENERIC INDIA) ─────────────────────────────────────────────────
  _default: {
    stateName: {
      en: 'India (General)', hi: 'भारत (सामान्य)', kn: 'ಭಾರತ (ಸಾಮಾನ್ಯ)',
      bn: 'ভারত (সাধারণ)', bho: 'भारत (सामान्य)', pa: 'ਭਾਰਤ (ਸਾਧਾਰਨ)'
    },
    soils: [
      {
        key: 'alluvial',
        standard: 'Alluvial Soil',
        localNames: {
          en: 'Alluvial Soil', hi: 'जलोढ़ मिट्टी', kn: 'ಮೆಕ್ಕಲು ಮಣ್ಣು',
          bn: 'পলি মাটি', bho: 'जलोढ़ माटी', pa: 'ਖਾਦੀ ਮਿੱਟੀ'
        }
      },
      {
        key: 'black',
        standard: 'Black Soil',
        localNames: {
          en: 'Black Soil (Regur)', hi: 'काली मिट्टी (रेगुर)', kn: 'ಕಪ್ಪು ಮಣ್ಣು (ರೆಗೂರ್)',
          bn: 'কালো মাটি (রেগুর)', bho: 'काली माटी', pa: 'ਕਾਲੀ ਮਿੱਟੀ (ਰੇਗੁਰ)'
        }
      },
      {
        key: 'red_laterite',
        standard: 'Red / Laterite Soil',
        localNames: {
          en: 'Red / Laterite Soil', hi: 'लाल / लैटेराइट मिट्टी', kn: 'ಕೆಂಪು / ಲ್ಯಾಟರೈಟ್ ಮಣ್ಣು',
          bn: 'লাল / ল্যাটেরাইট মাটি', bho: 'लाल माटी', pa: 'ਲਾਲ / ਲੈਟਰਾਈਟ ਮਿੱਟੀ'
        }
      },
      {
        key: 'loamy',
        standard: 'Loamy Soil',
        localNames: {
          en: 'Loamy Soil', hi: 'दोमट मिट्टी', kn: 'ಗೋಡು ಮಣ್ಣು',
          bn: 'দোআঁশ মাটি', bho: 'दोमट माटी', pa: 'ਦੋਮਟ ਮਿੱਟੀ'
        }
      },
      {
        key: 'sandy',
        standard: 'Sandy Soil',
        localNames: {
          en: 'Sandy Soil', hi: 'बलुई मिट्टी', kn: 'ಮರಳು ಮಣ್ಣು',
          bn: 'বালুয়া মাটি', bho: 'बलुआ माटी', pa: 'ਰੇਤਲੀ ਮਿੱਟੀ'
        }
      },
      {
        key: 'clay',
        standard: 'Clay Soil',
        localNames: {
          en: 'Clay Soil', hi: 'चिकनी मिट्टी', kn: 'ಜೇಡಿ ಮಣ್ಣು',
          bn: 'কাদা মাটি', bho: 'चिकनी माटी', pa: 'ਚਿਕਣੀ ਮਿੱਟੀ'
        }
      }
    ]
  }
};

/**
 * Get soil options for a given state/location.
 * If the state is not in the database, returns the generic Indian soil list.
 */
export function getSoilsForState(stateName: string | null | undefined): SoilEntry[] {
  if (!stateName) return SOIL_DATABASE._default.soils;

  // Exact match first
  if (SOIL_DATABASE[stateName]) return SOIL_DATABASE[stateName].soils;

  // Partial match (e.g. "Uttarakhand" inside "State of Uttarakhand")
  const key = Object.keys(SOIL_DATABASE).find(k =>
    k !== '_default' && (
      stateName.toLowerCase().includes(k.toLowerCase()) ||
      k.toLowerCase().includes(stateName.toLowerCase())
    )
  );

  return key ? SOIL_DATABASE[key].soils : SOIL_DATABASE._default.soils;
}

/**
 * Build a language instruction string to include in AI prompts.
 * Ensures AI responds exclusively in the selected language.
 */
export function getLanguageInstruction(language: string): string {
  const instructions: Record<string, string> = {
    en: 'Respond ENTIRELY in English. Do not use Hindi, Kannada, Bengali, Punjabi, Bhojpuri, or any other language. Scientific names (Latin), crop variety names, and officially registered product/chemical names may remain in their standard form.',
    hi: 'पूरी तरह से हिंदी में जवाब दें। अंग्रेजी शब्द केवल तभी प्रयोग करें जब वे अपरिहार्य वैज्ञानिक नाम, रासायनिक नाम, इकाइयाँ, या आधिकारिक रूप से पंजीकृत उत्पाद/दवाओं के नाम हों। कोई अन्य अंग्रेजी शब्द न मिलाएं।',
    kn: 'ಸಂಪೂರ್ಣವಾಗಿ ಕನ್ನಡದಲ್ಲಿ ಉತ್ತರಿಸಿ. ವೈಜ್ಞಾನಿಕ ಹೆಸರುಗಳು, ರಾಸಾಯನಿಕ ಹೆಸರುಗಳು, ಅಥವಾ ಅಧಿಕೃತ ಉತ್ಪನ್ನ ಹೆಸರುಗಳನ್ನು ಹೊರತುಪಡಿಸಿ ಬೇರೆ ಭಾಷೆ ಬಳಸಬೇಡಿ.',
    bn: 'সম্পূর্ণ বাংলায় উত্তর দিন। বৈজ্ঞানিক নাম, রাসায়নিক নাম, বা সরকারিভাবে নিবন্ধিত পণ্যের নাম ছাড়া অন্য ভাষায় কোনো শব্দ ব্যবহার করবেন না।',
    bho: 'पूरा जवाब भोजपुरी में दीं। वैज्ञानिक नाम, रासायनिक नाम, या आधिकारिक उत्पाद नाम के अलावा कौनो दूसरी भाषा मत मिलाईं।',
    pa: 'ਪੂਰੀ ਤਰ੍ਹਾਂ ਪੰਜਾਬੀ ਵਿੱਚ ਜਵਾਬ ਦਿਓ। ਵਿਗਿਆਨਕ ਨਾਮ, ਰਸਾਇਣਕ ਨਾਮ, ਜਾਂ ਸਰਕਾਰੀ ਤੌਰ ਤੇ ਦਰਜ ਉਤਪਾਦ ਨਾਮਾਂ ਨੂੰ ਛੱਡ ਕੇ ਕੋਈ ਹੋਰ ਭਾਸ਼ਾ ਨਾ ਵਰਤੋ।'
  };
  return instructions[language] || instructions.en;
}

/**
 * Translate soil-related UI label keys for the location-aware soil section.
 */
export function getSoilSectionLabels(language: SupportedLanguage): {
  soilTypeLabel: string;
  selectPlaceholder: string;
  selectedLocationPrefix: string;
  soilsForRegion: string;
} {
  const labels: Record<SupportedLanguage, {
    soilTypeLabel: string;
    selectPlaceholder: string;
    selectedLocationPrefix: string;
    soilsForRegion: string;
  }> = {
    en: {
      soilTypeLabel: 'Soil Type',
      selectPlaceholder: 'Select soil type for your region',
      selectedLocationPrefix: 'Soils available for',
      soilsForRegion: 'Region-specific soil types'
    },
    hi: {
      soilTypeLabel: 'मिट्टी का प्रकार',
      selectPlaceholder: 'अपने क्षेत्र की मिट्टी चुनें',
      selectedLocationPrefix: 'के लिए उपलब्ध मिट्टी',
      soilsForRegion: 'क्षेत्र-विशिष्ट मिट्टी के प्रकार'
    },
    kn: {
      soilTypeLabel: 'ಮಣ್ಣಿನ ಪ್ರಕಾರ',
      selectPlaceholder: 'ನಿಮ್ಮ ಪ್ರದೇಶದ ಮಣ್ಣು ಆಯ್ಕೆ ಮಾಡಿ',
      selectedLocationPrefix: 'ಗಾಗಿ ಲಭ್ಯವಿರುವ ಮಣ್ಣು',
      soilsForRegion: 'ಪ್ರಾದೇಶಿಕ ಮಣ್ಣಿನ ಪ್ರಕಾರಗಳು'
    },
    bn: {
      soilTypeLabel: 'মাটির ধরন',
      selectPlaceholder: 'আপনার অঞ্চলের মাটির ধরন বেছে নিন',
      selectedLocationPrefix: 'এর জন্য উপলব্ধ মাটি',
      soilsForRegion: 'আঞ্চলিক মাটির ধরন'
    },
    bho: {
      soilTypeLabel: 'माटी के प्रकार',
      selectPlaceholder: 'अपना क्षेत्र के माटी चुनीं',
      selectedLocationPrefix: 'के खातिर उपलब्ध माटी',
      soilsForRegion: 'क्षेत्र के माटी के प्रकार'
    },
    pa: {
      soilTypeLabel: 'ਮਿੱਟੀ ਦੀ ਕਿਸਮ',
      selectPlaceholder: 'ਆਪਣੇ ਖੇਤਰ ਦੀ ਮਿੱਟੀ ਚੁਣੋ',
      selectedLocationPrefix: 'ਲਈ ਉਪਲਬਧ ਮਿੱਟੀ',
      soilsForRegion: 'ਖੇਤਰ-ਵਿਸ਼ੇਸ਼ ਮਿੱਟੀ ਦੀਆਂ ਕਿਸਮਾਂ'
    }
  };
  return labels[language] || labels.en;
}
