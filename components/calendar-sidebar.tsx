import { useState } from "react";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type ParticipantInfo = {
  userID: string;
  name: string;
  color: string;
  isChecked?: boolean;
};

export function splitNameAndEmail(nameWithEmail: string) {
  const nameMatch = nameWithEmail.match(/^(.+?)\s*\((.+?)\)$/);
  const displayName = nameMatch ? nameMatch[1] : nameWithEmail;
  const email = nameMatch ? nameMatch[2] : "";
  return { displayName, email };
}

export function ParticipantItem({
  idx,
  participant,
  handleCheckUpdate,
  handleDeleteParticipant,
}: {
  idx: number;
  participant: ParticipantInfo;
  handleCheckUpdate: (userID: string) => void;
  handleDeleteParticipant: (userID: string) => void;
}) {
  const [showPopup, setShowPopup] = useState(false);
  const { displayName, email } = splitNameAndEmail(participant.name);
  const isChecked =
    participant.isChecked !== undefined ? participant.isChecked : true;

  return (
    <li key={idx} className="mb-1 relative">
      <div className="flex items-start border border-gray-100 rounded p-2 min-h-[3rem]">
        {/* Checkbox with color indicator */}
        <div
          className="flex w-6 h-6 rounded mr-3 flex-shrink-0 border-2 items-center justify-center"
          style={{
            backgroundColor: isChecked ? participant.color : "transparent",
            borderColor: participant.color,
          }}
        >
          <label className="w-full h-full flex items-center justify-center">
            <input
              type="checkbox"
              checked={isChecked}
              onChange={() => handleCheckUpdate(participant.userID)}
              className="cursor-pointer appearance-none w-full h-full bg-transparent border-none"
            />
            {/* Custom checkmark - only visible when checked */}
            {isChecked && (
              <svg
                className="absolute w-4 h-4 text-white pointer-events-none"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
          </label>
        </div>
        {/* Name and Email */}
        <div className="flex-1 text-sm">
          <div className="font-medium truncate">{displayName}</div>
          {email && (
            <div className="text-xs text-gray-500 truncate">{email}</div>
          )}
        </div>

        {/* Delete button */}
        <div className="ml-2 flex-shrink-0">
          <button
            onClick={() => setShowPopup(true)}
            aria-label="Delete Participant"
            className="text-gray-400 hover:text-red-600 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Delete Confirmation Popup - positioned near delete button */}
      {showPopup && (
        <>
          {/* Backdrop to close popup when clicking outside */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowPopup(false)}
          />

          <div className="absolute top-0 right-0 z-50 w-72">
            <Card className="shadow-lg">
              <CardHeader className="pb-1">
                <CardTitle className="text-xs">
                  Delete {displayName}&apos;s availability?
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-3">
                <p className="text-xs text-gray-600 mb-3">
                  This action cannot be undone.
                </p>
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPopup(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      handleDeleteParticipant(participant.userID);
                      setShowPopup(false);
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </li>
  );
}

export default function CalendarSideBar({
  participantInformation,
  handleCheckUpdate,
  handleDeleteParticipant,
}: {
  participantInformation: ParticipantInfo[];
  handleCheckUpdate: (userID: string) => void;
  handleDeleteParticipant: (userID: string) => void;
}) {
  const listItems = participantInformation.map((participant, idx) => {
    return (
      <ParticipantItem
        key={participant.userID}
        idx={idx}
        participant={participant}
        handleCheckUpdate={handleCheckUpdate}
        handleDeleteParticipant={handleDeleteParticipant}
      />
    );
  });

  return (
    <div
      data-testid="calendar-sidebar"
      className="flex-col w-full items-start justify-center"
    >
      <ul className="">{listItems}</ul>
    </div>
  );
}
