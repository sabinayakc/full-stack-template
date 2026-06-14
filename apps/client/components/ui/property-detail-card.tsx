import { Pressable, StyleSheet, Text, View } from "react-native";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { PropertyFacts } from "@/components/ui/property-facts";
import { fonts, useTheme } from "@/styles";

interface PropertyData {
  id: string;
  label?: string | null;
  propertyType?: string | null;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state: string;
  postalCode: string;
  yearBuilt?: number | null;
  squareFeet?: number | null;
  foundationType?: string | null;
  basementType?: string | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  stories?: number | null;
}

interface PropertyDetailCardProps {
  property: PropertyData;
  /** Label shown above the card (e.g. "Service Property") */
  sectionLabel?: string;
  /** Relationship type badge (e.g. "owner") */
  relationshipType?: string;
  /** Called when the "View Property" button is pressed */
  onViewDetail?: () => void;
  viewDetailLabel?: string;
}

export function PropertyDetailCard({
  property,
  sectionLabel,
  relationshipType,
  onViewDetail,
  viewDetailLabel = "View Property",
}: PropertyDetailCardProps) {
  const { colors: c } = useTheme();

  return (
    <View style={s.container}>
      {sectionLabel ? (
        <View style={s.headerRow}>
          <Text style={[s.sectionLabel, { color: c.textSecondary }]}>{sectionLabel}</Text>
          {onViewDetail ? (
            <Pressable
              style={[s.viewBtn, { borderColor: c.border, backgroundColor: c.bg }]}
              onPress={onViewDetail}
            >
              <Text style={[s.viewBtnText, { color: c.primary }]}>{viewDetailLabel}</Text>
              <IconSymbol name="chevron.right" size={12} color={c.primary} />
            </Pressable>
          ) : null}
        </View>
      ) : null}

      <Text style={[s.name, { color: c.text }]}>{property.label || property.addressLine1}</Text>
      {property.label ? (
        <Text style={[s.address, { color: c.textSecondary }]}>{property.addressLine1}</Text>
      ) : null}
      {property.addressLine2 ? (
        <Text style={[s.address, { color: c.textSecondary }]}>{property.addressLine2}</Text>
      ) : null}
      <Text style={[s.address, { color: c.textSecondary }]}>
        {property.city}, {property.state} {property.postalCode}
      </Text>

      <View style={s.badgeRow}>
        {property.propertyType ? (
          <View style={[s.badge, { backgroundColor: `${c.primary}18` }]}>
            <Text style={[s.badgeText, { color: c.primary }]}>{property.propertyType}</Text>
          </View>
        ) : null}
        {relationshipType ? (
          <View style={[s.badge, { backgroundColor: `${c.accent}18` }]}>
            <Text style={[s.badgeText, { color: c.accent }]}>{relationshipType}</Text>
          </View>
        ) : null}
      </View>

      <PropertyFacts property={property} />

      {!sectionLabel && onViewDetail ? (
        <Pressable
          style={[s.viewBtn, s.viewBtnStandalone, { borderColor: c.border, backgroundColor: c.bg }]}
          onPress={onViewDetail}
        >
          <Text style={[s.viewBtnText, { color: c.primary }]}>{viewDetailLabel}</Text>
          <IconSymbol name="chevron.right" size={12} color={c.primary} />
        </Pressable>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    gap: 2,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  sectionLabel: {
    fontSize: 11,
    fontFamily: fonts.semibold,
    textTransform: "uppercase",
    letterSpacing: 0.18 * 11,
  },
  name: {
    fontSize: 15,
    fontFamily: fonts.semibold,
  },
  address: {
    fontSize: 13,
    fontFamily: fonts.regular,
  },
  badgeRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 4,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontFamily: fonts.medium,
    textTransform: "capitalize",
  },
  viewBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  viewBtnStandalone: {
    alignSelf: "flex-end",
    marginTop: 8,
  },
  viewBtnText: {
    fontSize: 12,
    fontFamily: fonts.medium,
  },
});
