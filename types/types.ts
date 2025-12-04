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

export type EventData = {
  organizer_id: string;
  event_type: "select_availability" | "select_timeslot";
  start_time: string;
  end_time: string;
  name: string;
  created_at: string;
  id: string;
};

export type CheckedState = {
  userID: string;
  isChecked: boolean;
};
