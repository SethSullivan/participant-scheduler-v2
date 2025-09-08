import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Color wheel
export const colors = [
  "rgb(239, 68, 68)", // bg-red-500
  "rgb(22, 163, 74)", // bg-green-500
  "rgb(37, 99, 235)", // bg-blue-500
  "rgb(250, 204, 21)", // bg-yellow-500
  "rgb(128, 0, 128)", // bg-purple-500
  "rgb(236, 72, 153)", // bg-pink-500
  "rgb(75, 0, 130)", // bg-indigo-500
  "rgb(0, 128, 128)", // bg-teal-500
  "rgb(255, 165, 0)", // bg-orange-500
  "rgb(0, 255, 255)", // bg-cyan-500
];