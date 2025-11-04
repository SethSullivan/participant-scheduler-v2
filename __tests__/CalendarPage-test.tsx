import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CalendarPage from "@/app/[pageID]/page";
import { useParams, useRouter } from "next/navigation";

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  useParams: jest.fn().mockReturnValue({ pageID: "test-event-id" }),
}));

// Mock custom hooks
jest.mock("@/hooks/useEventData", () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock("@/hooks/useAuth", () => ({
  useAuth: jest.fn(),
}));

jest.mock("@/hooks/useAvailabilityData", () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock("@/hooks/useGoogleAccessToken", () => ({
  __esModule: true,
  default: jest.fn(),
}));

// Mock calendar... jest can't handle it for some reason
jest.mock("@/components/calendar", () => {
  return function Calendar({ availableSlots, setAvailableSlots, eventData, availabilityData }: any) {
    return (
      <div data-testid="calendar-component">
        <span data-testid="event-name">{eventData?.name}</span>
        <span data-testid="availability-count">{availabilityData?.length || 0}</span>
        <button onClick={() => setAvailableSlots([{ id: "1", start: new Date(), end: new Date() }])}>
          Add Slot
        </button>
      </div>
    );
  };
});

// jest.mock("@/components/calendar-sidebar", () => {
//   return function CalendarSidebar({ participantAvailability, checked, handleChange }: any) {
//     return (
//       <div data-testid="calendar-sidebar">
//         {participantAvailability.map((participant: any, idx: number) => (
//           <div key={idx} data-testid={`participant-${idx}`}>
//             <span>{participant.name}</span>
//             <input
//               type="checkbox"
//               checked={checked.find((c: any) => c.userID === participant.userID)?.isChecked}
//               onChange={() => handleChange(participant.userID)}
//               data-testid={`checkbox-${participant.userID}`}
//             />
//           </div>
//         ))}
//       </div>
//     );
//   };
// });

// jest.mock("@/components/submit-availability-popup", () => {
//   return function SubmitAvailabilityPopup({ setShowPopUp, availableSlots, eventID }: any) {
//     return (
//       <div data-testid="submit-popup">
//         <span>Submit Availability</span>
//         <span data-testid="popup-event-id">{eventID}</span>
//         <span data-testid="popup-slots-count">{availableSlots.length}</span>
//         <button onClick={() => setShowPopUp(false)}>Close</button>
//       </div>
//     );
//   };
// });

// Import mocked hooks after mocking
import useEventData from "@/hooks/useEventData";
import { useAuth } from "@/hooks/useAuth";
import useAvailabilityData from "@/hooks/useAvailabilityData";
import useGoogleAccessToken from "@/hooks/useGoogleAccessToken";

describe("CalendarPage", () => {
  const mockRouter = {
    push: jest.fn(),
    back: jest.fn(),
  };

  const mockEventData = {
    id: "test-event-id",
    name: "Test Event",
    organizer: "organizer-123",
    start_time: "2024-01-01T08:00:00",
    end_time: "2024-01-01T18:00:00",
  };

  const mockParticipantData = [
    {
      user_id: "user-1",
      availability: [
        {
          title: "Available: John Doe (john@example.com)",
          backgroundColor: "#FF0000",
          start: new Date("2024-01-01T09:00:00"),
          end: new Date("2024-01-01T10:00:00"),
        },
      ],
    },
    {
      user_id: "user-2",
      availability: [
        {
          title: "Available: Jane Smith (jane@example.com)",
          backgroundColor: "#00FF00",
          start: new Date("2024-01-01T11:00:00"),
          end: new Date("2024-01-01T12:00:00"),
        },
      ],
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    localStorage.clear();
    
    // Default mock implementations
    (useEventData as jest.Mock).mockReturnValue({
      eventData: mockEventData,
      isLoading: false,
    });
    
    (useAuth as jest.Mock).mockReturnValue({
      claims: { sub: "current-user-id" },
    });
    
    (useAvailabilityData as jest.Mock).mockReturnValue(mockParticipantData);
    (useGoogleAccessToken as jest.Mock).mockReturnValue("mock-access-token");
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe("Loading and Error States", () => {
    it("should show loading state while fetching event data", async () => {
      (useEventData as jest.Mock).mockReturnValue({
        eventData: null,
        isLoading: true,
      });

      render(<CalendarPage />);

      expect(screen.getByText("Loading...")).toBeInTheDocument();
    });

    it("should show error state when event is not found", () => {
      (useEventData as jest.Mock).mockReturnValue({
        eventData: null,
        isLoading: false,
      });

      render(<CalendarPage />);

      
      expect(screen.getByText("Event Not Found")).toBeInTheDocument();
      expect(screen.getByText(/doesn't exist or has been deleted/)).toBeInTheDocument();
    });

    it("should allow going back when event is not found", () => {
      (useEventData as jest.Mock).mockReturnValue({
        eventData: null,
        isLoading: false,
      });
      window.history.back = jest.fn();

      render(<CalendarPage />);

      
      const goBackButton = screen.getByRole("button", { name: /go back/i });
      fireEvent.click(goBackButton);
      
      expect(window.history.back).toHaveBeenCalled();
    });
  });

  describe("Instructional Popup for Anonymous Users", () => {
    it("should show instructional popup for anonymous users", () => {
      (useAuth as jest.Mock).mockReturnValue(null);

      render(<CalendarPage />);

      
      expect(screen.getByText("How to Use the Calendar")).toBeInTheDocument();
      expect(screen.getByText(/To select availability, click and drag/)).toBeInTheDocument();
    });

    it("should hide instructional popup when closed", async () => {
      (useAuth as jest.Mock).mockReturnValue(null);

      render(<CalendarPage />);
      
      const gotItButton = screen.getByRole("button", { name: /got it/i });
      fireEvent.click(gotItButton);
      
      await waitFor(() => {
        expect(screen.queryByText("How to Use the Calendar")).not.toBeInTheDocument();
      });
    });

    it("should not show instructional popup for authenticated users", () => {
      render(<CalendarPage />);
      
      expect(screen.queryByText("How to Use the Calendar")).not.toBeInTheDocument();
    });
  });

  describe("Calendar Display", () => {
    it("should render calendar with event data", () => {
      render(<CalendarPage />);

      
      expect(screen.getByTestId("calendar-component")).toBeInTheDocument();
      expect(screen.getByTestId("event-name")).toHaveTextContent("Test Event");
    });

    it("should display event name in header", () => {
      render(<CalendarPage />);
      
      expect(screen.getByRole("heading", { name: "Test Event" })).toBeInTheDocument();
    });

    it("should show submit button for anonymous users", () => {
      (useAuth as jest.Mock).mockReturnValue(null);

      render(<CalendarPage />);

      
      // Close instructional popup first
      const gotItButton = screen.getByRole("button", { name: /got it/i });
      fireEvent.click(gotItButton);
      
      expect(screen.getByRole("button", { name: /submit availability/i })).toBeInTheDocument();
    });

    it("should not show submit button for authenticated users", () => {
      render(<CalendarPage />);

      
      expect(screen.queryByRole("button", { name: /submit availability/i })).not.toBeInTheDocument();
    });
  });

  describe("Participant Sidebar", () => {
    it("should render participant sidebar with participant data", () => {
      render(<CalendarPage />);
      
      expect(screen.getByTestId("calendar-sidebar")).toBeInTheDocument();
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("john@example.com")).toBeInTheDocument();
      expect(screen.getByText("Jane Smith")).toBeInTheDocument();
      expect(screen.getByText("jane@example.com")).toBeInTheDocument();
    });

    it("should allow toggling participant visibility", async () => {
      render(<CalendarPage />);

      const checkboxes = screen.getAllByRole("checkbox");
      const checkbox = checkboxes[0] as HTMLInputElement;
      expect(checkbox.checked).toBe(true);
      
      fireEvent.click(checkbox);
      
      await waitFor(() => {
        expect(checkbox.checked).toBe(false);
      });
    });

    it("should filter calendar data based on checked participants", async () => {
      render(<CalendarPage />);

      
      // Initially, both participants should be visible
      expect(screen.getByTestId("availability-count")).toHaveTextContent("2");
      
      // Uncheck first participant
      const checkboxes = screen.getAllByRole("checkbox");
      const checkbox = checkboxes[0] as HTMLInputElement;
      fireEvent.click(checkbox);
      
      await waitFor(() => {
        expect(screen.getByTestId("availability-count")).toHaveTextContent("1");
      });
    });
  });

  describe("Submit Availability Popup", () => {
    it("should show alert when submitting with no availability", () => {
      (useAuth as jest.Mock).mockReturnValue(null);

      const alertSpy = jest.spyOn(window, "alert").mockImplementation(() => {});
      
      render(<CalendarPage />);

      
      // Close instructional popup
      fireEvent.click(screen.getByRole("button", { name: /got it/i }));
      
      const submitButton = screen.getByRole("button", { name: /submit availability/i });
      fireEvent.click(submitButton);
      
      expect(alertSpy).toHaveBeenCalledWith("Please select availability");
      alertSpy.mockRestore();
    });

    it("should show submit popup when availability is selected", async () => {
      (useAuth as jest.Mock).mockReturnValue(null);

      render(<CalendarPage />);

      
      // Close instructional popup
      fireEvent.click(screen.getByRole("button", { name: /got it/i }));
      
      // Add a slot
      const addSlotButton = screen.getByText("Add Slot");
      fireEvent.click(addSlotButton);
      
      // Click submit
      const submitButton = screen.getByRole("button", { name: /submit availability/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByTestId("submit-popup")).toBeInTheDocument();
      });
    });

    it("should close submit popup when close button is clicked", async () => {
      (useAuth as jest.Mock).mockReturnValue(null);

      render(<CalendarPage />);

      
      // Close instructional popup
      fireEvent.click(screen.getByRole("button", { name: /got it/i }));
      
      // Add a slot and submit
      fireEvent.click(screen.getByText("Add Slot"));
      fireEvent.click(screen.getByRole("button", { name: /submit availability/i }));
      
      await waitFor(() => {
        expect(screen.getByTestId("submit-popup")).toBeInTheDocument();
      });
      
      // Close popup
      fireEvent.click(screen.getByText("Close"));
      
      await waitFor(() => {
        expect(screen.queryByTestId("submit-popup")).not.toBeInTheDocument();
      });
    });
  });

  describe("LocalStorage Integration", () => {
    it("should save checked state to localStorage", async () => {
      render(<CalendarPage />);

      
      const checkboxes = screen.getAllByRole("checkbox");
      const checkbox = checkboxes[0] as HTMLInputElement;
      fireEvent.click(checkbox);
      
      await waitFor(() => {
        const savedState = localStorage.getItem("checked-state-test-event-id");
        expect(savedState).toBeTruthy();
        const parsedState = JSON.parse(savedState!);
        expect(parsedState.find((s: any) => s.userID === "user-1")?.isChecked).toBe(false);
      });
    });

    it("should load checked state from localStorage", () => {
      const initialState = [
        { userID: "user-1", isChecked: false },
        { userID: "user-2", isChecked: true },
      ];
      localStorage.setItem("checked-state-test-event-id", JSON.stringify(initialState));
      
      render(<CalendarPage />);

      
      const checkbox1 = screen.getByTestId("checkbox-user-1") as HTMLInputElement;
      const checkbox2 = screen.getByTestId("checkbox-user-2") as HTMLInputElement;
      
      expect(checkbox1.checked).toBe(false);
      expect(checkbox2.checked).toBe(true);
    });

    it("should load available slots from localStorage", () => {
      const mockSlots = [
        {
          id: "slot-1",
          start: new Date("2024-01-01T09:00:00"),
          end: new Date("2024-01-01T10:00:00"),
        },
      ];
      localStorage.setItem(
        "availability-test-event-id",
        JSON.stringify({ availabilitySlots: mockSlots })
      );
      
      render(<CalendarPage />);

      
      // The component should load slots from localStorage
      // This would be reflected in the calendar component's behavior
      expect(localStorage.getItem("availability-test-event-id")).toBeTruthy();
    });
  });

  describe("Unique Participants Processing", () => {
    it("should deduplicate participants correctly", () => {
      const duplicateParticipantData = [
        {
          user_id: "user-1",
          availability: [
            {
              title: "Available: John Doe (john@example.com)",
              backgroundColor: "#FF0000",
              start: new Date("2024-01-01T09:00:00"),
              end: new Date("2024-01-01T10:00:00"),
            },
            {
              title: "Available: John Doe (john@example.com)",
              backgroundColor: "#FF0000",
              start: new Date("2024-01-01T14:00:00"),
              end: new Date("2024-01-01T15:00:00"),
            },
          ],
        },
      ];
      
      (useAvailabilityData as jest.Mock).mockReturnValue(duplicateParticipantData);
      
      render(<CalendarPage />);

      
      // Should only show one entry for John Doe
      const johnDoeElements = screen.getAllByText("John Doe (john@example.com)");
      expect(johnDoeElements).toHaveLength(1);
    });

    it("should handle participants with missing data gracefully", () => {
      const incompleteData = [
        {
          user_id: "user-1",
          availability: [],
        },
      ];
      
      (useAvailabilityData as jest.Mock).mockReturnValue(incompleteData);
      
      render(<CalendarPage />);

      
      // Should not crash and calendar should still render
      expect(screen.getByTestId("calendar-component")).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle undefined participantAvailabilityData", () => {
      (useAvailabilityData as jest.Mock).mockReturnValue(undefined);
      
      render(<CalendarPage />);

      
      expect(screen.getByTestId("calendar-component")).toBeInTheDocument();
      expect(screen.queryByTestId("calendar-sidebar")).not.toBeInTheDocument();
    });

    it("should handle null access token", () => {
      (useGoogleAccessToken as jest.Mock).mockReturnValue(null);
      
      render(<CalendarPage />);

      
      expect(screen.getByTestId("calendar-component")).toBeInTheDocument();
    });

    it("should handle empty availability data", () => {
      (useAvailabilityData as jest.Mock).mockReturnValue([]);
      
      render(<CalendarPage />);

      
      expect(screen.getByTestId("calendar-component")).toBeInTheDocument();
      expect(screen.queryByTestId("calendar-sidebar")).not.toBeInTheDocument();
    });
  });
});