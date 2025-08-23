const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config();

const serviceAccount = require(path.resolve(__dirname, '../firebaseServiceAccountKey.json'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function clearProfiles() {
  try {
    console.log('🗑️ Clearing existing profiles...');
    
    // Get all profiles
    const snapshot = await db.collection('profiles').get();
    
    if (snapshot.empty) {
      console.log('✅ No profiles found to clear.');
      return;
    }
    
    let deletedCount = 0;
    
    // Delete each profile
    for (const doc of snapshot.docs) {
      await db.collection('profiles').doc(doc.id).delete();
      deletedCount++;
    }
    
    console.log(`✅ Cleared ${deletedCount} profiles.`);
    console.log('💡 Now each user will have their own profile when they first visit the profile page.');
    
  } catch (error) {
    console.error('❌ Error clearing profiles:', error);
  }
}

clearProfiles().then(() => {
  console.log('✅ Profile clearing complete.');
  process.exit(0);
}).catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
}); 