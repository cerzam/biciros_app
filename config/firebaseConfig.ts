import { initializeApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { initializeAuth, Auth } from 'firebase/auth';
// @ts-ignore - getReactNativePersistence existe en runtime pero los tipos no lo exportan
import { getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_MEASUREMENT_ID,
};

const app: FirebaseApp = initializeApp(firebaseConfig);

// Usar initializeAuth con persistencia para React Native
export const auth: Auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export const db: Firestore = getFirestore(app);