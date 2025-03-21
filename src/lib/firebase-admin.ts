import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin
const apps = getApps();

const firebaseAdmin = apps.length === 0 
  ? initializeApp({
      credential: cert({
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        projectId: process.env.FIREBASE_PROJECT_ID,
      }),
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