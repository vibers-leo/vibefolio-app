// 푸시 알림 등록/해제 — 웹 백엔드 API 호출
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { fetchAPI } from "./api/client";

const EAS_PROJECT_ID = Constants.expoConfig?.extra?.eas?.projectId ?? "";

// 알림 핸들러 설정
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/** 푸시 알림 권한 요청 및 Expo Push Token 반환 */
export async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) {
    if (__DEV__) console.warn("푸시 알림은 실제 기기에서만 가능합니다");
    return null;
  }

  // 기존 권한 확인
  const { status: existingStatus } =
    await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  // 권한 요청
  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    if (__DEV__) console.warn("푸시 알림 권한이 거부되었습니다");
    return null;
  }

  // Android 알림 채널
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Default",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  // Expo Push Token 발급
  try {
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: EAS_PROJECT_ID,
    });
    return tokenData.data;
  } catch (e) {
    if (__DEV__) console.warn("푸시 토큰 발급 실패:", e);
    return null;
  }
}

/** 푸시 토큰을 서버에 저장 */
export async function savePushToken(token: string): Promise<void> {
  try {
    await fetchAPI("/push-tokens", {
      method: "POST",
      body: JSON.stringify({
        expo_push_token: token,
        platform: Platform.OS,
      }),
    });
  } catch (e) {
    if (__DEV__) console.warn("푸시 토큰 저장 실패:", e);
  }
}

/** 푸시 토큰을 서버에서 제거 */
export async function removePushToken(): Promise<void> {
  try {
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: EAS_PROJECT_ID,
    });

    await fetchAPI("/push-tokens", {
      method: "DELETE",
      body: JSON.stringify({
        expo_push_token: tokenData.data,
      }),
    });
  } catch (e) {
    if (__DEV__) console.warn("푸시 토큰 제거 실패:", e);
  }
}
