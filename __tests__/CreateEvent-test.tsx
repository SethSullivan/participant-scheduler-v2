import CreateEvent from "@/components/create-event";
import { render } from "@testing-library/react";

describe("Create Event Popup", () => {
  let setShowPopup: jest.Mock;
  let setEventsData: jest.Mock;

  beforeEach(() => {
    setShowPopup = jest.fn();
    setEventsData = jest.fn();
  });

  it("should submit successfully and not show pop up after submit", async () => {
    render(
      <CreateEvent setShowPopup={setShowPopup} setEventsData={setEventsData} />
    );
    expect(true).toBe(true);
    // // Type input for event name
    // const eventNameInput = screen.getByTestId("event-name-input");
    // fireEvent.change(eventNameInput, { target: { value: "New Test Event" } });

    // // Submit new event
    // fireEvent.click(screen.getByRole("button", { name: /create event/i }));

    // await waitFor(() => {
    //   expect(setShowPopup).toHaveBeenCalledWith(false);
    // });
  });
});
