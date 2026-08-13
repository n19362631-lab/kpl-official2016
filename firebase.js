import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCIYvlfmQgu2uRV2Rlx4VqZo5R_XsxnhZo",
  authDomain: "kpl-official-2026-fb827.firebaseapp.com",
  projectId: "kpl-official-2026-fb827",
  storageBucket: "kpl-official-2026-fb827.firebasestorage.app",
  messagingSenderId: "332413798187",
  appId: "1:332413798187:web:5ad8da8b888dcf0fbd276e",
  measurementId: "G-2ZL7YEVQZ4"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider, signInWithPopup, onAuthStateChanged, signOut };
