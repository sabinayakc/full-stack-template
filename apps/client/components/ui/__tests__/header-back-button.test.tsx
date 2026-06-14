import { HeaderBackButton } from "@/components/ui/header-back-button";
import { fireEvent, render } from "@/test/utils";

const mockBack = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({ back: mockBack }),
}));

describe("HeaderBackButton", () => {
  beforeEach(() => mockBack.mockClear());

  it("renders default Back label", () => {
    const { getByText } = render(<HeaderBackButton />);
    expect(getByText("Back")).toBeTruthy();
  });

  it("renders custom label", () => {
    const { getByText } = render(<HeaderBackButton label="Cancel" />);
    expect(getByText("Cancel")).toBeTruthy();
  });

  it("calls router.back on press", () => {
    const { getByText } = render(<HeaderBackButton />);
    fireEvent.press(getByText("Back"));
    expect(mockBack).toHaveBeenCalledTimes(1);
  });
});
