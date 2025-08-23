// Types for calendar events
interface CalendarEvent {
	id: (string|undefined)[];
	title: string;
	start: Date;
	end: Date;
	allDay?: boolean;
}

function getDatesBetween(startDate: Date, endDate: Date): Date[] {
	const dateArray: Date[] = [];
	let currentDate = new Date(startDate);

	while (currentDate <= endDate) {
		dateArray.push(new Date(currentDate));
		currentDate.setDate(currentDate.getDate() + 1);
	}

	return dateArray;
}

// Format date function to replace Utilities.formatDate
function formatDate(
	date: Date,
	timeZone: string = "UTC",
	format: string = "yyyy-MM-dd HH:mm:ss"
): string {
	const options: Intl.DateTimeFormatOptions = {
		timeZone,
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
		hour12: false,
	};

	if (format.includes("hh:mm")) {
		return date.toLocaleTimeString("en-US", {
			hour: "2-digit",
			minute: "2-digit",
			hour12: true,
			timeZone,
		});
	}

	return date.toLocaleString("sv-SE", options).replace(" ", " ");
}


async function getCalendarEventsFromAPI(
	calendarIDs: string[],
	startDate: Date,
	endDate: Date,
	accessToken?: string
): Promise<CalendarEvent[]> {
	try {
		console.log("Fetching calendar events...");
		console.log("Access token exists:", !!accessToken);

		// Set the access token for the API client
		if (accessToken) {
			window.gapi.client.setToken({ access_token: accessToken });
		}
		var allEvents: CalendarEvent[] = [];

		for (const calendarID of calendarIDs) {
			console.log("Calendar: ", calendarID)
			const response = await window.gapi.client.calendar.events.list({
				calendarId: calendarID,
				timeMin: startDate.toISOString(),
				timeMax: endDate.toISOString(),
				singleEvents: true,
				orderBy: "startTime",
				maxResults: 250,
			});
			if (!response.result || !response.result.items) {
				console.error("No events found, returning empty array");
				return [];
			}
			console.log("Calendar API response:", response);
	
			const events: CalendarEvent[] = response.result.items.map((item: any, index: number) => {
				return {
					id: item.id || `event-${index}`,
					title: item.summary || "No Title",
					start: item.start?.dateTime ? new Date(item.start.dateTime) : new Date(item.start?.date + "T00:00:00"),
					end: item.end?.dateTime ? new Date(item.end.dateTime) : new Date(item.end?.date + "T23:59:59"),
				}
			});
			allEvents.push(...events)
		};
		
		return allEvents

	} catch (error) {
		console.error("Error fetching calendar events:", error);
		return [];
	}
}

// Update your main getEvents function to accept accessToken
export async function getEvents(
	numDaysAhead = 6,
	startTime = "07:00",
	endTime = "18:00",
	includeToday = true,
	accessToken?: string
) {
	try {
		const totalDays = numDaysAhead + 1;
		const tempStartDate = new Date();
		const startDate = includeToday
			? tempStartDate
			: new Date(tempStartDate.getTime() + 1000 * 60 * 60 * 24);
		const tempEndDate = new Date(startDate.getTime() + 1000 * numDaysAhead * 60 * 60 * 24);
		const endDate = new Date(tempEndDate.setHours(17, 30, 0));
		const allDates = getDatesBetween(startDate, endDate);

		// Sample date formatting (replacing Google Apps Script APIs)
		const date = new Date(2023, 2, 15, 14, 30, 45);
		const formattedDate = formatDate(
			date,
			Intl.DateTimeFormat().resolvedOptions().timeZone,
			"yyyy-MM-dd HH:mm:ss"
		);

		const calendarIDs = [
			"primary",
			process.env.NEXT_PUBLIC_PERSONAL_CALENDAR_ID,
			process.env.NEXT_PUBLIC_LAB_CALENDAR_ID,
			process.env.NEXT_PUBLIC_LAB_COORDINATION_CALENDAR_ID,
		].filter((id): id is string => id !== undefined);

		const events: CalendarEvent[] = await getCalendarEventsFromAPI(
			calendarIDs,
			startDate,
			endDate,
			accessToken
		);
		// Organize events by day
		const organizedEvents = organizeCalendarEventsByDayIndex(events, allDates);
		console.log("organizedEvents", organizedEvents)
		return organizedEvents;

	} catch (error) {
		console.error("Error in getEvents:", error);
		const totalDays = numDaysAhead + 1;
		return Array(totalDays).fill([]);
	}
}

function organizeCalendarEventsByDayIndex(
	events: CalendarEvent[],
	dates: Date[]
): CalendarEvent[][] {
	const eventsByDate: CalendarEvent[][] = [];
	for (let i = 0; i < dates.length; i++) {
		eventsByDate.push(events.filter((e) => e.start.getDate() === dates[i].getDate()));
	}
	return eventsByDate;
}