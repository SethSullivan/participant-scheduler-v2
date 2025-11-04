import { getParticipantsWithChecked } from "@/lib/utils/utils";
import { create } from "domain";

// Mock availability data
const mockAvailabilityData = [
  {
    id: "1",
    user_id: "user1",
    availability: [
      {
        id: "1",
        title: "Available: User1 Doe",
        isGcal: false,
        backgroundColor: "#ff0000",
        start: new Date("2023-10-01T09:00:00Z"),
        end: new Date("2023-10-01T10:00:00Z"),
      },
      {
        id: "2",
        title: "Available: User1 Doe",
        isGcal: false,
        backgroundColor: "#ff0000",
        start: new Date("2023-10-01T11:00:00Z"),
        end: new Date("2023-10-01T12:00:00Z"),
      },
    ],
    created_at: new Date(),
    event_id: "event1",
  },
  {
    id: "2",
    user_id: "user2",
    availability: [
      {
        id: "1",
        title: "Available: User2 Smith",
        isGcal: false,
        backgroundColor: "#5e3c3cff",
        start: new Date(),
        end: new Date("2023-10-01T10:30:00Z"),
      },
      {
        id: "2",
        title: "Available: User2 Smith",
        isGcal: false,
        backgroundColor: "#5e3c3cff",
        start: new Date("2023-10-01T11:30:00Z"),
        end: new Date("2023-10-01T12:30:00Z"),
      },
    ],
    created_at: new Date(),
    event_id: "event1",
  },
];

const mockChecked = [
  { userID: "user1", isChecked: true },
  { userID: "user2", isChecked: true },
];

describe("test utils", () => {
  describe("test getUniqueParticipants", () => {
    it("should return unique participants with checked availability", () => {
      const result = getParticipantsWithChecked(
        mockAvailabilityData,
        mockChecked
      );
      expect(result).toEqual([
        { userID: "user1", name: "User1 Doe", isChecked: true, color: "#ff0000" },
        { userID: "user2", name: "User2 Smith", isChecked: true, color: "#5e3c3cff" },
      ]);
    });
  });
});
