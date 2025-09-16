import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";


// web app's Firebase configuration
const firebaseConfig = {
//  apiKey: "AIzaSyDP3hszI2Ki_e6U1NT2XQFSE8q4vPanG1A",
//   authDomain: "speakup-66d6a.firebaseapp.com",
//   projectId: "speakup-66d6a",
//   storageBucket: "speakup-66d6a.firebasestorage.app",
//   messagingSenderId: "865218276961",
//   appId: "1:865218276961:web:f2a362bdad944ad1828420",
apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};


// 2. Initialize Firebase for SSR
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// 3. Get the auth service
const auth = getAuth(app);
const db = getFirestore(app); 

// 4. THIS IS THE MOST IMPORTANT LINE - IT MAKES 'auth' AVAILABLE TO OTHER FILES
export { auth, db };
