"use client";
import React, { useEffect, useState, use } from "react";
import Calendar from "@/components/calendar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import useEventData from "@/hooks/useEventData";

interface UserInfo {
	name: string;
	email: string;
	availableSlots: any[];
}

interface AvailabilitySlot {
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
		const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
		// TODO Pull event information from the eventID that's sent along with params
		// TODO Put info on UI.
		// TODO If the current user is organizer, show everyone's availability. If not, allow someone to submit availability with Name and Email
		// TODO allow routing back to dashboard if user is organizer

		const { authData, accessToken, isLoading } = useAuth();
		const eventData = useEventData(eventID);
		
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
							The event you're looking for doesn't exist or has been deleted.
						</p>
						<Button onClick={() => window.history.back()}>Go Back</Button>
					</div>
				</div>
			);
		}

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
						/>
					</div>
					<div className="flex-3 border-solid border-2">
						<Button>Submit Availability</Button>
					</div>
				</div>
				<div className="flex flex-col gap-2 items-start">
					<h2 className="font-bold text-2xl mb-4">Your user details</h2>
					<pre className="text-xs font-mono p-3 rounded border max-h-32 overflow-auto">
						{JSON.stringify(authData ? authData.claims : "not yet signed in", null, 2)}
					</pre>
				</div>
			</div>
		);
  }
