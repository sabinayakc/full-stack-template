import { Stack } from "expo-router";
import { ErrorScreen } from "@/components/ui/error-screen";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ErrorScreen
        icon="questionmark.circle"
        title="Page Not Found"
        subtitle="The page you're looking for doesn't exist or has been moved."
      />
    </>
  );
}
