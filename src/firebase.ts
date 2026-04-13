import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyCQwqyMM5UsR7-OTyM3tkZnlfOgXeTODIk",
  authDomain: "beverageshop-rg2026.firebaseapp.com",
  projectId: "beverageshop-rg2026",
  storageBucket: "beverageshop-rg2026.firebasestorage.app",
  messagingSenderId: "59381787813",
  appId: "1:59381787813:web:79223069f3e90ddcadb14c",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { db, auth, provider };
export default db;
