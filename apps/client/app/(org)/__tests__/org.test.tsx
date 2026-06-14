import SelectOrganization from "@/app/(org)/org";
import { render, waitFor } from "@/test/utils";

jest.mock("@/lib/auth", () => ({
  authClient: {
    organization: {
      list: jest.fn().mockResolvedValue({
        data: [{ id: "org1", name: "Acme Roofing", slug: "acme-roofing" }],
      }),
      listUserInvitations: jest.fn().mockResolvedValue({ data: [] }),
    },
  },
}));

jest.mock("@/providers/auth-provider", () => ({
  useAuth: () => ({
    user: { id: "u1", name: "Jane", metadata: { onboarded: true } },
    isLoading: false,
    activeOrganization: { id: "org1", name: "Acme Roofing" },
    setActiveOrganization: jest.fn(),
  }),
}));

jest.mock("@/components/ui/confirm-dialog", () => ({
  confirm: jest.fn().mockResolvedValue(true),
}));

jest.mock("@/components/ui/loading-screen", () => {
  const { Text } = require("react-native");
  return { LoadingScreen: () => <Text>Loading...</Text> };
});

describe("SelectOrganization", () => {
  it("renders loading state initially", () => {
    const { getByText } = render(<SelectOrganization />);
    expect(getByText("Loading...")).toBeTruthy();
  });

  it("renders App title after loading", async () => {
    const { getByText } = render(<SelectOrganization />);
    await waitFor(() => expect(getByText("App")).toBeTruthy());
  });

  it("renders create new organization button after loading", async () => {
    const { getByText } = render(<SelectOrganization />);
    await waitFor(() => expect(getByText("Create New Organization")).toBeTruthy());
  });
});
