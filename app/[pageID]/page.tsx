"use client";
import React, { useState, use, useEffect } from "react";
import Calendar from "@/components/calendar";
import { Button } from "@/components/ui/button";
import useEventData from "@/hooks/useEventData";
import { useAuth } from "@/hooks/useAuth";
import useAvailabilityData from "@/hooks/useAvailabilityData";
import SubmitAvailabilityPopup from "@/components/submit-availability-popup";

/* interface UserInfo {
	name: string;
	email: string;
	availableSlots: any[];
} */

type AvailabilitySlot = {
	id: string;
	title: string;
	start: Date;
	end: Date;
	isGcal:boolean;
	backgroundColor?: string;
	borderColor?: string;
	textColor?: string;
}

export default function ProtectedPage({
	params,
  }: {
	params: Promise<{ pageID: string }>
  }) {
		const { pageID: eventID } = use(params);
		const [availableSlots, setAvailableSlots] = useState<AvailabilitySlot[]>([]);
		const [accessToken, setAccessToken] = useState<string | undefined>(undefined);
		const [showPopUp, setShowPopUp] = useState(false);

		// const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
		// TODO If the current user is organizer, show everyone's availability. If not, allow someone to submit availability with Name and Email
		// TODO allow routing back to dashboard if user is organizer
		useEffect(()=>{
			// Get Google access token from localStorage
			const googleToken = localStorage.getItem("google_access_token");
			if (googleToken) {
				setAccessToken(googleToken);
			}
		}, [])
		const authData  = useAuth();
		const {eventData, isLoading} = useEventData(eventID);
		const participantAvailabilityData = useAvailabilityData(authData?.claims.sub, eventData?.organizer, eventID)

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
						<h1 className="text-2xl font-bold text-red-600 mb-4">Event Not Found</h1>
						<p className="text-gray-600 mb-4">
							The event you&apos;re looking for doesn&apos;t exist or has been deleted.
						</p>
						<Button onClick={() => window.history.back()}>Go Back</Button>
					</div>
				</div>
			);
		}
		const handleSubmitAvailability = () => {
			console.log("selected availability", availableSlots);
			if (availableSlots.length==0) {
				alert("Please select availability");
			} else {
				setShowPopUp(true);
			}
		};	
		return (
			<div className="flex-1 w-full flex flex-col gap-2">
				<h1 className="text-3xl font-semibold">{eventData ? eventData.name : ""}</h1>
				<div className="flex flex-row w-full">
					<div className="flex-3 bg-accent text-sm p-3 px-5 rounded-md text-foreground flex gap-3 items-center">
						<Calendar
							accessToken={accessToken}
							availableSlots={availableSlots}
							setAvailableSlots={setAvailableSlots}
							eventData={eventData}
							availabilityData={participantAvailabilityData?.map((e) => e.availability)}
						/>
					</div>
					<div className="flex-3 border-solid border-2">
						<Button onClick={handleSubmitAvailability}>Submit Availability</Button>
					</div>
				</div>
				{showPopUp &&
					<SubmitAvailabilityPopup
					setShowPopUp={setShowPopUp}
					availableSlots={availableSlots} // Pass slots to popup
					eventID={eventID}
					/>
				}
			</div>
		);
  }
