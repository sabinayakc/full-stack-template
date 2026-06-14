import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  View,
  type ViewStyle,
} from "react-native";
import { FormField } from "@/components/ui/form-field";
import { IconSymbol } from "@/components/ui/icon-symbol";
import {
  type GooglePlaceDetails,
  type GooglePlacesSuggestion,
  getGooglePlacesAvailability,
  useGooglePlaceDetails,
  useGooglePlacesAutocomplete,
} from "@/hooks/use-google-places";
import { useGooglePlacesLocationBias } from "@/hooks/use-google-places-location-bias";
import { fonts, radius, spacing, useTheme } from "@/styles";

function splitSuggestionLocationLines(text: string) {
  const normalized = text.trim();

  if (!normalized) {
    return { cityLine: "", regionLine: "" };
  }

  const [cityPart, ...rest] = normalized
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  if (!cityPart) {
    return { cityLine: "", regionLine: normalized };
  }

  return {
    cityLine: cityPart,
    regionLine: rest.join(", "),
  };
}

type GooglePlacesAutocompleteFieldProps = {
  value: string;
  onChangeText?: (value: string) => void;
  onPlaceSelected: (place: GooglePlaceDetails, suggestion: GooglePlacesSuggestion) => void;
  placeholder?: string;
  testID?: string;
  suggestionTestIDPrefix?: string;
  initialHelperText?: string;
  noResultsText?: string;
  minQueryLength?: number;
  showInput?: boolean;
  inputStyle?: TextInputProps["style"];
  containerStyle?: ViewStyle;
  placeholderTextColor?: string;
  label?: string;
  hint?: string;
  error?: string;
  surface?: "default" | "secondary";
};

export function GooglePlacesAutocompleteField({
  value,
  onChangeText,
  onPlaceSelected,
  placeholder = "Search address",
  testID,
  suggestionTestIDPrefix,
  initialHelperText = "Start typing the street address for address suggestions.",
  noResultsText = "No matches found. You can still enter the address manually.",
  minQueryLength = 3,
  showInput = true,
  inputStyle,
  containerStyle,
  placeholderTextColor,
  label,
  hint,
  error,
  surface = "default",
}: GooglePlacesAutocompleteFieldProps) {
  const { colors: c } = useTheme();
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [selectedSuggestion, setSelectedSuggestion] = useState<GooglePlacesSuggestion | null>(null);
  const [committedSelectionValue, setCommittedSelectionValue] = useState<string | null>(
    () => value.trim() || null,
  );
  const [hasSyncedCommittedValue, setHasSyncedCommittedValue] = useState(() =>
    Boolean(value.trim()),
  );
  const [pendingCommit, setPendingCommit] = useState(false);
  // Latch that hides the suggestion list as soon as the user taps a result.
  // Only cleared when the user types into the input (or clears it), so the
  // list never re-appears between the tap and the eventual committed value.
  const [suggestionDismissed, setSuggestionDismissed] = useState(false);
  const [sessionToken] = useState(() => `${Date.now()}-${Math.random().toString(36).slice(2)}`);
  const availability = getGooglePlacesAvailability();
  const { locationBias } = useGooglePlacesLocationBias();
  const backgroundColor = surface === "secondary" ? c.bgSecondary : c.bg;
  const trimmedValue = value.trim();
  const isCommitted = Boolean(committedSelectionValue && committedSelectionValue === trimmedValue);
  const { data: autocompleteData, isFetching } = useGooglePlacesAutocomplete(
    isCommitted || suggestionDismissed ? "" : trimmedValue,
    sessionToken,
    locationBias,
  );
  const { data: placeDetails, isFetching: isFetchingPlaceDetails } = useGooglePlaceDetails(
    selectedPlaceId,
    sessionToken,
  );
  const suggestions = autocompleteData?.suggestions ?? [];
  const isSelectionInProgress = Boolean(selectedPlaceId || selectedSuggestion);
  const hideSuggestions = Boolean(
    suggestionDismissed ||
      isSelectionInProgress ||
      pendingCommit ||
      committedSelectionValue ||
      (hasSyncedCommittedValue && committedSelectionValue === trimmedValue),
  );
  const shouldShowNoResults =
    trimmedValue.length >= minQueryLength &&
    availability.enabled &&
    !isFetching &&
    !isFetchingPlaceDetails &&
    !hideSuggestions &&
    suggestions.length === 0;

  useEffect(() => {
    if (!placeDetails?.place || !selectedSuggestion) {
      return;
    }

    onPlaceSelected(placeDetails.place, selectedSuggestion);
    // Mark that we just completed a selection — the next value change from
    // the parent should be treated as the committed selection value.
    setPendingCommit(true);
    setSelectedPlaceId(null);
    setSelectedSuggestion(null);
  }, [onPlaceSelected, placeDetails, selectedSuggestion]);

  useEffect(() => {
    // After onPlaceSelected fires the parent updates `value`. Commit
    // whatever the parent chose so the suggestion list stays hidden.
    if (pendingCommit && trimmedValue) {
      setCommittedSelectionValue(trimmedValue);
      setHasSyncedCommittedValue(true);
      setPendingCommit(false);
      return;
    }
  }, [pendingCommit, trimmedValue]);

  useEffect(() => {
    if (!committedSelectionValue) {
      return;
    }

    if (!hasSyncedCommittedValue && trimmedValue === committedSelectionValue) {
      setHasSyncedCommittedValue(true);
      return;
    }

    if (hasSyncedCommittedValue && trimmedValue !== committedSelectionValue) {
      setCommittedSelectionValue(null);
      setHasSyncedCommittedValue(false);
    }
  }, [committedSelectionValue, hasSyncedCommittedValue, trimmedValue]);

  return (
    <FormField label={label} hint={hint} error={error} style={containerStyle}>
      <View style={s.container}>
        {showInput ? (
          <View style={s.inputWrap}>
            <TextInput
              style={[
                s.input,
                {
                  borderColor: error ? c.danger : c.border,
                  backgroundColor: error ? `${c.danger}0D` : backgroundColor,
                  color: c.text,
                  paddingRight: trimmedValue.length > 0 && !isCommitted ? 40 : spacing.lg,
                },
                inputStyle,
              ]}
              placeholder={placeholder}
              placeholderTextColor={placeholderTextColor ?? c.textSecondary}
              value={value}
              onChangeText={(text) => {
                setSuggestionDismissed(false);
                onChangeText?.(text);
              }}
              testID={testID}
            />
            {trimmedValue.length > 0 && !isCommitted ? (
              <Pressable
                style={[s.clearBtn, { backgroundColor: c.border }]}
                onPress={() => {
                  onChangeText?.("");
                  setCommittedSelectionValue(null);
                  setHasSyncedCommittedValue(false);
                  setPendingCommit(false);
                  setSelectedPlaceId(null);
                  setSelectedSuggestion(null);
                  setSuggestionDismissed(false);
                }}
                hitSlop={8}
                testID={testID ? `${testID}-clear` : undefined}
              >
                <IconSymbol name="xmark" size={10} color={c.textSecondary} />
              </Pressable>
            ) : null}
          </View>
        ) : null}

        {(trimmedValue.length < minQueryLength ? showInput : true) ? (
          trimmedValue.length < minQueryLength ? (
            <Text style={[s.helperText, { color: c.textSecondary }]}>{initialHelperText}</Text>
          ) : availability.enabled ? (
            isFetching || isFetchingPlaceDetails ? (
              <View style={s.loadingRow}>
                <ActivityIndicator size="small" color={c.primary} />
                <Text style={[s.helperText, { color: c.textSecondary }]}>
                  {isFetchingPlaceDetails ? "Using selected address..." : "Looking up addresses..."}
                </Text>
              </View>
            ) : !hideSuggestions && suggestions.length > 0 ? (
              suggestions.map((suggestion, index) =>
                (() => {
                  const locationText = suggestion.secondaryText || suggestion.text;
                  const { cityLine, regionLine } = splitSuggestionLocationLines(locationText);

                  return (
                    <Pressable
                      key={suggestion.placeId}
                      style={[
                        s.suggestionCard,
                        {
                          borderColor:
                            selectedPlaceId === suggestion.placeId ? c.primary : c.border,
                          backgroundColor:
                            selectedPlaceId === suggestion.placeId ? c.primarySubtle : c.bg,
                        },
                      ]}
                      onPress={() => {
                        setSuggestionDismissed(true);
                        setSelectedSuggestion(suggestion);
                        setSelectedPlaceId(suggestion.placeId);
                      }}
                      testID={
                        suggestionTestIDPrefix ? `${suggestionTestIDPrefix}-${index}` : undefined
                      }
                    >
                      <Text style={[s.suggestionTitle, { color: c.text }]}>
                        {suggestion.mainText || suggestion.text}
                      </Text>
                      {cityLine ? (
                        <Text style={[s.suggestionSubtitle, { color: c.textSecondary }]}>
                          {cityLine}
                        </Text>
                      ) : null}
                      {regionLine ? (
                        <Text style={[s.suggestionSubtitle, { color: c.textSecondary }]}>
                          {regionLine}
                        </Text>
                      ) : !cityLine ? (
                        <Text style={[s.suggestionSubtitle, { color: c.textSecondary }]}>
                          {locationText}
                        </Text>
                      ) : null}
                    </Pressable>
                  );
                })(),
              )
            ) : shouldShowNoResults ? (
              <Text style={[s.helperText, { color: c.textSecondary }]}>{noResultsText}</Text>
            ) : null
          ) : (
            <Text style={[s.helperText, { color: c.textSecondary }]}>{availability.reason}</Text>
          )
        ) : null}
      </View>
    </FormField>
  );
}

const s = StyleSheet.create({
  container: {
    gap: 8,
  },
  inputWrap: {
    position: "relative",
    justifyContent: "center",
  },
  input: {
    borderRadius: radius.lg,
    borderWidth: 1,
    minHeight: 48,
    paddingHorizontal: spacing.lg,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: fonts.regular,
  },
  clearBtn: {
    position: "absolute",
    right: 12,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  helperText: {
    fontSize: 13,
    fontFamily: fonts.regular,
    lineHeight: 20,
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  suggestionCard: {
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 4,
  },
  suggestionTitle: {
    fontSize: 14,
    fontFamily: fonts.semibold,
  },
  suggestionSubtitle: {
    fontSize: 14,
    fontFamily: fonts.regular,
  },
});
