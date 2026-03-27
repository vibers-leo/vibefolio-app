// JWT 토큰 저장/조회 유틸 (SecureStore 기반, 웹은 localStorage 폴백)
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const TOKEN_KEY = "vibefolio_jwt";
const USER_KEY = "vibefolio_user";

/** JWT 토큰 저장 */
export async function setToken(token: string): Promise<void> {
  if (Platform.OS === "web") {
    localStorage.setItem(TOKEN_KEY, token);
    return;
  }
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

/** JWT 토큰 조회 */
export async function getToken(): Promise<string | null> {
  if (Platform.OS === "web") {
    return localStorage.getItem(TOKEN_KEY);
  }
  return SecureStore.getItemAsync(TOKEN_KEY);
}

/** JWT 토큰 삭제 */
export async function removeToken(): Promise<void> {
  if (Platform.OS === "web") {
    localStorage.removeItem(TOKEN_KEY);
    return;
  }
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

/** 유저 정보 캐시 저장 (오프라인 복원용) */
export async function setUserCache(user: object): Promise<void> {
  const json = JSON.stringify(user);
  if (Platform.OS === "web") {
    localStorage.setItem(USER_KEY, json);
    return;
  }
  await SecureStore.setItemAsync(USER_KEY, json);
}

/** 유저 정보 캐시 조회 */
export async function getUserCache(): Promise<object | null> {
  let json: string | null;
  if (Platform.OS === "web") {
    json = localStorage.getItem(USER_KEY);
  } else {
    json = await SecureStore.getItemAsync(USER_KEY);
  }
  if (!json) return null;
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/** 유저 정보 캐시 삭제 */
export async function removeUserCache(): Promise<void> {
  if (Platform.OS === "web") {
    localStorage.removeItem(USER_KEY);
    return;
  }
  await SecureStore.deleteItemAsync(USER_KEY);
}
