import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { User, ROLE_LEVELS } from '@/types';

interface AuthContextType {
  currentUser: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string, role?: 'admin' | 'editor') => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: () => boolean;
  isEditor: () => boolean;
  hasPermission: (permission: 'read' | 'write' | 'admin') => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  const getUserData = async (firebaseUser: FirebaseUser): Promise<User | null> => {
    try {
      console.log(`Fetching user data for UID: ${firebaseUser.uid}`);
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));

      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log('User data from Firestore:', userData);

        const role = userData.role || 'editor';
        const user: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email!,
          displayName: firebaseUser.displayName || userData.displayName,
          role: role,
          roleLevel: userData.roleLevel || ROLE_LEVELS[role],
          createdAt: userData.createdAt?.toDate() || new Date(),
          updatedAt: userData.updatedAt?.toDate() || new Date(),
        };

        console.log('Processed user data:', user);
        return user;
      } else {
        console.log('No user document found in Firestore for UID:', firebaseUser.uid);
        // Create a basic user document if it doesn't exist
        const basicUserData = {
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          role: 'editor' as const,
          roleLevel: 2 as const,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        await setDoc(doc(db, 'users', firebaseUser.uid), basicUserData);
        console.log('Created basic user document for:', firebaseUser.email);

        return {
          id: firebaseUser.uid,
          email: firebaseUser.email!,
          displayName: firebaseUser.displayName,
          role: 'editor',
          roleLevel: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  };

  const createUserDocument = async (firebaseUser: FirebaseUser, role: 'admin' | 'editor' = 'editor') => {
    const userData = {
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      role,
      roleLevel: ROLE_LEVELS[role],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await setDoc(doc(db, 'users', firebaseUser.uid), userData);
    return userData;
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log('Login successful:', result.user.email);
      // Don't set loading to false here, let the auth state change handle it
    } catch (error) {
      setLoading(false);
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (email: string, password: string, displayName: string, role: 'admin' | 'editor' = 'editor') => {
    setLoading(true);
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(user, { displayName });
      await createUserDocument(user, role);
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const isAdmin = () => {
    return currentUser?.role === 'admin';
  };

  const isEditor = () => {
    return currentUser?.role === 'editor' || currentUser?.role === 'admin';
  };

  const hasPermission = (permission: 'read' | 'write' | 'admin') => {
    if (!currentUser) return false;
    
    switch (permission) {
      case 'read':
        return true; // All authenticated users can read
      case 'write':
        return currentUser.role === 'editor' || currentUser.role === 'admin';
      case 'admin':
        return currentUser.role === 'admin';
      default:
        return false;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser) {
        const userData = await getUserData(firebaseUser);
        setCurrentUser(userData);
      } else {
        setCurrentUser(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    currentUser,
    firebaseUser,
    loading,
    login,
    register,
    logout,
    isAdmin,
    isEditor,
    hasPermission,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Export useAuth hook separately to fix Fast Refresh
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
