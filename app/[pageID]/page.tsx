"use client";
import React, { useState, use, useEffect } from "react";
import Calendar from "@/components/calendar";
import CalendarSideBar from "@/components/calendar-sidebar";
import { Button } from "@/components/ui/button";
import useEventData from "@/hooks/useEventData";
import { useAuth } from "@/hooks/useAuth";
import useAvailabilityData from "@/hooks/useAvailabilityData";
import SubmitAvailabilityPopup from "@/components/submit-availability-popup";
import { CalendarSlot, CheckedState } from "@/types/types";
import useGoogleAccessToken from "@/hooks/useGoogleAccessToken";

export default function ProtectedPage({
  params,
}: {
  params: Promise<{ pageID: string }>;
}) {
  const { pageID: eventID } = use(params);
  const [availableSlots, setAvailableSlots] = useState<CalendarSlot[]>([]);
  const [showPopUp, setShowPopUp] = useState(false);
  const [showInstructionalPopUp, setShowInstructionalPopUp] = useState(true);

  // Get authData, eventData, and participantAvailabilityData
  const authData = useAuth();
  const userID = authData?.claims.sub;
  const { eventData, isLoading } = useEventData(eventID);
  const participantAvailabilityData = useAvailabilityData(
    userID,
    eventData?.organizer,
    eventID
  );
  const accessToken = useGoogleAccessToken(eventID);

  const [checked, setChecked] = useState<CheckedState[]>([]);

  // Get local Availability data (mainly for anonymous users)
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

  useEffect(() => {
    function getChecked() {
      const checkedState = localStorage.getItem(`checked-state-${eventID}`);
      // Get from local storage
      if (checkedState && checkedState.length > 0) {
        const checkedStateData: CheckedState[] = JSON.parse(checkedState);

        // If localStorage hasn't been updated for new availability, then add a True to it
        if (participantAvailabilityData) {
          const participantIDs = participantAvailabilityData.map(
            (e) => e.user_id
          );
          const checkedIDs = checkedStateData.map((e) => e.userID);
          participantIDs.forEach((id) => {
            if (!checkedIDs.includes(id)) {
              checkedStateData.push({ userID: id, isChecked: true });
            }
          });
          localStorage.setItem(
            `checked-state-${eventID}`,
            JSON.stringify(checkedStateData)
          );
        }
        setChecked(checkedStateData);

        // Handle case where localStorage hasn't been set
      } else {
        if (participantAvailabilityData) {
          const initialCheckedState = participantAvailabilityData.map(
            (item) => ({
              userID: item.user_id,
              isChecked: true,
            })
          );
          setChecked(initialCheckedState);
          localStorage.setItem(
            `checked-state-${eventID}`,
            JSON.stringify(initialCheckedState)
          );
        }
      }
    }
    getChecked();

    window.addEventListener("storage", getChecked);

    return () => {
      window.removeEventListener("storage", getChecked);
    };
  }, [eventID, participantAvailabilityData]);

  // Save to localStorage when checked (or eventID) is changed
  useEffect(() => {
    if (checked.length > 0) {
      localStorage.setItem(`checked-state-${eventID}`, JSON.stringify(checked));
    }
  }, [checked, eventID]);

  const handleChange = (participantID: string) => {
    setChecked((prev) => {
      return prev.map((v) => {
        if (v.userID === participantID) {
          return { ...v, isChecked: !v.isChecked };
        }
        return v;
      });
    });
  };
  // TODO allow routing back to dashboard if user is organizer

  // Get list of participant names and colors
  let uniqueParticipants:
    | { userID: string; name: string; color: string; isChecked: boolean }[]
    | undefined = undefined;

  if (participantAvailabilityData) {
    // Create an array where each element contains both the availability item and user_id
    const availabilityWithUserIds = participantAvailabilityData.flatMap(
      (item) =>
        item.availability.map((subitem) => ({
          availability: subitem,
          userID: item.user_id,
        }))
    );
    // Now map this combined data
    uniqueParticipants = [
      ...new Set(
        availabilityWithUserIds.map(({ availability, userID }) =>
          JSON.stringify({
            userID: userID,
            name: availability.title.replace("Available: ", ""),
            isChecked: checked
              .filter((v) => v.userID == userID)
              .map((v) => v.isChecked)[0],
            color: availability.backgroundColor,
          })
        )
      ),
    ].map((item) => JSON.parse(item));
  }

  let checkedIDs: string[] | undefined = undefined;
  if (uniqueParticipants) {
    checkedIDs = uniqueParticipants
      .filter((v) => v.isChecked)
      .map((v) => v.userID);
  }

  // Show loading state while checking auth
  const handleSubmitAvailability = () => {
    if (availableSlots.length == 0) {
      alert("Please select availability");
    } else {
      setShowPopUp(true);
    }
  };
  const handleCloseInstructionalPopUp = () => {
    setShowInstructionalPopUp(false);
  };

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
            <li>Click and Drag inside the calendar to select availability.</li>
            <li>Click on Availability Block to remove it if necessary.</li>
            <li>Click &quot;Submit Availability&quot; to submit your availability.</li>
          </ul>
          <Button onClick={handleCloseInstructionalPopUp}>Got it!</Button>
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
            onClick={handleSubmitAvailability}
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
          <Calendar
            accessToken={accessToken}
            availableSlots={availableSlots}
            setAvailableSlots={setAvailableSlots}
            eventData={eventData}
            availabilityData={
              participantAvailabilityData && checkedIDs
                ? participantAvailabilityData
                    .filter((v) => checkedIDs.includes(v.user_id))
                    .map((e) => e.availability)
                : participantAvailabilityData?.map((e) => e.availability) || []
            }
          />
        </div>
        {uniqueParticipants && (
          <div className="flex">
            <CalendarSideBar
              participantAvailability={uniqueParticipants}
              checked={checked}
              handleChange={handleChange}
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
