import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { supabase } from "./supabase";

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) {
    if (__DEV__) console.warn("Push notifications require a physical device");
    return null;
  }

  // Check existing permissions
  const { status: existingStatus } =
    await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  // Request permissions if not granted
  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    if (__DEV__) console.warn("Push notification permission not granted");
    return null;
  }

  // Android notification channel
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Default",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  // Get Expo push token
  try {
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: "0fadd9e1-510c-43f9-a45c-742502b16bd5", // EAS project ID (update after eas init)
    });
    return tokenData.data;
  } catch (e) {
    if (__DEV__) console.warn("Failed to get push token:", e);
    return null;
  }
}

export async function savePushToken(token: string): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  // Upsert into push_tokens table
  await supabase.from("push_tokens").upsert(
    {
      user_id: user.id,
      expo_push_token: token,
      platform: Platform.OS,
    },
    { onConflict: "user_id,expo_push_token" }
  );
}

export async function removePushToken(): Promise<void> {
  try {
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: "0fadd9e1-510c-43f9-a45c-742502b16bd5",
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("push_tokens")
      .delete()
      .eq("user_id", user.id)
      .eq("expo_push_token", tokenData.data);
  } catch (e) {
    if (__DEV__) console.warn("Failed to remove push token:", e);
  }
}
