import { InfoPage, InfoPageSection } from "@/components/ui/info-page";
import { render } from "@/test/utils";

describe("InfoPage", () => {
  it("renders badge, title, and children", () => {
    const { getByText } = render(
      <InfoPage badge="v1.0" title="Release Notes">
        <InfoPageSection title="What's New">Bug fixes and improvements.</InfoPageSection>
      </InfoPage>,
    );
    expect(getByText("v1.0")).toBeTruthy();
    expect(getByText("Release Notes")).toBeTruthy();
    expect(getByText("What's New")).toBeTruthy();
    expect(getByText("Bug fixes and improvements.")).toBeTruthy();
  });

  it("renders subtitle when provided", () => {
    const { getByText } = render(
      <InfoPage badge="v1.0" title="Release Notes" subtitle="April 2026">
        <InfoPageSection title="Details">Content here.</InfoPageSection>
      </InfoPage>,
    );
    expect(getByText("April 2026")).toBeTruthy();
  });

  it("does not render subtitle when omitted", () => {
    const { queryByText } = render(
      <InfoPage badge="v1.0" title="Release Notes">
        <InfoPageSection title="Details">Content here.</InfoPageSection>
      </InfoPage>,
    );
    expect(queryByText("April 2026")).toBeNull();
  });
});
