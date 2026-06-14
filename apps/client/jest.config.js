module.exports = {
  preset: "jest-expo",
  setupFiles: ["./test/setup.ts"],
  transformIgnorePatterns: [
    "/node_modules/(?!(.pnpm|(jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg|@tanstack/.*|better-auth|@better-auth/.*|@repo/.*))",
    "/node_modules/react-native-reanimated/plugin/",
  ],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    "^react-native-enriched$": "<rootDir>/test/mocks/react-native-enriched.ts",
  },
};
