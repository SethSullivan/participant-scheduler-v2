"use client";

import { cn } from "@/lib/utils/utils";
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
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { EventData } from "@/types/types";

interface CreateEventProps extends React.ComponentPropsWithoutRef<"div"> {
  setShowPopup: (show: boolean) => void;
  setEventData: React.Dispatch<React.SetStateAction<EventData[] | null>>;
}

// Define event types
const EVENT_TYPES = [
  { value: "select_timeslot", label: "Select Timeslot" },
  { value: "select_availability", label: "Select Availability" },
];

export default function CreateEvent({
  className,
  setShowPopup,
  setEventData,
  ...props
}: CreateEventProps) {
  const [eventName, setEventName] = useState("");
  const [eventType, setEventType] = useState<string>(EVENT_TYPES[0].value);
  const [startTime, setStartTime] = useState<dayjs.Dayjs | null>(
    dayjs("2022-04-17T08:00")
  );
  const [endTime, setEndTime] = useState<dayjs.Dayjs | null>(
    dayjs("2022-04-17T18:00")
  );
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Validate inputs
      if (!eventName || !startTime || !endTime || !eventType) {
        setError("Please fill in all fields");
        setIsLoading(false);
        return;
      }

      // Make API request
      const response = await fetch("/api/create-event", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventName,
          eventType: eventType,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
        }),
      });

      const result = await response.json();

      // Handle different response statuses
      if (response.status === 401 || response.status === 403) {
        router.push("/sign-up");
        setIsLoading(false);
        return;
      }

      if (!response.ok) {
        setError(result.error || "Failed to create event");
        setIsLoading(false);
        return;
      }

      setEventData((prev) => (prev ? [...prev, result.data] : [result.data]));
      setIsLoading(false);
      setShowPopup(false);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
      setIsLoading(false);
      console.error("Error creating event:", error);
    }
  };

  return (
    <div
      data-testid="create-event-popup"
      className={cn("flex flex-col gap-6", className)}
      {...props}
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Event</CardTitle>
          <CardDescription>Enter event information</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleCreateEvent}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="event-name">Event Name</Label>
                <Input
                  data-testid="event-name-input"
                  id="event-name"
                  type="text"
                  placeholder="Team Meeting"
                  required
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="event-type">Event Type</Label>
                <select
                  id="event-type"
                  data-testid="event-type-select"
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {EVENT_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-2">
                <Label className="text-sm text-gray-800">
                  Choose the earliest time to schedule participants
                </Label>
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
                <Label className="text-sm text-gray-800">
                  Choose the latest time to schedule participants
                </Label>
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
              </div>

              {error && (
                <div className="text-sm text-red-500 bg-red-50 p-3 rounded">
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-2">
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
