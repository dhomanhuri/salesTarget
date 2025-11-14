import { db } from "./db";
import { users, departments } from "@shared/schema";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

async function seed() {
  console.log("🌱 Seeding database...");

  try {
    const hashedPassword = await bcrypt.hash("admin123", SALT_ROUNDS);

    const [salesDept] = await db
      .insert(departments)
      .values({ name: "Sales Department" })
      .returning();

    console.log("✅ Created department:", salesDept.name);

    const [admin] = await db
      .insert(users)
      .values({
        email: "admin@quotatrackr.com",
        password: hashedPassword,
        name: "Admin User",
        role: "ADMIN",
        departmentId: null,
        gmId: null,
      })
      .returning();

    console.log("✅ Created admin user:", admin.email);

    const gmPassword = await bcrypt.hash("gm123", SALT_ROUNDS);
    const [gm] = await db
      .insert(users)
      .values({
        email: "gm@quotatrackr.com",
        password: gmPassword,
        name: "General Manager",
        role: "GM",
        departmentId: salesDept.id,
        gmId: null,
      })
      .returning();

    console.log("✅ Created GM user:", gm.email);

    const amPassword = await bcrypt.hash("am123", SALT_ROUNDS);
    const [am] = await db
      .insert(users)
      .values({
        email: "am@quotatrackr.com",
        password: amPassword,
        name: "Account Manager",
        role: "AM",
        departmentId: salesDept.id,
        gmId: gm.id,
      })
      .returning();

    console.log("✅ Created AM user:", am.email);

    console.log("\n🎉 Seeding complete!");
    console.log("\nLogin credentials:");
    console.log("Admin: admin@quotatrackr.com / admin123");
    console.log("GM: gm@quotatrackr.com / gm123");
    console.log("AM: am@quotatrackr.com / am123");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

seed();
