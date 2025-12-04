import CreateEvent from "@/components/create-event";
import { EventData } from "@/types/types";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useRouter } from "next/navigation";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

describe("CreateEvent Component", () => {
  let setShowPopup: jest.Mock;
  let setEventData: jest.Mock;
  let mockPush: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    setShowPopup = jest.fn();
    setEventData = jest.fn();
    mockPush = jest.fn();

    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });

    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("renders the form with all required fields", () => {
    render(
      <CreateEvent setShowPopup={setShowPopup} setEventData={setEventData} />
    );

    expect(screen.getByText("Event")).toBeInTheDocument();
    expect(screen.getByText("Enter event information")).toBeInTheDocument();
    expect(screen.getByTestId("event-name-input")).toBeInTheDocument();
    expect(screen.getByText(/earliest time to schedule/i)).toBeInTheDocument();
    expect(screen.getByText(/latest time to schedule/i)).toBeInTheDocument();
    expect(screen.getByText(/Event Type/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /create event/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
  });

  it("calls setShowPopup when cancel button is clicked", () => {
    render(
      <CreateEvent setShowPopup={setShowPopup} setEventData={setEventData} />
    );

    const cancelButton = screen.getByRole("button", { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(setShowPopup).toHaveBeenCalledWith(false);
  });

  it("updates event name when user types", () => {
    render(
      <CreateEvent setShowPopup={setShowPopup} setEventData={setEventData} />
    );

    const input = screen.getByTestId("event-name-input") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "Test Event" } });

    expect(input.value).toBe("Test Event");
  });

  it("successfully creates an event and updates state", async () => {
    const mockEventData: EventData = {
      id: "123",
      name: "New Event",
      event_type: "select_availability",
      organizer_id: "user-123",
      created_at: "2022-04-17T08:00:00",
      start_time: "2022-04-17T08:00:00",
      end_time: "2022-04-17T18:00:00",
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ data: mockEventData }),
    });

    render(
      <CreateEvent setShowPopup={setShowPopup} setEventData={setEventData} />
    );

    // Fill in the form
    const eventNameInput = screen.getByTestId("event-name-input");
    fireEvent.change(eventNameInput, { target: { value: "New Event" } });

    // Submit the form
    const submitButton = screen.getByRole("button", { name: /create event/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/create-event", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: expect.any(String),
      });
    });

    await waitFor(() => {
      expect(setEventData).toHaveBeenCalled();
      expect(setShowPopup).toHaveBeenCalledWith(false);
    });
  });

  it("shows loading state while submitting", async () => {
    (global.fetch as jest.Mock).mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    render(
      <CreateEvent setShowPopup={setShowPopup} setEventData={setEventData} />
    );

    const eventNameInput = screen.getByTestId("event-name-input");
    fireEvent.change(eventNameInput, { target: { value: "Test Event" } });

    const submitButton = screen.getByRole("button", { name: /create event/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Creating event...")).toBeInTheDocument();
    });
  });

  it("redirects to sign-up on 401 error", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ error: "Unauthorized" }),
    });

    render(
      <CreateEvent setShowPopup={setShowPopup} setEventData={setEventData} />
    );

    const eventNameInput = screen.getByTestId("event-name-input");
    fireEvent.change(eventNameInput, { target: { value: "Test Event" } });

    const submitButton = screen.getByRole("button", { name: /create event/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/sign-up");
    });
  });

  it("redirects to sign-up on 403 error", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 403,
      json: async () => ({ error: "Forbidden" }),
    });

    render(
      <CreateEvent setShowPopup={setShowPopup} setEventData={setEventData} />
    );

    const eventNameInput = screen.getByTestId("event-name-input");
    fireEvent.change(eventNameInput, { target: { value: "Test Event" } });

    const submitButton = screen.getByRole("button", { name: /create event/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/sign-up");
    });
  });

  it("handles network errors gracefully", async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error("Network error")
    );

    render(
      <CreateEvent setShowPopup={setShowPopup} setEventData={setEventData} />
    );

    const eventNameInput = screen.getByTestId("event-name-input");
    fireEvent.change(eventNameInput, { target: { value: "Test Event" } });

    const submitButton = screen.getByRole("button", { name: /create event/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });
  });

  it("appends new event to existing events array", async () => {
    const existingEvents = [
      { id: "1", name: "Existing Event", organizer_id: "user-1" },
    ];
    const newEvent = {
      id: "2",
      name: "New Event",
      organizer_id: "user-2",
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ data: newEvent }),
    });

    render(
      <CreateEvent setShowPopup={setShowPopup} setEventData={setEventData} />
    );

    const eventNameInput = screen.getByTestId("event-name-input");
    fireEvent.change(eventNameInput, { target: { value: "New Event" } });

    const submitButton = screen.getByRole("button", { name: /create event/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(setEventData).toHaveBeenCalled();
    });

    // Get the callback function passed to setEventData
    const updateFunction = setEventData.mock.calls[0][0];

    // Test it adds to existing events
    const result = updateFunction(existingEvents);
    expect(result).toEqual([...existingEvents, newEvent]);

    // Test it creates new array when prev is null
    const resultWithNull = updateFunction(null);
    expect(resultWithNull).toEqual([newEvent]);
  });

  it("disables submit button while loading", async () => {
    (global.fetch as jest.Mock).mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    render(
      <CreateEvent setShowPopup={setShowPopup} setEventData={setEventData} />
    );

    const eventNameInput = screen.getByTestId("event-name-input");
    fireEvent.change(eventNameInput, { target: { value: "Test Event" } });

    const submitButton = screen.getByRole("button", { name: /create event/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });
  });
});
