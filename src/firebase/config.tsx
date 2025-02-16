// Import the functions you need from the SDKs you need
import { getApps, initializeApp } from "firebase/app";

// Using client side firebase for now, TODO: move to server side when we move off firebase
const firebaseConfig = {
  apiKey: "AIzaSyBz0wkB78GBRu2ZPBUM5vSMI763jKZXDFY",
  appId: "1:917994712987:web:1429b18067c6179b9cfb3e",
  authDomain: "docgpt-4d80b.firebaseapp.com",
  measurementId: "G-ZFB84M0FYS",
  messagingSenderId: "917994712987",
  projectId: "docgpt-4d80b",
  storageBucket: "docgpt-4d80b.firebasestorage.app",
};

// Initialize Firebase
const firebase_app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export default firebase_app;
