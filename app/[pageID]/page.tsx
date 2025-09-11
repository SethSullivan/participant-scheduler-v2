"use client";
import React, { useState, use, useEffect } from "react";
import Calendar from "@/components/calendar";
import { Button } from "@/components/ui/button";
import useEventData from "@/hooks/useEventData";
import { useAuth } from "@/hooks/useAuth";
import useAvailabilityData from "@/hooks/useAvailabilityData";
import SubmitAvailabilityPopup from "@/components/submit-availability-popup";
import { AvailabilitySlot } from "@/types/types";

export default function ProtectedPage({
  params,
}: {
  params: Promise<{ pageID: string }>;
}) {
  const { pageID: eventID } = use(params);
  const [availableSlots, setAvailableSlots] = useState<AvailabilitySlot[]>([]);
  const [accessToken, setAccessToken]       = useState<string | undefined>(undefined);
  const [showPopUp, setShowPopUp]           = useState(false);

  // Get authData, eventData, and participantAvailabilityData
  const authData                    = useAuth();
  const { eventData, isLoading }    = useEventData(eventID);
  const participantAvailabilityData = useAvailabilityData(
    authData?.claims.sub,
    eventData?.organizer,
    eventID
  );

  // TODO allow routing back to dashboard if user is organizer

  // Use localStorage to get google access token and previous availability
  const refreshGoogleAccessToken = async (refreshToken: string): Promise<string | null> => {
    try {
      const response = await fetch('/api/refresh-google-access-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }
  
      const data = await response.json();
      
      // Update localStorage with new tokens
      localStorage.setItem('google_access_token', data.access_token);
      if (data.refresh_token) {
        localStorage.setItem('google_refresh_token', data.refresh_token);
      }
  
      return data.access_token;
    } catch (error) {
      console.error(error);
      return null;
    }
  };
  useEffect(() => {
    const initializeTokens = async () =>{

      const googleAccessToken = localStorage.getItem('google_access_token');
      const googleRefreshToken = localStorage.getItem('google_refresh_token');
      console.log(googleAccessToken)
      if (googleAccessToken) {
        // Check if token is still valid by making a test request
        try {
          const testResponse = await fetch('https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=' + googleAccessToken);
          console.log(testResponse)
          if (testResponse.ok) {
            // Token is still valid
            setAccessToken(googleAccessToken);
            console.log('Existing access token is valid');
          } else {
            throw new Error('Token expired');
          }
        } catch (error) {
          console.log('Access token expired or invalid, attempting refresh...');
          
          // Try to refresh the token
          if (googleRefreshToken) {
            const newAccessToken = await refreshGoogleAccessToken(googleRefreshToken);
            if (newAccessToken) {
              setAccessToken(newAccessToken);
              console.log('Successfully refreshed access token');
            } else {
              console.log('Failed to refresh token, user will need to re-authenticate');
              // Clear invalid tokens
              // localStorage.removeItem('google_access_token');
              // localStorage.removeItem('google_refresh_token');
            }
          } else {
            console.log('No refresh token available');
          }
        }
      } else if (googleRefreshToken) {
        // No access token but have refresh token
        console.log('No access token found, attempting to refresh...');
        const newAccessToken = await refreshGoogleAccessToken(googleRefreshToken);
        if (newAccessToken) {
          setAccessToken(newAccessToken);
        }
      }
      
      const localAvailability = localStorage.getItem(`availability-${eventID}`);
      if (localAvailability) {
        const availabilityInfo = JSON.parse(localAvailability);
        setAvailableSlots(availabilityInfo.availabilitySlots);
      }
    }
    initializeTokens();
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
          <Button onClick={handleSubmitAvailability} className="hover:bg-lime-800 ">
            Submit Availability
          </Button>
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
      </div>
      {showPopUp && (
        <SubmitAvailabilityPopup
          setShowPopUp={setShowPopUp}
          availableSlots={availableSlots} // Pass slots to popup
          eventID={eventID}
        />
      )}
    </div>
  );
}
