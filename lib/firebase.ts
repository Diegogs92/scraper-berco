import { applicationDefault, cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Inicializa Firebase Admin de forma idempotente.
const app =
  getApps()[0] ||
  initializeApp({
    credential: process.env.FIREBASE_SERVICE_ACCOUNT
      ? cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT))
      : process.env.FIREBASE_PRIVATE_KEY
      ? cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        })
      : applicationDefault(),
  });

export const db = getFirestore(app);
