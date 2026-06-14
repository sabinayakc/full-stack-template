import { StyleSheet, Text } from "react-native";
import { fonts, useTheme } from "@/styles";

type PropertyFactsInput = {
  yearBuilt?: number | null;
  squareFeet?: number | null;
  foundationType?: string | null;
  basementType?: string | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  stories?: number | null;
};

export function formatPropertyFacts(property: PropertyFactsInput): string | null {
  const facts = [
    property.yearBuilt ? `Built ${property.yearBuilt}` : null,
    typeof property.squareFeet === "number"
      ? `${property.squareFeet.toLocaleString()} sq ft`
      : null,
    property.foundationType || null,
    property.basementType || null,
    typeof property.bedrooms === "number" ? `${property.bedrooms} bed` : null,
    typeof property.bathrooms === "number" ? `${property.bathrooms} bath` : null,
    typeof property.stories === "number" ? `${property.stories} stories` : null,
  ].filter(Boolean);

  return facts.length > 0 ? facts.join(" · ") : null;
}

export function PropertyFacts({ property }: { property: PropertyFactsInput }) {
  const { colors: c } = useTheme();
  const text = formatPropertyFacts(property);

  if (!text) {
    return null;
  }

  return <Text style={[s.text, { color: c.textSecondary }]}>{text}</Text>;
}

const s = StyleSheet.create({
  text: {
    marginTop: 4,
    fontSize: 12,
    fontFamily: fonts.regular,
    lineHeight: 18,
  },
});
