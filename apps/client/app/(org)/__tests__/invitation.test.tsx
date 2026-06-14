import { mockAuthClient } from "@/test/mocks/auth";
import { fireEvent, render, waitFor } from "@/test/utils";

const mockReplace = jest.fn();
const MockLink = Object.assign(({ children }: { children: React.ReactNode }) => children, {
  Trigger: () => null,
  Menu: () => null,
  MenuAction: () => null,
  Preview: () => null,
});

jest.mock("expo-router", () => ({
  useRouter: () => ({ replace: mockReplace }),
  useLocalSearchParams: () => ({ id: "test-inv-123" }),
  Link: MockLink,
}));

jest.mock("expo-image", () => ({
  Image: "Image",
}));

import Invitation from "../invitation";

describe("Invitation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthClient.organization.getInvitation = jest.fn();
    mockAuthClient.organization.acceptInvitation = jest.fn();
    mockAuthClient.organization.rejectInvitation = jest.fn();
  });

  it("shows loading state initially", () => {
    mockAuthClient.organization.getInvitation.mockReturnValue(new Promise(() => {}));
    render(<Invitation />);
    // Activity indicator renders while loading
  });

  it("shows not found state when invitation fails", async () => {
    mockAuthClient.organization.getInvitation.mockResolvedValue({
      error: { message: "Not found" },
    });

    const { getByText } = render(<Invitation />);

    await waitFor(() => {
      expect(getByText("Invitation Not Found")).toBeTruthy();
    });
  });

  it("shows invitation details for pending invitation", async () => {
    mockAuthClient.organization.getInvitation.mockResolvedValue({
      data: {
        id: "test-inv-123",
        email: "user@test.com",
        role: "member",
        status: "pending",
        organizationName: "Test Corp",
        organizationSlug: "test-corp",
        organizationId: "org-123",
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
      },
    });

    const { getByText } = render(<Invitation />);

    await waitFor(() => {
      expect(getByText("You're Invited!")).toBeTruthy();
      expect(getByText("Test Corp")).toBeTruthy();
      expect(getByText("Member")).toBeTruthy();
      expect(getByText("Accept Invitation")).toBeTruthy();
      expect(getByText("Decline")).toBeTruthy();
    });
  });

  it("shows expired state for expired invitation", async () => {
    mockAuthClient.organization.getInvitation.mockResolvedValue({
      data: {
        id: "test-inv-123",
        email: "user@test.com",
        role: "member",
        status: "pending",
        organizationName: "Test Corp",
        organizationSlug: "test-corp",
        organizationId: "org-123",
        expiresAt: new Date(Date.now() - 86400000).toISOString(),
      },
    });

    const { getByText } = render(<Invitation />);

    await waitFor(() => {
      expect(getByText("Invitation Expired")).toBeTruthy();
    });
  });

  it("handles accept invitation", async () => {
    mockAuthClient.organization.getInvitation.mockResolvedValue({
      data: {
        id: "test-inv-123",
        email: "user@test.com",
        role: "member",
        status: "pending",
        organizationName: "Test Corp",
        organizationSlug: "test-corp",
        organizationId: "org-123",
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
      },
    });

    mockAuthClient.organization.acceptInvitation.mockResolvedValue({ data: {} });
    mockAuthClient.organization.setActive.mockResolvedValue({});

    const { getByText } = render(<Invitation />);

    await waitFor(() => {
      expect(getByText("Accept Invitation")).toBeTruthy();
    });

    fireEvent.press(getByText("Accept Invitation"));

    await waitFor(() => {
      expect(mockAuthClient.organization.acceptInvitation).toHaveBeenCalledWith({
        invitationId: "test-inv-123",
      });
      expect(getByText("Welcome!")).toBeTruthy();
    });
  });
});
