import { screen, render, fireEvent, waitFor } from "@testing-library/react";
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
  beforeAll(() => {
    jest.clearAllMocks();
  });
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
    it("should display delete button", () => {
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
  describe("Delete functionality", () => {
    it("Delete button should show confirmation popup", () => {
      render(
        <ParticipantItem
          idx={0}
          participant={mockParticipantInfo[0]}
          handleCheckUpdate={mockHandleCheckUpdate}
          handleDeleteParticipant={mockHandleDeleteParticipant}
        />
      );
      const deleteButton = screen.getByLabelText("Delete Participant");
      expect(deleteButton).toBeInTheDocument();

      expect(
        screen.queryByText(
          `Delete ${mockParticipantInfo[0].name}&apos;s availability?`
        )
      ).toBeNull();

      fireEvent.click(deleteButton);

      waitFor(() => {
        expect(
          screen.getByText(
            `Delete ${mockParticipantInfo[0].name}&apos;s availability?`
          )
        ).toBeInTheDocument();
      });
    });
    it("Delete button on confirmation popup should delete and close popup", () => {
      render(
        <ParticipantItem
          idx={0}
          participant={mockParticipantInfo[0]}
          handleCheckUpdate={mockHandleCheckUpdate}
          handleDeleteParticipant={mockHandleDeleteParticipant}
        />
      );
      const deleteButton = screen.getByLabelText("Delete Participant");
      expect(deleteButton).toBeInTheDocument();

      expect(
        screen.queryByText(
          `Delete ${mockParticipantInfo[0].name}&apos;s availability?`
        )
      ).toBeNull();

      fireEvent.click(deleteButton);

      waitFor(() => {
        expect(
          screen.getByText(
            `Delete ${mockParticipantInfo[0].name}&apos;s availability?`
          )
        ).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Delete"));

      expect(mockHandleDeleteParticipant).toHaveBeenCalled();
      expect(
        screen.queryByText(
          `Delete ${mockParticipantInfo[0].name}&apos;s availability?`
        )
      ).toBeNull();
    });
    it("Cancel button on confirmation popup should not delete and close popup", () => {
      render(
        <ParticipantItem
          idx={0}
          participant={mockParticipantInfo[0]}
          handleCheckUpdate={mockHandleCheckUpdate}
          handleDeleteParticipant={mockHandleDeleteParticipant}
        />
      );
      const deleteButton = screen.getByLabelText("Delete Participant");
      expect(deleteButton).toBeInTheDocument();

      expect(
        screen.queryByText(
          `Delete ${mockParticipantInfo[0].name}&apos;s availability?`
        )
      ).toBeNull();

      fireEvent.click(deleteButton);

      waitFor(() => {
        expect(
          screen.getByText(
            `Delete ${mockParticipantInfo[0].name}&apos;s availability?`
          )
        ).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Cancel"));

      expect(mockHandleDeleteParticipant).not.toHaveBeenCalled();
      expect(
        screen.queryByText(
          `Delete ${mockParticipantInfo[0].name}&apos;s availability?`
        )
      ).toBeNull();
    });
  });
});
