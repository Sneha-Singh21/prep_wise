import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
    apiKey: "AIzaSyDachGUQiyx2uzeGyD_HYUq2oH4QDuuxwY",
    authDomain: "prepwise-810a4.firebaseapp.com",
    projectId: "prepwise-810a4",
    storageBucket: "prepwise-810a4.firebasestorage.app",
    messagingSenderId: "151935645692",
    appId: "1:151935645692:web:cbe6d2205d45c6a1dde479",
    measurementId: "G-YQRCDG1JYN"
};

// Initialize Firebase
const app = !getApps.length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
