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
  const [eventName, setEventName] = useState("");
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
      if (!eventName || !startTime || !endTime) {
        return {
          data: null,
          error: new Error("Please fill in all fields"),
        };
      }
      // Make API request
      const response = await fetch("/api/create-event", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventName,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
        }),
      });

      const result = await response.json();

      // Handle different response statuses
      if (response.status === 401 || response.status === 403) {
        router.push("/sign-up");
        return {
          data: null,
          error: new Error(result.error || "Authentication required"),
        };
      }

      if (!response.ok) {
        return {
          data: null,
          error: new Error(result.error || "Failed to create event"),
        };
      }

      setEventsData((prev) => (prev ? [...prev, result.data] : [result.data]));
      setIsLoading(false);
      setShowPopup(false);
      return {
        data: result.data,
        error: null,
      };
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
      setIsLoading(false);
      console.error("Error creating event:", error);
      return {
        data: null,
        error:
          error instanceof Error ? error : new Error("Unknown error occurred"),
      };
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
                <Label htmlFor="email">Event Name</Label>
                <Input
                  data-testid="event-name-input"
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
                <p className="text-sm text-gray-800">
                  Choose the latest time to schedule participants
                </p>
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
