import { createClient } from "@supabase/supabase-js";

// Load environment variables from .env.local
// Bun automatically loads .env.local, but for other runtimes you may need dotenv

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase environment variables");
  console.error("Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function clearDatabase() {
  try {
    console.log("🗑️  Clearing waitlist table...");

    // First, get the count of rows
    const { count: initialCount, error: countError } = await supabase
      .from("waitlist")
      .select("*", { count: "exact", head: true });

    if (countError) {
      throw countError;
    }

    console.log(`   Found ${initialCount || 0} rows to delete`);

    if (initialCount === 0) {
      console.log("✅ Table is already empty!");
      return;
    }

    // Delete all rows from waitlist table
    // Using a condition that matches all rows
    // If id is numeric, use gte(0). If it's text/UUID, use neq('')
    const { error, count } = await supabase
      .from("waitlist")
      .delete()
      .neq("email", ""); // This will match all rows since email is required

    if (error) {
      throw error;
    }

    console.log("✅ Successfully cleared waitlist table");
    console.log(`   Deleted ${count || initialCount || "all"} rows`);

    // Verify the table is empty
    const { count: remainingCount, error: selectError } = await supabase
      .from("waitlist")
      .select("*", { count: "exact", head: true });

    if (selectError) {
      throw selectError;
    }

    console.log(`✅ Verification: ${remainingCount || 0} rows remaining`);
    
    if (remainingCount === 0) {
      console.log("🎉 Database cleared successfully!");
    } else {
      console.warn(`⚠️  Warning: ${remainingCount} rows still remain`);
    }
  } catch (error) {
    console.error("❌ Error clearing database:", error);
    if (error instanceof Error) {
      console.error("   Error details:", error.message);
    }
    process.exit(1);
  }
}

clearDatabase();

