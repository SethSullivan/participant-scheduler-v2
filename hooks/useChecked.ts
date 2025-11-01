import { CheckedState, AvailabilityData } from "@/types/types";
import { useEffect, useState } from "react";
export default function useChecked(
  eventID: string,
  participantAvailabilityData:AvailabilityData[] | null
) {

  const [checked, setChecked] = useState<CheckedState[]>([]);

  useEffect(() => {
    function getChecked() {
      const checkedState = localStorage.getItem(`checked-state-${eventID}`);
      // Get from local storage
      if (checkedState && checkedState.length > 0) {
        const checkedStateData: CheckedState[] = JSON.parse(checkedState);

        // If localStorage hasn't been updated for new availability, then add a True to it
        if (participantAvailabilityData) {
          const participantIDs = participantAvailabilityData.map(
            (e) => e.user_id
          );
          const checkedIDs = checkedStateData.map((e) => e.userID);
          participantIDs.forEach((id) => {
            if (!checkedIDs.includes(id)) {
              checkedStateData.push({ userID: id, isChecked: true });
            }
          });
          localStorage.setItem(
            `checked-state-${eventID}`,
            JSON.stringify(checkedStateData)
          );
        }
        setChecked(checkedStateData);

        // Handle case where localStorage hasn't been set
      } else {
        if (participantAvailabilityData) {
          const initialCheckedState = participantAvailabilityData.map(
            (item) => ({
              userID: item.user_id,
              isChecked: true,
            })
          );
          setChecked(initialCheckedState);
          localStorage.setItem(
            `checked-state-${eventID}`,
            JSON.stringify(initialCheckedState)
          );
        }
      }
    }
    getChecked();

    window.addEventListener("storage", getChecked);

    return () => {
      window.removeEventListener("storage", getChecked);
    };
  }, [eventID, participantAvailabilityData]);
  return checked
}
