import { Text } from "react-native";
import { AuthScreenShell } from "@/components/auth/auth-screen-shell";
import { render } from "@/test/utils";

// Mock lottie-react-native
jest.mock("lottie-react-native", () => {
  const { View } = require("react-native");
  return {
    __esModule: true,
    default: () => require("react").createElement(View),
  };
});

describe("AuthScreenShell", () => {
  it("renders title, subtitle, and children", () => {
    const { getByText } = render(
      <AuthScreenShell
        title="Sign In"
        subtitle="Welcome back"
        prompt="Don't have an account?"
        actionHref="/(auth)/sign-up"
        actionLabel="Sign Up"
      >
        <Text>Form Content</Text>
      </AuthScreenShell>,
    );
    expect(getByText("Sign In")).toBeTruthy();
    expect(getByText("Welcome back")).toBeTruthy();
    expect(getByText("Form Content")).toBeTruthy();
  });

  it("renders prompt and action label", () => {
    const { getByText } = render(
      <AuthScreenShell
        title="Sign In"
        subtitle="Welcome back"
        prompt="Don't have an account?"
        actionHref="/(auth)/sign-up"
        actionLabel="Sign Up"
      >
        <Text>Form</Text>
      </AuthScreenShell>,
    );
    expect(getByText("Don't have an account?")).toBeTruthy();
    expect(getByText("Sign Up")).toBeTruthy();
  });

  it("renders legal links", () => {
    const { getByText } = render(
      <AuthScreenShell
        title="Sign In"
        subtitle="Welcome"
        prompt="New?"
        actionHref="/(auth)/sign-up"
        actionLabel="Sign Up"
      >
        <Text>Form</Text>
      </AuthScreenShell>,
    );
    expect(getByText("Privacy Policy")).toBeTruthy();
    expect(getByText("Terms")).toBeTruthy();
  });
});
