// File: api/send-message.js

const admin = require("firebase-admin");

// 🔑 Firebase Admin Init using Environment Variables
// Vercel par is tarah se service account key ko handle karna safe hota hai.
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      type: process.env.FIREBASE_TYPE,
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: process.env.FIREBASE_AUTH_URI,
      token_uri: process.env.FIREBASE_TOKEN_URI,
      auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
      client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
      universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN,
    }),
  });
}

// ---- Main Handler Function ----
module.exports = async (req, res) => {
  // 📩 Sirf POST requests ko handle karein
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  try {
    const { title, body } = req.body;

    if (!title || !body) {
      return res.status(400).json({ error: "Title and body are required" });
    }

    // 🔍 Firestore se sabhi users ke tokens fetch karein
    const snapshot = await admin.firestore().collection("users").get();
    const tokens = [];
    snapshot.forEach(doc => {
      const userData = doc.data();
      if (userData.fcmToken) {
        tokens.push(userData.fcmToken);
      }
    });

    if (tokens.length === 0) {
      return res.status(400).json({ error: "No tokens found in Firestore" });
    }

    // 📤 Send notification to all tokens
    const message = {
      notification: { title, body },
      tokens: tokens,
    };

    const response = await admin.messaging().sendEachForMulticast(message);
    console.log("📨 Notification sent:", response);

    res.status(200).json({ success: true, response });

  } catch (err) {
    console.error("❌ Error:", err);
    res.status(500).json({ error: err.message });
  }
};