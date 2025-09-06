import { useState } from "react";
import { AvailabilitySlot } from "@/types/types";

export const useDeleteSlot = (
  setAvailableSlots: React.Dispatch<React.SetStateAction<AvailabilitySlot[]>>
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
