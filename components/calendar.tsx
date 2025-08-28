import { useState, useEffect, } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { DateSelectArg, EventClickArg } from "@fullcalendar/core";
import { getEvents } from "@/lib/utils/getCalendarEvents";
import DeleteSlotPopup from "./ui/delete-slot-popup";
import { useDeleteSlot } from "@/hooks/useDeleteSlot";

interface AvailabilitySlot {
	id: string;
	title: string;
	start: Date;
	end: Date;
	isGcal: boolean;
	backgroundColor?: string;
	borderColor?: string;
	textColor?: string;
};

type CalendarEvent = {
	start: Date;
	end: Date;
	id: string;
	title: string;
	isGcal: boolean;
};

type EventData = {
	id: string;
	organizer: string;
	name: string;
	start_time: Date;
	end_time: Date;
	created_at: Date;
};

interface CalendarProps {
	accessToken?: string | undefined;
	availableSlots: AvailabilitySlot[];
	setAvailableSlots: React.Dispatch<React.SetStateAction<AvailabilitySlot[]>>;
	eventData: EventData;
	availabilityData:AvailabilitySlot[][] | undefined;
};

export default function Calendar({
	accessToken,
	availableSlots,
	setAvailableSlots,
	eventData,
	availabilityData,
}: CalendarProps) {
	const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]); // THESE ARE GCAL EVENTS FROM MY CALENDAR
	const [isLoading, setIsLoading] = useState(true);
	const { eventToDelete, initiateDelete, confirmDelete, cancelDelete } =
		useDeleteSlot(setAvailableSlots);
	useEffect(() => {
		const fetchEvents = async () => {
			if (accessToken) {
				try {
					setIsLoading(true);
					console.log("Calendar component fetching events...");
					const organizedEvents = await getEvents(6, true, accessToken);
					const flatEvents = organizedEvents.flat();
					// Add in isGcal to every event in the array
					flatEvents.map((v) => ({ ...v, isGcal: true }));
					setCalendarEvents(flatEvents);
					console.log("Calendar events loaded:", flatEvents);
				} catch (error) {
					console.error("Error loading calendar events:", error);
				} finally {
					setIsLoading(false);
				}
			} else {
				setIsLoading(false);
			}
		};
		fetchEvents();
	}, [accessToken]); // Re-fetch when access token changes

	const handleDateSelect = (selectInfo: DateSelectArg) => {
		// Create a new availability slot
		const newSlot: AvailabilitySlot = {
			id: Date.now().toString(),
			title: "Available",
			start: selectInfo.start,
			end: selectInfo.end,
			isGcal: false,
			backgroundColor: "#47b06cff",
			borderColor: "#0d3f1fff",
			textColor: "#000000ff",
		};

		setAvailableSlots((prev) => [...prev, newSlot]);

		// Clear the selection
		selectInfo.view.calendar.unselect();
	};
	const handleEventClick = (clickInfo: EventClickArg) => {
		if (!clickInfo.event.extendedProps.isGcal) {
			initiateDelete(clickInfo.event.id);
		}
	};
	const formatTimeForCalendar = (dateTime: Date | string): string => {
		const date = new Date(dateTime);
		if (isNaN(date.getTime())) {
			return "07:00:00"; // fallback time
		}
		// Format as HH:MM:SS for FullCalendar
		return date.toTimeString().slice(0, 8);
	};
	console.log("participant availability", availabilityData);
	const getAllEvents = () => {
		let events = calendarEvents.concat(availableSlots)
		// flatten participant availability
		if (availabilityData){
			const flattened = availabilityData.flat();
			events = events.concat(flattened)
		} 
		return events
	}
	
	// Add loading return early in the component
	if (isLoading) {
		return (
			<div className="calendar-container">
				<div className="flex items-center justify-center h-96">
					<div className="text-center">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
						<p className="text-gray-600">Loading calendar events...</p>
					</div>
				</div>
			</div>
		);
	}
	return (
		<div className="calendar-container">
			<div className="calendar-header pb-3">
				<p>Drag to select time ranges when you&apos;re available</p>
			</div>

			<FullCalendar
				plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
				initialView="timeGridWeek"
				headerToolbar={{
					left: "prev,next today",
					center: "title",
					right: "timeGridWeek,timeGridDay",
				}}
				weekends={false}
				selectable={true}
				selectMirror={true}
				dayMaxEvents={true}
				slotMinTime={formatTimeForCalendar(eventData.start_time)}
				slotMaxTime={formatTimeForCalendar(eventData.end_time)}
				slotDuration="00:15:00"
				height="auto"
				events={getAllEvents()}
				select={handleDateSelect}
				eventClick={handleEventClick}
				selectConstraint={{
					start: formatTimeForCalendar(eventData.start_time),
					end: formatTimeForCalendar(eventData.end_time),
				}}
				businessHours={{
					daysOfWeek: [1, 2, 3, 4, 5], // Monday - Friday
					startTime: "08:00",
					endTime: "18:00",
				}}
				eventOverlap={false}
				selectOverlap={false}
				allDaySlot={false}
			/>
			{eventToDelete && DeleteSlotPopup({ confirmDelete, cancelDelete })}
			{availableSlots.length > 0 && (
				<div className="availability-summary">
					<h3>Your Availability ({availableSlots.length} slots)</h3>
					<button className="clear-all-btn" onClick={() => setAvailableSlots([])}>
						Clear All
					</button>
				</div>
			)}
		</div>
	);
}
