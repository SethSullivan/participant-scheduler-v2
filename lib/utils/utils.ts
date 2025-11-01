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

export function getUniqueParticipants(participantAvailabilityData:AvailabilityData[] | null, checked:CheckedState[]) {
  // Get list of participant names and colors
  // const uniqueParticipants:
    // | { userID: string; name: string; color: string; isChecked: boolean }[]
    // | undefined = undefined;
  if (participantAvailabilityData) {
    // Create an array where each element contains both the availability item and user_id
    const availabilityWithUserIds = participantAvailabilityData.flatMap(
      (item) =>
        item.availability.map((subitem) => ({
          availability: subitem,
          userID: item.user_id,
        }))
    );
    // Now map this combined data
    const uniqueParticipants = [
      ...new Set(
        availabilityWithUserIds.map(({ availability, userID }) =>
          JSON.stringify({
            userID: userID,
            name: availability.title.replace("Available: ", ""),
            isChecked: checked
              .filter((v) => v.userID == userID)
              .map((v) => v.isChecked)[0],
            color: availability.backgroundColor,
          })
        )
      ),
    ].map((item) => JSON.parse(item));
    return uniqueParticipants
  } else {
    return undefined
  }
}
