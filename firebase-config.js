import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyCDP4NsKjbh_6m66P3IhN9Z18x_bvwdM1w",
  authDomain: "senaiteste-8eb47.firebaseapp.com",
  databaseURL: "https://senaiteste-8eb47-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "senaiteste-8eb47",
  storageBucket: "senaiteste-8eb47.appspot.com",
  messagingSenderId: "1043580467574",
  appId: "1:1043580467574:web:bc3f37a70c276c79176257"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db };
export { app };