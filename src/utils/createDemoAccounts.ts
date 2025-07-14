import { createUserWithEmailAndPassword, updateProfile, signOut } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { ROLE_LEVELS } from '@/types';

export interface DemoAccount {
  email: string;
  password: string;
  displayName: string;
  role: 'admin' | 'editor';
  roleLevel: 1 | 2;
}

export const demoAccounts: DemoAccount[] = [
  {
    email: 'admin@news.com',
    password: 'admin123',
    displayName: 'Admin User',
    role: 'admin',
    roleLevel: 1
  },
  {
    email: 'editor@news.com',
    password: 'editor123',
    displayName: 'Editor User',
    role: 'editor',
    roleLevel: 2
  }
];

export const createSingleDemoAccount = async (account: DemoAccount): Promise<{ success: boolean; message: string; uid?: string }> => {
  try {
    console.log(`Creating account for ${account.email}...`);
    
    // Create Firebase Auth user
    const { user } = await createUserWithEmailAndPassword(
      auth,
      account.email,
      account.password
    );

    console.log(`Firebase Auth user created: ${user.uid}`);

    // Update display name
    await updateProfile(user, {
      displayName: account.displayName
    });

    console.log(`Display name updated for ${user.uid}`);

    // Create user document in Firestore
    const userData = {
      email: account.email,
      displayName: account.displayName,
      role: account.role,
      roleLevel: account.roleLevel,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await setDoc(doc(db, 'users', user.uid), userData);
    console.log(`Firestore document created for ${user.uid}`);

    // Sign out the newly created user so it doesn't interfere with the current session
    await signOut(auth);
    console.log(`Signed out ${account.email}`);

    return {
      success: true,
      message: `Account created successfully for ${account.email}`,
      uid: user.uid
    };

  } catch (error: any) {
    console.error(`Error creating account for ${account.email}:`, error);
    
    if (error.code === 'auth/email-already-in-use') {
      return {
        success: true,
        message: `Account already exists for ${account.email}`
      };
    }
    
    return {
      success: false,
      message: `Failed to create account for ${account.email}: ${error.message}`
    };
  }
};

export const createAllDemoAccounts = async (): Promise<{ success: boolean; results: Array<{ email: string; success: boolean; message: string }> }> => {
  console.log('Starting demo account creation...');
  
  const results = [];
  let allSuccessful = true;

  for (const account of demoAccounts) {
    const result = await createSingleDemoAccount(account);
    results.push({
      email: account.email,
      success: result.success,
      message: result.message
    });
    
    if (!result.success) {
      allSuccessful = false;
    }

    // Small delay between account creations
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('Demo account creation completed');
  
  return {
    success: allSuccessful,
    results
  };
};

// Function to check if demo accounts exist
export const checkDemoAccountsExist = async (): Promise<boolean> => {
  try {
    // This is a simple check - in a real app you might want to check Firestore
    // For now, we'll assume if we can't create them, they exist
    return false; // Always return false to allow creation attempts
  } catch (error) {
    console.error('Error checking demo accounts:', error);
    return false;
  }
};
