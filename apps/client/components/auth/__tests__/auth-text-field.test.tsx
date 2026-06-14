import { AuthTextField } from "@/components/auth/auth-text-field";
import { fireEvent, render } from "@/test/utils";

describe("AuthTextField", () => {
  it("renders label", () => {
    const { getByText } = render(<AuthTextField label="Email" />);
    expect(getByText("Email")).toBeTruthy();
  });

  it("renders error", () => {
    const { getByText } = render(<AuthTextField label="Email" error="Required" />);
    expect(getByText("Required")).toBeTruthy();
  });

  it("renders placeholder and fires onChangeText", () => {
    const onChange = jest.fn();
    const { getByPlaceholderText } = render(
      <AuthTextField label="Email" placeholder="you@example.com" onChangeText={onChange} />,
    );
    fireEvent.changeText(getByPlaceholderText("you@example.com"), "test");
    expect(onChange).toHaveBeenCalledWith("test");
  });
});
