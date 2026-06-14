import { OrgSelector } from "@/components/core/org-selector";
import { render } from "@/test/utils";

jest.mock("@/components/ui/app-modal", () => ({
  AppModal: ({ children, visible }: { children: React.ReactNode; visible: boolean }) =>
    visible ? children : null,
}));

jest.mock("@/lib/api", () => ({
  fetchWithAuth: jest.fn().mockResolvedValue({ url: null }),
}));

jest.mock("@/lib/auth", () => ({
  authClient: {
    organization: {
      list: jest.fn().mockResolvedValue({
        data: [
          { id: "org1", name: "Acme Corp", slug: "acme" },
          { id: "org2", name: "Beta Inc", slug: "beta" },
        ],
      }),
    },
  },
}));

jest.mock("@/providers/auth-provider", () => ({
  useAuth: () => ({
    activeOrganization: { id: "org1", name: "Acme Corp" },
    setActiveOrganization: jest.fn(),
  }),
}));

describe("OrgSelector", () => {
  it("renders active organization name", async () => {
    const { findByText } = render(<OrgSelector />);
    expect(await findByText("Acme Corp")).toBeTruthy();
  });
});
