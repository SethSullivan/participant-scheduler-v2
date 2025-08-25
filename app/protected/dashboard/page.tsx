"use client";
import { Button } from "@/components/ui/button";
import React, { useEffect, useState } from "react";
import CreateEvent from "@/components/CreateEvent";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type EventsData = {
    organizer:string;
    start_time:string;
    end_time:string;
    name:string;
    created_at:Date;
}

export default function DashBoard() {
	const [showPopup, setShowPopup] = useState(false);
	const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [eventsData, setEventsData] = useState<EventsData[]|null>(null);
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
	return (
		<div className="flex min-h-screen justify-center items-center border-2 border-solid">
			<div className="flex justify-center items-center">
                <div className="flex-1 border-2 border-line">
                    placeholder
                </div>
                <div className="flex-1">
				{showPopup ? (
					<CreateEvent setShowPopup={setShowPopup} />
				) : (
					<Button onClick={() => setShowPopup(true)}>Create Event</Button>
				)}

                </div>
			</div>
		</div>
	);
}
