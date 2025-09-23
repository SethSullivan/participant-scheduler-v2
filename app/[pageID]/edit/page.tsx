"use client";
import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

import { EventsData } from "@/types/types";
import LoadingSpinner from "@/components/ui/loading-screen";
import useEventData from "@/hooks/useEventData";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { Button } from "@/components/ui/button";

// Simple inline spinner component
function ButtonSpinner() {
  return (
    <div className="flex items-center">
      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
    </div>
  );
}
export default function EditEventPage({
  params,
}: {
  params: Promise<{ pageID: string }>;
}) {
  const { pageID: eventID } = use(params);
  const router = useRouter();
  const supabase = createClient();
  const { eventData, isLoading } = useEventData(eventID);
  
  // Initialize with empty/default values
  const [eventName, setEventName] = useState("");
  const [startTime, setStartTime] = useState<dayjs.Dayjs | null>(null);
  const [endTime, setEndTime] = useState<dayjs.Dayjs | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccessful, setSubmissionSuccessful] = useState(false);

  // Update state values when eventData is loaded
  useEffect(() => {
    if (eventData && !isLoading) {
      setEventName(eventData.name);
      console.log(eventData)
      // Handle possible invalid dates safely
      try {
        if (eventData.start_time) {
          const startDayjs = dayjs(eventData.start_time);
          setStartTime(startDayjs.isValid() ? startDayjs : null);
        }
        
        if (eventData.end_time) {
          const endDayjs = dayjs(eventData.end_time);
          setEndTime(endDayjs.isValid() ? endDayjs : null);
        }
      } catch (error) {
        console.error("Error parsing dates:", error);
        setError("Error loading event times");
      }
    }
  }, [eventData, isLoading]);

  const handleSaveChanges = async () => {
    try {
      setIsSubmitting(true);
      const supabase = createClient();
      const { data } = await supabase.auth.getClaims();
      const user = data?.claims;

      if (!user) {
        setError("You must be the organizer to edit an event");
        router.push("/sign-up");
        return;
      }

      if (user.sub !== eventData?.organizer) {
        setError("You must be the organizer to edit an event");
        router.back();
        return;
      }

      // Check if times are selected
      if (!startTime || !endTime) {
        setError("Please select both start and end times");
        setIsSubmitting(false);
        return;
      }

      if (startTime.isAfter(endTime) || startTime.isSame(endTime)) {
        setError("Start time must be before end time");
        setIsSubmitting(false);
        return;
      }
      const { error: eventsError } = await supabase.from("events").upsert({
        id: eventID,
        name: eventName,
        organizer: user.sub,
        start_time: startTime.toISOString(), // Store as full datetime
        end_time: endTime.toISOString(), // Store as full datetime
      });
      // router.back();

      if (eventsError) {
        throw eventsError;
      } else {
        setSubmissionSuccessful(true);
      }
    } catch (error) {
      console.error("Error updating event:", error);
      setError((error as Error).message || "Failed to update event");
    } finally {
      setIsSubmitting(false);
    }
  };
  if (submissionSuccessful) {
    return (
      <div className="min-h-screen p-6 flex flex-col items-center justify-start space-y-4 pt-40">
        <h1>Successfully updated event!</h1>
        <Button onClick={() => router.push(`/dashboard`)}>
          Back to Dashboard
        </Button>
        <Button onClick={() => setSubmissionSuccessful(false)} variant="outline">
          Continue Editing
        </Button>
      </div>
    );
  }
  return (
    <div className="min-h-screen p-6">
      <div className="max-w-xl mx-auto">
        {isLoading && <LoadingSpinner />}
        {!isLoading && eventData && (
          // Edit EventName
          <div className="space-y-6">
            <div className="flex flex-col gap-2">
              <label htmlFor="eventName" className="font-medium">
                Event Name
              </label>
              <input
                id="eventName"
                type="text"
                defaultValue={eventName}
                required
                className="border border-gray-300 rounded-md p-2"
                onChange={(e) => setEventName(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="eventName" className="font-medium">
                Start Time
              </label>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <TimePicker
                  label=""
                  value={startTime}
                  onChange={(newValue) => setStartTime(newValue)}
                  minTime={dayjs().set("hour", 6).startOf("hour")}
                  maxTime={dayjs().set("hour", 22).startOf("hour")}
                  minutesStep={15}
                />
              </LocalizationProvider>
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="eventName" className="font-medium">
                End Time
              </label>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <TimePicker
                  label=""
                  value={endTime}
                  onChange={(newValue) => setEndTime(newValue)}
                  minTime={dayjs().set("hour", 6).startOf("hour")}
                  maxTime={dayjs().set("hour", 22).startOf("hour")}
                  minutesStep={15}
                />
              </LocalizationProvider>
            </div>
            <div className="flex justify-center">
              <Button onClick={() => handleSaveChanges()}>
                {isSubmitting ? <ButtonSpinner /> : "Save Changes"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
    );
}
