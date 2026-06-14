import { SettingsListItem, SettingsListSection } from "@/components/ui/settings-list";
import { fireEvent, render } from "@/test/utils";

describe("SettingsListSection", () => {
  it("renders title and children", () => {
    const { getByText } = render(
      <SettingsListSection title="Account">
        <SettingsListItem label="Email" />
      </SettingsListSection>,
    );
    expect(getByText("Account")).toBeTruthy();
    expect(getByText("Email")).toBeTruthy();
  });

  it("renders without title", () => {
    const { getByText } = render(
      <SettingsListSection>
        <SettingsListItem label="Theme" />
      </SettingsListSection>,
    );
    expect(getByText("Theme")).toBeTruthy();
  });

  it("shows children when collapsible and not defaultCollapsed", () => {
    const { getByText } = render(
      <SettingsListSection title="Section" collapsible>
        <SettingsListItem label="Visible" />
      </SettingsListSection>,
    );
    expect(getByText("Visible")).toBeTruthy();
  });

  it("hides children when defaultCollapsed", () => {
    const { queryByText, getByText } = render(
      <SettingsListSection title="Section" collapsible defaultCollapsed>
        <SettingsListItem label="Hidden" />
      </SettingsListSection>,
    );
    expect(getByText("Section")).toBeTruthy();
    expect(queryByText("Hidden")).toBeNull();
  });

  it("toggles children on press", () => {
    const { getByText, queryByText } = render(
      <SettingsListSection title="Toggle" collapsible defaultCollapsed>
        <SettingsListItem label="Content" />
      </SettingsListSection>,
    );
    expect(queryByText("Content")).toBeNull();
    fireEvent.press(getByText("Toggle"));
    expect(getByText("Content")).toBeTruthy();
    fireEvent.press(getByText("Toggle"));
    expect(queryByText("Content")).toBeNull();
  });
});

describe("SettingsListItem", () => {
  it("renders label", () => {
    const { getByText } = render(<SettingsListItem label="Profile" />);
    expect(getByText("Profile")).toBeTruthy();
  });

  it("renders subtitle", () => {
    const { getByText } = render(<SettingsListItem label="Profile" subtitle="Edit your info" />);
    expect(getByText("Edit your info")).toBeTruthy();
  });

  it("fires onPress", () => {
    const onPress = jest.fn();
    const { getByText } = render(<SettingsListItem label="Profile" onPress={onPress} />);
    fireEvent.press(getByText("Profile"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("renders with destructive style", () => {
    const { getByText } = render(<SettingsListItem label="Delete Account" destructive />);
    expect(getByText("Delete Account")).toBeTruthy();
  });

  it("renders testID", () => {
    const { getByTestId } = render(
      <SettingsListItem label="Profile" testID="profile-item" onPress={jest.fn()} />,
    );
    expect(getByTestId("profile-item")).toBeTruthy();
  });
});
