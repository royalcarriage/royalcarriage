const admin = require("firebase-admin");
if (!admin.apps.length) {
  admin.initializeApp({ projectId: "royalcarriagelimoseo" });
}
const db = admin.firestore();

async function main() {
  const snapshot = await db
    .collection("regeneration_queue")
    .where("status", "==", "failed")
    .get();
  console.log(`Found ${snapshot.size} failed items`);

  for (const doc of snapshot.docs) {
    await doc.ref.update({ status: "pending", retries: 0 });
  }
  console.log("Reset to pending");
  process.exit(0);
}

main();
