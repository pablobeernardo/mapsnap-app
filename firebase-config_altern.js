import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyDO9kHzrw44ZYFl2AuztdAOMtoO7pd8zCY",
  authDomain: "dzsuperofertas.firebaseapp.com",
  databaseURL: "https://dzsuperofertas.firebaseio.com",
  projectId: "dzsuperofertas",
  storageBucket: "dzsuperofertas.appspot.com",
  messagingSenderId: "677084542092",
  appId: "1:677084542092:web:131465c2fede9fff9637a9"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db };
export { app };