import { PropertyDetailCard } from "@/components/ui/property-detail-card";
import { fireEvent, render } from "@/test/utils";

const baseProperty = {
  id: "p1",
  addressLine1: "123 Main St",
  city: "Austin",
  state: "TX",
  postalCode: "78701",
};

describe("PropertyDetailCard", () => {
  it("renders address", () => {
    const { getByText } = render(<PropertyDetailCard property={baseProperty} />);
    expect(getByText("123 Main St")).toBeTruthy();
    expect(getByText("Austin, TX 78701")).toBeTruthy();
  });

  it("renders label as name when provided", () => {
    const property = { ...baseProperty, label: "Home Office" };
    const { getByText } = render(<PropertyDetailCard property={property} />);
    expect(getByText("Home Office")).toBeTruthy();
    // Address shown below label
    expect(getByText("123 Main St")).toBeTruthy();
  });

  it("renders section label and view button", () => {
    const onViewDetail = jest.fn();
    const { getByText } = render(
      <PropertyDetailCard
        property={baseProperty}
        sectionLabel="Service Property"
        onViewDetail={onViewDetail}
      />,
    );
    expect(getByText("Service Property")).toBeTruthy();
    expect(getByText("View Property")).toBeTruthy();
    fireEvent.press(getByText("View Property"));
    expect(onViewDetail).toHaveBeenCalledTimes(1);
  });

  it("renders custom viewDetailLabel", () => {
    const { getByText } = render(
      <PropertyDetailCard
        property={baseProperty}
        sectionLabel="Property"
        onViewDetail={jest.fn()}
        viewDetailLabel="Open Details"
      />,
    );
    expect(getByText("Open Details")).toBeTruthy();
  });

  it("renders property type and relationship badges", () => {
    const property = { ...baseProperty, propertyType: "Residential" };
    const { getByText } = render(
      <PropertyDetailCard property={property} relationshipType="owner" />,
    );
    expect(getByText("Residential")).toBeTruthy();
    expect(getByText("owner")).toBeTruthy();
  });
});
