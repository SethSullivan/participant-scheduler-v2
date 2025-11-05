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
  // Split name and email - assuming format like "John Doe (john@example.com)"
  const { displayName, email } = splitNameAndEmail(participant.name);
  const isChecked =
    participant.isChecked !== undefined ? participant.isChecked : true;
  return (
    <li key={idx} className="mb-1">
      <div className="flex items-center border border-gray-100 rounded p-2 min-h-[3rem]">
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
        {/* Delete button (garbage can icon) */}
        <div>
          <button
            onClick={() => handleDeleteParticipant(participant.userID)}
            aria-label="Delete Participant"
            className="text-gray-400 hover:text-red-600"
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
  // Create list of ParticipantItems
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
      {/* <div className="flex justify-items-center text-center items-center border-2 border-blue">
                Availability Legend
            </div> */}
      <ul className="">{listItems}</ul>
    </div>
  );
}
