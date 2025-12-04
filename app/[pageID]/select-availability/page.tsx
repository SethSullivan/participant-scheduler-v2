"use client";
import React, { useState, useEffect } from "react";
import CalendarSelectAvailability from "@/components/calendar";
import CalendarSideBar from "@/components/calendar-sidebar";
import { Button } from "@/components/ui/button";
import useEventData from "@/hooks/useEventData";
import { useAuth } from "@/hooks/useAuth";
import useAvailabilityData from "@/hooks/useAvailabilityData";
import SubmitAvailabilityPopup from "@/components/submit-availability-popup";
import { CalendarSlot } from "@/types/types";
import useGoogleAccessToken from "@/hooks/useGoogleAccessToken";
import useChecked from "@/hooks/useChecked";
import { getParticipantsWithChecked } from "@/lib/utils/utils";
import { useParams } from "next/navigation";

export default function CalendarPageAvailability() {
  const { pageID: eventID } = useParams<{ pageID: string }>();
  const [availableSlots, setAvailableSlots] = useState<CalendarSlot[]>([]);
  const [showPopUp, setShowPopUp] = useState(false);
  const [showInstructionalPopUp, setShowInstructionalPopUp] = useState(true);

  //* Get authData, eventData, and availabilityData
  const authData = useAuth();
  const userID = authData?.claims.sub;
  const { eventData, isLoading } = useEventData(eventID);
  // Need to return setAvailabilityData when user deletes a participant's availability
  const { availabilityData, setAvailabilityData } = useAvailabilityData(
    userID,
    eventData?.organizer_id,
    eventID
  );
  const accessToken = useGoogleAccessToken(eventID);

  //* Set checked to value that was set in localStorage from last time
  const initChecked = useChecked(eventID, availabilityData);
  const [checked, setChecked] = useState(initChecked);
  //! This useEffect must be here bc initChecked is not available on first render,
  //! and therefore sets checked = [] and won't be updated without useEffect
  useEffect(() => {
    setChecked(initChecked);
  }, [initChecked]);

  //* Save to localStorage when checked (or eventID) is changed
  useEffect(() => {
    if (checked.length > 0) {
      localStorage.setItem(`checked-state-${eventID}`, JSON.stringify(checked));
    }
  }, [checked, eventID]);

  const handleCheckUpdate = (participantID: string) => {
    setChecked((prev) => {
      return prev.map((v) => {
        if (v.userID === participantID) {
          return { ...v, isChecked: !v.isChecked };
        }
        return v;
      });
    });
  };
  const HandleDeleteParticipant = async (participantID: string) => {
    // Remove participant availability from availabilityData
    if (availabilityData) {
      const newAvailabilityData = availabilityData.filter(
        (v) => v.user_id !== participantID
      );
      setAvailabilityData(newAvailabilityData);
      console.log("HERE");
      console.log(newAvailabilityData);
      // Delete participant from database
      // Make API request
      const response = await fetch("/api/delete-participant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          participantID,
        }),
      });
      const result = await response.json();

      if (!response.ok) {
        console.error(
          "Error deleting participant:",
          result.error || "Failed to delete participant"
        );
      }
    }
  };

  // TODO allow routing back to dashboard if user is organizer

  //* Get unique participants and checkedIDs for the sidebar
  const participantsWithChecked = getParticipantsWithChecked(
    availabilityData,
    checked
  );
  let checkedIDs: string[] = [];
  if (participantsWithChecked) {
    checkedIDs = participantsWithChecked
      .filter((v) => v.isChecked)
      .map((v) => v.userID);
  }

  //* Get local Availability data, for anonymous users
  useEffect(() => {
    function getLocalAvailability() {
      const localAvailability = localStorage.getItem(`availability-${eventID}`);
      if (localAvailability) {
        const availabilityInfo = JSON.parse(localAvailability);
        setAvailableSlots(availabilityInfo.availabilitySlots);
      }
    }

    window.addEventListener("storage", getLocalAvailability);

    return () => {
      window.removeEventListener("storage", getLocalAvailability);
    };
  }, [eventID]);

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

  if (!isLoading && showInstructionalPopUp && !userID) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
          <h2 className="text-2xl font-bold mb-4">How to Use the Calendar</h2>
          <ul className="list-disc list-inside mb-4 text-left">
            <li>To select, click and drag inside the calendar.</li>
            <li>To delete, click on Availability Block.</li>
            <li>To submit, click &quot;Submit Availability&quot;.</li>
          </ul>
          <Button
            onClick={() => {
              setShowInstructionalPopUp(false);
            }}
          >
            Got it!
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-screen pb-10">
      {/* Header Container */}
      <div className="flex flex-[1] w-full items-center justify-between pb-1 pt-3">
        <h1 className="text-3xl font-semibold">
          {eventData ? eventData.name : ""}
        </h1>
        {!userID && (
          <Button
            onClick={() => {
              if (availableSlots.length == 0) {
                alert("Please select availability");
              } else {
                setShowPopUp(true);
              }
            }}
            className="hover:bg-lime-800 "
          >
            Submit Availability
          </Button>
        )}
      </div>
      {/* Calendar Container */}
      <div className="flex flex-[10] w-full">
        {/* Calendar Background style */}
        <div className="flex w-full bg-accent text-sm p-3 px-5 rounded-md text-foreground flex gap-3 items-center justify-items-center">
          <CalendarSelectAvailability
            accessToken={accessToken}
            availableSlots={availableSlots}
            setAvailableSlots={setAvailableSlots}
            eventData={eventData}
            availabilityData={
              availabilityData && checkedIDs
                ? availabilityData
                    .filter((v) => checkedIDs.includes(v.user_id))
                    .map((e) => e.availability)
                : availabilityData?.map((e) => e.availability) || []
            }
          />
        </div>
        {participantsWithChecked && participantsWithChecked.length > 0 && (
          <div className="flex">
            <CalendarSideBar
              participantInformation={participantsWithChecked}
              handleCheckUpdate={handleCheckUpdate}
              handleDeleteParticipant={HandleDeleteParticipant}
            />
          </div>
        )}
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
