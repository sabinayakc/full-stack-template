import React from "react";
import { TextInput } from "react-native";

export const EnrichedTextInput = React.forwardRef((props: Record<string, unknown>, ref: unknown) =>
  React.createElement(TextInput, { ...props, ref } as Record<string, unknown>),
);
