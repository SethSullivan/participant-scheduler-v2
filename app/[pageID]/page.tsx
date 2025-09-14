"use client";
import React, { useState, use, useEffect } from "react";
import Calendar from "@/components/calendar";
import CalendarSideBar from "@/components/calendar-sidebar";
import { Button } from "@/components/ui/button";
import useEventData from "@/hooks/useEventData";
import { useAuth } from "@/hooks/useAuth";
import useAvailabilityData from "@/hooks/useAvailabilityData";
import SubmitAvailabilityPopup from "@/components/submit-availability-popup";
import { CalendarSlot } from "@/types/types";
import useGoogleAccessToken from "@/hooks/useGoogleAccessToken";

export default function ProtectedPage({
  params,
}: {
  params: Promise<{ pageID: string }>;
}) {
  const { pageID: eventID } = use(params);
  const [availableSlots, setAvailableSlots] = useState<CalendarSlot[]>([]);
  const [showPopUp, setShowPopUp]           = useState(false);

  // Get authData, eventData, and participantAvailabilityData
  const authData = useAuth();
  const userID = authData?.claims.sub;
  const { eventData, isLoading }    = useEventData(eventID);
  const participantAvailabilityData = useAvailabilityData(
    userID,
    eventData?.organizer,
    eventID
  );
  const accessToken = useGoogleAccessToken(eventID);

  // TODO allow routing back to dashboard if user is organizer

  useEffect(() => {
    function getLocalAvailability() {
      const localAvailability = localStorage.getItem(`availability-${eventID}`);
      if (localAvailability) {
        const availabilityInfo = JSON.parse(localAvailability);
        setAvailableSlots(availabilityInfo.availabilitySlots);
      }
    };

    window.addEventListener("storage", getLocalAvailability)

    return () => {
      window.removeEventListener("storage", getLocalAvailability)
    }

  }, [])

  // Get list of participant names and colors
  let uniqueParticipants: {name:string, color:string}[]|undefined = undefined
  if (participantAvailabilityData) {
    uniqueParticipants = [...new Set(participantAvailabilityData
      .flatMap(item=> item.availability)
      .map(subitem => JSON.stringify({
        name: subitem.title.replace("Available: ", ""), color:subitem.backgroundColor
      }))
    )].map(item => JSON.parse(item) as {name:string, color:string});
    console.log(uniqueParticipants);
  }

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>Loading...</div>
      </div>
    );
  }
  // Handle case when event is not found
  if (!eventData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Event Not Found
          </h1>
          <p className="text-gray-600 mb-4">
            The event you&apos;re looking for doesn&apos;t exist or has been
            deleted.
          </p>
          <Button onClick={() => window.history.back()}>Go Back</Button>
        </div>
      </div>
    );
  }
  const handleSubmitAvailability = () => {
    if (availableSlots.length == 0) {
      alert("Please select availability");
    } else {
      setShowPopUp(true);
    }
  };
  return (
    <div className="flex flex-col w-full h-screen pb-10">
      {/* Header Container */}
      <div className="flex flex-[1] w-full items-center justify-between pb-1 pt-3">
          <h1 className="text-3xl font-semibold">
            {eventData ? eventData.name : ""}
          </h1>
          {!userID &&
            <Button onClick={handleSubmitAvailability} className="hover:bg-lime-800 ">
              Submit Availability
            </Button>
          }
      </div>

      {/* Calendar Container */}
      <div className="flex flex-[10] w-full">
        {/* Calendar Background style */}
        <div className="flex w-full bg-accent text-sm p-3 px-5 rounded-md text-foreground flex gap-3 items-center justify-items-center">
          <Calendar
            accessToken={accessToken}
            availableSlots={availableSlots}
            setAvailableSlots={setAvailableSlots}
            eventData={eventData}
            availabilityData={participantAvailabilityData?.map(
              (e) => e.availability
            )}
          />
        </div>
        {uniqueParticipants &&
          <div className="flex">
            <CalendarSideBar participantAvailability={uniqueParticipants}/>
          </div>
        }
      </div>
      {showPopUp && (
        <SubmitAvailabilityPopup
          setShowPopUp={setShowPopUp}
          availableSlots={availableSlots}
          eventID={eventID}
        />
      )}
    </div>
  );
}
