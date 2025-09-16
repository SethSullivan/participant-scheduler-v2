import { useState } from "react";

export default function CalendarSideBar({
  participantAvailability,
}: {
  participantAvailability: { name: string; color: string }[];
}) {
  const [checked, setChecked] = useState(new Array(participantAvailability.length).fill(true))
  const handleChange = (idx: number) => {
    setChecked(prev => {
      const updated = [...prev];
      updated[idx] = !updated[idx];
      return updated;
    });
  };

  const listItems = participantAvailability.map((participant, idx) => {
    // Split name and email - assuming format like "John Doe (john@example.com)"
    const nameMatch = participant.name.match(/^(.+?)\s*\((.+?)\)$/);
    const displayName = nameMatch ? nameMatch[1] : participant.name;
    const email = nameMatch ? nameMatch[2] : "";
    return (
      <li key={idx} className="mb-1">
        <div className="flex items-center border border-gray-100 rounded p-2 min-h-[3rem]">
          <div
            className="flex w-6 h-6 rounded mr-3 flex-shrink-0 border-2 items-center justify-center"
            style={{ 
              backgroundColor: checked[idx] ? participant.color : "transparent",
              borderColor: participant.color
             }}
          >
              <label className="w-full h-full flex items-center justify-center">
              <input
                type="checkbox"
                checked={checked[idx]}
                onChange={() => handleChange(idx)}
                className="cursor-pointer appearance-none w-full h-full bg-transparent border-none"
              />
              {/* Custom checkmark - only visible when checked */}
              {checked[idx] && (
                <svg
                  className="absolute w-4 h-4 text-white pointer-events-none"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </label>
          </div>
          <div className="flex-1 text-sm">
            <div className="font-medium truncate">{displayName}</div>
            {email && (
              <div className="text-xs text-gray-500 truncate">{email}</div>
            )}
          </div>
        </div>
      </li>
    );
  });

  return (
    <div className="flex-col w-full items-start justify-center">
      {/* <div className="flex justify-items-center text-center items-center border-2 border-blue">
                Availability Legend
            </div> */}
      <ul className="">{listItems}</ul>
    </div>
  );
}
