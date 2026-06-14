import { waitFor } from "@testing-library/react-native";
import OrganizationScreen from "@/app/(app)/settings/organization/index";
import { render } from "@/test/utils";

jest.mock("@/providers/auth-provider", () => ({
  useAuth: () => ({
    user: { id: "u1" },
    activeOrganization: {
      id: "org1",
      name: "Acme Roofing",
      slug: "acme-roofing",
      settings: {
        address: "123 Main St",
        phone: "(555) 123-4567",
        email: "info@acme.com",
        website: "https://acme.com",
      },
    },
    refreshOrganization: jest.fn(),
  }),
}));

jest.mock("@/providers/toast-provider", () => ({
  useToast: () => ({ success: jest.fn(), error: jest.fn() }),
}));

jest.mock("@/lib/api", () => ({
  fetchWithAuth: jest.fn().mockResolvedValue({}),
}));

jest.mock("@/lib/auth", () => ({
  authClient: {
    organization: {
      listMembers: jest.fn().mockResolvedValue({
        data: {
          members: [{ userId: "u1", role: "owner" }],
        },
      }),
      update: jest.fn().mockResolvedValue({}),
    },
  },
}));

jest.mock("@/components/ui/avatar-editor", () => {
  const { View } = require("react-native");
  return { AvatarEditor: () => <View /> };
});

jest.mock("@/components/ui/confirm-dialog", () => ({
  confirm: jest.fn().mockResolvedValue(true),
  confirmWithInput: jest.fn().mockResolvedValue(true),
}));

jest.mock("@/components/ui/keyboard-view", () => {
  const React = require("react");
  const { View } = require("react-native");
  return { KeyboardView: ({ children }: { children: React.ReactNode }) => <View>{children}</View> };
});

jest.mock("@/components/ui/google-places-autocomplete-field", () => {
  const { TextInput } = require("react-native");
  return {
    GooglePlacesAutocompleteField: (props: {
      value: string;
      onChangeText: (v: string) => void;
      testID?: string;
    }) => <TextInput value={props.value} onChangeText={props.onChangeText} testID={props.testID} />,
  };
});

jest.mock("@/components/ui/phone-input", () => {
  const { TextInput } = require("react-native");
  return {
    PhoneInput: (props: { value: string; onChangeText: (v: string) => void; testID?: string }) => (
      <TextInput value={props.value} onChangeText={props.onChangeText} testID={props.testID} />
    ),
  };
});

describe("OrganizationScreen", () => {
  it("renders organization name and slug", () => {
    const { getByText } = render(<OrganizationScreen />);
    expect(getByText("Acme Roofing")).toBeTruthy();
    expect(getByText("acme-roofing")).toBeTruthy();
  });

  it("renders Members navigation item", () => {
    const { getByText } = render(<OrganizationScreen />);
    expect(getByText("Members")).toBeTruthy();
  });

  it("renders identity section after role loads", async () => {
    const { getByText, getByTestId } = render(<OrganizationScreen />);
    await waitFor(() => {
      expect(getByText("Identity")).toBeTruthy();
      expect(getByTestId("organization-identity-name")).toBeTruthy();
    });
  });

  it("renders danger zone section", () => {
    const { getByText } = render(<OrganizationScreen />);
    expect(getByText("Danger Zone")).toBeTruthy();
  });

  it("renders Delete Organization for admin/owner", async () => {
    const { getByText } = render(<OrganizationScreen />);
    await waitFor(() => {
      expect(getByText("Delete Organization")).toBeTruthy();
    });
  });
});
