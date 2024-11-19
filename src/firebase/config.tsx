// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyBz0wkB78GBRu2ZPBUM5vSMI763jKZXDFY",
  authDomain: "docgpt-4d80b.firebaseapp.com",
  projectId: "docgpt-4d80b",
  storageBucket: "docgpt-4d80b.firebasestorage.app",
  messagingSenderId: "917994712987",
  appId: "1:917994712987:web:1429b18067c6179b9cfb3e",
  measurementId: "G-ZFB84M0FYS",
};

// Initialize Firebase
let firebase_app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export default firebase_app;
