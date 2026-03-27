// 좋아요 API — 웹 백엔드 호출
import { fetchAPI } from "./client";

export async function toggleLike(
  projectId: string | number
): Promise<{ liked: boolean }> {
  return fetchAPI<{ liked: boolean }>("/likes", {
    method: "POST",
    body: JSON.stringify({ projectId: Number(projectId) }),
  });
}

export async function getLikeStatus(
  projectId: string | number
): Promise<boolean> {
  const res = await fetchAPI<{ liked: boolean }>(
    `/likes/status?projectId=${projectId}`
  );
  return res.liked;
}

export async function getLikeCount(
  projectId: string | number
): Promise<number> {
  const res = await fetchAPI<{ count: number }>(
    `/likes?projectId=${projectId}`
  );
  return res.count;
}
