"use client";

import { cn } from "@/lib/utils/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { routerServerGlobal } from "next/dist/server/lib/router-utils/router-server-context";

interface CreateEventProps extends React.ComponentPropsWithoutRef<"div"> {
    setShowPopup: (show: boolean) => void;
}

export default function CreateEvent({
	className, 
    setShowPopup,
	...props
}: CreateEventProps) {
	const router = useRouter();
	const [eventName, setEventName] = useState("");
	const [startTime, setStartTime] = useState("");
	const [endTime, setEndTime] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const handleCreateEvent = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setError(null);
		try {
			// 4. Add proper error handling
			const supabase = createClient();
			const { data } = await supabase.auth.getClaims();
			const user = data?.claims;

			console.log(user);
			if (!user) {
				setError("You must have an account to create an event");
				router.push("/auth/sign-up");
				return;
			}
			if (user?.is_anonymous) {
				setError("You must have an account to create an event");
				router.push("/auth/sign-up"); // 5. Fix router path (add leading slash)
				return;
			}

			// Convert time inputs to full datetime objects in user's timezone
			const today = new Date();
			const startDateTime = new Date(`${today.toISOString().split("T")[0]}T${startTime}:00`);
			const endDateTime = new Date(`${today.toISOString().split("T")[0]}T${endTime}:00`);

			const { error: eventsError, data: eventsData } = await supabase
				.from("events")
				.insert({
					name: eventName,
					organizer: user.sub,
					start_time: startDateTime.toISOString(), // Store as full datetime
					end_time: endDateTime.toISOString(), // Store as full datetime
				})
				.select();

			if (eventsError) {
				throw eventsError;
			}

			console.log("Event created successfully:", eventsData);
			// Clear form on success
			setEventName("");
			setStartTime("");
			setEndTime("");
			setShowPopup(false);
		} catch (error: any) {
			console.error("Error creating event:", error);
			setError(error.message || "Failed to create event");
		} finally {
			setIsLoading(false);
		}
	};
	return (
		<div className={cn("flex flex-col gap-6", className)} {...props}>
			<Card>
				<CardHeader>
					<CardTitle className="text-2xl">Event</CardTitle>
					<CardDescription>Enter event information</CardDescription>
				</CardHeader>

				<CardContent>
					<form onSubmit={handleCreateEvent}>
						<div className="flex flex-col gap-6">
							<div className="grid gap-2">
								<Label htmlFor="email">Event Name</Label>
								<Input
									id="event-name"
									type="name"
									placeholder=""
									required
									value={eventName}
									onChange={(e) => setEventName(e.target.value)}
								/>
							</div>

							<div className="grid gap-2">
								<Label htmlFor="start-time">Start Time</Label>
								<Input
									id="start-time"
									type="time"
									required
									value={startTime}
									onChange={(e) => setStartTime(e.target.value)}
								/>
							</div>

							<div className="grid gap-2">
								<Label htmlFor="start-time">End Time</Label>
								<Input
									id="end-time"
									type="time"
									required
									value={endTime}
									onChange={(e) => setEndTime(e.target.value)}
								/>
								{error && <p className="text-sm text-red-500">{error}</p>}
								<Button type="submit" className="w-full" disabled={isLoading}>
									{isLoading ? "Creating event..." : "Create Event"}
								</Button>
<Button 
                                type="button" 
                                variant="outline" 
                                className="w-full" 
                                onClick={() => setShowPopup(false)}
                            >
                                Cancel
                            </Button>
							</div>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
