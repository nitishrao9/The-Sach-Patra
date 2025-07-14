// Translation service for article content using Google Translate API
interface TranslationCache {
  [key: string]: {
    [lang: string]: string;
  };
}

// Translation cache to avoid repeated API calls
const translationCache: TranslationCache = {};

// Google Translate API service
export class TranslationService {
  private static instance: TranslationService;
  private cache: TranslationCache = {};
  private apiKey: string = ''; // You'll need to set this

  static getInstance(): TranslationService {
    if (!TranslationService.instance) {
      TranslationService.instance = new TranslationService();
    }
    return TranslationService.instance;
  }

  // Set API key (call this in your app initialization)
  setApiKey(key: string) {
    this.apiKey = key;
  }

  // Simple client-side translation using Google Translate (free tier)
  async translateText(text: string, targetLang: 'hi' | 'en', sourceLang: 'hi' | 'en' = 'hi'): Promise<string> {
    // If target and source are same, return original
    if (targetLang === sourceLang) {
      return text;
    }

    // Check cache first
    const cacheKey = `${text}_${sourceLang}_${targetLang}`;
    if (this.cache[cacheKey]) {
      return this.cache[cacheKey][targetLang];
    }

    try {
      // For demo purposes, we'll use a simple mapping for common words
      // In production, you would use Google Translate API or similar service
      const translatedText = await this.performTranslation(text, targetLang, sourceLang);
      
      // Cache the result
      if (!this.cache[cacheKey]) {
        this.cache[cacheKey] = {};
      }
      this.cache[cacheKey][targetLang] = translatedText;
      
      return translatedText;
    } catch (error) {
      console.error('Translation error:', error);
      return text; // Return original text if translation fails
    }
  }

  private async performTranslation(text: string, targetLang: 'hi' | 'en', sourceLang: 'hi' | 'en'): Promise<string> {
    // Try to detect if text is already in target language
    if (this.isTextInLanguage(text, targetLang)) {
      return text;
    }

    try {
      // Use Google Translate API via free endpoint
      const response = await fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`
      );

      if (response.ok) {
        const result = await response.json();
        if (result && result[0] && result[0][0] && result[0][0][0]) {
          return result[0][0][0];
        }
      }
    } catch (error) {
      console.warn('Google Translate API failed, falling back to word mapping:', error);
    }

    // Fallback to word mapping if API fails
    if (sourceLang === 'hi' && targetLang === 'en') {
      return this.hindiToEnglish(text);
    } else if (sourceLang === 'en' && targetLang === 'hi') {
      return this.englishToHindi(text);
    }

    return text;
  }

  private isTextInLanguage(text: string, lang: 'hi' | 'en'): boolean {
    if (lang === 'hi') {
      // Check if text contains Devanagari characters
      return /[\u0900-\u097F]/.test(text);
    } else {
      // Check if text is primarily Latin characters
      return /^[a-zA-Z0-9\s.,!?;:'"()-]+$/.test(text.trim());
    }
  }

  private hindiToEnglish(text: string): string {
    // Simple word mapping for demo - replace with actual API call
    const translations: { [key: string]: string } = {
      // News content
      'वायु प्रदूषण': 'Air Pollution',
      'सरकार': 'Government',
      'नए दिशानिर्देश': 'New Guidelines',
      'केंद्रीय पर्यावरण मंत्रालय': 'Central Environment Ministry',
      'आज': 'Today',
      'जारी किए': 'Issued',
      'हैं': 'Have',
      'इन': 'These',
      'दिशानिर्देशों': 'Guidelines',
      'में': 'In',
      'वाहनों': 'Vehicles',
      'से': 'From',
      'होने': 'Happening',
      'वाले': 'Related',
      'प्रदूषण': 'Pollution',
      'को': 'To',
      'कम': 'Reduce',
      'करने': 'Doing',
      'के': 'Of',
      'उपाय': 'Measures',
      'शामिल': 'Included',

      // Places
      'भारत': 'India',
      'देश': 'Country',
      'राज्य': 'State',
      'नई दिल्ली': 'New Delhi',
      'मुंबई': 'Mumbai',
      'कोलकाता': 'Kolkata',
      'चेन्नई': 'Chennai',
      'बेंगलुरु': 'Bangalore',
      'हैदराबाद': 'Hyderabad',
      'पुणे': 'Pune',
      'अहमदाबाद': 'Ahmedabad',
      'जयपुर': 'Jaipur',
      'लखनऊ': 'Lucknow',

      // People & Positions
      'मुख्यमंत्री': 'Chief Minister',
      'प्रधानमंत्री': 'Prime Minister',
      'राष्ट्रपति': 'President',
      'मंत्री': 'Minister',
      'नेता': 'Leader',
      'अधिकारी': 'Officer',

      // Common words
      'और': 'And',
      'या': 'Or',
      'लेकिन': 'But',
      'क्योंकि': 'Because',
      'जब': 'When',
      'तब': 'Then',
      'यह': 'This',
      'वह': 'That',
      'कहा': 'Said',
      'किया': 'Did',
      'होगा': 'Will be',
      'था': 'Was',
      'है': 'Is',
      'थे': 'Were',
      'गए': 'Went',
      'गई': 'Went',
      'दिया': 'Given',
      'लिया': 'Taken',
      'आया': 'Came',
      'गया': 'Went',
      'रहा': 'Staying',
      'रही': 'Staying',
      'रहे': 'Staying'
    };

    let translatedText = text;
    
    // Replace Hindi words with English equivalents
    Object.entries(translations).forEach(([hindi, english]) => {
      const regex = new RegExp(hindi, 'g');
      translatedText = translatedText.replace(regex, english);
    });

    return translatedText;
  }

  private englishToHindi(text: string): string {
    // Simple word mapping for demo - replace with actual API call
    const translations: { [key: string]: string } = {
      // News content
      'Air Pollution': 'वायु प्रदूषण',
      'Government': 'सरकार',
      'New Guidelines': 'नए दिशानिर्देश',
      'Central Environment Ministry': 'केंद्रीय पर्यावरण मंत्रालय',
      'Today': 'आज',
      'Issued': 'जारी किए',
      'Have': 'हैं',
      'These': 'इन',
      'Guidelines': 'दिशानिर्देश',
      'In': 'में',
      'Vehicles': 'वाहनों',
      'From': 'से',
      'Happening': 'होने',
      'Related': 'वाले',
      'Pollution': 'प्रदूषण',
      'To': 'को',
      'Reduce': 'कम',
      'Doing': 'करने',
      'Of': 'के',
      'Measures': 'उपाय',
      'Included': 'शामिल',

      // Places
      'India': 'भारत',
      'Country': 'देश',
      'State': 'राज्य',
      'New Delhi': 'नई दिल्ली',
      'Mumbai': 'मुंबई',
      'Kolkata': 'कोलकाता',
      'Chennai': 'चेन्नई',
      'Bangalore': 'बेंगलुरु',
      'Hyderabad': 'हैदराबाद',
      'Pune': 'पुणे',
      'Ahmedabad': 'अहमदाबाद',
      'Jaipur': 'जयपुर',
      'Lucknow': 'लखनऊ',

      // People & Positions
      'Chief Minister': 'मुख्यमंत्री',
      'Prime Minister': 'प्रधानमंत्री',
      'President': 'राष्ट्रपति',
      'Minister': 'मंत्री',
      'Leader': 'नेता',
      'Officer': 'अधिकारी',

      // Common words
      'And': 'और',
      'Or': 'या',
      'But': 'लेकिन',
      'Because': 'क्योंकि',
      'When': 'जब',
      'Then': 'तब',
      'This': 'यह',
      'That': 'वह',
      'Said': 'कहा',
      'Did': 'किया',
      'Will be': 'होगा',
      'Was': 'था',
      'Is': 'है',
      'Were': 'थे',
      'Went': 'गए',
      'Given': 'दिया',
      'Taken': 'लिया',
      'Came': 'आया',
      'Staying': 'रहा'
    };

    let translatedText = text;
    
    // Replace English words with Hindi equivalents
    Object.entries(translations).forEach(([english, hindi]) => {
      const regex = new RegExp(english, 'gi');
      translatedText = translatedText.replace(regex, hindi);
    });

    return translatedText;
  }

  // Translate article object
  async translateArticle(article: any, targetLang: 'hi' | 'en'): Promise<any> {
    const sourceLang = targetLang === 'hi' ? 'en' : 'hi';
    
    try {
      const [translatedTitle, translatedExcerpt, translatedContent] = await Promise.all([
        this.translateText(article.title, targetLang, sourceLang),
        this.translateText(article.excerpt, targetLang, sourceLang),
        this.translateText(article.content, targetLang, sourceLang)
      ]);

      return {
        ...article,
        title: translatedTitle,
        excerpt: translatedExcerpt,
        content: translatedContent
      };
    } catch (error) {
      console.error('Error translating article:', error);
      return article; // Return original if translation fails
    }
  }
}

export const translationService = TranslationService.getInstance();
