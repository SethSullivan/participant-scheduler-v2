import { useState } from "react";
import { CalendarSlot } from "@/types/types";

export const useDeleteSlot = (
  setAvailableSlots: React.Dispatch<React.SetStateAction<CalendarSlot[]>>
) => {
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);

  const initiateDelete = (eventId: string) => {
    setEventToDelete(eventId);
  };

  const confirmDelete = () => {
    if (eventToDelete) {
      setAvailableSlots((prev) =>
        prev.filter((slot) => slot.id !== eventToDelete)
      );
      setEventToDelete(null);
    }
  };

  const cancelDelete = () => {
    setEventToDelete(null);
  };

  return {
    eventToDelete,
    initiateDelete,
    confirmDelete,
    cancelDelete,
  };
};
