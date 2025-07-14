import { collection, getDocs, doc, updateDoc, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { convertLegacyCategory } from './categoryMappings';

// Migration utility to convert Hindi categories to English in the database
export const migrateCategoriesData = async () => {
  console.log('Starting category migration...');
  
  try {
    const batch = writeBatch(db);
    let updateCount = 0;

    // Migrate news articles
    const newsSnapshot = await getDocs(collection(db, 'news'));
    console.log(`Found ${newsSnapshot.size} news articles to check`);

    newsSnapshot.forEach((docSnapshot) => {
      const data = docSnapshot.data();
      if (data.category) {
        const newCategory = convertLegacyCategory(data.category);
        if (newCategory !== data.category) {
          console.log(`Updating news article ${docSnapshot.id}: ${data.category} -> ${newCategory}`);
          batch.update(doc(db, 'news', docSnapshot.id), { category: newCategory });
          updateCount++;
        }
      }
    });

    // Migrate ads if they have category field
    const adsSnapshot = await getDocs(collection(db, 'advertisements'));
    console.log(`Found ${adsSnapshot.size} ads to check`);

    adsSnapshot.forEach((docSnapshot) => {
      const data = docSnapshot.data();
      if (data.category) {
        const newCategory = convertLegacyCategory(data.category);
        if (newCategory !== data.category) {
          console.log(`Updating ad ${docSnapshot.id}: ${data.category} -> ${newCategory}`);
          batch.update(doc(db, 'advertisements', docSnapshot.id), { category: newCategory });
          updateCount++;
        }
      }
    });

    // Commit all updates
    if (updateCount > 0) {
      await batch.commit();
      console.log(`Migration completed! Updated ${updateCount} documents.`);
    } else {
      console.log('No documents needed migration.');
    }

    return { success: true, updatedCount: updateCount };
  } catch (error) {
    console.error('Migration failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Check if migration is needed
export const checkMigrationNeeded = async (): Promise<boolean> => {
  try {
    const newsSnapshot = await getDocs(collection(db, 'news'));
    
    for (const docSnapshot of newsSnapshot.docs) {
      const data = docSnapshot.data();
      if (data.category) {
        const newCategory = convertLegacyCategory(data.category);
        if (newCategory !== data.category) {
          return true; // Migration needed
        }
      }
    }
    
    return false; // No migration needed
  } catch (error) {
    console.error('Error checking migration status:', error);
    return false;
  }
};

// Get migration status
export const getMigrationStatus = async () => {
  try {
    const newsSnapshot = await getDocs(collection(db, 'news'));
    let hindiCategories = 0;
    let englishCategories = 0;
    const categoryCounts: Record<string, number> = {};

    newsSnapshot.forEach((docSnapshot) => {
      const data = docSnapshot.data();
      if (data.category) {
        const category = data.category;
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
        
        const newCategory = convertLegacyCategory(category);
        if (newCategory !== category) {
          hindiCategories++;
        } else {
          englishCategories++;
        }
      }
    });

    return {
      total: newsSnapshot.size,
      hindiCategories,
      englishCategories,
      categoryCounts,
      migrationNeeded: hindiCategories > 0
    };
  } catch (error) {
    console.error('Error getting migration status:', error);
    return null;
  }
};
