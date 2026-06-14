import HomeScreen from "@/app/(app)/index";
import { render } from "@/test/utils";

jest.mock("@/providers/auth-provider", () => ({
  useAuth: () => ({
    user: { name: "Jane Doe" },
    activeOrganization: { name: "Acme Inc" },
  }),
}));

describe("HomeScreen (app index)", () => {
  it("renders a welcome message with the user and org name", () => {
    const { getByText } = render(<HomeScreen />);
    expect(getByText("Welcome, Jane Doe")).toBeTruthy();
    expect(getByText("Acme Inc")).toBeTruthy();
  });
});
