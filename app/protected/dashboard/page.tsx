"use client";
import { Button } from "@/components/ui/button";
import React, { useEffect, useState } from "react";
import CreateEvent from "@/components/CreateEvent";
import EventCard from "@/components/event-card";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type EventsData = {
	organizer: string;
	start_time: Date;
	end_time: Date;
	name: string;
	created_at: Date;
	id: string;
};

export default function DashBoard() {
	const [showPopup, setShowPopup] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [eventsData, setEventsData] = useState<EventsData[] | null>(null);
	const router = useRouter();

	useEffect(() => {
		const getUsersEvents = async () => {
			try {
				const supabase = createClient();
				const { data } = await supabase.auth.getClaims();
				const user = data?.claims;
				if (!user) {
					router.push("/auth/login");
					return;
				}
				const { error: eventsError, data: eventsData } = await supabase
					.from("events")
					.select("*")
					.eq("organizer", user.sub);

				if (eventsError) throw eventsError;
				console.log("Events data", eventsData);
				if (eventsData) {
					setEventsData(eventsData);
				}
			} catch (error: any) {
				console.error("Error loading events:", error);
				setError(error.message);
			} finally {
				setIsLoading(false);
			}
		};
		setIsLoading(true);
		getUsersEvents();
	}, []);

	const handleEventClick = (event: EventsData) => {
		console.log("Event clicked:", event);
		// Add your event click logic here
		// For example: router.push(`/events/${event.id}`);
		alert(`Event: ${event.name}\nTime: ${event.start_time} - ${event.end_time}`);
	};
	return (
		<div className="min-h-screen p-6">
			<div className="max-w-6xl mx-auto">
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
					{/* Events List */}
					<div className="space-y-4">
						<h2 className="text-2xl font-bold text-gray-900 mb-4">Your Events</h2>

						{isLoading && (
							<div className="text-center py-8">
								<p className="text-gray-500">Loading events...</p>
							</div>
						)}

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
							<CreateEvent setShowPopup={setShowPopup} />
						) : (
							<div className="w-full max-w-md">
								<Button
									onClick={() => setShowPopup(true)}
									className="w-full h-12 text-lg"
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
