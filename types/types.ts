// Types for calendarevents
export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
}

export type AvailabilitySlot = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  isGcal: boolean;
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
};
export type AvailabilityData = {
  id: string;
  created_at: Date;
  availability: AvailabilitySlot[];
  eventID: string;
};