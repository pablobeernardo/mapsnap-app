import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyBxW7WraKIpqjQahtoJUEcD_zjhkfbig_0",
  authDomain: "testenotification-24c43.firebaseapp.com",
  databaseURL: "https://testenotification-24c43-default-rtdb.firebaseio.com/",
  projectId: "testenotification-24c43",
  storageBucket: "testenotification-24c43.appspot.com",
  messagingSenderId: "658870452462",
  appId: "1:658870452462:android:79acd40e9f9f8339fc73ff"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db };
export { app };