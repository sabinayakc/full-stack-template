import { formatPropertyFacts, PropertyFacts } from "@/components/ui/property-facts";
import { render } from "@/test/utils";

describe("formatPropertyFacts", () => {
  it("returns null when no facts", () => {
    expect(formatPropertyFacts({})).toBeNull();
  });

  it("formats year built", () => {
    expect(formatPropertyFacts({ yearBuilt: 2005 })).toBe("Built 2005");
  });

  it("formats square feet with comma", () => {
    expect(formatPropertyFacts({ squareFeet: 2500 })).toBe("2,500 sq ft");
  });

  it("formats multiple facts with dot separator", () => {
    const result = formatPropertyFacts({ yearBuilt: 2005, bedrooms: 3, bathrooms: 2 });
    expect(result).toBe("Built 2005 · 3 bed · 2 bath");
  });

  it("includes all fact types", () => {
    const result = formatPropertyFacts({
      yearBuilt: 2000,
      squareFeet: 1800,
      foundationType: "Slab",
      basementType: "Full",
      bedrooms: 4,
      bathrooms: 3,
      stories: 2,
    });
    expect(result).toBe("Built 2000 · 1,800 sq ft · Slab · Full · 4 bed · 3 bath · 2 stories");
  });
});

describe("PropertyFacts", () => {
  it("returns null when no facts", () => {
    const { toJSON } = render(<PropertyFacts property={{}} />);
    expect(toJSON()).toBeNull();
  });

  it("renders fact text", () => {
    const { getByText } = render(<PropertyFacts property={{ yearBuilt: 2010, bedrooms: 3 }} />);
    expect(getByText("Built 2010 · 3 bed")).toBeTruthy();
  });
});
