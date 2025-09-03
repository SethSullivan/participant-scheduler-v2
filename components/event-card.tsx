"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, User } from "lucide-react";

type EventsData = {
  organizer: string;
  start_time: Date;
  end_time: Date;
  name: string;
  created_at: Date;
  id: string;
};

interface EventCardProps {
  event: EventsData;
  onEventClick: (event: EventsData) => void;
}

export default function EventCard({ event, onEventClick }: EventCardProps) {
  const formatTime = (dateString: Date) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (dateString: Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Card className="w-full max-w-md hover:shadow-lg transition-shadow cursor-pointer border border-gray-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-gray-900">
          {event.name}
        </CardTitle>
        <CardDescription className="text-sm text-gray-500">
          Created {formatDate(event.created_at)}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-gray-500" />
          <span className="text-gray-700">
            {formatTime(event.start_time)} - {formatTime(event.end_time)}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <User className="h-4 w-4 text-gray-500" />
          <span className="text-gray-700">
            Organizer: {event.organizer.substring(0, 8)}...
          </span>
        </div>

        <div className="pt-3">
          <Button
            onClick={() => onEventClick(event)}
            className="w-full"
            variant="outline"
          >
            View Availability
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
