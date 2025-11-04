"use client";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import CreateEvent from "@/components/create-event";
import EventCard from "@/components/event-card";
import { useRouter } from "next/navigation";
import { EventsData } from "@/types/types";
import LoadingSpinner from "@/components/ui/loading-screen";
import useUsersEvents from "@/hooks/useUsersEvents";

export default function DashBoard() {
  const [showPopup, setShowPopup] = useState(false);
  const router = useRouter();

  // Returning setEventsData from here so i can pass it down to CreateEvent component
  const { eventsData, isLoading:isLoadingEvents, error, setEventsData } = useUsersEvents();
  
  // Loading state initially set to false, used for handling event click
  const [loadingText, setLoadingText] = useState("Loading your events ...");
  const [isLoading, setIsLoading] = useState(false);
  
  const handleEventClick = (event: EventsData) => {
    setIsLoading(true);
    setLoadingText(`Loading ${event.name}...`);
    router.push(`/${event.id}`);
  };

  if (error) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center p-6">
        <h1 className="text-2xl font-bold mb-4 text-red-600">Error</h1>
        <p className="text-center text-gray-700">{error}</p>
        <Button
          variant="default"
          className="mt-6"
          onClick={() => router.refresh()}
        >
          Retry
        </Button>
      </div>
    );
  }

  if (isLoading || isLoadingEvents) {
    return <LoadingSpinner specificText={loadingText} />;
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Events List */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Your Events
            </h2>

            {error && (
              <div className="text-center py-8">
                <p className="text-red-500">Error: {error}</p>
              </div>
            )}

            {eventsData && eventsData.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  No events found. Create your first event!
                </p>
              </div>
            )}

            {eventsData && eventsData.length > 0 && (
              <div className="space-y-4">
                {eventsData.map((event, index) => (
                  <EventCard
                    key={event.id || index}
                    event={event}
                    onEventClick={handleEventClick}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Create Event Section */}
          <div className="flex justify-center items-start">
            {showPopup ? (
              <CreateEvent
                setShowPopup={setShowPopup}
                setEventsData={setEventsData} // Will just add the new event to the list
              />
            ) : (
              <div className="w-full max-w-md">
                <Button
                  onClick={() => setShowPopup(true)}
                  className="w-full h-12 text-lg"
                  variant={"default"}
                >
                  Create New Event
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
