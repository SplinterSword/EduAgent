
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// Log each environment variable individually
const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
const messagingSenderId = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;

const firebaseConfig = {
  apiKey: apiKey,
  authDomain: authDomain,
  projectId: projectId,
  storageBucket: storageBucket,
  messagingSenderId: messagingSenderId,
  appId: appId,
};

// Log the entire config object to see what Firebase is receiving
console.log('Firebase config object being constructed:', firebaseConfig);

// Initialize Firebase
let app;

if (!getApps().length) {
  // More detailed validation of the firebaseConfig object
  const requiredKeys: (keyof typeof firebaseConfig)[] = ['apiKey', 'authDomain', 'projectId', 'appId'];
  for (const key of requiredKeys) {
    const value = firebaseConfig[key];
    if (typeof value !== 'string' || value.trim() === '' || value.includes("YOUR_") || value === undefined) {
      const errorMessage = `Firebase Config Error: '${key}' is missing, invalid, or still a placeholder ("${value}"). Please check your .env file and ensure all NEXT_PUBLIC_FIREBASE_ variables are set correctly and the server was restarted.`;
      console.error(errorMessage);
      throw new Error(errorMessage);
    }
  }
  // Optional keys check (less likely to cause 'configuration-not-found' but good practice)
   const optionalKeys: (keyof typeof firebaseConfig)[] = ['storageBucket', 'messagingSenderId'];
    for (const key of optionalKeys) {
        const value = firebaseConfig[key];
        if (value !== undefined && (typeof value !== 'string' || value.trim() === '' || value.includes("YOUR_"))) {
            const warningMessage = `Firebase Config Warning: Optional key '${key}' has an invalid placeholder value ("${value}") or is an empty string. While this might not break initialization, ensure it's correct if used.`;
            console.warn(warningMessage);
            // You might not want to throw an error for optional keys unless they are clearly malformed placeholders
            if (typeof value === 'string' && value.includes("YOUR_")) {
                 const errorMessage = `Firebase Config Error: Optional key '${key}' is still a placeholder. Please set it correctly or remove the environment variable if not used.`;
                 console.error(errorMessage);
                 throw new Error(errorMessage);
            }
        }
    }


  try {
    console.log('Attempting to initialize Firebase with config:', firebaseConfig);
    app = initializeApp(firebaseConfig);
    console.log('Firebase initialized successfully.');
  } catch (error) {
    console.error("Firebase initialization error:", error);
    // Propagate the error so Next.js shows it.
    throw error;
  }
} else {
  app = getApp();
  console.log('Firebase app already initialized, getting existing app.');
}

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, googleProvider };
