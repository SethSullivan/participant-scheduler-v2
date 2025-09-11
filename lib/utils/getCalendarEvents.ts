import { initializeGoogleServices } from "./gapiUtils";
import { CalendarEvent } from "@/types/types";

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

async function getCalendarEventsFromAPI(
  startDate: Date,
  endDate: Date,
  accessToken: string
): Promise<CalendarEvent[]> {
  try {
    // Must reinitialize google services
    await initializeGoogleServices();
    await waitForGapi();

    // Set the access token for the API client
    if (accessToken) {
      window.gapi.client.setToken({ access_token: accessToken });
    } else {
      throw Error("no access token, cannot ");
    }

    const calendarsResponse =
      await window.gapi.client.calendar.calendarList.list();
    const calendarIDs = calendarsResponse.result.items?.map((e) => e.id);
    const allEvents: CalendarEvent[] = [];
    if (calendarIDs) {
      for (const calendarID of calendarIDs) {
        if (!calendarID) {
          continue;
        }
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

        const events: CalendarEvent[] = response.result.items
          .filter((item: gapi.client.calendar.Event) => {
            // All-day events only have 'date', timed events have 'dateTime'
            return item.start?.dateTime && item.end?.dateTime;
          })
          .map((item: gapi.client.calendar.Event, index: number) => {
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
  accessToken: string
) {
  try {
    const tempStartDate = new Date();
    const startDate = includeToday
      ? tempStartDate
      : new Date(tempStartDate.getTime() + 1000 * 60 * 60 * 24);
    const tempEndDate = new Date(
      startDate.getTime() + 1000 * numDaysAhead * 60 * 60 * 24
    );
    const endDate = new Date(tempEndDate.setHours(17, 30, 0));
    const allDates = getDatesBetween(startDate, endDate);

    const events: CalendarEvent[] = await getCalendarEventsFromAPI(
      startDate,
      endDate,
      accessToken
    );
    // Organize events by day
    const organizedEvents = organizeCalendarEventsByDayIndex(events, allDates);
    return organizedEvents;
  } catch (error) {
    console.error("Error in getEvents:", error);
    return Array(numDaysAhead + 1).fill([]);
  }
}

function organizeCalendarEventsByDayIndex(
  events: CalendarEvent[],
  dates: Date[]
): CalendarEvent[][] {
  const eventsByDate: CalendarEvent[][] = [];
  for (let i = 0; i < dates.length; i++) {
    eventsByDate.push(
      events.filter((e) => e.start.getDate() === dates[i].getDate())
    );
  }
  return eventsByDate;
}
