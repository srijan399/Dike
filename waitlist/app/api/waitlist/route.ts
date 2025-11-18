import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { sendEmail, getWelcomeEmailHTML } from "@/utils/mailer";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    // Validate email
    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    // Create Supabase client with service role key for server-side operations
    // This bypasses RLS which is safe since we're validating input server-side
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase environment variables");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Insert email into waitlist table
    const { data, error } = await supabase
      .from("waitlist")
      .insert([{ email: email.toLowerCase().trim() }])
      .select()
      .single();

    if (error) {
      // Check if it's a duplicate email error
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "This email is already on the waitlist" },
          { status: 409 }
        );
      }

      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to join waitlist" },
        { status: 500 }
      );
    }

    // Send confirmation email in the background (non-blocking)
    // Using setImmediate to defer execution to the next event loop iteration
    setImmediate(async () => {
      try {
        const htmlContent = getWelcomeEmailHTML();
        await sendEmail(
          email,
          "Welcome to Dike Protocol - You're on the Waitlist!",
          "Thank you for joining the Dike Protocol waitlist! You're now part of an exclusive community pioneering the next generation of capital-efficient prediction markets.",
          htmlContent
        );
        console.log(`✅ Background email sent successfully to ${email}`);
      } catch (emailError) {
        // Log error but don't fail the request since email is sent in background
        console.error(`❌ Error sending background email to ${email}:`, emailError);
      }
    });

    // Return success immediately without waiting for email
    return NextResponse.json(
      { message: "Successfully joined waitlist", data },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

