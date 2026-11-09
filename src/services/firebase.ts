import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';

// Standard Firebase config with environment variable overrides or fallback
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDemoDummyKeyForCyutCampusLifeApp',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'cyut-campus-life.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'cyut-campus-life',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'cyut-campus-life.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '103200000000',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:103200000000:web:cyutcampuslifeapp',
};

// Initialize Firebase safely (avoid re-initialization)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// Google Auth Provider configured for CYUT G-Suite / Workspace accounts
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

// Domain validation helper for 朝陽科技大學 (CYUT)
export const CYUT_EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@(gm\.)?cyut\.edu\.tw$/i;

export function isCyutEmail(email: string): boolean {
  return CYUT_EMAIL_REGEX.test(email.trim());
}

export function extractStudentIdFromEmail(email: string): string {
  const prefix = email.split('@')[0] || '';
  // Check if starts with s, e.g. s11124108 -> 11124108
  if (/^s\d{6,9}$/i.test(prefix)) {
    return prefix.slice(1);
  }
  return prefix || '11124108';
}

export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return { user: result.user, error: null };
  } catch (error: any) {
    console.warn('Firebase Google Auth:', error?.code || error?.message);
    return { user: null, error };
  }
}

export {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  type FirebaseUser,
};
