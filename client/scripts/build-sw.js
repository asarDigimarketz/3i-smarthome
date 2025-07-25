const fs = require('fs');
const path = require('path');

// Read environment variables
require('dotenv').config();

// Read the service worker template
const swPath = path.join(__dirname, '../public/firebase-messaging-sw.js');
let swContent = fs.readFileSync(swPath, 'utf8');

// Replace placeholders with actual values
const replacements = {
  '{{NEXT_PUBLIC_FIREBASE_API_KEY}}': process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  '{{NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN}}': process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  '{{NEXT_PUBLIC_FIREBASE_PROJECT_ID}}': process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  '{{NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET}}': process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  '{{NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID}}': process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  '{{NEXT_PUBLIC_FIREBASE_APP_ID}}': process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Perform replacements
Object.entries(replacements).forEach(([placeholder, value]) => {
  if (value) {
    swContent = swContent.replace(new RegExp(placeholder, 'g'), value);
  } else {
    console.warn(`Warning: Environment variable for ${placeholder} is not set`);
  }
});

// Write the processed service worker
fs.writeFileSync(swPath, swContent);
console.log('Service worker built successfully with environment variables'); 