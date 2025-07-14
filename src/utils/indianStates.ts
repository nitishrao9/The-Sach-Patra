// Indian States and Union Territories data structure

export interface IndianState {
  code: string;
  name: {
    hi: string;
    en: string;
  };
  type: 'state' | 'ut'; // state or union territory
}

export const INDIAN_STATES: IndianState[] = [
  // States
  { code: 'AP', name: { hi: 'आंध्र प्रदेश', en: 'Andhra Pradesh' }, type: 'state' },
  { code: 'AR', name: { hi: 'अरुणाचल प्रदेश', en: 'Arunachal Pradesh' }, type: 'state' },
  { code: 'AS', name: { hi: 'असम', en: 'Assam' }, type: 'state' },
  { code: 'BR', name: { hi: 'बिहार', en: 'Bihar' }, type: 'state' },
  { code: 'CT', name: { hi: 'छत्तीसगढ़', en: 'Chhattisgarh' }, type: 'state' },
  { code: 'GA', name: { hi: 'गोवा', en: 'Goa' }, type: 'state' },
  { code: 'GJ', name: { hi: 'गुजरात', en: 'Gujarat' }, type: 'state' },
  { code: 'HR', name: { hi: 'हरियाणा', en: 'Haryana' }, type: 'state' },
  { code: 'HP', name: { hi: 'हिमाचल प्रदेश', en: 'Himachal Pradesh' }, type: 'state' },
  { code: 'JH', name: { hi: 'झारखंड', en: 'Jharkhand' }, type: 'state' },
  { code: 'KA', name: { hi: 'कर्नाटक', en: 'Karnataka' }, type: 'state' },
  { code: 'KL', name: { hi: 'केरल', en: 'Kerala' }, type: 'state' },
  { code: 'MP', name: { hi: 'मध्य प्रदेश', en: 'Madhya Pradesh' }, type: 'state' },
  { code: 'MH', name: { hi: 'महाराष्ट्र', en: 'Maharashtra' }, type: 'state' },
  { code: 'MN', name: { hi: 'मणिपुर', en: 'Manipur' }, type: 'state' },
  { code: 'ML', name: { hi: 'मेघालय', en: 'Meghalaya' }, type: 'state' },
  { code: 'MZ', name: { hi: 'मिजोरम', en: 'Mizoram' }, type: 'state' },
  { code: 'NL', name: { hi: 'नागालैंड', en: 'Nagaland' }, type: 'state' },
  { code: 'OR', name: { hi: 'ओडिशा', en: 'Odisha' }, type: 'state' },
  { code: 'PB', name: { hi: 'पंजाब', en: 'Punjab' }, type: 'state' },
  { code: 'RJ', name: { hi: 'राजस्थान', en: 'Rajasthan' }, type: 'state' },
  { code: 'SK', name: { hi: 'सिक्किम', en: 'Sikkim' }, type: 'state' },
  { code: 'TN', name: { hi: 'तमिलनाडु', en: 'Tamil Nadu' }, type: 'state' },
  { code: 'TG', name: { hi: 'तेलंगाना', en: 'Telangana' }, type: 'state' },
  { code: 'TR', name: { hi: 'त्रिपुरा', en: 'Tripura' }, type: 'state' },
  { code: 'UP', name: { hi: 'उत्तर प्रदेश', en: 'Uttar Pradesh' }, type: 'state' },
  { code: 'UT', name: { hi: 'उत्तराखंड', en: 'Uttarakhand' }, type: 'state' },
  { code: 'WB', name: { hi: 'पश्चिम बंगाल', en: 'West Bengal' }, type: 'state' },

  // Union Territories
  { code: 'AN', name: { hi: 'अंडमान और निकोबार द्वीप समूह', en: 'Andaman and Nicobar Islands' }, type: 'ut' },
  { code: 'CH', name: { hi: 'चंडीगढ़', en: 'Chandigarh' }, type: 'ut' },
  { code: 'DN', name: { hi: 'दादरा और नगर हवेली और दमन और दीव', en: 'Dadra and Nagar Haveli and Daman and Diu' }, type: 'ut' },
  { code: 'DL', name: { hi: 'दिल्ली', en: 'Delhi' }, type: 'ut' },
  { code: 'JK', name: { hi: 'जम्मू और कश्मीर', en: 'Jammu and Kashmir' }, type: 'ut' },
  { code: 'LA', name: { hi: 'लद्दाख', en: 'Ladakh' }, type: 'ut' },
  { code: 'LD', name: { hi: 'लक्षद्वीप', en: 'Lakshadweep' }, type: 'ut' },
  { code: 'PY', name: { hi: 'पुडुचेरी', en: 'Puducherry' }, type: 'ut' }
];

// Helper functions
export const getStateByCode = (code: string): IndianState | undefined => {
  return INDIAN_STATES.find(state => state.code === code);
};

export const getStatesByType = (type: 'state' | 'ut'): IndianState[] => {
  return INDIAN_STATES.filter(state => state.type === type);
};

export const getAllStatesForDropdown = (language: 'hi' | 'en' = 'hi') => {
  return INDIAN_STATES.map(state => ({
    code: state.code,
    name: state.name[language],
    type: state.type,
    urlSlug: state.code.toLowerCase()
  }));
};

export const getStateDisplayName = (code: string, language: 'hi' | 'en' = 'hi'): string => {
  const state = getStateByCode(code);
  return state ? state.name[language] : code;
};

// URL slug to state code mapping
export const getStateFromUrl = (urlSlug: string): string => {
  return urlSlug.toUpperCase();
};

export const getStateUrl = (code: string): string => {
  return code.toLowerCase();
};
