import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { AvailabilityData, AvailabilitySlot } from "@/types/types";
import { colors } from "@/lib/utils/utils";

export default function useAvailabilityData(
  userID: string | undefined,
  organizerID: string | undefined,
  eventID: string | undefined
) {
  const [availabilityData, setAvailabilityData] = useState<
    AvailabilityData[] | null
  >(null);
  useEffect(() => {
    const getParticipantAvailability = async () => {
      // If there's no userID, this user shouldn't be able to see others availability
      if (!userID) {
        return;
      }

      // If the current user is not the organizer, then they shouldn't be able to see others availability
      if (userID != organizerID) {
        return;
      }

      const supabase = createClient();
      try {
        const { error: availabilityError, data: availabilityResponse } =
          await supabase
            .from("participant_availability")
            .select("*")
            .eq("event_id", eventID);
        if (availabilityError) {
          throw availabilityError;
        }
        // Modify color of each persons availability
        if (availabilityResponse && availabilityResponse.length > 0) {
          const modifiedAvailability = availabilityResponse.map((participant, index) => ({
            ...participant,
            availability: participant.availability.map((slot:AvailabilitySlot) => ({
              ...slot,
              backgroundColor: colors[index % colors.length],
            })),
          }));
          
          setAvailabilityData(modifiedAvailability);
        }
      } catch (error) {
        console.error("Error fetching participant_availability", error);
      }
    };
    getParticipantAvailability();
  }, [eventID, organizerID, userID]);
  return availabilityData;
}
