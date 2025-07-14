import { collection, getDocs, addDoc, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface CustomCategory {
  id: string;
  name: string; // English name
  createdAt: Date;
  createdBy: string;
}

// Get all custom categories from Firestore
export const getCustomCategories = async (): Promise<string[]> => {
  try {
    const categoriesQuery = query(
      collection(db, 'customCategories'),
      orderBy('createdAt', 'asc')
    );
    
    const querySnapshot = await getDocs(categoriesQuery);
    const categories = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return data.name;
    });
    
    return categories;
  } catch (error) {
    console.error('Error fetching custom categories:', error);
    return [];
  }
};

// Add a new custom category
export const addCustomCategory = async (categoryName: string, createdBy: string): Promise<boolean> => {
  try {
    // Check if category already exists
    const existingCategories = await getCustomCategories();
    const normalizedName = categoryName.trim().toLowerCase();
    
    const exists = existingCategories.some(cat => 
      cat.toLowerCase() === normalizedName
    );
    
    if (exists) {
      throw new Error('Category already exists');
    }
    
    const categoryData = {
      name: categoryName.trim(),
      createdAt: new Date(),
      createdBy
    };
    
    await addDoc(collection(db, 'customCategories'), categoryData);
    return true;
  } catch (error) {
    console.error('Error adding custom category:', error);
    throw error;
  }
};

// Check if a category is custom (not in default categories)
export const isCustomCategory = (categoryName: string): boolean => {
  const defaultCategories = [
    'national', 'international', 'politics', 'sports',
    'entertainment', 'technology', 'business', 'education',
    'agriculture', 'special'
  ];

  return !defaultCategories.includes(categoryName.toLowerCase());
};
