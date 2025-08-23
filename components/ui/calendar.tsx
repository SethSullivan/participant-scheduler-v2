import { useState, useEffect, useCallback } from "react";
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { getEvents } from "@/lib/utils/getCalendarEvents";

interface AvailabilitySlot {
    id: string;
    title: string;
    start: Date;
    end: Date;
    backgroundColor?: string;
    borderColor?: string;
    textColor?: string;
}
interface CalendarProps {
    accessToken?: string | undefined;
    availableSlots: AvailabilitySlot[];
    setAvailableSlots: React.Dispatch<React.SetStateAction<any[]>>;
}

export default function Calendar({ accessToken, availableSlots, setAvailableSlots }: CalendarProps) {
    const [calendarEvents, setCalendarEvents] = useState<any[]>([]); // THESE ARE GCAL EVENTS FROM MY CALENDAR
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
            if (accessToken) {
                try {
                    setIsLoading(true);
                    console.log('Calendar component fetching events...');
                    const organizedEvents = await getEvents(6, "07:00", "18:00", true, accessToken);
                    const flatEvents = organizedEvents.flat();
                    setCalendarEvents(flatEvents);
                    console.log('Calendar events loaded:', flatEvents);
                } catch (error) {
                    console.error('Error loading calendar events:', error);
                } finally {
                    setIsLoading(false);
                }
            }
        };
        fetchEvents();
    }, [accessToken]); // Re-fetch when access token changes


    const handleDateSelect = (selectInfo: any) => {
        // Create a new availability slot
        const newSlot:AvailabilitySlot = {
            id: Date.now().toString(),
            title: 'Available',
            start: selectInfo.start,
            end: selectInfo.end,
            backgroundColor: '#47b06cff',
            borderColor: '#0d3f1fff',
            textColor: '#000000ff'
        };

        setAvailableSlots(prev => [...prev, newSlot]);
        
        // Clear the selection
        selectInfo.view.calendar.unselect();
    };

    const handleEventClick = (clickInfo: any) => {
        // Remove availability slot when clicked
        if (window.confirm('Remove this availability slot?')) {
            setAvailableSlots(prev => 
                prev.filter(slot => slot.id !== clickInfo.event.id)
            );
        }
    };

    return (
        <div className="calendar-container">
            <div className="calendar-header">
                <h2>Select Your Availability</h2>
                <p>Drag to select time ranges when you're available</p>
            </div>
            
            <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="timeGridWeek"
                headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: 'timeGridWeek,timeGridDay'
                }}
                weekends={false}
                selectable={true}
                selectMirror={true}
                dayMaxEvents={true}
                slotMinTime="07:00:00"
                slotMaxTime="19:00:00"
                slotDuration="00:30:00"
                height="auto"
                events={calendarEvents}
                select={handleDateSelect}
                eventClick={handleEventClick}
                selectConstraint={{
                    start: '07:00',
                    end: '19:00',
                }}
                businessHours={{
                    daysOfWeek: [1, 2, 3, 4, 5], // Monday - Friday
                    startTime: '07:00',
                    endTime: '19:00',
                }}
                eventOverlap={false}
                selectOverlap={false}
                allDaySlot={false}
            />
            
            {availableSlots.length > 0 && (
                <div className="availability-summary">
                    <h3>Your Availability ({availableSlots.length} slots)</h3>
                    <button 
                        className="clear-all-btn"
                        onClick={() => setAvailableSlots([])}
                    >
                        Clear All
                    </button>
                </div>
            )}
        </div>
    );
}