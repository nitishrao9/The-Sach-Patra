// Category mappings for consistent URL handling across the application

// Master category list - stored in English in database
export const CATEGORIES = {
  LATEST: "latest",
  NATIONAL: "national",
  INTERNATIONAL: "international",
  POLITICS: "politics",
  SPORTS: "sports",
  ENTERTAINMENT: "entertainment",
  TECHNOLOGY: "technology",
  BUSINESS: "business",
  EDUCATION: "education",
  AGRICULTURE: "agriculture",
  SPECIAL: "special"
} as const;

// State-based news support
export const isStateBasedCategory = (category: string): boolean => {
  return category === CATEGORIES.NATIONAL;
};

// Category display names for different languages
export const CATEGORY_TRANSLATIONS = {
  [CATEGORIES.LATEST]: {
    hi: "ताज़ा खबरें",
    en: "Latest News"
  },
  [CATEGORIES.NATIONAL]: {
    hi: "देश",
    en: "National"
  },
  [CATEGORIES.INTERNATIONAL]: {
    hi: "विदेश",
    en: "International"
  },
  [CATEGORIES.POLITICS]: {
    hi: "राजनीति",
    en: "Politics"
  },
  [CATEGORIES.SPORTS]: {
    hi: "खेल",
    en: "Sports"
  },
  [CATEGORIES.ENTERTAINMENT]: {
    hi: "मनोरंजन",
    en: "Entertainment"
  },
  [CATEGORIES.TECHNOLOGY]: {
    hi: "तकनीक",
    en: "Technology"
  },
  [CATEGORIES.BUSINESS]: {
    hi: "व्यापार",
    en: "Business"
  },
  [CATEGORIES.EDUCATION]: {
    hi: "शिक्षा",
    en: "Education"
  },
  [CATEGORIES.AGRICULTURE]: {
    hi: "कृषि",
    en: "Agriculture"
  },
  [CATEGORIES.SPECIAL]: {
    hi: "विशेष",
    en: "Special Reports"
  }
};

// URL slug to category mapping
export const URL_TO_CATEGORY: Record<string, string> = {
  "latest": CATEGORIES.LATEST,
  "national": CATEGORIES.NATIONAL,
  "international": CATEGORIES.INTERNATIONAL,
  "politics": CATEGORIES.POLITICS,
  "sports": CATEGORIES.SPORTS,
  "entertainment": CATEGORIES.ENTERTAINMENT,
  "technology": CATEGORIES.TECHNOLOGY,
  "business": CATEGORIES.BUSINESS,
  "education": CATEGORIES.EDUCATION,
  "agriculture": CATEGORIES.AGRICULTURE,
  "special-reports": CATEGORIES.SPECIAL
};

// Helper function to get URL slug from category
export const getCategoryUrl = (category: string): string => {
  // If it's already a URL slug, return it
  if (Object.values(URL_TO_CATEGORY).includes(category)) {
    const urlSlug = Object.keys(URL_TO_CATEGORY).find(key => URL_TO_CATEGORY[key] === category);
    return urlSlug || 'latest';
  }

  // If it's a Hindi category name, find the corresponding English category
  const englishCategory = Object.keys(CATEGORY_TRANSLATIONS).find(key =>
    CATEGORY_TRANSLATIONS[key as keyof typeof CATEGORY_TRANSLATIONS].hi === category
  );

  if (englishCategory) {
    const urlSlug = Object.keys(URL_TO_CATEGORY).find(key => URL_TO_CATEGORY[key] === englishCategory);
    return urlSlug || 'latest';
  }

  // For custom categories, convert to URL-friendly slug
  if (category && category !== 'latest') {
    return category.toLowerCase().replace(/\s+/g, '-');
  }

  return 'latest';
};

// Helper function to get category from URL slug
export const getCategoryFromUrl = (urlSlug: string): string => {
  // Check predefined mappings first
  if (URL_TO_CATEGORY[urlSlug]) {
    return URL_TO_CATEGORY[urlSlug];
  }

  // For custom categories, convert URL slug back to category name
  if (urlSlug && urlSlug !== 'latest') {
    return urlSlug.replace(/-/g, ' ');
  }

  return CATEGORIES.LATEST;
};

// Helper function to get localized category name
export const getCategoryDisplayName = (category: string, language: 'hi' | 'en' = 'hi'): string => {
  // If category is a URL slug, convert to category first
  const actualCategory = URL_TO_CATEGORY[category] || category;

  const translation = CATEGORY_TRANSLATIONS[actualCategory as keyof typeof CATEGORY_TRANSLATIONS];
  return translation ? translation[language] : category;
};

// Helper function to get all categories for dropdowns/lists
export const getAllCategories = (language: 'hi' | 'en' = 'hi', customCategories: string[] = []) => {
  const defaultCategories = Object.keys(CATEGORY_TRANSLATIONS)
    .filter(category => category !== CATEGORIES.LATEST) // Exclude "latest" from navigation
    .map(category => ({
      value: category,
      label: CATEGORY_TRANSLATIONS[category as keyof typeof CATEGORY_TRANSLATIONS][language],
      urlSlug: getCategoryUrl(category)
    }));

  // Add custom categories
  const customCategoryItems = customCategories.map(category => ({
    value: category,
    label: category, // Custom categories are stored in English, display as-is for now
    urlSlug: category.toLowerCase().replace(/\s+/g, '-')
  }));

  return [...defaultCategories, ...customCategoryItems];
};

// Helper function for Firebase queries (returns English category for consistency)
export const getFirebaseCategory = (urlSlug: string): string => {
  if (urlSlug === 'latest') return ''; // Empty means get all

  // Check predefined mappings first
  if (URL_TO_CATEGORY[urlSlug]) {
    return URL_TO_CATEGORY[urlSlug];
  }

  // For custom categories, convert URL slug back to category name
  if (urlSlug && urlSlug !== 'latest') {
    return urlSlug.replace(/-/g, ' ');
  }

  return '';
};

// Helper function to convert Hindi category to English
export const convertHindiToEnglish = (hindiCategory: string): string => {
  const hindiToEnglishMap: Record<string, string> = {
    "ताज़ा खबरें": CATEGORIES.LATEST,
    "देश": CATEGORIES.NATIONAL,
    "विदेश": CATEGORIES.INTERNATIONAL,
    "राजनीति": CATEGORIES.POLITICS,
    "खेल": CATEGORIES.SPORTS,
    "मनोरंजन": CATEGORIES.ENTERTAINMENT,
    "तकनीक": CATEGORIES.TECHNOLOGY,
    "व्यापार": CATEGORIES.BUSINESS,
    "शिक्षा": CATEGORIES.EDUCATION,
    "कृषि": CATEGORIES.AGRICULTURE,
    "विशेष": CATEGORIES.SPECIAL
  };

  return hindiToEnglishMap[hindiCategory] || hindiCategory;
};

// Helper function to convert English category to Hindi
export const convertEnglishToHindi = (englishCategory: string): string => {
  const englishToHindiMap: Record<string, string> = {
    [CATEGORIES.LATEST]: "ताज़ा खबरें",
    [CATEGORIES.NATIONAL]: "देश",
    [CATEGORIES.INTERNATIONAL]: "विदेश",
    [CATEGORIES.POLITICS]: "राजनीति",
    [CATEGORIES.SPORTS]: "खेल",
    [CATEGORIES.ENTERTAINMENT]: "मनोरंजन",
    [CATEGORIES.TECHNOLOGY]: "तकनीक",
    [CATEGORIES.BUSINESS]: "व्यापार",
    [CATEGORIES.EDUCATION]: "शिक्षा",
    [CATEGORIES.AGRICULTURE]: "कृषि",
    [CATEGORIES.SPECIAL]: "विशेष"
  };

  return englishToHindiMap[englishCategory] || englishCategory;
};

// Helper function to convert old Hindi categories to new English format
export const convertLegacyCategory = (oldCategory: string): string => {
  const mapping: Record<string, string> = {
    "ताज़ा खबरें": CATEGORIES.LATEST,
    "देश": CATEGORIES.NATIONAL,
    "विदेश": CATEGORIES.INTERNATIONAL,
    "राजनीति": CATEGORIES.POLITICS,
    "खेल": CATEGORIES.SPORTS,
    "मनोरंजन": CATEGORIES.ENTERTAINMENT,
    "तकनीक": CATEGORIES.TECHNOLOGY,
    "व्यापार": CATEGORIES.BUSINESS,
    "विशेष": CATEGORIES.SPECIAL
  };

  return mapping[oldCategory] || oldCategory;
};

// Helper function to get localized category name
export const getLocalizedCategoryName = (hindiCategory: string, t: (key: string) => string): string => {
  const categoryKeyMap: Record<string, string> = {
    "ताज़ा खबरें": "latest_news",
    "देश": "national",
    "विदेश": "international",
    "राजनीति": "politics",
    "खेल": "sports",
    "मनोरंजन": "entertainment",
    "तकनीक": "technology",
    "व्यापार": "business",
    "शिक्षा": "education",
    "कृषि": "agriculture",
    "विशेष": "special"
  };

  const key = categoryKeyMap[hindiCategory];
  return key ? t(key) : hindiCategory;
};
