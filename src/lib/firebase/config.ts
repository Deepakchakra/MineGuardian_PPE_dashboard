import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAVzTGs-vyeZH8szgWQu6zzoBbll1fSRgM",
  authDomain: "mineguardian-b9ced.firebaseapp.com",
  databaseURL: "https://mineguardian-b9ced-default-rtdb.firebaseio.com",
  projectId: "mineguardian-b9ced",
  storageBucket: "mineguardian-b9ced.firebasestorage.app",
  messagingSenderId: "1064682186588",
  appId: "1:1064682186588:web:5f55c8d8ff4952aab8c399",
};

const app = getApps().length
  ? getApp()
  : initializeApp(firebaseConfig);

export const database = getDatabase(app);