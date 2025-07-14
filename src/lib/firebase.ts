import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDNFGtRk-KH-cls4nl-BTOl9C33sDJPRHo",
  authDomain: "news-a5809.firebaseapp.com",
  projectId: "news-a5809",
  storageBucket: "news-a5809.firebasestorage.app",
  messagingSenderId: "322671425553",
  appId: "1:322671425553:web:2f69031d4e2677442559b0",
  measurementId: "G-7LXXLSJYF7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);

export default app;
