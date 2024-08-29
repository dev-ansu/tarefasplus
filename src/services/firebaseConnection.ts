import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCeOQ7mcdf_LTCY5Av0JW5yxweOu7Y5x0M",
  authDomain: "tarefasmais-97127.firebaseapp.com",
  projectId: "tarefasmais-97127",
  storageBucket: "tarefasmais-97127.appspot.com",
  messagingSenderId: "1028059848909",
  appId: "1:1028059848909:web:2d2543cb45efef584b4984"
};


const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
