// 이미지 선택 및 업로드 — 웹 백엔드 API를 통해 업로드
import * as ImagePicker from "expo-image-picker";
import { fetchAPIFormData } from "./api/client";

interface UploadResponse {
  url: string;
}

/** 갤러리에서 이미지 선택 후 서버 업로드 */
export async function pickImage(): Promise<string | null> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: true,
    aspect: [16, 9],
    quality: 0.8,
  });

  if (result.canceled || !result.assets[0]) return null;

  const asset = result.assets[0];
  return uploadImageToServer(asset.uri, "thumbnail");
}

/** 카메라로 촬영 후 서버 업로드 */
export async function takePhoto(): Promise<string | null> {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== "granted") {
    if (__DEV__) console.warn("카메라 권한이 거부되었습니다");
    return null;
  }

  const result = await ImagePicker.launchCameraAsync({
    allowsEditing: true,
    aspect: [16, 9],
    quality: 0.8,
  });

  if (result.canceled || !result.assets[0]) return null;

  const asset = result.assets[0];
  return uploadImageToServer(asset.uri, "photo");
}

/**
 * 이미지 파일을 웹 백엔드 /api/upload 엔드포인트로 업로드
 * - FormData로 multipart/form-data 전송
 * - 서버가 저장 후 공개 URL 반환
 */
async function uploadImageToServer(
  uri: string,
  prefix: string
): Promise<string | null> {
  try {
    const fileName = `${prefix}_${Date.now()}.jpg`;

    const formData = new FormData();
    formData.append("file", {
      uri,
      name: fileName,
      type: "image/jpeg",
    } as any);

    const res = await fetchAPIFormData<UploadResponse>("/upload", formData);
    return res.url;
  } catch (e) {
    if (__DEV__) console.error("이미지 업로드 실패:", e);
    return null;
  }
}
