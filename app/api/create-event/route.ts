import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    const { eventName, startTime, endTime } = body;

    // Validate input
    if (!eventName || !startTime || !endTime) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

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

    // Validate time logic
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (start >= end) {
      return NextResponse.json(
        { error: "Start time must be before end time" },
        { status: 400 }
      );
    }

    // Insert event into database
    const { error: eventsError, data: eventsData } = await supabase
      .from("events")
      .insert({
        name: eventName,
        organizer_id: user.id,
        start_time: start.toISOString(),
        end_time: end.toISOString(),
      })
      .select()
      .single();

    if (eventsError) {
      console.error("Database error:", eventsError);
      return NextResponse.json(
        { error: "Failed to create event" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: eventsData }, { status: 201 });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
