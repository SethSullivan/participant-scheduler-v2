import { AvailabilityData, CheckedState } from "@/types/types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Color wheel
export const colors = [
  "rgba(239, 68, 68, 0.8)", // bg-red-500
  "rgb(22, 163, 74, 0.8)", // bg-green-500
  "rgb(37, 99, 235, 0.8)", // bg-blue-500
  "rgb(250, 204, 21, 0.8)", // bg-yellow-500
  "rgb(128, 0, 128, 0.8)", // bg-purple-500
  "rgb(236, 72, 153, 0.8)", // bg-pink-500
  "rgb(75, 0, 130, 0.8)", // bg-indigo-500
  "rgb(0, 128, 128, 0.8)", // bg-teal-500
  "rgb(255, 165, 0, 0.8)", // bg-orange-500
  "rgb(0, 255, 255, 0.8)", // bg-cyan-500
];

export function getParticipantsWithChecked(participantAvailabilityData:AvailabilityData[] | null, checked:CheckedState[]) {
  if (participantAvailabilityData) {

    // Get userID, name, isChecked, color for each unique participant
    const ans = participantAvailabilityData.map((item) => {
      const firstAvailability = item.availability[0]; // All availability items for a user have the same title and color
      return {
        userID: item.user_id,
        name: firstAvailability.title.replace("Available: ", ""),
        isChecked: checked
          .filter((v) => v.userID == item.user_id) // Filter to get the matching userID
          .map((v) => v.isChecked)[0], // Get the isChecked value, returns array of 1 so take first element
        color: firstAvailability.backgroundColor as string, // Color should be defined here, from useAvailabilityData.ts
      };
    });

    return ans;
  } else {
    return undefined
  }
}
