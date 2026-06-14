import { useQuery } from "@tanstack/react-query";
import { fetch } from "expo/fetch";
import { useDeferredValue } from "react";
import { GOOGLE_MAPS_API_KEY } from "@/constants/app";
import type { GooglePlacesLocationBias } from "./use-google-places-location-bias";

type GoogleAddressComponent = {
  longText?: string;
  shortText?: string;
  types?: string[];
};

type GooglePlacesTextValue =
  | string
  | {
      text?: string;
    };

type GooglePlacePrediction = {
  place?: string;
  placeId?: string;
  text?: GooglePlacesTextValue;
  structuredFormat?: {
    mainText?: GooglePlacesTextValue;
    secondaryText?: GooglePlacesTextValue;
  };
};

export type GooglePlacesSuggestion = {
  placeId: string;
  text: string;
  mainText?: string;
  secondaryText?: string;
};

export type GooglePlaceDetails = {
  placeId: string;
  formattedAddress: string;
  address: {
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country?: string;
  };
};

function getComponentText(component: GoogleAddressComponent | undefined) {
  return component?.longText ?? component?.shortText ?? "";
}

function getComponentShortText(component: GoogleAddressComponent | undefined) {
  return component?.shortText ?? component?.longText ?? "";
}

function getGoogleTextValue(value: GooglePlacesTextValue | undefined) {
  if (typeof value === "string") {
    return value;
  }

  return value?.text ?? "";
}

function getPredictionPlaceId(prediction: GooglePlacePrediction) {
  if (prediction.placeId) {
    return prediction.placeId;
  }

  if (prediction.place?.startsWith("places/")) {
    return prediction.place.replace(/^places\//, "");
  }

  return "";
}

function findComponent(components: GoogleAddressComponent[], type: string) {
  return components.find((component) => component.types?.includes(type));
}

function getPlacesBaseUrl() {
  return "https://places.googleapis.com/v1";
}

function isPlacesEnabled() {
  return Boolean(GOOGLE_MAPS_API_KEY);
}

function shouldLogGooglePlaces() {
  return __DEV__;
}

function sanitizeGooglePlacesHeaders(headers?: HeadersInit) {
  if (!headers) {
    return {};
  }

  const normalized = new Headers(headers);
  const sanitizedEntries = Array.from(normalized.entries()).map(([key, value]) => [
    key,
    key.toLowerCase() === "x-goog-api-key" ? "[REDACTED]" : value,
  ]);

  return Object.fromEntries(sanitizedEntries);
}

function parseRequestBody(body?: BodyInit | null) {
  if (typeof body !== "string") {
    return body ?? null;
  }

  try {
    return JSON.parse(body);
  } catch {
    return body;
  }
}

function parseResponseBody(bodyText: string) {
  if (!bodyText) {
    return null;
  }

  try {
    return JSON.parse(bodyText);
  } catch {
    return bodyText;
  }
}

async function googlePlacesFetch<T>(path: string, init?: RequestInit): Promise<T> {
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error("Google Maps API key is not configured.");
  }

  const url = `${getPlacesBaseUrl()}${path}`;
  const headers = {
    "Content-Type": "application/json",
    "X-Goog-Api-Key": GOOGLE_MAPS_API_KEY,
    ...(init?.headers ?? {}),
  };

  if (shouldLogGooglePlaces()) {
    console.log("[Google Places] Request", {
      url,
      method: init?.method ?? "GET",
      headers: sanitizeGooglePlacesHeaders(headers),
      body: parseRequestBody(init?.body),
    });
  }

  const response = await fetch(url, {
    ...init,
    headers,
  });

  const responseText = await response.text();
  const parsedBody = parseResponseBody(responseText);

  if (shouldLogGooglePlaces()) {
    console.log("[Google Places] Response", {
      url,
      status: response.status,
      ok: response.ok,
      body: parsedBody,
    });
  }

  if (!response.ok) {
    throw new Error(
      typeof parsedBody === "string"
        ? parsedBody || "Google Places request failed."
        : JSON.stringify(parsedBody) || "Google Places request failed.",
    );
  }

  return parsedBody as T;
}

export function useGooglePlacesAutocomplete(
  query: string,
  sessionToken?: string,
  locationBias?: GooglePlacesLocationBias | null,
) {
  const deferredQuery = useDeferredValue(query.trim());

  return useQuery<{ suggestions: GooglePlacesSuggestion[] }>({
    queryKey: ["google-places", "autocomplete", deferredQuery, sessionToken, locationBias],
    queryFn: async () => {
      const payload = await googlePlacesFetch<{
        suggestions?: Array<{
          placePrediction?: GooglePlacePrediction;
        }>;
      }>("/places:autocomplete", {
        method: "POST",
        headers: {
          "X-Goog-FieldMask":
            "suggestions.placePrediction.place,suggestions.placePrediction.placeId,suggestions.placePrediction.text,suggestions.placePrediction.structuredFormat.mainText,suggestions.placePrediction.structuredFormat.secondaryText",
        },
        body: JSON.stringify({
          input: deferredQuery,
          sessionToken,
          locationBias: locationBias ?? undefined,
        }),
      });

      return {
        suggestions: (payload.suggestions ?? [])
          .map((suggestion) => suggestion.placePrediction)
          .filter((prediction): prediction is NonNullable<typeof prediction> =>
            Boolean(prediction && getPredictionPlaceId(prediction)),
          )
          .map((prediction) => ({
            placeId: getPredictionPlaceId(prediction),
            text: getGoogleTextValue(prediction.text),
            mainText: getGoogleTextValue(prediction.structuredFormat?.mainText) || undefined,
            secondaryText:
              getGoogleTextValue(prediction.structuredFormat?.secondaryText) || undefined,
          })),
      };
    },
    enabled: isPlacesEnabled() && deferredQuery.length > 2,
    staleTime: 60_000,
  });
}

export function useGooglePlaceDetails(placeId: string | null, sessionToken?: string) {
  return useQuery<{ place: GooglePlaceDetails }>({
    queryKey: ["google-places", "details", placeId, sessionToken],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (sessionToken) {
        params.set("sessionToken", sessionToken);
      }

      const payload = await googlePlacesFetch<{
        id?: string;
        formattedAddress?: string;
        addressComponents?: GoogleAddressComponent[];
      }>(`/places/${encodeURIComponent(placeId ?? "")}?${params.toString()}`, {
        headers: {
          "X-Goog-FieldMask": "id,formattedAddress,addressComponents",
        },
      });

      const components = payload.addressComponents ?? [];
      const streetNumber = getComponentText(findComponent(components, "street_number"));
      const route = getComponentText(findComponent(components, "route"));
      const locality =
        getComponentText(findComponent(components, "locality")) ||
        getComponentText(findComponent(components, "postal_town")) ||
        getComponentText(findComponent(components, "administrative_area_level_2"));
      const state = getComponentShortText(findComponent(components, "administrative_area_level_1"));
      const postalCode = getComponentText(findComponent(components, "postal_code"));
      const country = getComponentShortText(findComponent(components, "country"));

      // Build addressLine1 from structured components; fall back to the
      // street portion of formattedAddress (everything before the first
      // comma) so we never store the full formatted string as the street.
      let addressLine1 = [streetNumber, route].filter(Boolean).join(" ");
      if (!addressLine1 && payload.formattedAddress) {
        addressLine1 = payload.formattedAddress.split(",")[0]?.trim() ?? "";
      }

      return {
        place: {
          placeId: payload.id ?? placeId ?? "",
          formattedAddress: payload.formattedAddress ?? "",
          address: {
            addressLine1,
            city: locality,
            state,
            postalCode,
            country: country || undefined,
          },
        },
      };
    },
    enabled: isPlacesEnabled() && Boolean(placeId),
    staleTime: 5 * 60_000,
  });
}

export function getGooglePlacesAvailability() {
  return {
    enabled: isPlacesEnabled(),
    reason: GOOGLE_MAPS_API_KEY
      ? null
      : "Set EXPO_PUBLIC_GOOGLE_MAPS_API_KEY to enable Google Places autocomplete.",
  };
}
