import { DatePicker } from "@/components/ui/date-picker";
import { fireEvent, render } from "@/test/utils";

// Mock AppModal to just render children when visible
jest.mock("@/components/ui/app-modal", () => {
  return {
    AppModal: ({ children, visible }: { children: React.ReactNode; visible: boolean }) =>
      visible ? children : null,
  };
});

describe("DatePicker", () => {
  it("renders placeholder when no value", () => {
    const { getByText } = render(<DatePicker onChange={jest.fn()} />);
    expect(getByText("Select date")).toBeTruthy();
  });

  it("renders custom placeholder", () => {
    const { getByText } = render(<DatePicker onChange={jest.fn()} placeholder="Pick a date" />);
    expect(getByText("Pick a date")).toBeTruthy();
  });

  it("renders time placeholder for time mode", () => {
    const { getByText } = render(<DatePicker onChange={jest.fn()} mode="time" />);
    expect(getByText("Select time")).toBeTruthy();
  });

  it("renders datetime placeholder for datetime mode", () => {
    const { getByText } = render(<DatePicker onChange={jest.fn()} mode="datetime" />);
    expect(getByText("Select date & time")).toBeTruthy();
  });

  it("displays formatted date when value is provided", () => {
    const date = new Date(2026, 3, 15); // April 15, 2026
    const { getByText } = render(<DatePicker value={date} onChange={jest.fn()} />);
    expect(getByText("April 15, 2026")).toBeTruthy();
  });

  it("renders label", () => {
    const { getByText } = render(<DatePicker onChange={jest.fn()} label="Start Date" />);
    expect(getByText("Start Date")).toBeTruthy();
  });

  it("renders error", () => {
    const { getByText } = render(<DatePicker onChange={jest.fn()} error="Required" />);
    expect(getByText("Required")).toBeTruthy();
  });

  it("opens picker modal on press", () => {
    const { getByText } = render(<DatePicker onChange={jest.fn()} />);
    fireEvent.press(getByText("Select date"));
    // Modal opens showing Select Date header
    expect(getByText("Select Date")).toBeTruthy();
    expect(getByText("Done")).toBeTruthy();
    expect(getByText("Cancel")).toBeTruthy();
  });
});
