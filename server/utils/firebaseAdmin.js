const admin = require('firebase-admin');
const serviceAccount = require('../config/serviceAccountKey.json'); // Place your service account JSON here

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

module.exports = admin; 