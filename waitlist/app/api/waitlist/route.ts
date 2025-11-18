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

    try {
      // Send confirmation email
      const htmlContent = getWelcomeEmailHTML();
      await sendEmail(
        email,
        "Welcome to Dike Protocol - You're on the Waitlist!",
        "Thank you for joining the Dike Protocol waitlist! You're now part of an exclusive community pioneering the next generation of capital-efficient prediction markets.",
        htmlContent
      );
    } catch (emailError) {
      console.error("Error sending confirmation email:", emailError);
      const rollbackError = await supabase
        .from("waitlist")
        .delete()
        .eq("email", email.toLowerCase().trim());

      if (rollbackError.error) {
        console.error(
          "Error rolling back waitlist entry after email failure:",
          rollbackError.error
        );
      }

      return NextResponse.json(
        { error: "Failed to send confirmation email" },
        { status: 500 }
      );
    }

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

export async function GET(request: Request) {
  //get all waitlist entries
  try {
    if(request.headers.get("x-admin-secret") !== process.env.ADMIN_SECRET) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }
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

    const { data, error } = await supabase.from("waitlist").select("*");

    const responseData = {
      entries: data,
      count: data ? data.length : 0,
    };

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to fetch waitlist entries" },
        { status: 500 }
      );
    }

    return NextResponse.json({ responseData }, { status: 200 });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
