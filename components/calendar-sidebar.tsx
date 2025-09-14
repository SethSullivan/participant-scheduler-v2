export default function CalendarSideBar({
  participantAvailability,
}: {
  participantAvailability: { name: string; color: string }[];
}) {
  const listItems = participantAvailability.map((participant, idx) => {
    // Split name and email - assuming format like "John Doe (john@example.com)"
    const nameMatch = participant.name.match(/^(.+?)\s*\((.+?)\)$/);
    const displayName = nameMatch ? nameMatch[1] : participant.name;
    const email = nameMatch ? nameMatch[2] : "";

    return (
      <li key={idx} className="mb-1">
        <div className="flex items-center border border-gray-100 rounded p-2 min-h-[3rem]">
          <div
            className="w-6 h-6 rounded mr-3 flex-shrink-0 border"
            style={{ backgroundColor: participant.color }}
          ></div>
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
