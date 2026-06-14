import { DetailActionFooter, type FooterAction } from "@/components/ui/detail-action-footer";
import { fireEvent, render } from "@/test/utils";

// Mock AppModal to just render children (avoids Modal complexities in tests)
jest.mock("@/components/ui/app-modal", () => {
  return {
    AppModal: ({ children, visible }: { children: React.ReactNode; visible: boolean }) =>
      visible ? children : null,
  };
});

describe("DetailActionFooter", () => {
  const makePrimary = (overrides?: Partial<FooterAction>): FooterAction => ({
    label: "Send",
    icon: "paperplane.fill",
    onPress: jest.fn(),
    testID: "send-btn",
    ...overrides,
  });

  it("returns null when no actions", () => {
    const { toJSON } = render(<DetailActionFooter primaryAction={null} dropdownActions={[]} />);
    expect(toJSON()).toBeNull();
  });

  it("renders primary action", () => {
    const { getByText } = render(
      <DetailActionFooter primaryAction={makePrimary()} dropdownActions={[]} />,
    );
    expect(getByText("Send")).toBeTruthy();
  });

  it("fires primary action onPress", () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <DetailActionFooter primaryAction={makePrimary({ onPress })} dropdownActions={[]} />,
    );
    fireEvent.press(getByTestId("send-btn"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("renders more button when dropdown actions exist", () => {
    const dropdown: FooterAction = {
      label: "Delete",
      icon: "trash.fill",
      onPress: jest.fn(),
      danger: true,
      testID: "delete-btn",
    };
    const { getByTestId } = render(
      <DetailActionFooter primaryAction={makePrimary()} dropdownActions={[dropdown]} />,
    );
    expect(getByTestId("more-actions")).toBeTruthy();
  });
});
