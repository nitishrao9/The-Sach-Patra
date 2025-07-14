import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

/**
 * Migration utility to add createdBy field to existing articles
 * This should be run once by an admin to update existing articles
 */
export const migrateArticlesToAddCreatedBy = async (defaultUserId?: string) => {
  try {
    console.log('Starting migration to add createdBy field to existing articles...');
    
    const articlesRef = collection(db, 'news');
    const snapshot = await getDocs(articlesRef);
    
    let updatedCount = 0;
    let skippedCount = 0;
    
    for (const docSnapshot of snapshot.docs) {
      const data = docSnapshot.data();
      
      // Skip if createdBy already exists
      if (data.createdBy) {
        skippedCount++;
        continue;
      }
      
      // Update with default user ID or leave empty for admin to assign later
      const updateData: any = {};
      
      if (defaultUserId) {
        updateData.createdBy = defaultUserId;
      } else {
        // If no default user ID provided, we can try to match by author name
        // or leave it empty for manual assignment
        updateData.createdBy = null;
      }
      
      await updateDoc(doc(db, 'news', docSnapshot.id), updateData);
      updatedCount++;
      
      console.log(`Updated article: ${data.title} (ID: ${docSnapshot.id})`);
    }
    
    console.log(`Migration completed!`);
    console.log(`- Updated articles: ${updatedCount}`);
    console.log(`- Skipped articles (already had createdBy): ${skippedCount}`);
    
    return {
      success: true,
      updatedCount,
      skippedCount,
      totalProcessed: updatedCount + skippedCount
    };
    
  } catch (error) {
    console.error('Migration failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Utility to assign ownership of articles to specific users based on author name
 */
export const assignArticleOwnership = async (authorToUserIdMap: Record<string, string>) => {
  try {
    console.log('Starting ownership assignment...');
    
    const articlesRef = collection(db, 'news');
    const snapshot = await getDocs(articlesRef);
    
    let updatedCount = 0;
    let skippedCount = 0;
    
    for (const docSnapshot of snapshot.docs) {
      const data = docSnapshot.data();
      const authorName = data.author;
      
      // Skip if createdBy already exists or no mapping for this author
      if (data.createdBy || !authorToUserIdMap[authorName]) {
        skippedCount++;
        continue;
      }
      
      await updateDoc(doc(db, 'news', docSnapshot.id), {
        createdBy: authorToUserIdMap[authorName]
      });
      
      updatedCount++;
      console.log(`Assigned article "${data.title}" to user ${authorToUserIdMap[authorName]} (author: ${authorName})`);
    }
    
    console.log(`Ownership assignment completed!`);
    console.log(`- Updated articles: ${updatedCount}`);
    console.log(`- Skipped articles: ${skippedCount}`);
    
    return {
      success: true,
      updatedCount,
      skippedCount,
      totalProcessed: updatedCount + skippedCount
    };
    
  } catch (error) {
    console.error('Ownership assignment failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};
