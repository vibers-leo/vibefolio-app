// 북마크 API — 웹 백엔드 호출
import { fetchAPI } from "./api/client";

/** 유저의 프로젝트 북마크 ID 목록 조회 */
export async function getUserBookmarks(userId: string): Promise<string[]> {
  const res = await fetchAPI<{ bookmarks: string[] }>(
    `/bookmarks?userId=${userId}`
  );
  return res.bookmarks || [];
}

/** 프로젝트 북마크 토글 (추가/제거) */
export async function toggleBookmark(projectId: string): Promise<boolean> {
  const res = await fetchAPI<{ bookmarked: boolean }>("/bookmarks", {
    method: "POST",
    body: JSON.stringify({ projectId }),
  });
  return res.bookmarked;
}

/** 유저의 채용 북마크 ID 목록 조회 */
export async function getUserRecruitBookmarks(
  userId: string
): Promise<number[]> {
  const res = await fetchAPI<{ bookmarks: number[] }>(
    `/bookmarks/recruit?userId=${userId}`
  );
  return res.bookmarks || [];
}

/** 채용 북마크 토글 (추가/제거) */
export async function toggleRecruitBookmark(
  itemId: number
): Promise<boolean> {
  const res = await fetchAPI<{ bookmarked: boolean }>("/bookmarks/recruit", {
    method: "POST",
    body: JSON.stringify({ recruitItemId: itemId }),
  });
  return res.bookmarked;
}
