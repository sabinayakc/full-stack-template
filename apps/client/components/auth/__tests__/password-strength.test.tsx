import { PasswordStrength } from "@/components/auth/password-strength";
import { render } from "@/test/utils";

describe("PasswordStrength", () => {
  it("shows 'Add a password' when empty", () => {
    const { getByText } = render(<PasswordStrength password="" />);
    expect(getByText("Add a password")).toBeTruthy();
  });

  it("shows 'Too short' for short passwords", () => {
    const { getByText } = render(<PasswordStrength password="abc" />);
    expect(getByText("Too short")).toBeTruthy();
  });

  it("shows 'Weak' for simple 8-char password", () => {
    const { getByText } = render(<PasswordStrength password="abcdefgh" />);
    expect(getByText("Weak")).toBeTruthy();
  });

  it("shows 'Fair' for medium strength", () => {
    const { getByText } = render(<PasswordStrength password="Abcdefgh1" />);
    expect(getByText("Fair")).toBeTruthy();
  });

  it("shows 'Good' for good strength", () => {
    const { getByText } = render(<PasswordStrength password="Abcdefgh1234" />);
    expect(getByText("Good")).toBeTruthy();
  });

  it("shows 'Strong' for strong password", () => {
    const { getByText } = render(<PasswordStrength password="Abcdefgh123!" />);
    expect(getByText("Strong")).toBeTruthy();
  });

  it("shows hint and policy in non-minimal mode", () => {
    const { getByText } = render(<PasswordStrength password="" />);
    expect(getByText("Password strength")).toBeTruthy();
  });

  it("hides details in minimal mode", () => {
    const { queryByText } = render(<PasswordStrength password="" minimal />);
    expect(queryByText("Password strength")).toBeNull();
  });
});
