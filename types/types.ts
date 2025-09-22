// Types for calendarevents

export type CalendarSlot = {
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
  user_id: string;
  created_at: Date;
  availability: CalendarSlot[];
  event_id: string;
};

export type EventsData = {
  organizer: string;
  start_time: Date;
  end_time: Date;
  name: string;
  created_at: Date;
  id: string;
};

export type CheckedState = {
  userID: string;
  isChecked: boolean;
};
