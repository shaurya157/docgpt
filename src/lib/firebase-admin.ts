import { ServiceAccount } from 'firebase-admin';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

import FirebaseConfig from './firebase-creds.json';

// Initialize Firebase Admin
const apps = getApps();

const firebaseAdmin = apps.length === 0 
  ? initializeApp({
      credential: cert(FirebaseConfig as ServiceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL,
    })
  : apps[0];

// Initialize Firestore
export const adminDb = getFirestore(firebaseAdmin);

// Helper function to get chat history
export async function getChatHistory(chatId: string) {
  try {
    const chatDoc = await adminDb.collection('chats').doc(chatId).get();
    if (!chatDoc.exists) {
      return [];
    }
    const chatData = chatDoc.data();
    return chatData?.messages || [];
  } catch (error) {
    console.error('Error fetching chat history:', error);
    return [];
  }
} 