import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation resources
const resources = {
  hi: {
    translation: {
      // Navigation
      "latest_news": "ताज़ा खबरें",
      "national": "देश",
      "international": "विदेश",
      "politics": "राजनीति",
      "sports": "खेल",
      "entertainment": "मनोरंजन",
      "technology": "तकनीक",
      "business": "व्यापार",
      "education": "शिक्षा",
      "agriculture": "कृषि",
      "special": "विशेष",
      
      // Common UI
      "search": "खोजें",
      "home": "होम",
      "about": "हमारे बारे में",
      "contact": "संपर्क",
      "more_news": "और समाचार",
      "view_more": "और {{category}} समाचार देखें",
      "read_more": "और पढ़ें",
      "back": "वापस जाएं",
      "retry": "पुनः प्रयास करें",
      "loading": "लोड हो रहा है...",
      "journalist": "पत्रकार",
      "tags": "टैग्स",
      "share": "शेयर करें",
      
      // Error messages
      "error_loading_data": "डेटा लोड करने में त्रुटि",
      "error_loading_news": "समाचार लोड करने में त्रुटि",
      "error_loading_article": "लेख लोड करने में त्रुटि",
      "error_loading_featured": "मुख्य समाचार लोड करने में त्रुटि",
      "error_loading_categories": "श्रेणीबद्ध समाचार लोड करने में त्रुटि",
      "error_loading_videos": "वीडियो लोड करने में त्रुटि",
      "error_loading_gallery": "गैलरी इमेज लोड करने में त्रुटि",
      "error_loading_tags": "ट्रेंडिंग टैग लोड करने में त्रुटि",
      "news_not_found": "समाचार नहीं मिला",
      "news_not_available": "आपके द्वारा खोजा गया समाचार उपलब्ध नहीं है।",
      "no_news_in_category": "इस श्रेणी में कोई समाचार नहीं है।",
      
      // Time
      "hours_ago": "{{count}} घंटे पहले",
      "minutes_ago": "{{count}} मिनट पहले",
      "days_ago": "{{count}} दिन पहले",
      "just_now": "अभी",
      
      // Sections
      "breaking_news": "ब्रेकिंग न्यूज़",
      "featured_news": "मुख्य समाचार",
      "trending": "ट्रेंडिंग",
      "videos": "वीडियो",
      "photo_gallery": "फोटो गैलरी",
      "gallery_title": "तस्वीरों में",
      
      // Newsletter
      "newsletter_title": "न्यूज़लेटर सब्सक्रिप्शन",
      "newsletter_description": "ताज़ा खबरों के लिए हमारे न्यूज़लेटर की सदस्यता लें",
      "email_placeholder": "आपका ईमेल पता",
      "subscribe": "सदस्यता लें",
      "subscribing": "सब्सक्राइब हो रहा है...",
      "subscribed": "सब्सक्राइब हो गया!",
      
      // Language
      "language": "भाषा",
      "hindi": "हिंदी",
      "english": "English",

      // Categories (for consistency)
      "latest": "ताज़ा खबरें",
      "national": "देश",
      "international": "विदेश",
      "politics": "राजनीति",
      "sports": "खेल",
      "entertainment": "मनोरंजन",
      "technology": "तकनीक",
      "business": "व्यापार",
      "education": "शिक्षा",
      "agriculture": "कृषि",
      "special": "विशेष"
    }
  },
  en: {
    translation: {
      // Navigation
      "latest_news": "Latest News",
      "national": "National",
      "international": "International",
      "politics": "Politics",
      "sports": "Sports",
      "entertainment": "Entertainment",
      "technology": "Technology",
      "business": "Business",
      "education": "Education",
      "agriculture": "Agriculture",
      "special": "Special Reports",
      
      // Common UI
      "search": "Search",
      "home": "Home",
      "about": "About Us",
      "contact": "Contact",
      "more_news": "More News",
      "view_more": "View More {{category}} News",
      "read_more": "Read More",
      "back": "Go Back",
      "retry": "Try Again",
      "loading": "Loading...",
      "journalist": "Journalist",
      "tags": "Tags",
      "share": "Share",
      
      // Error messages
      "error_loading_data": "Error Loading Data",
      "error_loading_news": "Error Loading News",
      "error_loading_article": "Error Loading Article",
      "error_loading_featured": "Error Loading Featured News",
      "error_loading_categories": "Error Loading Categorized News",
      "error_loading_videos": "Error Loading Videos",
      "error_loading_gallery": "Error Loading Gallery Images",
      "error_loading_tags": "Error Loading Trending Tags",
      "news_not_found": "News Not Found",
      "news_not_available": "The news article you are looking for is not available.",
      "no_news_in_category": "No news available in this category.",
      
      // Time
      "hours_ago": "{{count}} hours ago",
      "minutes_ago": "{{count}} minutes ago", 
      "days_ago": "{{count}} days ago",
      "just_now": "Just now",
      
      // Sections
      "breaking_news": "Breaking News",
      "featured_news": "Featured News",
      "trending": "Trending",
      "videos": "Videos",
      "photo_gallery": "Photo Gallery",
      "gallery_title": "In Pictures",
      
      // Newsletter
      "newsletter_title": "Newsletter Subscription",
      "newsletter_description": "Subscribe to our newsletter for latest news updates",
      "email_placeholder": "Your email address",
      "subscribe": "Subscribe",
      "subscribing": "Subscribing...",
      "subscribed": "Subscribed!",
      
      // Language
      "language": "Language",
      "hindi": "हिंदी",
      "english": "English",

      // Categories (for consistency)
      "latest": "Latest News",
      "national": "National",
      "international": "International",
      "politics": "Politics",
      "sports": "Sports",
      "entertainment": "Entertainment",
      "technology": "Technology",
      "business": "Business",
      "special": "Special Reports"
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'hi', // Default to Hindi
    lng: 'hi', // Set Hindi as default
    debug: false,
    
    interpolation: {
      escapeValue: false
    },
    
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  });

export default i18n;
