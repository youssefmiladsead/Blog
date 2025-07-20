import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAVIX9TrbJ4dzij-jhYdBjenvKXN9A81OE",
  authDomain: "react-blog-4f687.firebaseapp.com",
  projectId: "react-blog-4f687",
  storageBucket: "react-blog-4f687.appspot.com",
  messagingSenderId: "868488061858",
  appId: "1:868488061858:web:69a17aee726d42a181c8fb",
  measurementId: "G-R34FVVW274",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
