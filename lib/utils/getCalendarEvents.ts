import { initializeGoogleServices } from "./gapiUtils";

// Types for calendarevents
interface CalendarEvent {
	id: string;
	title: string;
	start: Date;
	end: Date;
}

function getDatesBetween(startDate: Date, endDate: Date): Date[] {
	const dateArray: Date[] = [];
	const currentDate = new Date(startDate);

	while (currentDate <= endDate) {
		dateArray.push(new Date(currentDate));
		currentDate.setDate(currentDate.getDate() + 1);
	}

	return dateArray;
}

// Format date function to replace Utilities.formatDate
// function formatDate(
// 	date: Date,
// 	timeZone: string = "UTC",
// 	format: string = "yyyy-MM-dd HH:mm:ss"
// ): string {
// 	const options: Intl.DateTimeFormatOptions = {
// 		timeZone,
// 		year: "numeric",
// 		month: "2-digit",
// 		day: "2-digit",
// 		hour: "2-digit",
// 		minute: "2-digit",
// 		second: "2-digit",
// 		hour12: false,
// 	};

// 	if (format.includes("hh:mm")) {
// 		return date.toLocaleTimeString("en-US", {
// 			hour: "2-digit",
// 			minute: "2-digit",
// 			hour12: true,
// 			timeZone,
// 		});
// 	}

// 	return date.toLocaleString("sv-SE", options).replace(" ", " ");
// }

function waitForGapi(): Promise<void> {
	return new Promise((resolve, reject) => {
		const checkGapi = () => {
			if (window.gapi && window.gapi.client && window.gapi.client.calendar) {
				resolve();
			} else if (window.gapi && window.gapi.client) {
				// gapi.client exists but calendar API not loaded yet
				setTimeout(checkGapi, 100);
			} else if (window.gapi) {
				// gapi exists but client not ready, wait a bit more
				setTimeout(checkGapi, 100);
			} else {
				reject(new Error("Google API not loaded"));
			}
		};
		checkGapi();
	});
}

async function getCalendarEventsFromAPI(
	startDate: Date,
	endDate: Date,
	accessToken?: string
): Promise<CalendarEvent[]> {
	try {
		console.log("Fetching calendar events...");
		console.log("Access token exists:", !!accessToken);

		// Must reinitialize google services
		await initializeGoogleServices();
		await waitForGapi();
		
		// Set the access token for the API client
		if (accessToken) {
			window.gapi.client.setToken({ access_token: accessToken });
		}

		const calendarsResponse = await window.gapi.client.calendar.calendarList.list();
		console.log("calendars", calendarsResponse.result.items);
		const calendarIDs = calendarsResponse.result.items?.map((e)=>e.id);
		var allEvents: CalendarEvent[] = [];
		if (calendarIDs) {
			for (const calendarID of calendarIDs) {
				if (!calendarID) {
					continue;
				}
				console.log("Calendar: ", calendarID);
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
				// console.log("Calendar API response:", response.result.items);
	
				const events: CalendarEvent[] = response.result.items
					.filter((item: gapi.client.calendar.Event) => {
						// All-day events only have 'date', timed events have 'dateTime'
						return item.start?.dateTime && item.end?.dateTime;
					})
					.map((item:  gapi.client.calendar.Event, index: number) => {
						return {
							id: item.id || `event-${index}`,
							title: item.summary || "No Title",
							start: item.start?.dateTime
								? new Date(item.start.dateTime)
								: new Date(item.start?.date + "T00:00:00"),
							end: item.end?.dateTime
								? new Date(item.end.dateTime)
								: new Date(item.end?.date + "T23:59:59"),
						};
					});
				allEvents.push(...events);
			}
			console.log(allEvents)
			return allEvents;
		} else {
			return [];
		}
	} catch (error) {
		console.error("Error fetching calendar events:", error);
		return [];
	}
}

// Update your main getEvents function to accept accessToken
export async function getEvents(
	numDaysAhead = 6,
	includeToday = true,
	accessToken?: string
) {
	try {
		const tempStartDate = new Date();
		const startDate = includeToday
			? tempStartDate
			: new Date(tempStartDate.getTime() + 1000 * 60 * 60 * 24);
		const tempEndDate = new Date(startDate.getTime() + 1000 * numDaysAhead * 60 * 60 * 24);
		const endDate = new Date(tempEndDate.setHours(17, 30, 0));
		const allDates = getDatesBetween(startDate, endDate);

		const events: CalendarEvent[] = await getCalendarEventsFromAPI(
			startDate,
			endDate,
			accessToken
		);
		// Organize events by day
		const organizedEvents = organizeCalendarEventsByDayIndex(events, allDates);
		console.log("organizedEvents", organizedEvents);
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
