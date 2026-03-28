import { Stack } from "expo-router";

/**
 * Supanova Premium Auth Layout
 * - 헤더 숨김 처리로 풀스크린 프리미엄 인증 경험
 */
export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#ffffff" },
        animation: "slide_from_bottom",
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="forgot-password" />
    </Stack>
  );
}
