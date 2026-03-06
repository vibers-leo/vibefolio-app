import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackTitle: "뒤로",
        contentStyle: { backgroundColor: "#ffffff" },
      }}
    >
      <Stack.Screen name="login" options={{ headerTitle: "로그인" }} />
      <Stack.Screen name="signup" options={{ headerTitle: "회원가입" }} />
    </Stack>
  );
}
