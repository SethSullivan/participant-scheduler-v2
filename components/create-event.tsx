"use client";

import { cn } from "@/lib/utils/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import dayjs from "dayjs";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { EventsData } from "@/types/types";

interface CreateEventProps extends React.ComponentPropsWithoutRef<"div"> {
  setShowPopup: (show: boolean) => void;
  setEventsData: React.Dispatch<React.SetStateAction<EventsData[] | null>>;
}

export default function CreateEvent({
  className,
  setShowPopup,
  setEventsData,
  ...props
}: CreateEventProps) {
  const router = useRouter();
  const [eventName, setEventName] = useState("");
  const [startTime, setStartTime] = useState<dayjs.Dayjs | null>(
    dayjs("2022-04-17T08:00")
  );
  const [endTime, setEndTime] = useState<dayjs.Dayjs | null>(
    dayjs("2022-04-17T18:00")
  );
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data } = await supabase.auth.getClaims();
      const user = data?.claims;

      if (!user) {
        setError("You must have an account to create an event");
        router.push("/sign-up");
        return;
      }

      if (user?.is_anonymous) {
        setError("You must have an account to create an event");
        router.push("/sign-up");
        return;
      }

      // Check if times are selected
      if (!startTime || !endTime) {
        setError("Please select both start and end times");
        setIsLoading(false);
        return;
      }

      if (startTime.isAfter(endTime) || startTime.isSame(endTime)) {
        setError("Start time must be before end time");
        setIsLoading(false);
        return;
      }

      const { error: eventsError, data: eventsData } = await supabase
        .from("events")
        .insert({
          name: eventName,
          organizer: user.sub,
          start_time: startTime.toISOString(), // Store as full datetime
          end_time: endTime.toISOString(), // Store as full datetime
        })
        .select();

      if (eventsError) {
        throw eventsError;
      }

      console.log("Event created successfully:", eventsData);
      const newEvent: EventsData = eventsData[0];
      setEventsData((prev: EventsData[] | null) =>
        prev ? [...prev, newEvent] : [newEvent]
      );

      // Clear form on success
      setEventName("");
      setStartTime(dayjs("2022-04-17T08:00"));
      setEndTime(dayjs("2022-04-17T18:00"));
      setShowPopup(false);
    } catch (error) {
      console.error("Error creating event:", error);
      setError((error as Error).message || "Failed to create event");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Event</CardTitle>
          <CardDescription>Enter event information</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleCreateEvent}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Event Name</Label>
                <Input
                  id="event-name"
                  type="name"
                  placeholder=""
                  required
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <p className="text-sm text-gray-800">
                  Choose the earliest time to schedule participants
                </p>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <TimePicker
                    label="Start Time"
                    value={startTime}
                    onChange={(newValue) => setStartTime(newValue)}
                    minTime={dayjs().set("hour", 6).startOf("hour")}
                    maxTime={dayjs().set("hour", 22).startOf("hour")}
                    minutesStep={15}
                  />
                </LocalizationProvider>
              </div>

              <div className="grid gap-2">
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <TimePicker
                    label="End Time"
                    value={endTime}
                    onChange={(newValue) => setEndTime(newValue)}
                    minTime={dayjs().set("hour", 6).startOf("hour")}
                    maxTime={dayjs().set("hour", 22).startOf("hour")}
                    minutesStep={15}
                  />
                </LocalizationProvider>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creating event..." : "Create Event"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowPopup(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
