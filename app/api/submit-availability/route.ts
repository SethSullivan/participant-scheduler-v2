import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { name, email, availableSlots, eventID } = await request.json();
    // Validate input
    if (
      !name?.trim() ||
      !email?.trim() ||
      !availableSlots?.length ||
      !eventID
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Insert participant (now has permission)
    const { error: participantsError, data: participantData } = await supabase
      .from("participants")
      .upsert(
        { name: name.trim(), email: email.trim().toLowerCase(), event_id: eventID },
        { onConflict: "email, event_id" }
      )
      .select("id") // Get the ID in the same query
      .single();

    if (participantsError) {
      console.error("Error inserting participant:", participantsError);
      return NextResponse.json(
        { error: "Failed to process participant data" },
        { status: 500 }
      );
    }

    const { error: participantAvailabilityError } = await supabase
      .from("participant_availability")
      .upsert(
        {
          user_id: participantData.id, // Use the returned ID directly
          availability: availableSlots,
          event_id: eventID,
        },
        { onConflict: "user_id, event_id" }
      );

    if (participantAvailabilityError) {
      console.error(
        "Error inserting availability:",
        participantAvailabilityError
      );
      return NextResponse.json(
        { error: "Failed to save availability" },
        { status: 500 }
      );
    }
    return NextResponse.json({
      success: true,
      message: "Availability submitted successfully",
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
