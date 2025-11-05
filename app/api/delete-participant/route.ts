import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    const { participantID } = body;

    // Create Supabase client
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "You must be authenticated to create an event" },
        { status: 401 }
      );
    }

    // Check if user is anonymous
    if (user.is_anonymous) {
      return NextResponse.json(
        { error: "Anonymous users cannot create events" },
        { status: 403 }
      );
    }

    const { error } = await supabase
      .from("participants")
      .delete()
      .eq("id", participantID);

    if (error) {
      console.error("Error deleting participant:", error);
      throw error;
    }

    return  NextResponse.json({ success: true });
    
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
