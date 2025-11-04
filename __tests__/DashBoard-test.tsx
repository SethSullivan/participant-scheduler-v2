import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import DashBoard from "@/app/(protected)/dashboard/page";
import { useRouter } from "next/navigation";

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

// Mock custom hook
jest.mock("@/hooks/useUsersEvents", () => ({
  __esModule: true,
  default: jest.fn(),
}));
jest.mock("@/hooks/useCreateEvent", () => ({
  __esModule: true,
  default: jest.fn(),
}));

// Mock components
// jest.mock("@/components/ui/loading-screen", () => {
//   return function LoadingSpinner({ specificText }: { specificText?: string }) {
//     return <div data-testid="loading-spinner">{specificText || "Loading..."}</div>;
//   };
// });

// jest.mock("@/components/create-event", () => {
//   return function CreateEvent({ setShowPopup, setEventsData }: any) {
//     return (
//       <div data-testid="create-event-popup">
//         <h3>Create Event Form</h3>
//         <button
//           onClick={() => {
//             const newEvent = {
//               id: "new-event-id",
//               name: "New Test Event",
//               organizer: "test-user",
//               start_time: "2024-01-01T08:00:00",
//               end_time: "2024-01-01T18:00:00",
//             };
//             setEventsData((prev: any) => (prev ? [...prev, newEvent] : [newEvent]));
//             setShowPopup(false);
//           }}
//         >
//           Submit Event
//         </button>
//         <button onClick={() => setShowPopup(false)}>Cancel</button>
//       </div>
//     );
//   };
// });

// jest.mock("@/components/event-card", () => {
//   return function EventCard({ event, onEventClick }: any) {
//     return (
//       <div
//         data-testid={`event-card-${event.id}`}
//         onClick={() => onEventClick(event)}
//         className="cursor-pointer"
//       >
//         <h3>{event.name}</h3>
//         <p>Organizer: {event.organizer}</p>
//         <p>
//           Time: {event.start_time} - {event.end_time}
//         </p>
//       </div>
//     );
//   };
// });

// Import mocked hook after mocking
import useUsersEvents from "@/hooks/useUsersEvents";
import useCreateEvent from "@/hooks/useCreateEvent";

describe("DashBoard", () => {
  const mockRouter = {
    push: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  };

  const mockEventsData = [
    {
      id: "event-1",
      name: "Team Meeting",
      organizer: "user-123",
      start_time: "2024-01-15T09:00:00",
      end_time: "2024-01-15T10:00:00",
    },
    {
      id: "event-2",
      name: "Client Presentation",
      organizer: "user-123",
      start_time: "2024-01-16T14:00:00",
      end_time: "2024-01-16T15:00:00",
    },
    {
      id: "event-3",
      name: "Workshop",
      organizer: "user-123",
      start_time: "2024-01-20T10:00:00",
      end_time: "2024-01-20T12:00:00",
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useUsersEvents as jest.Mock).mockReturnValue({
      eventsData: mockEventsData,
      isLoading: false,
      error: null,
      setEventsData: jest.fn(),
    });
  });

  describe("Loading State", () => {
    it("should show loading screen initially", () => {
      (useUsersEvents as jest.Mock).mockReturnValueOnce({
        eventsData: null,
        isLoading: true,
        error: null,
        setEventsData: jest.fn(),
      });
      render(<DashBoard />);

      expect(screen.getByTestId("loading-screen")).toBeInTheDocument();
      expect(screen.getByText("Loading your events ...")).toBeInTheDocument();
    });
  });

  describe("Events Display", () => {
    it("should display all events when loaded successfully", async () => {
      render(<DashBoard />);

      await waitFor(() => {
        expect(screen.getByText("Your Events")).toBeInTheDocument();
      });

      expect(screen.getByText("Team Meeting")).toBeInTheDocument();
      expect(screen.getByText("Client Presentation")).toBeInTheDocument();
      expect(screen.getByText("Workshop")).toBeInTheDocument();
    });

    it("should display 'no events' message when events array is empty", async () => {
      (useUsersEvents as jest.Mock).mockReturnValueOnce({
        eventsData: [],
        isLoading: false,
        error: null,
        setEventsData: jest.fn(),
      });

      render(<DashBoard />);

      await waitFor(() => {
        expect(screen.getByText("No events found. Create your first event!")).toBeInTheDocument();
      });
    });
  });

  describe("Error Handling", () => {
    it("should display error message when there is an error", async () => {
      const errorMessage = "An unexpected error occurred";
      
      (useUsersEvents as jest.Mock).mockReturnValueOnce({
        eventsData: [],
        isLoading: false,
        error: errorMessage,
        setEventsData: jest.fn(),
      });

      render(<DashBoard />);

      await waitFor(() => {
        expect(screen.getByText(`Error`)).toBeInTheDocument();
        expect(screen.getByText(`${errorMessage}`)).toBeInTheDocument();
      });
      expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument();
      expect(screen.queryByText("Team Meeting")).toBeNull();
    });
  });

  describe("Event Navigation", () => {
    it("should navigate to event page when event card is clicked", async () => {
      render(<DashBoard />);

      await waitFor(() => {
        expect(screen.getByText("Your Events")).toBeInTheDocument();
      });

      const viewAvailability = screen.getAllByText("View Availability");
      fireEvent.click(viewAvailability[0]);

      expect(mockRouter.push).toHaveBeenCalledWith("/event-1");
      expect(mockRouter.push).toHaveBeenCalledTimes(1);
    });
  });

  describe("Create Event Popup", () => {
    it("should show create event button by default", async () => {
      render(<DashBoard />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /create new event/i })).toBeInTheDocument();
      });
    });

    it("should show create event form when button is clicked and hide when cancelled is clicked", async () => {
      render(<DashBoard />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /create new event/i })).toBeInTheDocument();
      });

      const createButton = screen.getByRole("button", { name: /create new event/i });
      fireEvent.click(createButton);

      expect(screen.getByTestId("create-event-popup")).toBeInTheDocument();
      
      // Close popup
      fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

      await waitFor(() => {
        expect(screen.queryByTestId("create-event-popup")).not.toBeInTheDocument();
      });
  
      expect(screen.getByRole("button", { name: /create new event/i })).toBeInTheDocument();
      expect(screen.getByText("Create New Event")).toBeInTheDocument();
    });

    it("should submit successfully and not show pop up after submit", async () => {
      // Mock useCreateEvent
      (useCreateEvent as jest.Mock).mockResolvedValue({
        data: {
          id: "new-event-id",
          name: "New Event",
          organizer: "user-123",
          start_time: "2024-01-01T08:00:00",
          end_time: "2024-01-01T18:00:00",
        },
        error: null,
      });

      render(<DashBoard />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /create new event/i })).toBeInTheDocument();
      });

      // Initial count
      expect(screen.getAllByText(/view availability/i)).toHaveLength(3);

      // Open create event form
      fireEvent.click(screen.getByRole("button", { name: /create new event/i }));

      // Type input for event name
      const eventNameInput = screen.getByTestId("event-name-input");
      fireEvent.change(eventNameInput, { target: { value: "New Test Event" } });
      
      // Submit new event
      fireEvent.click(screen.getByRole("button", { name: /create event/i }));

      await waitFor(() => {
        expect(screen.queryByTestId("create-event-popup")).not.toBeInTheDocument();
      });
    });
  });

  describe("Edge Cases", () => {
    // TODO 
    // it("should handle rapid event card clicks", async () => {
    //   render(<DashBoard />);

    //   const viewAvailability = screen.getAllByText("View Availability");
    //   fireEvent.click(viewAvailability[0]);
    //   fireEvent.click(viewAvailability[0]);
    //   fireEvent.click(viewAvailability[0]);

    //   // Should only navigate once (or three times depending on implementation)
    //   expect(mockRouter.push).toHaveBeenCalledTimes(1);
    // });

    it("should maintain state when toggling create event popup", async () => {
      render(<DashBoard />);

      await waitFor(() => {
        expect(screen.getByText("Team Meeting")).toBeInTheDocument();
      });

      // Open and close popup
      fireEvent.click(screen.getByRole("button", { name: /create new event/i }));
      fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

      // Events should still be displayed
      expect(screen.getByText("Team Meeting")).toBeInTheDocument();
      expect(screen.getByText("Client Presentation")).toBeInTheDocument();
    });
  });
});