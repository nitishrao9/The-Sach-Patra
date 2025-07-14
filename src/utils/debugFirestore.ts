import { collection, getDocs, query, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export const debugFirestoreData = async () => {
  try {
    // Check news collection
    const newsQuery = query(collection(db, 'news'), limit(5));
    const newsSnapshot = await getDocs(newsQuery);

    // Check gallery collection
    const galleryQuery = query(collection(db, 'gallery'), limit(3));
    const gallerySnapshot = await getDocs(galleryQuery);

    // Check videos collection
    const videosQuery = query(collection(db, 'videos'), limit(3));
    const videosSnapshot = await getDocs(videosQuery);

    // Check breaking news collection
    const breakingQuery = query(collection(db, 'breakingNews'), limit(3));
    const breakingSnapshot = await getDocs(breakingQuery);

    return {
      news: newsSnapshot.docs.length,
      gallery: gallerySnapshot.docs.length,
      videos: videosSnapshot.docs.length,
      breakingNews: breakingSnapshot.docs.length
    };
  } catch (error) {
    return null;
  }
};
