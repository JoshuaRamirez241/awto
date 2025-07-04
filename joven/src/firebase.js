// firebase.js

// Firebase Initialization
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyA2oBqELFCq7nXVTDKGNa2ssKE10etHtdk",
  authDomain: "awto-b8b30.firebaseapp.com",
  projectId: "awto-b8b30",
  storageBucket: "awto-b8b30.appspot.com",
  messagingSenderId: "909076592021",
  appId: "1:909076592021:web:e7eea1ea9912946c72729c",
  measurementId: "G-V6K71Q2YSR"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firebase Services
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);
const storage = getStorage(app);

// Export for use in other components
export { auth, provider, db, storage };
