import { screen, render } from "@testing-library/react";
import { ParticipantItem } from "@/components/calendar-sidebar";

const mockParticipantInfo = [
  {
    userID: "user1",
    name: "John Doe (john@example.com)",
    color: "#FF0000",
    isChecked: true,
  },
  {
    userID: "user2",
    name: "Jane Smith (jane@example.com)",
    color: "#00FF00",
    isChecked: false,
  },
];

describe("CalendarSideBar", () => {
  it("renders correctly", () => {
    render(<div></div>); // Placeholder test
    expect(true).toBe(true);
  });
});

const mockHandleCheckUpdate = jest.fn();
const mockHandleDeleteParticipant = jest.fn();
describe("ParticipantItem", () => {
  describe("Renders participant info correctly", () => {
    it("Should have a checkbox, display name, and email below name", () => {
      render(
        <ParticipantItem
          idx={0}
          participant={mockParticipantInfo[0]}
          handleCheckUpdate={mockHandleCheckUpdate}
          handleDeleteParticipant={mockHandleDeleteParticipant}
        />
      );
      expect(screen.getByRole("checkbox")).toBeInTheDocument();
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("john@example.com")).toBeInTheDocument();
    });
    it("should display a garbage can indicator for deleting", () => {
      render(
        <ParticipantItem
          idx={0}
          participant={mockParticipantInfo[0]}
          handleCheckUpdate={mockHandleCheckUpdate}
          handleDeleteParticipant={mockHandleDeleteParticipant}
        />
      );
      expect(screen.getByLabelText("Delete Participant")).toBeInTheDocument();
    });
  });
});
