import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { users } from "./drizzle/schema.ts";
import { eq } from "drizzle-orm";

// Database connection
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL not found in environment");
  process.exit(1);
}

const client = postgres(connectionString);
const db = drizzle(client);

async function upgradeUserToPremium() {
  try {
    // Get the first user (or you can specify by email/openId)
    const allUsers = await db.select().from(users).limit(10);
    
    console.log("Available users:");
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name || "Unknown"} (${user.email || user.openId}) - Current tier: ${user.tier}`);
    });

    if (allUsers.length === 0) {
      console.log("No users found. Please log in first to create your account.");
      process.exit(0);
    }

    // Upgrade the first user to premium
    const userToUpgrade = allUsers[0];
    
    await db
      .update(users)
      .set({ tier: "premium" })
      .where(eq(users.id, userToUpgrade.id));

    console.log(`\n✅ Successfully upgraded user to PREMIUM tier!`);
    console.log(`User: ${userToUpgrade.name || "Unknown"}`);
    console.log(`Email: ${userToUpgrade.email || userToUpgrade.openId}`);
    console.log(`New tier: PREMIUM`);
    console.log(`\nYou now have access to:`);
    console.log(`- Voice chat with avatars`);
    console.log(`- NSFW photo generation`);
    console.log(`- Video avatar generation`);
    console.log(`- All premium features`);

    await client.end();
  } catch (error) {
    console.error("Error upgrading user:", error);
    process.exit(1);
  }
}

upgradeUserToPremium();

