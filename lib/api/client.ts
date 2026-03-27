// API 클라이언트 — vibefolio-nextjs 웹 백엔드 호출
import { getToken } from "../tokenStore";

const API_URL =
  process.env.EXPO_PUBLIC_API_URL || "https://www.vibefolio.net";

/** API 기본 경로 */
export const API_BASE = `${API_URL}/api`;

class APIError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "APIError";
  }
}

/**
 * 인증 헤더 포함 fetch 래퍼
 * - SecureStore에서 JWT 토큰을 읽어 Authorization 헤더에 추가
 * - 401 응답 시 자동 로그아웃은 AuthContext에서 처리
 */
export async function fetchAPI<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const token = await getToken();

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new APIError(res.status, text);
  }

  // 204 No Content 등 빈 응답 처리
  const contentType = res.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    return undefined as T;
  }

  return res.json();
}

/**
 * multipart/form-data 전송용 (이미지 업로드 등)
 * - Content-Type 헤더를 설정하지 않음 (브라우저가 boundary 자동 설정)
 */
export async function fetchAPIFormData<T>(
  path: string,
  formData: FormData
): Promise<T> {
  const token = await getToken();

  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new APIError(res.status, text);
  }

  return res.json();
}
