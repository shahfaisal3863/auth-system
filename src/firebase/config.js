
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDl1cQ30CO7vrJScS4xzWdZ3ENV7GkDuhQ",
  authDomain: "authsystem-fbc53.firebaseapp.com",
  projectId: "authsystem-fbc53",
  storageBucket: "authsystem-fbc53.firebasestorage.app",
  messagingSenderId: "26792052719",
  appId: "1:26792052719:web:be339554883ff3b915d81a",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
