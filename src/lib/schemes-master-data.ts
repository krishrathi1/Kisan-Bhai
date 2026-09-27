export interface SchemeDetail {
  id: string;
  key: string;
  title: string;
  hindiTitle: string;
  stateCode: string; // 'all' or state slug e.g. 'uttarakhand'
  stateName: string; // 'All India (Central)' or 'Uttarakhand'
  category: 
    | 'Financial Assistance'
    | 'Crop Insurance & Relief'
    | 'Solar & Irrigation'
    | 'Machinery Subsidy'
    | 'Credit & Loan Waiver'
    | 'Organic & Natural Farming'
    | 'Horticulture & Orchards'
    | 'Allied & Livestock';
  benefitSummary: string;
  benefitAmount: string;
  detailedBenefits: string[];
  eligibility: string[];
  ineligibility?: string[];
  documents: string[];
  applicationSteps: string[];
  nodalDepartment: string;
  helpline: string;
  officialPortalName: string;
  faqs: { question: string; answer: string }[];
}

export const ALL_INDIA_SCHEMES_DIRECTORY: SchemeDetail[] = [
  // ==========================================
  // CENTRAL GOVERNMENT SCHEMES (ALL INDIA)
  // ==========================================
  {
    id: 'pm-kisan',
    key: 'pmkisan',
    title: 'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)',
    hindiTitle: 'प्रधानमंत्री किसान सम्मान निधि योजना',
    stateCode: 'all',
    stateName: 'All India (Central Govt)',
    category: 'Financial Assistance',
    benefitSummary: 'Direct cash transfer of ₹6,000 per year credited into Aadhaar-linked bank accounts.',
    benefitAmount: '₹6,000 / Year (3 installments of ₹2,000)',
    detailedBenefits: [
      '₹2,000 credited every 4 months (April-July, August-November, December-March).',
      '100% funded by Central Government via Direct Benefit Transfer (DBT).',
      'Over 11 crore farmer families receiving regular income support without intermediaries.',
      'Can be clubbed with state supplementary schemes (e.g., Namo Shetkari, Rythu Bharosa, CM Kisan Kalyan).'
    ],
    eligibility: [
      'All landholding farmer families with cultivable landholding in their names.',
      'Small, marginal, and medium farmers across rural and urban India.',
      'Mandatory Aadhaar-seeded active bank account and completed eKYC.'
    ],
    ineligibility: [
      'Institutional landholders.',
      'Farmer families holding constitutional posts or retired government employees drawing pension > ₹10,000/month.',
      'Income tax payers from the last assessment year.',
      'Professionals like Doctors, Engineers, Lawyers, Chartered Accountants.'
    ],
    documents: [
      'Aadhaar Card',
      'Land Records (Khasra-Khatauni / 7-12 / RoR)',
      'Bank Account Passbook (Aadhaar Seeded)',
      'Active Mobile Number for OTP'
    ],
    applicationSteps: [
      'Step 1: Check your land records to ensure ownership is registered in revenue database.',
      'Step 2: Visit nearest Common Service Centre (CSC) or Krishi Mitra center with Aadhaar & Land Khatauni.',
      'Step 3: Complete biometric/OTP eKYC and enter land identification numbers.',
      'Step 4: State Nodal Officer verifies the landholding records.',
      'Step 5: FTO (Fund Transfer Order) generated and installment directly deposited into your bank.'
    ],
    nodalDepartment: 'Department of Agriculture & Farmers Welfare, Ministry of Agriculture, Govt of India',
    helpline: '155261 / 1800-115-526 / 011-24300606',
    officialPortalName: 'pmkisan.gov.in',
    faqs: [
      {
        question: 'Is eKYC mandatory for receiving PM-KISAN installments?',
        answer: 'Yes, OTP-based Aadhaar eKYC (or biometric eKYC at CSC centers) and Aadhaar bank account seeding are strictly mandatory.'
      },
      {
        question: 'Can tenant farmers apply for PM-KISAN?',
        answer: 'PM-KISAN requires cultivable land titles. However, states like Andhra Pradesh (Rythu Bharosa) and Odisha (KALIA) provide state grants for tenant farmers.'
      }
    ]
  },
  {
    id: 'pmfby',
    key: 'pmfby',
    title: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
    hindiTitle: 'प्रधानमंत्री फसल बीमा योजना',
    stateCode: 'all',
    stateName: 'All India (Central Govt)',
    category: 'Crop Insurance & Relief',
    benefitSummary: 'Comprehensive low-cost insurance cover against non-preventable natural risks, pests, and post-harvest damage.',
    benefitAmount: '100% Sum Insured Coverage (Farmer pays only 1.5% - 5% premium)',
    detailedBenefits: [
      'Kharif Food & Oilseed Crops: Farmer pays only 2.0% of Sum Insured.',
      'Rabi Food & Oilseed Crops: Farmer pays only 1.5% of Sum Insured.',
      'Annual Commercial / Horticultural Crops: Farmer pays only 5.0% of Sum Insured.',
      'Full coverage for prevented sowing, mid-season localized adversity (hailstorm, landslide, inundation), and post-harvest cyclone damage up to 14 days.'
    ],
    eligibility: [
      'All farmers growing notified crops in notified areas.',
      'Both loanee farmers (holding KCC) and non-loanee farmers are eligible.',
      'Sharecroppers and tenant farmers with valid cultivation declarations are eligible.'
    ],
    ineligibility: [
      'Non-notified crops or sowing outside notified block boundaries.',
      'Losses resulting from war, nuclear risks, malicious damage, or stray cattle grazing.'
    ],
    documents: [
      'Aadhaar Card',
      'Land Record Document (Khatauni / RoR / Lease Agreement)',
      'Sowing Certificate / Patwari Panchnama',
      'Bank Account Passbook / Cancelled Cheque'
    ],
    applicationSteps: [
      'Step 1: Check notification cutoff dates (usually July 31 for Kharif, Dec 31 for Rabi).',
      'Step 2: Collect Sowing Certificate from village revenue officer / Patwari or Gram Sevak.',
      'Step 3: Register at bank branch (for KCC) or nearest CSC / Krishi Kendra.',
      'Step 4: Pay farmer share of premium (1.5% - 2%) and obtain insurance policy certificate.',
      'Step 5: In case of crop loss, report within 72 hours via PMFBY Crop Insurance App or toll-free helpline.'
    ],
    nodalDepartment: 'Ministry of Agriculture & Farmers Welfare, GoI & Empaneled Insurance Companies',
    helpline: '1800-180-1551 / 14447 (Crop Loss Reporting)',
    officialPortalName: 'pmfby.gov.in',
    faqs: [
      {
        question: 'Within how many hours must crop damage be reported?',
        answer: 'Localized crop damage (hailstorm, flooding) must be reported within 72 hours through the Fasal Bima App, bank, or agriculture officer.'
      }
    ]
  },
  {
    id: 'kcc',
    key: 'kcc',
    title: 'Kisan Credit Card (KCC) Scheme',
    hindiTitle: 'किसान क्रेडिट कार्ड योजना',
    stateCode: 'all',
    stateName: 'All India (Central Govt)',
    category: 'Credit & Loan Waiver',
    benefitSummary: 'Concessional short-term institutional credit at an effective 4% interest rate.',
    benefitAmount: 'Up to ₹3,00,000 credit at 4% interest (No collateral up to ₹1.6 Lakh)',
    detailedBenefits: [
      'Base interest rate of 7%, reduced to 4% upon prompt repayment (3% Interest Subvention).',
      'Collateral-free credit limit raised to ₹1,60,000 (and up to ₹3,00,000 under tie-up arrangements).',
      'Flexible credit card format: ATM-enabled RuPay Kisan Card for easy withdrawals at mandis and agro-shops.',
      'Includes allied activities: Dairy farming, poultry, sheep/goat rearing, and fisheries with credit up to ₹2,00,000.'
    ],
    eligibility: [
      'All individual land-owner farmers, tenant farmers, oral lessees, and sharecroppers.',
      'Self-Help Groups (SHGs) or Joint Liability Groups (JLGs) of farmers.',
      'Animal husbandry, dairy, and fisheries farmers.'
    ],
    documents: [
      'Aadhaar Card and PAN Card',
      'Land Ownership Record (7-12 / Khasra / Khatoni) showing cropping pattern',
      'Passport size photographs',
      'No Dues Certificate from nearby banks (if loan > ₹1.6 Lakh)'
    ],
    applicationSteps: [
      'Step 1: Download one-page KCC application form from your bank or PM-KISAN portal.',
      'Step 2: Attach copy of land records and Aadhaar card.',
      'Step 3: Submit at your village bank branch (SBI, PNB, Gramin Bank, or Cooperative Bank).',
      'Step 4: Bank sanctions credit limit within 14 days based on land area and scale of finance.',
      'Step 5: Receive RuPay Kisan Card and activate PIN for ATM/POS transactions.'
    ],
    nodalDepartment: 'Department of Financial Services, Ministry of Finance & RBI/NABARD',
    helpline: '1800-180-1111 / Local Lead District Bank',
    officialPortalName: 'sbi.co.in / nabard.org',
    faqs: [
      {
        question: 'What is the repayment period for KCC crop loans?',
        answer: 'Repayment period is linked to the harvesting and marketing period of the crop (usually 12 months for seasonal crops, 18 months for sugarcane).'
      }
    ]
  },
  {
    id: 'pm-kusum',
    key: 'pmkusum',
    title: 'PM-KUSUM (Pradhan Mantri Solar Pump Scheme)',
    hindiTitle: 'पीएम कुसुम सोलर पंप योजना',
    stateCode: 'all',
    stateName: 'All India (Central Govt)',
    category: 'Solar & Irrigation',
    benefitSummary: 'Up to 90% combined subsidy for setting up solar irrigation pumps and solarizing farm tube-wells.',
    benefitAmount: '60% - 90% Subsidy on Standalone & Grid-Connected Solar Pumps',
    detailedBenefits: [
      'Component A: Set up small solar plants (500 kW to 2 MW) on barren/fallow land and sell power to DISCOM.',
      'Component B: Install standalone solar agriculture pumps (3 HP to 10 HP) in off-grid rural areas with 60% standard subsidy (up to 85-90% in NE/Hill states).',
      'Component C: Solarisation of grid-connected agriculture pumps with net-metering to earn extra income by feeding power to the grid.',
      'Eliminates diesel costs and provides 25 years of reliable free daytime irrigation.'
    ],
    eligibility: [
      'Individual farmers, cooperatives, panchayats, Farmer Producer Organizations (FPOs), and Water User Associations.',
      'Farmers with cultivable land requiring irrigation and currently lacking reliable electricity supply.'
    ],
    documents: [
      'Aadhaar Card and Jan-Aadhaar/Family ID',
      'Land Revenue Records (Khasra/Khatauni/Jamabandi)',
      'Water Source Certificate (borewell/open well/pond)',
      'Bank Account Passbook'
    ],
    applicationSteps: [
      'Step 1: Check your state renewable energy development agency notification (e.g. UREDA in UK, MEDA in MH, HAREDA in HR).',
      'Step 2: Register on your state renewable energy portal.',
      'Step 3: Select solar pump capacity (3 HP, 5 HP, 7.5 HP, 10 HP based on borewell depth).',
      'Step 4: Deposit farmer contribution (10% to 40% of benchmark cost).',
      'Step 5: Certified vendor conducts site survey, delivers solar panels and pump, and completes installation.'
    ],
    nodalDepartment: 'Ministry of New and Renewable Energy (MNRE), Govt of India & State Nodal Agencies',
    helpline: '1800-180-3333 / 011-24360707',
    officialPortalName: 'pmkusum.mnre.gov.in',
    faqs: [
      {
        question: 'How long do the solar pump panels last?',
        answer: 'Solar photovoltaic modules come with a 25-year performance warranty and minimal maintenance requirements.'
      }
    ]
  },
  {
    id: 'smam-machinery',
    key: 'smam',
    title: 'Sub-Mission on Agricultural Mechanization (SMAM)',
    hindiTitle: 'कृषि यंत्रीकरण उप-मिशन (मशीनरी सब्सिडी)',
    stateCode: 'all',
    stateName: 'All India (Central Govt)',
    category: 'Machinery Subsidy',
    benefitSummary: '40% to 80% subsidy for purchasing tractors, power tillers, rotavators, and setting up Custom Hiring Centers.',
    benefitAmount: '40% - 50% for Individuals | Up to 80% for Farm Groups/CHCs',
    detailedBenefits: [
      'Small, marginal, SC/ST, and women farmers receive 50% subsidy on farm implements.',
      'Other farmers receive 40% subsidy on approved machinery.',
      'Financial assistance up to ₹10 Lakh (80% subsidy) for establishing Custom Hiring Centers (CHCs) in villages.',
      'Covers drones, laser land levelers, multi-crop threshers, happy seeders, rotavators, and sprayers.'
    ],
    eligibility: [
      'All landholding farmers.',
      'Priority given to women farmers, SC/ST, and small/marginal farmers.',
      'FPOs, SHGs, and cooperative societies eligible for Custom Hiring Centre grants.'
    ],
    documents: [
      'Aadhaar Card',
      'Land Records (7-12 / Khasra-Khatauni)',
      'Bank Account Passbook',
      'Caste Certificate (if applying under SC/ST quota)',
      'Quotation from authorized implement dealer'
    ],
    applicationSteps: [
      'Step 1: Visit Agricoop DBT mechanization portal (agrimachinery.nic.in).',
      'Step 2: Register as a farmer with Aadhaar and mobile verification.',
      'Step 3: Select implement type and authorized dealer in your district.',
      'Step 4: Receive approval/lottery allotment order from District Agriculture Officer.',
      'Step 5: Purchase machine, upload invoice and GPS photo; subsidy directly disbursed into bank account.'
    ],
    nodalDepartment: 'Mechanization & Technology Division, Ministry of Agriculture & Farmers Welfare, GoI',
    helpline: '011-23382937 / 1800-180-1551',
    officialPortalName: 'agrimachinery.nic.in',
    faqs: [
      {
        question: 'Can I purchase any tractor brand under SMAM?',
        answer: 'Yes, you can purchase any tractor or equipment model tested and approved by central testing institutes (CFMTTI).'
      }
    ]
  },
  {
    id: 'soil-health-card',
    key: 'soilhealth',
    title: 'Soil Health Card Scheme',
    hindiTitle: 'मृदा स्वास्थ्य कार्ड योजना',
    stateCode: 'all',
    stateName: 'All India (Central Govt)',
    category: 'Organic & Natural Farming',
    benefitSummary: 'Free laboratory testing of soil samples and customized crop-specific fertilizer recommendations.',
    benefitAmount: '100% Free Testing & Advisory Card issued every 3 years',
    detailedBenefits: [
      'Tests 12 vital parameters: N, P, K (Macronutrients); S (Secondary nutrient); Zn, Fe, Cu, Mn, Bo (Micronutrients); pH, EC, OC (Physical indicators).',
      'Saves 15% to 25% on chemical fertilizer costs by curbing excessive urea and DAP application.',
      'Recommends dosage for specific crops to boost yield by 8-15%.',
      'Promotes soil health rejuvenation through organic manure and bio-fertilizer integration.'
    ],
    eligibility: [
      'All agricultural landholders in every state and union territory in India.',
      'Soil samples collected by Krishi Mitra or agriculture officers across GPS-gridded plots.'
    ],
    documents: [
      'Farmer Name and Contact Number',
      'Khasra/Survey Number and Village Location Details'
    ],
    applicationSteps: [
      'Step 1: Department collects soil sample from field using GPS grid method.',
      'Step 2: Sample analyzed in district government soil testing laboratory.',
      'Step 3: Printed Soil Health Card generated with fertilizer dosage chart.',
      'Step 4: Card handed over to farmer or downloaded online using mobile number.'
    ],
    nodalDepartment: 'Integrated Nutrient Management Division, Ministry of Agriculture & Farmers Welfare',
    helpline: '1800-180-1551',
    officialPortalName: 'soilhealth.dac.gov.in',
    faqs: [
      {
        question: 'How often should soil be tested?',
        answer: 'Soil testing is recommended once every 3 years to account for changes in nutrient dynamics.'
      }
    ]
  },
  {
    id: 'enam-national',
    key: 'enam',
    title: 'National Agriculture Market (e-NAM 2.0)',
    hindiTitle: 'राष्ट्रीय कृषि बाजार (ई-नाम)',
    stateCode: 'all',
    stateName: 'All India (Central Govt)',
    category: 'Financial Assistance',
    benefitSummary: 'Pan-India electronic trading portal integrating 1,361+ mandis for transparent bidding and direct payment.',
    benefitAmount: 'Zero Commission Trade & Direct Same-Day Online Bank Settlement',
    detailedBenefits: [
      'Removes local middlemen monopolies: buyers across India bid competitively on your harvest.',
      'Free quality assaying and grading laboratories inside connected mandis.',
      'Electronic weighbridge integration and direct settlement into farmer bank accounts.',
      'Warehouse-based trading (e-NWR) allows selling produce from approved warehouses without transporting to physical mandis.'
    ],
    eligibility: [
      'Any farmer selling agricultural, horticultural, or spice commodities.',
      'Individual farmers, Farmer Producer Organizations (FPOs), and traders.'
    ],
    documents: [
      'Aadhaar Card',
      'Bank Account Passbook (for payment credit)',
      'Mandi Gate Entry Receipt / Commodity Details'
    ],
    applicationSteps: [
      'Step 1: Register on e-NAM mobile app or mandi gate entry kiosk.',
      'Step 2: Bring harvest lot to e-NAM market yard and get lot sample assayed.',
      'Step 3: Assay report uploaded to portal; traders across India submit online bids.',
      'Step 4: Accept the highest transparent bid on your mobile phone.',
      'Step 5: Payment credited directly to bank account within hours.'
    ],
    nodalDepartment: 'Small Farmers Agri-Business Consortium (SFAC), Ministry of Agriculture, GoI',
    helpline: '1800-270-0224',
    officialPortalName: 'enam.gov.in',
    faqs: [
      {
        question: 'Are there charges for farmers on e-NAM?',
        answer: 'No, registration, assaying, and trading services on e-NAM are completely free of charge for farmers.'
      }
    ]
  },
  {
    id: 'pkvy-organic',
    key: 'pkvy',
    title: 'Paramparagat Krishi Vikas Yojana (PKVY)',
    hindiTitle: 'परम्परागत कृषि विकास योजना (जैविक खेती)',
    stateCode: 'all',
    stateName: 'All India (Central Govt)',
    category: 'Organic & Natural Farming',
    benefitSummary: '₹50,000 per hectare grant for adopting organic farming clusters and certified green inputs.',
    benefitAmount: '₹50,000 / Hectare over 3 years (₹31,000 DBT for inputs)',
    detailedBenefits: [
      '₹31,000/ha direct cash assistance for organic seeds, bio-fertilizers, vermicompost, and bio-pesticides.',
      '₹8,800/ha for value addition, packaging, eco-friendly branding, and custom marketing.',
      'Free Participatory Guarantee System (PGS-India) organic certification for 3 years.',
      'Access to dedicated organic mandis and export premium prices.'
    ],
    eligibility: [
      'Farmers willing to form clusters of 20 hectares (50 farmers) in contiguous rural areas.',
      'Small and marginal farmers are given primary priority.'
    ],
    documents: [
      'Aadhaar Card',
      'Land Records showing cultivable plot',
      'Cluster Registration Group form',
      'Bank Passbook'
    ],
    applicationSteps: [
      'Step 1: Form a village group of 20-50 farmers interested in organic farming.',
      'Step 2: Contact District Agriculture Officer / KVK to register the PKVY cluster.',
      'Step 3: Receive first installment grant for seed treatment and soil preparation.',
      'Step 4: Undergo 3-year transition period under PGS green endorsement.',
      'Step 5: Receive final PGS-India Organic Certification and sell at premium organic markets.'
    ],
    nodalDepartment: 'National Project on Organic Farming (NPOF), Ministry of Agriculture & Farmers Welfare',
    helpline: '1800-180-1551',
    officialPortalName: 'pgsindia-ncof.gov.in',
    faqs: [
      {
        question: 'How long does organic certification take?',
        answer: 'PGS-India certification takes 3 years of continuous pesticide-free farming to achieve full organic status.'
      }
    ]
  },

  // ==========================================
  // UTTARAKHAND STATE GOVERNMENT SCHEMES
  // ==========================================
  {
    id: 'uk-deen-dayal',
    key: 'uk-deendayal',
    title: 'Deen Dayal Upadhyay Kisan Kalyan Yojana (Uttarakhand)',
    hindiTitle: 'दीन दयाल उपाध्याय किसान कल्याण योजना (उत्तराखंड)',
    stateCode: 'uttarakhand',
    stateName: 'Uttarakhand',
    category: 'Credit & Loan Waiver',
    benefitSummary: '0% Interest-free agricultural loans up to ₹3,00,000 for individual farmers and ₹5,00,000 for SHGs.',
    benefitAmount: 'Up to ₹3 Lakh @ 0% Interest (Zero Interest Loan)',
    detailedBenefits: [
      'Completely interest-free loan (100% interest subvention provided by Uttarakhand Government).',
      'Available for agriculture, horticulture, dairy, goat farming, fisheries, and agro-processing.',
      'Farmer Self-Help Groups (SHGs) and FPOs can avail interest-free loans up to ₹5,00,000.',
      'Repayment tenure of up to 3 years with flexible installment plans.'
    ],
    eligibility: [
      'Permanent domicile residents of Uttarakhand state.',
      'Small and marginal farmers holding agricultural land in Uttarakhand.',
      'Members of registered women SHGs and cooperative societies.'
    ],
    documents: [
      'Uttarakhand Domicile / Permanent Residence Certificate',
      'Aadhaar Card',
      'Land Khatauni / Khasra records (certified by Patwari)',
      'Bank Passbook of District Cooperative Bank or designated partner bank'
    ],
    applicationSteps: [
      'Step 1: Obtain scheme application form from nearest District Cooperative Bank branch or block agriculture office.',
      'Step 2: Attach land Khatauni and business project plan (crop, dairy, or horticulture).',
      'Step 3: Verification conducted by Block Development Officer (BDO) and Agriculture Officer.',
      'Step 4: Loan amount disbursed into bank account at 0% interest rate.'
    ],
    nodalDepartment: 'Department of Cooperation & Agriculture, Govt of Uttarakhand',
    helpline: '1800-180-4200 / 0135-2712211',
    officialPortalName: 'cooperative.uk.gov.in',
    faqs: [
      {
        question: 'Is interest charged if repaid on time?',
        answer: 'No! If you repay installments as per schedule, the entire interest is borne by the Uttarakhand government.'
      }
    ]
  },
  {
    id: 'uk-apple-mission',
    key: 'uk-apple',
    title: 'Uttarakhand High-Density Apple & Kiwi Mission',
    hindiTitle: 'उत्तराखंड सेब एवं कीवी सघन बागवानी मिशन',
    stateCode: 'uttarakhand',
    stateName: 'Uttarakhand',
    category: 'Horticulture & Orchards',
    benefitSummary: '80% capital subsidy on dwarf apple rootstocks, micro-drip irrigation, and anti-hail net trellis.',
    benefitAmount: '80% State Subsidy (Up to ₹4,00,000 per hectare)',
    detailedBenefits: [
      'Supply of certified Italian/Chilean high-density dwarf rootstocks (Gala, Red Velox, Granny Smith).',
      'Yield starts from 2nd year onwards compared to 7 years in traditional seedlings.',
      '80% subsidy covering plant material, galvanized trellis system, drip system, and anti-hail protection.',
      'Buyback linkages and climate-controlled storage access in Nainital, Uttarkashi, and Chamoli.'
    ],
    eligibility: [
      'Farmers residing in hilly districts of Uttarakhand (altitude 5,000 ft to 9,000 ft).',
      'Minimum land area of 0.1 hectare (1 Nali / 200 sq m) up to 2 hectares.'
    ],
    documents: [
      'Uttarakhand Domicile Certificate',
      'Aadhaar Card',
      'Land Ownership Record (Khatauni / Revenue Map)',
      'Soil & Water Source Testing Report'
    ],
    applicationSteps: [
      'Step 1: Register on Uttarakhand Horticulture Department portal (shm.uk.gov.in).',
      'Step 2: Submit land details and layout plan to District Horticulture Officer (DHO).',
      'Step 3: Technical inspection and elevation check by horticulture experts.',
      'Step 4: High-density plants and trellis materials delivered with 80% subsidy.'
    ],
    nodalDepartment: 'Department of Horticulture & Food Processing, Govt of Uttarakhand',
    helpline: '0135-2759759 / District Horticulture Offices (DHO)',
    officialPortalName: 'shm.uk.gov.in',
    faqs: [
      {
        question: 'Which districts in Uttarakhand are prioritized for Apple Mission?',
        answer: 'Uttarkashi, Chamoli, Pithoragarh, Nainital, Almora, Tehri, and Bageshwar.'
      }
    ]
  },
  {
    id: 'uk-aromatic-plants',
    key: 'uk-aromatic',
    title: 'Uttarakhand Aromatic & Medicinal Plants Scheme (CAP)',
    hindiTitle: 'उत्तराखंड सगंध एवं औषधीय पादप संवर्धन योजना',
    stateCode: 'uttarakhand',
    stateName: 'Uttarakhand',
    category: 'Organic & Natural Farming',
    benefitSummary: '50% to 75% subsidy for cultivating Lemongrass, Chamomile, Tejpatta, and Gwar Patha on hill terraces.',
    benefitAmount: '50% - 75% Grant + Free Distillation & Guaranteed State Buyback',
    detailedBenefits: [
      'Monkey and wild-animal resistant crops: wild animals do not damage aromatic plants.',
      'Free field planting material (slips and saplings) provided through Centre for Aromatic Plants (CAP) Selaqui.',
      'Installation of free village-level essential oil steam distillation units.',
      'Guaranteed minimum support price buyback of harvested essential oils by CAP Uttarakhand.'
    ],
    eligibility: [
      'Farmers with fallow/uncultivated terrace fields in Uttarakhand.',
      'Individual farmers, women self-help groups, and Van Panchayats.'
    ],
    documents: [
      'Aadhaar Card',
      'Land Record (Khatauni / Van Panchayat allotment)',
      'Bank Account Passbook'
    ],
    applicationSteps: [
      'Step 1: Contact Centre for Aromatic Plants (CAP), Selaqui, Dehradun or block field extension center.',
      'Step 2: Attend free 2-day practical nursery training.',
      'Step 3: Collect subsidized plant slips (Damask Rose, Lemongrass, Mint, Tejpatta).',
      'Step 4: Harvest leaves and distill oil at government distillation plants.',
      'Step 5: CAP directly purchases essential oil and credits payment to bank.'
    ],
    nodalDepartment: 'Centre for Aromatic Plants (CAP), Selaqui, Govt of Uttarakhand',
    helpline: '0135-2698305 / capselaqui.org',
    officialPortalName: 'capselaqui.org',
    faqs: [
      {
        question: 'Are aromatic crops safe from monkeys and wild boars?',
        answer: 'Yes! Due to high essential oil aroma, monkeys, wild boars, and stray cattle do not consume or destroy these crops.'
      }
    ]
  },
  {
    id: 'uk-saur-swarojgar',
    key: 'uk-solar',
    title: 'Mukhyamantri Saur Swarojgar Yojana (Uttarakhand)',
    hindiTitle: 'मुख्यमंत्री सौर स्वरोजगार योजना (उत्तराखंड)',
    stateCode: 'uttarakhand',
    stateName: 'Uttarakhand',
    category: 'Solar & Irrigation',
    benefitSummary: 'Set up 25 kW solar power generation plant on farm land with 70% bank loan and guaranteed 25-yr power buyback.',
    benefitAmount: '₹10 Lakh Project Grant (Guaranteed ₹1.2 Lakh/year income)',
    detailedBenefits: [
      'Converts unused hill agricultural terraces into steady monthly income.',
      'Produce ~38,000 units of clean electricity per year from a 25 kW plant.',
      'UPCL (Uttarakhand Power Corporation Ltd) signs mandatory 25-year Power Purchase Agreement (PPA) at ₹4.50/unit.',
      'Generates regular income of ~₹10,000 to ₹12,000 every month for 25 years.'
    ],
    eligibility: [
      'Permanent residents of Uttarakhand (youth, small farmers, and returnee migrants).',
      'Ownership of at least 300 to 400 square meters of shadow-free agricultural/fallow land.'
    ],
    documents: [
      'Uttarakhand Domicile Certificate',
      'Aadhaar Card and Electricity Bill',
      'Land Revenue Records (Khatauni / Registry)',
      'Bank Passbook'
    ],
    applicationSteps: [
      'Step 1: Register on MSME single window portal of Uttarakhand (msme.uk.gov.in).',
      'Step 2: Technical feasibility check by UREDA (Uttarakhand Renewable Energy Development Agency).',
      'Step 3: Letter of Award issued; bank sanctions loan under MSME interest subvention.',
      'Step 4: Grid synchronization completed by UPCL.',
      'Step 5: Receive monthly payments directly into your bank account for units supplied.'
    ],
    nodalDepartment: 'UREDA & Department of Energy, Govt of Uttarakhand',
    helpline: '0135-2521553 / ureda.uk.gov.in',
    officialPortalName: 'ureda.uk.gov.in',
    faqs: [
      {
        question: 'Can I still farm under the solar panels?',
        answer: 'Yes, elevated solar mounting structures permit shade-loving crops like ginger, turmeric, and garlic under the panels.'
      }
    ]
  },

  // ==========================================
  // PUNJAB STATE GOVERNMENT SCHEMES
  // ==========================================
  {
    id: 'punjab-crm',
    key: 'pb-crm',
    title: 'Punjab Crop Residue Management (CRM) Subsidy',
    hindiTitle: 'पंजाब फसल अवशेष प्रबंधन सब्सिडी (पराली रोकथाम)',
    stateCode: 'punjab',
    stateName: 'Punjab',
    category: 'Machinery Subsidy',
    benefitSummary: '50% to 80% subsidy on Happy Seeder, Super Seeder, Straw Chopper, and Smart Seeders.',
    benefitAmount: '50% Individual | 80% for Cooperatives / CHCs',
    detailedBenefits: [
      'Direct sowing of wheat immediately after paddy harvest without burning stubble.',
      'Preserves soil moisture, beneficial microorganisms, and earthworm population.',
      'Individual farmers receive 50% direct subsidy on machinery invoice.',
      'Primary Agricultural Cooperative Societies (PACS) receive 80% capital grant.'
    ],
    eligibility: [
      'Farmers resident in Punjab with cultivable land.',
      'Cooperative societies, gram panchayats, and registered FPOs in Punjab.'
    ],
    documents: [
      'Aadhaar Card',
      'Punjab Land Records (Jamabandi / Fard)',
      'Bank Account Passbook',
      'Self-declaration of zero stubble burning'
    ],
    applicationSteps: [
      'Step 1: Apply on Punjab Agri Department portal (agrimachinerypb.com).',
      'Step 2: Choose implement (Super Seeder, Paddy Straw Chopper, Mulcher).',
      'Step 3: Verification by Chief Agriculture Officer (CAO).',
      'Step 4: Purchase machine from empanelled dealer; subsidy credited to account.'
    ],
    nodalDepartment: 'Department of Agriculture & Farmers Welfare, Govt of Punjab',
    helpline: '1800-180-1551 / agripb.gov.in',
    officialPortalName: 'agripb.gov.in',
    faqs: [
      {
        question: 'Does Super Seeder reduce wheat sowing cost?',
        answer: 'Yes, it combines stubble cutting, furrow opening, and wheat seed-fertilizer placement in a single tractor pass, saving ₹2,500/acre in fuel.'
      }
    ]
  },
  {
    id: 'punjab-pbpk',
    key: 'pb-pbpk',
    title: 'Pani Bachao Paise Kamao (Punjab)',
    hindiTitle: 'पानी बचाओ पैसे कमाओ योजना (पंजाब)',
    stateCode: 'punjab',
    stateName: 'Punjab',
    category: 'Solar & Irrigation',
    benefitSummary: 'Direct cash deposit of ₹4.00 per kilowatt-hour of agricultural electricity saved on tubewell connections.',
    benefitAmount: 'Direct Cash Transfer for Every Unit of Power Saved',
    detailedBenefits: [
      'Farmers get voluntary free electricity meters installed on agricultural tubewells.',
      'Monthly electricity allowance assigned based on connected horsepower.',
      'Unused electricity rewarded with cash credited directly into bank account every month.',
      'Encourages water conservation without taking away free power entitlements.'
    ],
    eligibility: [
      'Farmers holding AP (Agricultural Power) tubewell connections with PSPCL in Punjab.'
    ],
    documents: [
      'PSPCL Tubewell Electricity Account Number',
      'Aadhaar Card',
      'Aadhaar-linked Bank Passbook'
    ],
    applicationSteps: [
      'Step 1: Submit voluntary participation consent form to local PSPCL sub-division office.',
      'Step 2: PSPCL installs smart bi-directional digital electric meter free of cost.',
      'Step 3: Practice efficient irrigation (DSR, tensiometers).',
      'Step 4: Monthly savings calculated and deposited into farmer bank account.'
    ],
    nodalDepartment: 'Punjab State Power Corporation Limited (PSPCL) & Dept of Agriculture',
    helpline: '1912 / 1800-180-6045',
    officialPortalName: 'pspcl.in',
    faqs: [
      {
        question: 'Will I be billed if I exceed the electricity limit?',
        answer: 'No! There is zero bill or penalty even if you consume more than the allocation. You only gain money for savings.'
      }
    ]
  },

  // ==========================================
  // HARYANA STATE GOVERNMENT SCHEMES
  // ==========================================
  {
    id: 'haryana-bby',
    key: 'hr-bby',
    title: 'Bhavantar Bharpayee Yojana (Haryana)',
    hindiTitle: 'भावांतर भरपाई योजना (हरियाणा)',
    stateCode: 'haryana',
    stateName: 'Haryana',
    category: 'Financial Assistance',
    benefitSummary: 'Price deficit compensation guaranteeing baseline procurement rate for 16 horticultural crops.',
    benefitAmount: '100% Deficit Compensation Between Mandi Price and Benchmark Price',
    detailedBenefits: [
      'Covers Tomato, Onion, Potato, Cauliflower, Peas, Carrot, Ladyfinger, Capsicum, Guava, Kinnow, etc.',
      'If open mandi price falls below state benchmark, the deficit difference is credited via DBT.',
      'Protects farmers from distress sales during peak seasonal market gluts.',
      'Direct integration with Haryana e-Kharid and Meri Fasal Mera Byora portals.'
    ],
    eligibility: [
      'Farmers growing notified vegetables and fruits in Haryana.',
      'Mandatory registration on Meri Fasal Mera Byora (MFMB) portal during sowing window.'
    ],
    documents: [
      'Parivar Pehchan Patra (PPP / Family ID)',
      'Aadhaar Card',
      'Haryana Land Revenue Details (Kila/Khasra number)',
      'Mandi J-Form / Sale Receipt'
    ],
    applicationSteps: [
      'Step 1: Register crop sowing on fasal.haryana.gov.in (Meri Fasal Mera Byora).',
      'Step 2: Patwari/Horticulture official verifies standing crop acreage.',
      'Step 3: Sell harvest in registered Haryana APMC mandis and collect digital J-Form.',
      'Step 4: If selling price < Protected Price, deficit amount automatically computed and transferred.'
    ],
    nodalDepartment: 'Haryana State Agricultural Marketing Board & Dept of Horticulture, Haryana',
    helpline: '1800-180-2117 / fasal.haryana.gov.in',
    officialPortalName: 'fasal.haryana.gov.in',
    faqs: [
      {
        question: 'What is the benchmark price for Tomato under BBY?',
        answer: 'State fixed protected price is ₹400/quintal; if mandi modal rate is ₹250, Haryana govt deposits ₹150/quintal directly.'
      }
    ]
  },
  {
    id: 'haryana-mera-pani',
    key: 'hr-merapani',
    title: 'Mera Pani Meri Virasat Scheme (Haryana)',
    hindiTitle: 'मेरा पानी मेरी विरासत योजना (हरियाणा)',
    stateCode: 'haryana',
    stateName: 'Haryana',
    category: 'Financial Assistance',
    benefitSummary: 'Financial grant of ₹7,000 per acre for diversifying land from water-intensive paddy to alternate crops.',
    benefitAmount: '₹7,000 / Acre Cash Incentive Deposited via DBT',
    detailedBenefits: [
      '₹7,000 per acre incentive for substituting paddy with Maize, Cotton, Bajra, Pulses, or Agroforestry.',
      'Free high-yield hybrid maize seeds and subsidized micro-irrigation systems.',
      '100% government procurement guarantee for alternate crops at Minimum Support Price (MSP).',
      'Conserves groundwater table in critical dark-zone blocks.'
    ],
    eligibility: [
      'Haryana farmers who cultivated paddy in the preceding Kharif season.',
      'Applicable in all districts, with special focus on dark-zone blocks (Kurukshetra, Kaithal, Karnal).'
    ],
    documents: [
      'Parivar Pehchan Patra (PPP)',
      'Aadhaar Card',
      'Land Records showing previous year paddy cultivation'
    ],
    applicationSteps: [
      'Step 1: Register on fasal.haryana.gov.in under "Mera Pani Meri Virasat" tab.',
      'Step 2: Declare alternate crop sown in place of paddy.',
      'Step 3: Satellite and drone ground-truthing verification by agriculture department.',
      'Step 4: First installment of ₹2,000 credited after verification; remaining ₹5,000 credited at harvest.'
    ],
    nodalDepartment: 'Department of Agriculture & Farmers Welfare, Govt of Haryana',
    helpline: '1800-180-2117',
    officialPortalName: 'agriharyana.gov.in',
    faqs: [
      {
        question: 'Can I leave the field fallow and claim the ₹7,000 incentive?',
        answer: 'Yes! Farmers leaving the field completely unplanted without paddy also receive ₹7,000/acre.'
      }
    ]
  },

  // ==========================================
  // MAHARASHTRA STATE GOVERNMENT SCHEMES
  // ==========================================
  {
    id: 'maha-namo-shetkari',
    key: 'mh-namo',
    title: 'Namo Shetkari Mahasanman Nidhi Yojana (Maharashtra)',
    hindiTitle: 'नमो शेतकरी महासन्मान निधी योजना (महाराष्ट्र)',
    stateCode: 'maharashtra',
    stateName: 'Maharashtra',
    category: 'Financial Assistance',
    benefitSummary: 'Additional ₹6,000 per year from Maharashtra Govt, delivering a combined total of ₹12,000/year.',
    benefitAmount: '₹6,000 / Year from State + ₹6,000 from Centre = ₹12,000 / Year',
    detailedBenefits: [
      'Direct supplementary payment of ₹2,000 in three installments matching PM-KISAN cycles.',
      'Total of ₹12,000 annually per beneficiary farmer family in Maharashtra.',
      'Direct DBT transfer with zero processing fee or middleman involvement.',
      'Comprehensive coverage across all 36 districts of Maharashtra.'
    ],
    eligibility: [
      'All farmers in Maharashtra who are approved active beneficiaries of central PM-KISAN.',
      'Land title registered in Maharashtra land records (7/12 extract).'
    ],
    documents: [
      'Aadhaar Card (linked to bank account)',
      '7/12 (Saat Bara) and 8A Land Extract',
      'PM-KISAN Registration ID'
    ],
    applicationSteps: [
      'Step 1: If you receive PM-KISAN, enrollment is automatic via MahaDBT integration.',
      'Step 2: Check your status on mahadbt.maharashtra.gov.in using Aadhaar number.',
      'Step 3: Ensure Aadhaar NPCI bank account mapping is active at your bank branch.'
    ],
    nodalDepartment: 'Department of Agriculture, Government of Maharashtra',
    helpline: '020-25537038 / 1800-120-8040',
    officialPortalName: 'mahadbt.maharashtra.gov.in',
    faqs: [
      {
        question: 'Do I need to file a separate application if I already get PM-KISAN?',
        answer: 'No separate application is required; approved PM-KISAN farmers in Maharashtra are automatically enrolled.'
      }
    ]
  },
  {
    id: 'maha-shettale',
    key: 'mh-shettale',
    title: 'Magel Tyala Shettale (Farm Pond on Demand - Maharashtra)',
    hindiTitle: 'मागेल त्याला शेततळे योजना (महाराष्ट्र)',
    stateCode: 'maharashtra',
    stateName: 'Maharashtra',
    category: 'Solar & Irrigation',
    benefitSummary: 'Direct capital grant of up to ₹75,000 for excavating farm ponds with plastic geomembrane lining.',
    benefitAmount: 'Up to ₹75,000 Direct Grant into Bank Account',
    detailedBenefits: [
      'Guaranteed farm pond sanction to any farmer who demands one ("Magel Tyala").',
      'Harvests monsoon rainwater to secure protective irrigation for Kharif and Rabi crops.',
      'Direct DBT disbursement in two installments based on georeferenced excavation photos.',
      'Can be integrated with fish farming and drip irrigation systems.'
    ],
    eligibility: [
      'Farmers holding minimum 0.60 hectare (1.5 acres) of land in Maharashtra.',
      'Land must be technically suitable for rainwater percolation/storage.'
    ],
    documents: [
      '7/12 & 8-A Land Extract',
      'Aadhaar Card',
      'Undertaking not to sell farm pond land',
      'Bank Account Passbook'
    ],
    applicationSteps: [
      'Step 1: Apply online on MahaDBT portal under "Magel Tyala Shettale".',
      'Step 2: Taluka Agriculture Officer verifies site and issues pre-sanction letter.',
      'Step 3: Complete farm pond excavation using earthmoving machines.',
      'Step 4: Agriculture assistant takes geotagged photographs of dimensions.',
      'Step 5: Subsidy of up to ₹75,000 credited directly into farmer account.'
    ],
    nodalDepartment: 'Department of Agriculture, Govt of Maharashtra',
    helpline: '1800-120-8040',
    officialPortalName: 'mahadbt.maharashtra.gov.in',
    faqs: [
      {
        question: 'What are the standard dimensions for the farm pond?',
        answer: 'Standard sizes range from 30m x 30m x 3m (capacity ~2,700 cubic meters) to smaller 15m x 15m ponds.'
      }
    ]
  },

  // ==========================================
  // KARNATAKA STATE GOVERNMENT SCHEMES
  // ==========================================
  {
    id: 'karnataka-raitha-siri',
    key: 'ka-siri',
    title: 'Raitha Siri Scheme (Karnataka Millet Mission)',
    hindiTitle: 'रैता सिरी योजना (कर्नाटक श्रीअन्न प्रोत्साहन)',
    stateCode: 'karnataka',
    stateName: 'Karnataka',
    category: 'Financial Assistance',
    benefitSummary: 'Direct financial assistance of ₹10,000 per hectare for growing minor millets.',
    benefitAmount: '₹10,000 / Hectare (Maximum 2 Hectares = ₹20,000)',
    detailedBenefits: [
      'Incentive of ₹10,000 per hectare credited via DBT to promote climate-resilient millets.',
      'Covers Ragi, Foxtail millet (Navane), Little millet (Same), Kodo millet (Haraka), Proso millet (Baragu).',
      'Free distribution of certified high-yielding seeds through Raita Samparka Kendras (RSK).',
      'Guaranteed MSP procurement through Karnataka Food & Civil Supplies Corporation.'
    ],
    eligibility: [
      'Farmers cultivating minor millets in any district of Karnataka.',
      'Registered with FRUITS (Farmer Registration & Unified Beneficiary Information System) ID.'
    ],
    documents: [
      'FRUITS ID / FID Number',
      'Aadhaar Card',
      'Pahani (RTC / Land Record)',
      'Aadhaar-seeded Bank Account'
    ],
    applicationSteps: [
      'Step 1: Get your FRUITS ID at your local Raita Samparka Kendra (RSK) or Tahsildar office.',
      'Step 2: Sowing details recorded by Village Agriculture Assistant in crop survey app.',
      'Step 3: Verification of standing millet crop through satellite geotagging.',
      'Step 4: Cash assistance of ₹10,000/ha credited into Aadhaar-linked bank account.'
    ],
    nodalDepartment: 'Department of Agriculture, Government of Karnataka',
    helpline: '080-22212837 / Raita Samparka Kendras (RSK)',
    officialPortalName: 'raitamitra.karnataka.gov.in',
    faqs: [
      {
        question: 'What is a FRUITS ID in Karnataka?',
        answer: 'FRUITS is Karnataka single digital farmer registry that integrates land, bank, and Aadhaar for all state schemes.'
      }
    ]
  },
  {
    id: 'karnataka-ganga-kalyana',
    key: 'ka-ganga',
    title: 'Ganga Kalyana Scheme (Karnataka)',
    hindiTitle: 'गंगा कल्याण योजना (कर्नाटक)',
    stateCode: 'karnataka',
    stateName: 'Karnataka',
    category: 'Solar & Irrigation',
    benefitSummary: 'Free drilling of irrigation borewells with submersible pumps and power energization.',
    benefitAmount: '100% Free Irrigation Borewell & Pump (Valued at ₹2.5 to ₹3.5 Lakh)',
    detailedBenefits: [
      'Complete cost of geological survey, borewell drilling, and PVC casing pipes borne by state.',
      'Free supply of 5 HP / 7.5 HP ISI marked submersible pump set and starter control panel.',
      'Dedicated electricity connection from ESCOMs provided free of cost.',
      'Provides permanent perennial irrigation to dryland farmers.'
    ],
    eligibility: [
      'Small and marginal farmers belonging to SC, ST, and OBC backward communities in Karnataka.',
      'Annual family income must not exceed ₹98,000 for rural areas.',
      'Minimum landholding of 1.5 acres (or contiguous cluster of 5 acres for joint scheme).'
    ],
    documents: [
      'Caste and Income Certificate (issued by Tahsildar with RD number)',
      'RTC (Pahani) and Mutation Extract',
      'Aadhaar Card',
      'FRUITS ID'
    ],
    applicationSteps: [
      'Step 1: Apply online on Karnataka Seva Sindhu or KDDC / Ambedkar Development Corporation portal.',
      'Step 2: Document verification and field spot inspection by taluk committee.',
      'Step 3: Sanction letter issued by Corporation.',
      'Step 4: Empanelled rig contractor drills borewell and installs submersible pump.'
    ],
    nodalDepartment: 'Social Welfare & Backward Classes Dept, Govt of Karnataka',
    helpline: '080-22864349 / Seva Sindhu: 1902',
    officialPortalName: 'sevasindhu.karnataka.gov.in',
    faqs: [
      {
        question: 'Can individual farmers apply if they own less than 1.5 acres?',
        answer: 'Individual scheme requires 1.5 acres; smaller farmers can form a joint cluster with neighboring plots.'
      }
    ]
  },

  // ==========================================
  // TAMIL NADU STATE GOVERNMENT SCHEMES
  // ==========================================
  {
    id: 'tn-kalaignar-scheme',
    key: 'tn-kalaignar',
    title: "Kalaignarin All Village Integrated Agriculture Development Programme",
    hindiTitle: 'कलाईनार एकीकृत ग्राम कृषि विकास कार्यक्रम (तमिलनाडु)',
    stateCode: 'tamil-nadu',
    stateName: 'Tamil Nadu',
    category: 'Financial Assistance',
    benefitSummary: 'Holistic village-level convergence providing free coconut saplings, vegetable seed kits, and sprayers.',
    benefitAmount: 'Free Input Kits + 100% Drip Irrigation Subsidy',
    detailedBenefits: [
      'Transforms fallow drylands into cultivable fertile lands with government tractor plowing.',
      'Free distribution of high-yield coconut saplings (2 per household) and horticultural kits.',
      '100% subsidy for small and marginal farmers on drip and sprinkler micro-irrigation systems.',
      'Establishment of community farm ponds, desilting of check dams, and solar drying yards.'
    ],
    eligibility: [
      'Farmers resident in village panchayats selected under the current phase in Tamil Nadu.',
      'Priority for small, marginal, women, and SC/ST farmers.'
    ],
    documents: [
      'Uzhavan App Registration / Farmer ID',
      'Aadhaar Card',
      'Chitta / Adangal (Land Records)',
      'Bank Account Passbook'
    ],
    applicationSteps: [
      'Step 1: Register on Uzhavan Mobile App or visit local Agricultural Extension Centre (AEC).',
      'Step 2: Village Agriculture Officer (VAO) verifies land records.',
      'Step 3: Collect free input kits from local panchayat distribution camp.',
      'Step 4: Micro-irrigation installed by empanelled vendors with 100% state subsidy.'
    ],
    nodalDepartment: 'Department of Agriculture and Farmers Welfare, Govt of Tamil Nadu',
    helpline: '1800-180-1551 / Uzhavan App Helpline',
    officialPortalName: 'agrisnet.tn.gov.in',
    faqs: [
      {
        question: 'What is the Uzhavan App in Tamil Nadu?',
        answer: 'Uzhavan is the unified bilingual mobile app used by Tamil Nadu farmers for scheme enrollment, farm subsidies, and mandi rates.'
      }
    ]
  },

  // ==========================================
  // RAJASTHAN STATE GOVERNMENT SCHEMES
  // ==========================================
  {
    id: 'rj-tarbandi',
    key: 'rj-tarbandi',
    title: 'Rajasthan Tarbandi Yojana (Farm Fencing Subsidy)',
    hindiTitle: 'राजस्थान तारबंदी योजना (खेत बाड़ सब्सिडी)',
    stateCode: 'rajasthan',
    stateName: 'Rajasthan',
    category: 'Machinery Subsidy',
    benefitSummary: '50% to 60% grant for wire fencing around farm boundaries to protect crops from wild animals and stray cattle.',
    benefitAmount: '50% - 60% Subsidy (Up to ₹48,000 for 400 meters of fencing)',
    detailedBenefits: [
      'Small and marginal farmers receive 60% subsidy (up to ₹48,000).',
      'General farmers receive 50% subsidy (up to ₹40,000) for barbed wire fencing.',
      'Guarantees 100% protection against nilgai (blue bulls), wild boars, and stray cattle.',
      'Group of farmers can combine contiguous landholdings (minimum 5 hectares) for cluster tarbandi.'
    ],
    eligibility: [
      'Farmers of Rajasthan holding at least 1.5 hectares (or group holding 5 hectares).',
      'Jan-Aadhaar card mandatory.'
    ],
    documents: [
      'Jan-Aadhaar Card',
      'Aadhaar Card',
      'Jamabandi / Khasra Map (Not more than 6 months old)',
      'Bank Account linked with Jan-Aadhaar'
    ],
    applicationSteps: [
      'Step 1: Apply online on RajKisan Saathi portal (rajkisan.rajasthan.gov.in) through e-Mitra.',
      'Step 2: Agriculture Supervisor conducts pre-verification of plot boundaries.',
      'Step 3: Erect iron/cement pillars and barbed wire fencing.',
      'Step 4: Post-verification GPS geotagged photography by department.',
      'Step 5: Subsidy directly transferred to Jan-Aadhaar linked bank account.'
    ],
    nodalDepartment: 'Department of Agriculture, Government of Rajasthan',
    helpline: '0141-2227849 / 1800-180-1551',
    officialPortalName: 'rajkisan.rajasthan.gov.in',
    faqs: [
      {
        question: 'Can neighboring farmers apply jointly for Tarbandi?',
        answer: 'Yes! Farmers with small plots can form a group having at least 5 hectares combined to claim the maximum subsidy.'
      }
    ]
  },
  {
    id: 'rj-kisan-mitra-urja',
    key: 'rj-urja',
    title: 'Mukhyamantri Kisan Mitra Urja Yojana (Rajasthan)',
    hindiTitle: 'मुख्यमंत्री किसान मित्र ऊर्जा योजना (राजस्थान)',
    stateCode: 'rajasthan',
    stateName: 'Rajasthan',
    category: 'Solar & Irrigation',
    benefitSummary: 'Direct grant of ₹1,000 per month (up to ₹12,000 per year) on agricultural electricity bills.',
    benefitAmount: 'Up to ₹12,000 / Year Electricity Bill Rebate',
    detailedBenefits: [
      '₹1,000 monthly grant deducted directly on metered agricultural electric power connections.',
      'Farmers with monthly bill less than ₹1,000 enjoy 100% free electricity.',
      'Remaining unused subsidy carries over to subsequent billing cycles.',
      'Benefited over 14 lakh rural farmer consumers across Discoms (JVVNL, AVVNL, JdVVNL).'
    ],
    eligibility: [
      'General metered agricultural consumers in rural Rajasthan.',
      'Active connection without outstanding past dues.'
    ],
    documents: [
      'Agricultural Electricity K-Number / Consumer ID',
      'Jan-Aadhaar Card linked to consumer account'
    ],
    applicationSteps: [
      'Step 1: Link your Jan-Aadhaar card with your electricity K-number on the DISCOM website.',
      'Step 2: The subsidy is automatically adjusted in the monthly electricity bill.',
      'Step 3: Receive billing receipt showing net zero or reduced payable amount.'
    ],
    nodalDepartment: 'Department of Energy & Discoms, Govt of Rajasthan',
    helpline: '1800-180-6003 (JVVNL) / 1912',
    officialPortalName: 'energy.rajasthan.gov.in',
    faqs: [
      {
        question: 'Do I get cash in hand if my bill is zero?',
        answer: 'The subsidy adjusts against your electricity bill; any surplus amount rolls over to adjust against future consumption.'
      }
    ]
  },

  // ==========================================
  // BIHAR STATE GOVERNMENT SCHEMES
  // ==========================================
  {
    id: 'bihar-fasal-sahayata',
    key: 'br-fasal',
    title: 'Bihar Rajya Fasal Sahayata Yojana (BRFSY)',
    hindiTitle: 'बिहार राज्य फसल सहायता योजना (फसल क्षति मुआवजा)',
    stateCode: 'bihar',
    stateName: 'Bihar',
    category: 'Crop Insurance & Relief',
    benefitSummary: 'Free crop damage compensation up to ₹10,000/ha without requiring farmers to pay any insurance premium.',
    benefitAmount: '₹7,500 to ₹10,000 / Hectare Free Financial Assistance',
    detailedBenefits: [
      'Zero premium: Farmers do not have to pay a single rupee as insurance premium.',
      'Crop loss 1% to 20%: Assistance of ₹7,500 per hectare.',
      'Crop loss > 20%: Full compensation of ₹10,000 per hectare (up to 2 hectares).',
      'Covers flood damage, drought, hailstorms, and unseasonal rainfall for Paddy, Wheat, Maize, and Gram.'
    ],
    eligibility: [
      'All farmers cultivating notified crops in Bihar.',
      'Both land-owner (Raiyat) and non-landowner (Gair-Raiyat / sharecroppers) farmers.'
    ],
    documents: [
      'Aadhaar Card',
      'Land LPC (Land Possession Certificate) or Self-Declaration for Gair-Raiyat',
      'Aadhaar-linked Bank Account Passbook'
    ],
    applicationSteps: [
      'Step 1: Register on Bihar Cooperative Department portal (pacsonline.bih.nic.in).',
      'Step 2: Upload land receipt / self-declaration during crop sowing season.',
      'Step 3: Statistical Directorate conducts crop cutting experiments (CCE) post-harvest.',
      'Step 4: If block yield falls below threshold, relief amount credited directly into bank.'
    ],
    nodalDepartment: 'Department of Cooperation, Government of Bihar',
    helpline: '1800-180-0110 / 0612-2200693',
    officialPortalName: 'state.bihar.gov.in/cooperative',
    faqs: [
      {
        question: 'Can sharecroppers without land papers apply in Bihar?',
        answer: 'Yes! Sharecroppers (Gair-Raiyat) can apply by submitting a simple self-declaration signed by local Ward Member/Mukhiya.'
      }
    ]
  },

  // ==========================================
  // WEST BENGAL STATE GOVERNMENT SCHEMES
  // ==========================================
  {
    id: 'wb-krishak-bandhu',
    key: 'wb-bandhu',
    title: 'Krishak Bandhu (Assured Financial Assistance & Death Benefit)',
    hindiTitle: 'कृषक बंधु योजना (पश्चिम बंगाल)',
    stateCode: 'west-bengal',
    stateName: 'West Bengal',
    category: 'Financial Assistance',
    benefitSummary: 'Assistance up to ₹10,000/year plus ₹2,00,000 one-time bereavement grant to family on farmer death.',
    benefitAmount: 'Up to ₹10,000 / Year + ₹2,00,000 Life Insurance Grant',
    detailedBenefits: [
      'Farmers with 1 acre or more receive ₹10,000 per year in two equal installments (Kharif and Rabi).',
      'Farmers with less than 1 acre receive pro-rata assistance with guaranteed minimum of ₹4,000/year.',
      'Krishak Bandhu Death Benefit: Family receives ₹2,00,000 in case of death of farmer aged 18 to 60 years.',
      'Covers sharecroppers (Bargadars) as well as recorded title holders.'
    ],
    eligibility: [
      'All farmers and registered Bargadars (sharecroppers) in West Bengal.',
      'Land recorded in RoR (Parcha) of Directorate of Land Records.'
    ],
    documents: [
      'Aadhaar Card and Voter ID (EPIC)',
      'RoR / Parcha copy / Recorded Bargadar Certificate',
      'Bank Account Passbook'
    ],
    applicationSteps: [
      'Step 1: Submit form at local "Duare Sarkar" camp or Block Assistant Director of Agriculture (ADA) office.',
      'Step 2: Land revenue verification with Banglarbhumi land database.',
      'Step 3: Receive Krishak Bandhu Smart ID Card.',
      'Step 4: Installments credited directly into bank account in Kharif (June) and Rabi (November).'
    ],
    nodalDepartment: 'Department of Agriculture, Government of West Bengal',
    helpline: '8336957370 / Duare Sarkar Portal',
    officialPortalName: 'krishakbandhu.net',
    faqs: [
      {
        question: 'Does Krishak Bandhu require pre-existing illness declaration for death benefit?',
        answer: 'No, the ₹2 Lakh death grant covers both natural and accidental death for farmers aged 18-60.'
      }
    ]
  },

  // ==========================================
  // ANDHRA PRADESH STATE GOVERNMENT SCHEMES
  // ==========================================
  {
    id: 'ap-rythu-bharosa',
    key: 'ap-bharosa',
    title: 'YSR Rythu Bharosa - PM KISAN (Andhra Pradesh)',
    hindiTitle: 'वाईएसआर रायथु भरोसा (आंध्र प्रदेश)',
    stateCode: 'andhra-pradesh',
    stateName: 'Andhra Pradesh',
    category: 'Financial Assistance',
    benefitSummary: 'Annual financial assistance of ₹13,500 per farmer family, including tenant and landless farmers.',
    benefitAmount: '₹13,500 / Year (₹7,500 State + ₹6,000 PM-KISAN)',
    detailedBenefits: [
      'Disbursed in 3 timely installments: ₹7,500 in May (sowing), ₹4,000 in Oct (harvesting), ₹2,000 in Jan (Sankranti).',
      'Extended to tenant farmers (CCRC holders) and ROFR forest land cultivators.',
      'Combined with 100% free crop insurance and zero-interest crop loans (Sunna Vaddi).',
      'Administered through 10,000+ village Rythu Bharosa Kendras (RBKs).'
    ],
    eligibility: [
      'All farmer families cultivating land in Andhra Pradesh.',
      'SC, ST, BC, and Minority tenant farmers holding Crop Cultivator Rights Card (CCRC).'
    ],
    documents: [
      'Aadhaar Card',
      'Pattadar Passbook / Webland 1B records',
      'CCRC Agreement (for tenant farmers)',
      'Bank Account Passbook'
    ],
    applicationSteps: [
      'Step 1: Verify eligibility at your local Rythu Bharosa Kendra (RBK) in your village.',
      'Step 2: Village Agriculture Assistant (VAA) enters details into e-Crop booking system.',
      'Step 3: Social audit list displayed publicly at Village Secretariat.',
      'Step 4: Funds transferred directly via Aadhaar enabled DBT.'
    ],
    nodalDepartment: 'Department of Agriculture, Government of Andhra Pradesh',
    helpline: '1902 / 155251',
    officialPortalName: 'ysrrythubharosa.ap.gov.in',
    faqs: [
      {
        question: 'What is a Rythu Bharosa Kendra (RBK)?',
        answer: 'RBKs are one-stop digital village kiosks providing seed supply, fertilizer testing, e-Crop booking, and banking in every AP village.'
      }
    ]
  },

  // ==========================================
  // TELANGANA STATE GOVERNMENT SCHEMES
  // ==========================================
  {
    id: 'telangana-rythu-bandhu',
    key: 'ts-bandhu',
    title: 'Rythu Bandhu (Agriculture Investment Support Scheme - Telangana)',
    hindiTitle: 'रायथु बंधु योजना (तेलंगाना निवेश सहायता)',
    stateCode: 'telangana',
    stateName: 'Telangana',
    category: 'Financial Assistance',
    benefitSummary: 'Direct investment grant of ₹10,000 per acre per year (₹5,000/acre per season) for agricultural inputs.',
    benefitAmount: '₹10,000 / Acre per Year (₹5,000 in Kharif + ₹5,000 in Rabi)',
    detailedBenefits: [
      'Paid before start of season to purchase seeds, fertilizers, pesticides, and field labor.',
      'No cap on acreage: every acre of owned cultivable land is supported.',
      'Pairing with Rythu Bima (100% state-paid ₹5,00,000 life insurance for every farmer).',
      'Free 24x7 uninterrupted 3-phase agricultural electricity across Telangana.'
    ],
    eligibility: [
      'All farmers in Telangana owning agricultural land with new digital Pattadar Passbook (Dharani portal).'
    ],
    documents: [
      'Pattadar Passbook / Dharani Land Record',
      'Aadhaar Card',
      'Bank Account Passbook'
    ],
    applicationSteps: [
      'Step 1: Ensure land mutation is completed on Dharani portal (dharani.telangana.gov.in).',
      'Step 2: Submit passbook copy and bank details to Agriculture Extension Officer (AEO).',
      'Step 3: Direct Treasury DBT transfer executed before Kharif (June) and Rabi (November).'
    ],
    nodalDepartment: 'Department of Agriculture, Government of Telangana',
    helpline: '040-23383520 / 1800-425-3525',
    officialPortalName: 'rythubandhu.telangana.gov.in',
    faqs: [
      {
        question: 'What is the Rythu Bima scheme in Telangana?',
        answer: 'Rythu Bima provides ₹5 Lakh immediate death compensation to the nominee within 10 days of a farmer death, funded 100% by state via LIC.'
      }
    ]
  },

  // ==========================================
  // ODISHA STATE GOVERNMENT SCHEMES
  // ==========================================
  {
    id: 'odisha-kalia',
    key: 'od-kalia',
    title: 'KALIA Scheme (Krushak Assistance for Livelihood and Income Augmentation)',
    hindiTitle: 'कालिया योजना (ओडिशा किसान आजीविका सहायता)',
    stateCode: 'odisha',
    stateName: 'Odisha',
    category: 'Financial Assistance',
    benefitSummary: '₹10,000/year for small & marginal farmers, plus ₹12,500 livelihood package for landless farm laborers.',
    benefitAmount: '₹10,000 / Year (Farmers) | ₹12,500 (Landless Laborers)',
    detailedBenefits: [
      'Financial assistance of ₹10,000 per family over two cropping seasons.',
      'Special livelihood support of ₹12,500 for landless agricultural households for goat rearing, duckery, mushroom, and bee-keeping.',
      'Life insurance cover of ₹2,00,000 at a nominal state-subsidized premium of just ₹0.30.',
      'Interest-free crop loans up to ₹50,000 through cooperative societies.'
    ],
    eligibility: [
      'Small and marginal farmers of Odisha.',
      'Landless agricultural households and vulnerable agricultural laborers.'
    ],
    documents: [
      'Aadhaar Card',
      'Ration Card / Food Security Card',
      'Land Record (RoR) for farmers or MGNREGA Job Card for landless',
      'Aadhaar-seeded Bank Account'
    ],
    applicationSteps: [
      'Step 1: Check beneficiary status on kalia.odisha.gov.in portal.',
      'Step 2: New applicants register online through Mo Seva Kendra or Gram Panchayat camp.',
      'Step 3: Verification through Krushak Odisha unified database.',
      'Step 4: Assistance deposited directly into bank account via DBT.'
    ],
    nodalDepartment: 'Department of Agriculture & Farmers Empowerment, Govt of Odisha',
    helpline: '1800-572-1122 / 0674-2395532',
    officialPortalName: 'kalia.odisha.gov.in',
    faqs: [
      {
        question: 'Are landless laborers eligible under KALIA?',
        answer: 'Yes! KALIA is one of India pioneer schemes explicitly providing financial packages to landless agricultural labor families.'
      }
    ]
  },

  // ==========================================
  // HIMACHAL PRADESH STATE GOVERNMENT SCHEMES
  // ==========================================
  {
    id: 'hp-prakritik-kheti',
    key: 'hp-pk3y',
    title: 'Prakritik Kheti Khushhal Kisan Yojana (PK3Y - Himachal Pradesh)',
    hindiTitle: 'प्राकृतिक खेती खुशहाल किसान योजना (हिमाचल प्रदेश)',
    stateCode: 'himachal-pradesh',
    stateName: 'Himachal Pradesh',
    category: 'Organic & Natural Farming',
    benefitSummary: '100% financial grant for drums and inputs to adopt chemical-free Subhash Palekar Natural Farming (SPNF).',
    benefitAmount: 'Free Input Drums, Cow Shed Assistance & ₹25,000 Indigenous Cow Grant',
    detailedBenefits: [
      'Free supply of 3 plastic drums (200-liter capacity) for preparing Jeevamrit and Beejamrit.',
      'Assistance of ₹25,000 or 50% subsidy for purchasing indigenous hill breed cows (Pahari/Desi cow).',
      'Subsidy of up to ₹8,000 for laying concrete flooring in cow-sheds to collect cow urine (Gomutra).',
      'Premium marketing counters in state mandis for certified chemical-free natural produce.'
    ],
    eligibility: [
      'Farmers residing in Himachal Pradesh practicing or willing to adopt chemical-free farming.'
    ],
    documents: [
      'Himachal Bonafide / Domicile Certificate',
      'Aadhaar Card',
      'Kisan Credit Card / Land Records (Jamabandi)'
    ],
    applicationSteps: [
      'Step 1: Contact Block Technology Team (BTM / ATM) under ATMA in your block.',
      'Step 2: Attend practical 2-day hands-on natural farming workshop.',
      'Step 3: Receive free plastic drum kit and register your farm parcel for natural certification.',
      'Step 4: Receive Desi Cow purchase grant after physical verification.'
    ],
    nodalDepartment: 'State Project Implementing Unit (PK3Y), Dept of Agriculture, HP',
    helpline: '0177-2831203 / 1800-180-1551',
    officialPortalName: 'spnfhp.nic.in',
    faqs: [
      {
        question: 'Does natural farming reduce input costs?',
        answer: 'Yes, it cuts external market purchases of urea, DAP, and pesticides to zero, saving ₹10,000 to ₹15,000 per acre.'
      }
    ]
  },

  // ==========================================
  // KERALA STATE GOVERNMENT SCHEMES
  // ==========================================
  {
    id: 'kerala-subhiksha',
    key: 'kl-subhiksha',
    title: 'Subhiksha Keralam Integrated Food Security Mission',
    hindiTitle: 'सुभिक्षा केरलम एकीकृत खाद्य सुरक्षा मिशन',
    stateCode: 'kerala',
    stateName: 'Kerala',
    category: 'Horticulture & Orchards',
    benefitSummary: 'Grants and interest subvention for cultivating fallow lands with tubers, vegetables, and fruit crops.',
    benefitAmount: 'Up to ₹40,000 / Hectare for Fallow Land Cultivation',
    detailedBenefits: [
      'Financial subsidy of ₹40,000 per hectare for converting fallow land into banana, cassava, and vegetable cultivation.',
      'Subsidized distribution of hybrid vegetable seeds, grow-bags, and drip systems through Krishi Bhavans.',
      'Guaranteed base floor price scheme: Kerala is the first state guaranteeing minimum floor prices for 16 vegetables.',
      'Interest-free agricultural loans up to ₹1,00,000 disbursed via Primary Agricultural Credit Societies (PACS).'
    ],
    eligibility: [
      'Farmers, Kudumbashree groups, youth clubs, and cooperative societies in Kerala.'
    ],
    documents: [
      'AIMS Kerala Farmer Registration ID',
      'Aadhaar Card',
      'Land Tax Receipt / Lease Consent Letter'
    ],
    applicationSteps: [
      'Step 1: Register on Kerala Agriculture Information Management System (AIMS - aims.kerala.gov.in).',
      'Step 2: Submit land details to your local panchayat Krishi Bhavan.',
      'Step 3: Agricultural Officer inspects site and recommends grant.',
      'Step 4: Subsidy credited directly into bank account upon crop emergence.'
    ],
    nodalDepartment: 'Department of Agriculture Development and Farmers Welfare, Govt of Kerala',
    helpline: '0471-2304581 / Krishi Bhavan in every Panchayat',
    officialPortalName: 'aims.kerala.gov.in',
    faqs: [
      {
        question: 'What is Kerala Base Price Scheme for vegetables?',
        answer: 'If market price of tapioca, banana, or tomato falls below production cost, the state pays the differential amount directly to the farmer.'
      }
    ]
  },

  // ==========================================
  // CHHATTISGARH STATE GOVERNMENT SCHEMES
  // ==========================================
  {
    id: 'cg-kisan-nyay',
    key: 'cg-nyay',
    title: 'Rajiv Gandhi Kisan Nyay Yojana (Chhattisgarh)',
    hindiTitle: 'राजीव गांधी किसान न्याय योजना (छत्तीसगढ़)',
    stateCode: 'chhattisgarh',
    stateName: 'Chhattisgarh',
    category: 'Financial Assistance',
    benefitSummary: 'Direct input subsidy of ₹9,000 to ₹10,000 per acre for paddy, maize, pulses, and sugarcane growers.',
    benefitAmount: '₹9,000 - ₹10,000 / Acre Cash Assistance via DBT',
    detailedBenefits: [
      'Direct input subsidy credited in 4 quarterly installments.',
      'Farmers diversifying from paddy to pulses, oilseeds, or plantation crops receive enhanced assistance of ₹10,000/acre.',
      'Helps Chhattisgarh achieve the highest effective paddy realization rate in India (> ₹2,500/quintal).',
      'Over 24 lakh farmer beneficiaries across all 33 districts of Chhattisgarh.'
    ],
    eligibility: [
      'Farmers selling notified crops through Primary Agricultural Credit Societies (PACS) in Chhattisgarh.'
    ],
    documents: [
      'Kisan Code / Unified Farmer Registration ID',
      'Aadhaar Card',
      'B-1 Land Revenue Record / Rin Pustika',
      'Bank Account Passbook'
    ],
    applicationSteps: [
      'Step 1: Register on kisan.cg.nic.in portal during Kharif registration window.',
      'Step 2: Patwari and Rural Agriculture Extension Officer (RAEO) verify acreage.',
      'Step 3: Sell produce at local PACS mandi yard.',
      'Step 4: Input subsidy of ₹9,000/acre deposited directly into bank account.'
    ],
    nodalDepartment: 'Department of Agriculture Development and Farmer Welfare, Govt of Chhattisgarh',
    helpline: '0771-2443900 / 1800-233-3663',
    officialPortalName: 'kisan.cg.nic.in',
    faqs: [
      {
        question: 'Is input subsidy available for pulse and oilseed farmers?',
        answer: 'Yes! Farmers cultivating pulses, oilseeds, and millets receive enhanced assistance of ₹10,000 per acre.'
      }
    ]
  }
];

export const ALL_INDIAN_STATES_FILTER = [
  { code: 'all', name: 'All India (Central Schemes)' },
  { code: 'uttarakhand', name: 'Uttarakhand' },
  { code: 'punjab', name: 'Punjab' },
  { code: 'haryana', name: 'Haryana' },
  { code: 'uttar-pradesh', name: 'Uttar Pradesh' },
  { code: 'maharashtra', name: 'Maharashtra' },
  { code: 'karnataka', name: 'Karnataka' },
  { code: 'tamil-nadu', name: 'Tamil Nadu' },
  { code: 'rajasthan', name: 'Rajasthan' },
  { code: 'madhya-pradesh', name: 'Madhya Pradesh' },
  { code: 'gujarat', name: 'Gujarat' },
  { code: 'bihar', name: 'Bihar' },
  { code: 'west-bengal', name: 'West Bengal' },
  { code: 'andhra-pradesh', name: 'Andhra Pradesh' },
  { code: 'telangana', name: 'Telangana' },
  { code: 'odisha', name: 'Odisha' },
  { code: 'kerala', name: 'Kerala' },
  { code: 'himachal-pradesh', name: 'Himachal Pradesh' },
  { code: 'assam', name: 'Assam' },
  { code: 'chhattisgarh', name: 'Chhattisgarh' },
  { code: 'jharkhand', name: 'Jharkhand' },
  { code: 'jammu-and-kashmir', name: 'Jammu and Kashmir' },
  { code: 'delhi', name: 'Delhi' },
  { code: 'goa', name: 'Goa' },
  { code: 'tripura', name: 'Tripura' },
  { code: 'meghalaya', name: 'Meghalaya' },
  { code: 'manipur', name: 'Manipur' },
  { code: 'mizoram', name: 'Mizoram' },
  { code: 'nagaland', name: 'Nagaland' },
  { code: 'arunachal-pradesh', name: 'Arunachal Pradesh' },
  { code: 'sikkim', name: 'Sikkim' },
  { code: 'chandigarh', name: 'Chandigarh' },
  { code: 'puducherry', name: 'Puducherry' },
] as const;
