import { VerificationResendCard } from "@/components/auth/verification-resend-card";
import { fireEvent, render } from "@/test/utils";

describe("VerificationResendCard", () => {
  it("renders message", () => {
    const { getByText } = render(
      <VerificationResendCard
        message="Check your email."
        cooldownRemaining={0}
        resendLoading={false}
        onResend={jest.fn()}
      />,
    );
    expect(getByText("Check your email.")).toBeTruthy();
  });

  it("shows cooldown text when remaining > 0", () => {
    const { getByText } = render(
      <VerificationResendCard
        message="Check email."
        cooldownRemaining={30}
        resendLoading={false}
        onResend={jest.fn()}
      />,
    );
    expect(getByText("You can resend another verification email in 30s.")).toBeTruthy();
  });

  it("shows ready-to-resend text when cooldown is 0", () => {
    const { getByText } = render(
      <VerificationResendCard
        message="Check email."
        cooldownRemaining={0}
        resendLoading={false}
        onResend={jest.fn()}
      />,
    );
    expect(getByText("Need another link? You can resend it now.")).toBeTruthy();
  });

  it("renders Resend Email button", () => {
    const { getByText } = render(
      <VerificationResendCard
        message="Check email."
        cooldownRemaining={0}
        resendLoading={false}
        onResend={jest.fn()}
      />,
    );
    expect(getByText("Resend Email")).toBeTruthy();
  });

  it("renders secondary action when provided", () => {
    const onSecondary = jest.fn();
    const { getByText } = render(
      <VerificationResendCard
        message="Check email."
        cooldownRemaining={0}
        resendLoading={false}
        onResend={jest.fn()}
        secondaryActionLabel="Change Email"
        onSecondaryAction={onSecondary}
      />,
    );
    fireEvent.press(getByText("Change Email"));
    expect(onSecondary).toHaveBeenCalledTimes(1);
  });
});
