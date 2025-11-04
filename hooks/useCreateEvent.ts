import { useRouter } from "next/router";
import dayjs from "dayjs";
import { createClient } from "@/lib/supabase/client";
export async function useCreateEvent(
    eventName: string,
    startTime: dayjs.Dayjs | null,
    endTime: dayjs.Dayjs | null,
) {
    const supabase = createClient();
    const router = useRouter();
    const { data } = await supabase.auth.getClaims();
    const user = data?.claims;

    if (!user) {
        router.push("/sign-up");
        return { data: null, error: new Error("You must have an account to create an event") };
    }

    if (user?.is_anonymous) {
        router.push("/sign-up");
        return { data: null, error: new Error("You must have an account to create an event") };
    }

    // Check if times are selected
    if (!startTime || !endTime) {
        return { data: null, error: new Error("Please select both start and end times") };
    }
    // Validate that start time is before end time
    if (startTime.isAfter(endTime) || startTime.isSame(endTime)) {
        return { data: null, error: new Error("Start time must be before end time") };
    }

    const { error: eventsError, data: eventsData } = await supabase
    .from("events")
    .insert({
        name: eventName,
        organizer: user.sub,
        start_time: startTime.toISOString(), // Store as full datetime
        end_time: endTime.toISOString(), // Store as full datetime
    })
    .select()
    .single();

    if (eventsError) {
        return { data: null, error: eventsError };
    }
    return { data: eventsData, error: null };
};