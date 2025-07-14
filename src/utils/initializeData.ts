import { collection, addDoc, doc, setDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { latestNews } from '@/lib/mock-data';
import { ROLE_LEVELS } from '@/types';

// Initialize comprehensive news data
export const initializeNewsData = async () => {
  try {
    console.log('Initializing comprehensive news data...');

    const comprehensiveNewsData = [
      // देश (National) News
      {
        title: 'भारत में नई तकनीकी क्रांति का आगाज',
        excerpt: 'भारत में आर्टिफिशियल इंटेलिजेंस और मशीन लर्निंग के क्षेत्र में नई उपलब्धियां हासिल की गई हैं',
        content: 'भारत में तकनीकी क्षेत्र में एक नई क्रांति आई है। आर्टिफिशियल इंटेलिजेंस और मशीन लर्निंग के क्षेत्र में भारतीय कंपनियों ने उल्लेखनीय प्रगति की है। स्टार्टअप्स से लेकर बड़ी कंपनियों तक सभी इस नई तकनीक को अपना रहे हैं। यह भारत के डिजिटल भविष्य के लिए एक महत्वपूर्ण कदम है। इस क्षेत्र में भारत विश्व में अग्रणी बनने की दिशा में तेजी से आगे बढ़ रहा है।',
        category: 'देश',
        imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800',
        author: 'राहुल शर्मा',
        publishedAt: new Date('2024-01-15').toLocaleString(),
        featured: true,
        commentsCount: 45,
        tags: ['तकनीक', 'AI', 'भारत', 'डिजिटल'],
        status: 'published' as const,
        views: 1250,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15')
      },
      {
        title: 'नई शिक्षा नीति का सफल क्रियान्वयन',
        excerpt: 'देश भर में नई शिक्षा नीति के तहत शैक्षणिक सुधार हो रहे हैं',
        content: 'भारत की नई शिक्षा नीति 2020 का क्रियान्वयन सफलतापूर्वक हो रहा है। विभिन्न राज्यों में इसके सकारात्मक परिणाम देखने को मिल रहे हैं। छात्रों के लिए नए अवसर और बेहतर शिक्षा व्यवस्था का निर्माण हो रहा है। इस नीति से भारत की शिक्षा व्यवस्था में आमूलचूल परिवर्तन आने की उम्मीद है।',
        category: 'देश',
        imageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800',
        author: 'प्रिया गुप्ता',
        publishedAt: new Date('2024-01-14').toLocaleString(),
        featured: false,
        commentsCount: 32,
        tags: ['शिक्षा', 'नीति', 'सुधार'],
        status: 'published' as const,
        views: 890,
        createdAt: new Date('2024-01-14'),
        updatedAt: new Date('2024-01-14')
      },

      // खेल (Sports) News
      {
        title: 'क्रिकेट विश्व कप की तैयारियां जोरों पर',
        excerpt: 'भारतीय क्रिकेट टीम विश्व कप के लिए जोरदार तैयारी कर रही है',
        content: 'आगामी क्रिकेट विश्व कप के लिए भारतीय टीम की तैयारियां जोरों पर हैं। कप्तान और कोच ने टीम की रणनीति पर विस्तार से चर्चा की है। नए खिलाड़ियों का चयन और अनुभवी खिलाड़ियों की फिटनेस पर विशेष ध्यान दिया जा रहा है। टीम इंडिया का लक्ष्य इस बार विश्व कप जीतना है।',
        category: 'खेल',
        imageUrl: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800',
        author: 'अमित कुमार',
        publishedAt: new Date('2024-01-13').toLocaleString(),
        featured: true,
        commentsCount: 67,
        tags: ['क्रिकेट', 'विश्व कप', 'खेल', 'भारत'],
        status: 'published' as const,
        views: 1890,
        createdAt: new Date('2024-01-13'),
        updatedAt: new Date('2024-01-13')
      },
      {
        title: 'ओलंपिक में भारत की बेहतर तैयारी',
        excerpt: 'आगामी ओलंपिक खेलों के लिए भारतीय एथलीटों की तैयारी',
        content: 'भारतीय एथलीट आगामी ओलंपिक खेलों के लिए कड़ी मेहनत कर रहे हैं। सरकार द्वारा खेल सुविधाओं में सुधार और एथलीटों को बेहतर प्रशिक्षण दिया जा रहा है। इस बार भारत से मेडल की उम्मीदें काफी बढ़ी हैं।',
        category: 'खेल',
        imageUrl: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800',
        author: 'सुनीता देवी',
        publishedAt: new Date('2024-01-12').toLocaleString(),
        featured: false,
        commentsCount: 23,
        tags: ['ओलंपिक', 'एथलीट', 'प्रशिक्षण'],
        status: 'published' as const,
        views: 654,
        createdAt: new Date('2024-01-12'),
        updatedAt: new Date('2024-01-12')
      },

      // व्यापार (Business) News
      {
        title: 'भारतीय अर्थव्यवस्था में नई उमंग',
        excerpt: 'GDP वृद्धि दर में सुधार और नए निवेश के अवसर',
        content: 'भारतीय अर्थव्यवस्था में सकारात्मक बदलाव देखने को मिल रहे हैं। GDP की वृद्धि दर में सुधार हुआ है और विदेशी निवेशकों का भरोसा बढ़ा है। नई औद्योगिक नीतियों का सकारात्मक प्रभाव दिख रहा है। भारत विश्व की सबसे तेजी से बढ़ती अर्थव्यवस्थाओं में से एक है।',
        category: 'व्यापार',
        imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800',
        author: 'विकास अग्रवाल',
        publishedAt: new Date('2024-01-11').toLocaleString(),
        featured: true,
        commentsCount: 41,
        tags: ['अर्थव्यवस्था', 'GDP', 'निवेश'],
        status: 'published' as const,
        views: 1123,
        createdAt: new Date('2024-01-11'),
        updatedAt: new Date('2024-01-11')
      },

      // तकनीक (Technology) News
      {
        title: '5G नेटवर्क का विस्तार तेज गति से',
        excerpt: 'भारत में 5G नेटवर्क का तेजी से विस्तार हो रहा है',
        content: 'भारत में 5G नेटवर्क का रोलआउट तेज गति से हो रहा है। प्रमुख शहरों में 5G सेवा शुरू हो चुकी है और जल्द ही छोटे शहरों में भी यह सुविधा उपलब्ध होगी। इससे डिजिटल इंडिया के सपने को साकार करने में मदद मिलेगी।',
        category: 'तकनीक',
        imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
        author: 'तेजस पटेल',
        publishedAt: new Date('2024-01-10').toLocaleString(),
        featured: false,
        commentsCount: 34,
        tags: ['5G', 'नेटवर्क', 'डिजिटल'],
        status: 'published' as const,
        views: 987,
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-10')
      },

      // मनोरंजन (Entertainment) News
      {
        title: 'बॉलीवुड में नई फिल्मों की धूम',
        excerpt: 'इस साल रिलीज होने वाली प्रमुख बॉलीवुड फिल्में',
        content: 'बॉलीवुड में इस साल कई बड़ी फिल्में रिलीज होने वाली हैं। दर्शकों को विभिन्न विधाओं की फिल्में देखने को मिलेंगी। नए निर्देशकों और अभिनेताओं के साथ-साथ अनुभवी कलाकार भी नजर आएंगे।',
        category: 'मनोरंजन',
        imageUrl: 'https://images.unsplash.com/photo-1489599735734-79b4afd47c06?w=800',
        author: 'अनिता शर्मा',
        publishedAt: new Date('2024-01-09').toLocaleString(),
        featured: false,
        commentsCount: 28,
        tags: ['बॉलीवुड', 'फिल्म', 'मनोरंजन'],
        status: 'published' as const,
        views: 756,
        createdAt: new Date('2024-01-09'),
        updatedAt: new Date('2024-01-09')
      },

      // विदेश (International) News
      {
        title: 'भारत की अंतर्राष्ट्रीय कूटनीति में सफलता',
        excerpt: 'विश्व मंच पर भारत की बढ़ती साख और नई साझेदारियां',
        content: 'अंतर्राष्ट्रीय मंच पर भारत की स्थिति मजबूत हो रही है। विभिन्न देशों के साथ नई साझेदारियां और व्यापारिक समझौते हो रहे हैं। G20 की अध्यक्षता में भारत ने अपनी कूटनीतिक क्षमता का परिचय दिया है।',
        category: 'विदेश',
        imageUrl: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=800',
        author: 'दीपक मिश्रा',
        publishedAt: new Date('2024-01-08').toLocaleString(),
        featured: true,
        commentsCount: 52,
        tags: ['कूटनीति', 'अंतर्राष्ट्रीय', 'G20'],
        status: 'published' as const,
        views: 1456,
        createdAt: new Date('2024-01-08'),
        updatedAt: new Date('2024-01-08')
      },

      // Draft Articles
      {
        title: 'पर्यावरण संरक्षण की नई पहल',
        excerpt: 'सरकार की नई पर्यावरण नीति और हरित ऊर्जा के प्रयास',
        content: 'भारत सरकार ने पर्यावरण संरक्षण के लिए नई नीतियां बनाई हैं। हरित ऊर्जा के क्षेत्र में निवेश बढ़ाया जा रहा है और कार्बन उत्सर्जन कम करने के लिए ठोस कदम उठाए जा रहे हैं।',
        category: 'देश',
        imageUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800',
        author: 'रीता सिंह',
        publishedAt: new Date('2024-01-07').toLocaleString(),
        featured: false,
        commentsCount: 0,
        tags: ['पर्यावरण', 'हरित ऊर्जा', 'संरक्षण'],
        status: 'draft' as const,
        views: 0,
        createdAt: new Date('2024-01-07'),
        updatedAt: new Date('2024-01-07')
      },

      {
        title: 'स्वास्थ्य सेवाओं में डिजिटल क्रांति',
        excerpt: 'टेलीमेडिसिन और डिजिटल स्वास्थ्य सेवाओं का विस्तार',
        content: 'भारत में स्वास्थ्य सेवाओं में डिजिटल तकनीक का उपयोग बढ़ रहा है। टेलीमेडिसिन सेवाओं से दूरदराज के इलाकों में भी बेहतर स्वास्थ्य सुविधा मिल रही है।',
        category: 'तकनीक',
        imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800',
        author: 'डॉ. अजय वर्मा',
        publishedAt: new Date('2024-01-06').toLocaleString(),
        featured: false,
        commentsCount: 0,
        tags: ['स्वास्थ्य', 'टेलीमेडिसिन', 'डिजिटल'],
        status: 'draft' as const,
        views: 0,
        createdAt: new Date('2024-01-06'),
        updatedAt: new Date('2024-01-06')
      }
    ];

    for (const article of comprehensiveNewsData) {
      await addDoc(collection(db, 'news'), article);
    }

    console.log('Comprehensive news data initialized successfully');
  } catch (error) {
    console.error('Error initializing news data:', error);
  }
};

// Initialize sample advertisement data
export const initializeAdData = async () => {
  try {
    console.log('Initializing advertisement data...');
    
    const sampleAds = [
      {
        title: 'Header Banner Ad',
        imageUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&h=200&fit=crop',
        linkUrl: 'https://example.com/header-ad',
        position: 'header' as const,
        isActive: true,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        clickCount: 0,
        impressionCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Sidebar Tech Ad',
        imageUrl: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=250&fit=crop',
        linkUrl: 'https://example.com/tech-ad',
        position: 'sidebar' as const,
        category: 'तकनीक',
        isActive: true,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        clickCount: 0,
        impressionCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Content Sports Ad',
        imageUrl: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&h=300&fit=crop',
        linkUrl: 'https://example.com/sports-ad',
        position: 'content' as const,
        category: 'खेल',
        isActive: true,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        clickCount: 0,
        impressionCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'General Sidebar Ad',
        imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=300&h=250&fit=crop',
        linkUrl: 'https://example.com/general-ad',
        position: 'sidebar' as const,
        isActive: true,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        clickCount: 0,
        impressionCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    for (const ad of sampleAds) {
      await addDoc(collection(db, 'advertisements'), ad);
    }
    
    console.log('Advertisement data initialized successfully');
  } catch (error) {
    console.error('Error initializing advertisement data:', error);
  }
};

// Initialize demo accounts
export const initializeDemoAccounts = async () => {
  try {
    console.log('Initializing demo accounts...');

    const demoAccounts = [
      {
        email: 'admin@news.com',
        password: 'admin123',
        displayName: 'Admin User',
        role: 'admin' as const,
        roleLevel: 1 as const
      },
      {
        email: 'editor@news.com',
        password: 'editor123',
        displayName: 'Editor User',
        role: 'editor' as const,
        roleLevel: 2 as const
      },
      {
        email: 'user@news.com',
        password: 'user123',
        displayName: 'Regular User',
        role: 'user' as const,
        roleLevel: 3 as const
      }
    ];

    for (const account of demoAccounts) {
      try {
        // Create Firebase Auth user
        const { user } = await createUserWithEmailAndPassword(
          auth,
          account.email,
          account.password
        );

        // Update display name
        await updateProfile(user, {
          displayName: account.displayName
        });

        // Create user document in Firestore with proper role data
        const userData = {
          email: account.email,
          displayName: account.displayName,
          role: account.role,
          roleLevel: account.roleLevel,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        await setDoc(doc(db, 'users', user.uid), userData);
        console.log(`Demo account created in Auth and Firestore: ${account.email} with role ${account.role} (level ${account.roleLevel})`);

        // Sign out the created user to avoid session conflicts
        await auth.signOut();

      } catch (error: any) {
        if (error.code === 'auth/email-already-in-use') {
          console.log(`Account already exists: ${account.email}`);
          // Try to update Firestore data for existing user
          try {
            // We can't get the UID easily for existing users, so we'll skip this
            console.log(`Skipping Firestore update for existing user: ${account.email}`);
          } catch (firestoreError) {
            console.error(`Error updating Firestore for existing user ${account.email}:`, firestoreError);
          }
        } else {
          console.error(`Error creating account ${account.email}:`, error);
        }
      }
    }

    console.log('Demo accounts initialization completed');
  } catch (error) {
    console.error('Error initializing demo accounts:', error);
  }
};

// Initialize admin user (legacy function - kept for compatibility)
export const initializeAdminUser = async () => {
  await initializeDemoAccounts();
};

// Initialize all data
export const initializeAllData = async () => {
  console.log('Starting data initialization...');

  await initializeNewsData();
  await initializeAdData();
  await initializeDemoAccounts();

  console.log('All data initialized successfully!');
};

// Helper function to clear all data (use with caution)
export const clearAllData = async () => {
  console.warn('This function would clear all data - implement with caution');
  // Implementation would involve deleting all documents from collections
  // This is left as an exercise for production use
};
