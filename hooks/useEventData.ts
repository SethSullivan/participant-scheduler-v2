import { createClient } from "@/lib/supabase/client";
import React, { useEffect, useState } from "react";

type EventData = {
	id: string;
	organizer: string;
	name: string;
	start_time: Date;
	end_time: Date;
	created_at: Date;
};

export default function useEventData(eventID: string) {
	const [eventData, setEventData] = useState<EventData | null>(null);
	const [isLoading, setIsLoading] = useState(true); // Add loading state

	useEffect(() => {
		const getEventData = async () => {
			const supabase = createClient();
			try {
				const { error: eventError, data: eventResponse } = await supabase
					.from("events")
					.select("*")
					.eq("id", eventID);

				if (eventError) {
					throw eventError;
				}

				if (eventResponse && eventResponse.length > 0) {
					setEventData(eventResponse[0]); // Get first item from array
				} else {
					setEventData(null); // No event found
				}
			} catch (error) {
				throw error;
			} finally {
				setIsLoading(false)
			}
		};
		getEventData();
	}, [eventID]);

	return {eventData, isLoading};
}
