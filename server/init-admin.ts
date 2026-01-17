/**
 * Initialize first admin user
 * Run once to create the initial super admin account
 *
 * Usage:
 *   npm run init-admin
 *   or
 *   tsx server/init-admin.ts
 */

import { storage } from "./storage";

async function initializeAdmin() {
  console.log("🔐 Initializing admin user...\n");

  const username = process.env.ADMIN_USERNAME || "admin";
  const password = process.env.ADMIN_PASSWORD || "Admin123!";

  try {
    // Check if admin already exists
    const existingAdmin = await storage.getUserByUsername(username);

    if (existingAdmin) {
      console.log("✅ Admin user already exists");
      console.log(`   Username: ${existingAdmin.username}`);
      console.log(`   Role: ${existingAdmin.role}`);
      console.log(`   Created: ${existingAdmin.createdAt}\n`);

      // Update to super_admin if not already
      if (existingAdmin.role !== "super_admin") {
        await storage.updateUserRole(existingAdmin.id, "super_admin");
        console.log("✅ Updated to super_admin role\n");
      }

      return;
    }

    // Create new admin user
    console.log("Creating new admin user...");
    const newUser = await storage.createUser({
      username,
      password,
    });

    // Promote to super_admin
    await storage.updateUserRole(newUser.id, "super_admin");

    console.log("\n✅ Admin user created successfully!\n");
    console.log("═══════════════════════════════════════");
    console.log("   Username: " + username);
    console.log("   Password: " + password);
    console.log("   Role: super_admin");
    console.log("═══════════════════════════════════════\n");
    console.log("⚠️  IMPORTANT: Change the password after first login!\n");
    console.log("📱 Login at: https://royalcarriagelimoseo.web.app/login");
    console.log("   or locally: http://localhost:5000/login\n");
  } catch (error) {
    console.error("❌ Error creating admin user:", error);
    process.exit(1);
  }
}

// Run initialization
initializeAdmin()
  .then(() => {
    console.log("✅ Initialization complete\n");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Initialization failed:", error);
    process.exit(1);
  });
