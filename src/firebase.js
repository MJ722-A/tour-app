import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBUkDrTxQC_jfP8FmBu07DGP2nmVBclJ0Y",
  authDomain: "myproject-bb02c.firebaseapp.com",
  projectId: "myproject-bb02c",
  storageBucket: "myproject-bb02c.firebasestorage.app",
  messagingSenderId: "185920574841",
  appId: "1:185920574841:web:fc1552be1f57d4c995cba8"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);