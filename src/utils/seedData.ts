import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Sample news articles for testing
const sampleArticles = [
  {
    title: "वायु प्रदूषण से निपटने के लिए सरकार ने जारी किए नए दिशानिर्देश",
    excerpt: "केंद्रीय पर्यावरण मंत्रालय ने आज वायु प्रदूषण से निपटने के लिए नए दिशानिर्देश जारी किए हैं।",
    content: "केंद्रीय पर्यावरण मंत्रालय ने आज वायु प्रदूषण से निपटने के लिए नए दिशानिर्देश जारी किए हैं। इन दिशानिर्देशों में वाहनों से होने वाले प्रदूषण को कम करने के उपाय शामिल हैं।",
    category: "देश",
    imageUrl: "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce",
    author: "अमन शर्मा",
    publishedAt: "2 घंटे पहले",
    featured: true,
    status: "published",
    tags: ["पर्यावरण", "प्रदूषण", "सरकार"],
    commentsCount: 15
  },
  {
    title: "नए कृषि कानूनों पर संसद में चर्चा",
    excerpt: "नए कृषि कानूनों पर संसद में आज विशेष चर्चा होगी। विपक्ष ने मुद्दे पर सरकार को घेरने की तैयारी की है।",
    content: "नए कृषि कानूनों पर संसद में आज विशेष चर्चा होगी। विपक्ष ने मुद्दे पर सरकार को घेरने की तैयारी की है। किसान संगठनों ने भी इस मुद्दे पर अपनी चिंता जताई है।",
    category: "राजनीति",
    imageUrl: "https://images.unsplash.com/photo-1579824250090-6c7b327993cf",
    author: "प्रिया गुप्ता",
    publishedAt: "1 घंटा पहले",
    featured: false,
    status: "published",
    tags: ["कृषि", "संसद", "राजनीति"],
    commentsCount: 8
  },
  {
    title: "भारतीय क्रिकेट टीम ने जीता मैच",
    excerpt: "भारतीय क्रिकेट टीम ने आज एक रोमांचक मैच में विरोधी टीम को हराया।",
    content: "भारतीय क्रिकेट टीम ने आज एक रोमांचक मैच में विरोधी टीम को 5 विकेट से हराया। कप्तान की शानदार पारी ने टीम को जीत दिलाई।",
    category: "खेल",
    imageUrl: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e",
    author: "राहुल सिंह",
    publishedAt: "3 घंटे पहले",
    featured: false,
    status: "published",
    tags: ["क्रिकेट", "खेल", "भारत"],
    commentsCount: 25
  },
  {
    title: "नई तकनीक से बदलेगा शिक्षा का भविष्य",
    excerpt: "आर्टिफिशियल इंटेलिजेंस और मशीन लर्निंग के उपयोग से शिक्षा क्षेत्र में क्रांति आने की उम्मीद है।",
    content: "आर्टिफिशियल इंटेलिजेंस और मशीन लर्निंग के उपयोग से शिक्षा क्षेत्र में क्रांति आने की उम्मीद है। नई तकनीकों से छात्रों को बेहतर शिक्षा मिल सकेगी।",
    category: "तकनीक",
    imageUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e",
    author: "डॉ. सुनीता शर्मा",
    publishedAt: "4 घंटे पहले",
    featured: true,
    status: "published",
    tags: ["तकनीक", "शिक्षा", "AI"],
    commentsCount: 12
  },
  {
    title: "बॉलीवुड की नई फिल्म ने तोड़े रिकॉर्ड",
    excerpt: "इस सप्ताह रिलीज हुई नई फिल्म ने बॉक्स ऑफिस पर धमाल मचाया है।",
    content: "इस सप्ताह रिलीज हुई नई फिल्म ने बॉक्स ऑफिस पर धमाल मचाया है। पहले दिन ही फिल्म ने 50 करोड़ का कारोबार किया।",
    category: "मनोरंजन",
    imageUrl: "https://images.unsplash.com/photo-1478720568477-152d9b164e26",
    author: "अनिल कुमार",
    publishedAt: "5 घंटे पहले",
    featured: false,
    status: "published",
    tags: ["बॉलीवुड", "फिल्म", "मनोरंजन"],
    commentsCount: 30
  }
];

// Sample gallery images
const sampleGallery = [
  {
    imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
    caption: "हिमालय की खूबसूरत वादियां"
  },
  {
    imageUrl: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da",
    caption: "भारतीय संस्कृति का प्रतीक"
  },
  {
    imageUrl: "https://images.unsplash.com/photo-1598977123118-4e30ba3c4f4b",
    caption: "केरल के बैकवाटर्स की शांति"
  }
];

// Sample videos
const sampleVideos = [
  {
    title: "प्रधानमंत्री से विशेष बातचीत",
    thumbnailUrl: "https://images.unsplash.com/photo-1495020689067-958852a7765e",
    videoUrl: "https://example.com/video1.mp4",
    duration: "12:45",
    publishedAt: "2 घंटे पहले"
  },
  {
    title: "नया स्वास्थ्य बिल और इसका प्रभाव",
    thumbnailUrl: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528",
    videoUrl: "https://example.com/video2.mp4",
    duration: "8:32",
    publishedAt: "5 घंटे पहले"
  }
];

// Sample breaking news
const sampleBreakingNews = [
  {
    title: "प्रधानमंत्री ने की 2 लाख करोड़ रुपये के विकास पैकेज की घोषणा",
    isActive: true,
    priority: 1
  },
  {
    title: "उत्तर भारत में भूकंप के झटके, रिक्टर पैमाने पर तीव्रता 5.8 मापी गई",
    isActive: true,
    priority: 2
  }
];

export const seedDatabase = async () => {
  try {
    console.log('Starting database seeding...');

    // Add sample news articles
    console.log('Adding sample news articles...');
    for (const article of sampleArticles) {
      await addDoc(collection(db, 'news'), {
        ...article,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    // Add sample gallery images
    console.log('Adding sample gallery images...');
    for (const image of sampleGallery) {
      await addDoc(collection(db, 'gallery'), {
        ...image,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    // Add sample videos
    console.log('Adding sample videos...');
    for (const video of sampleVideos) {
      await addDoc(collection(db, 'videos'), {
        ...video,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    // Add sample breaking news
    console.log('Adding sample breaking news...');
    for (const news of sampleBreakingNews) {
      await addDoc(collection(db, 'breakingNews'), {
        ...news,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    console.log('Database seeding completed successfully!');
    return true;
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
};
