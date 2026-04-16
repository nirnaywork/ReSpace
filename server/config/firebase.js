const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

let serviceAccount;

try {
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT || './serviceAccountKey.json';
  const absolutePath = path.resolve(serviceAccountPath);
  
  if (fs.existsSync(absolutePath)) {
    serviceAccount = require(absolutePath);
  } else {
    console.warn('⚠️ Firebase service account key not found. Using environment variables.');
    serviceAccount = {
      type: 'service_account',
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
    };
  }
} catch (err) {
  console.error('Firebase config error:', err.message);
}

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('✅ Firebase Admin SDK initialized');
  } catch (err) {
    console.error('❌ Firebase Admin initialization failed:', err.message);
    console.log('⚠️ Server will run without Firebase verification (development mode)');
  }
}

module.exports = admin;
