import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyALm9eedl4ZmNexE-EFphj9bwCXUZxquZg",
  authDomain: "rini-bf259.firebaseapp.com",
  projectId: "rini-bf259",
  storageBucket: "rini-bf259.appspot.com",
  messagingSenderId: "212228037607",
  appId: "1:212228037607:web:32402b20fe536d25943b42",
  measurementId: "G-2VFTW7Q627"
};


const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);