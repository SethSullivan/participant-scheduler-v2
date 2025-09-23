"use client";
import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

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
  const { eventData, isLoading } = useEventData(eventID);
  
  // Initialize with empty/default values
  const [eventName, setEventName] = useState("");
  const [startTime, setStartTime] = useState<dayjs.Dayjs | null>(null);
  const [endTime, setEndTime] = useState<dayjs.Dayjs | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccessful, setSubmissionSuccessful] = useState(false);
  const [deleteSuccessful, setDeleteSuccessful] = useState(false);

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

  const handleDeleteEvent = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this event? This action cannot be undone."
    );

    if (confirmDelete) {
      try {
        const supabase = createClient();
        const { data } = await supabase.auth.getClaims();
        const user = data?.claims;

        if (!user) {
          setError("You must be signed in to delete an event");
          await new Promise((resolve) => setTimeout(resolve, 3000));
          router.push("/sign-up");
          return;
        }

        if (user.sub !== eventData?.organizer) {
          setError("You must be the organizer to delete an event");
          //wait 3 seconds
          await new Promise((resolve) => setTimeout(resolve, 3000));
          router.back();
          return;
        }

        const { error: deleteError } = await supabase
          .from("events")
          .delete()
          .eq("id", eventID);

        if (deleteError) {
          throw deleteError;
        } else {
          setDeleteSuccessful(true);
        }
      } catch (error) {
        console.error("Error deleting event:", error);
        setError((error as Error).message || "Failed to delete event");
      }
    }
  };

  if(error) {
    return (
      <div className="min-h-screen p-6 flex flex-col items-center justify-start space-y-4 pt-40">
        <h1 className="text-red-500">Error: {error}</h1>
      </div>
    );
  }

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
  if (deleteSuccessful) {
    return (
      <div className="min-h-screen p-6 flex flex-col items-center justify-start space-y-4 pt-40">
        <h1>Successfully deleted event</h1>
        <Button onClick={() => router.push(`/dashboard`)}>
          Back to Dashboard
        </Button>
      </div>
    );
  }
  return (
    <div className="flex flex-col w-full self-center items-center justify-center min-h-screen p-6">
      <div className="flex flex-col max-w-md w-full">
        {isLoading && <LoadingSpinner specificText="Loading event editor" />}
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
                className="border border-gray-300 rounded-sm p-2 h-14"
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
                  className="border-gray-300"
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
                  className="border-gray-300"
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
      <div className="flex flex-grow justify-center items-end pb-10 mt-auto">
        <Button variant="destructive" className="mt-10" onClick={() => handleDeleteEvent()}>
          Delete Event
        </Button>
      </div>
    </div>
    );
}
