import { useCallback, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { z } from "zod";
import { FormField } from "@/components/ui/form-field";
import { GooglePlacesAutocompleteField } from "@/components/ui/google-places-autocomplete-field";
import { ThemedTextInput } from "@/components/ui/themed-text-input";
import { fonts, useTheme } from "@/styles";

export const propertyAddressSchema = z.object({
  addressLine1: z.string().trim().min(1, "Address is required"),
  city: z.string().trim().min(1, "City is required"),
  state: z.string().trim().min(1, "State is required"),
  postalCode: z.string().trim().min(1, "ZIP is required"),
});

export type PropertyAddressData = z.infer<typeof propertyAddressSchema>;

type PropertyFieldKey = "addressLine1" | "city" | "state" | "postalCode";

type PropertyAddressFormProps = {
  onSubmit: (data: PropertyAddressData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  submitLabel?: string;
  surface?: "default" | "secondary";
  testIDPrefix?: string;
};

export function PropertyAddressForm({
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitLabel = "Add",
  surface = "secondary",
  testIDPrefix = "property-address",
}: PropertyAddressFormProps) {
  const { colors: c } = useTheme();

  const [addr, setAddr] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [errors, setErrors] = useState<Partial<Record<PropertyFieldKey, string>>>({});

  const handleSubmit = useCallback(async () => {
    const result = propertyAddressSchema.safeParse({
      addressLine1: addr,
      city,
      state,
      postalCode: zip,
    });
    if (!result.success) {
      const fieldErrors: Partial<Record<PropertyFieldKey, string>> = {};
      for (const issue of result.error.issues) {
        const key = String(issue.path[0]) as PropertyFieldKey;
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    await onSubmit(result.data);
  }, [addr, city, state, zip, onSubmit]);

  const handleCancel = useCallback(() => {
    setErrors({});
    onCancel();
  }, [onCancel]);

  return (
    <View style={[s.container, { borderColor: c.border, backgroundColor: c.bgSecondary }]}>
      <FormField error={errors.addressLine1}>
        <GooglePlacesAutocompleteField
          surface={surface}
          value={addr}
          onChangeText={setAddr}
          onPlaceSelected={(place) => {
            setAddr(place.address.addressLine1);
            setCity(place.address.city);
            setState(place.address.state);
            setZip(place.address.postalCode);
          }}
          placeholder="Street address"
          testID={`${testIDPrefix}-address`}
        />
      </FormField>
      <View style={s.rowFields}>
        <FormField error={errors.city} style={s.flex1}>
          <ThemedTextInput
            surface={surface}
            size="field"
            placeholder="City"
            value={city}
            onChangeText={setCity}
            testID={`${testIDPrefix}-city`}
          />
        </FormField>
        <FormField error={errors.state} style={s.smallField}>
          <ThemedTextInput
            surface={surface}
            size="field"
            placeholder="ST"
            value={state}
            onChangeText={setState}
            autoCapitalize="characters"
            maxLength={2}
            testID={`${testIDPrefix}-state`}
          />
        </FormField>
        <FormField error={errors.postalCode} style={s.smallField}>
          <ThemedTextInput
            surface={surface}
            size="field"
            placeholder="ZIP"
            value={zip}
            onChangeText={setZip}
            keyboardType="number-pad"
            testID={`${testIDPrefix}-zip`}
          />
        </FormField>
      </View>
      <View style={s.actions}>
        <Pressable
          style={[s.actionBtn, { borderColor: c.border, backgroundColor: c.bg }]}
          onPress={handleCancel}
        >
          <Text style={[s.actionBtnText, { color: c.textSecondary }]}>Cancel</Text>
        </Pressable>
        <Pressable
          style={[s.actionBtn, { borderColor: c.primary, backgroundColor: `${c.primary}12` }]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color={c.primary} />
          ) : (
            <Text style={[s.actionBtnText, { color: c.primary }]}>{submitLabel}</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    gap: 8,
  },
  rowFields: {
    flexDirection: "row",
    gap: 8,
  },
  flex1: {
    flex: 1,
  },
  smallField: {
    width: 72,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  actionBtnText: {
    fontSize: 12,
    fontFamily: fonts.semibold,
    textTransform: "uppercase",
    letterSpacing: 0.14 * 12,
  },
});
