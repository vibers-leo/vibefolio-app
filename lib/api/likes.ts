import { fetchAPI } from "./client";
import { supabase } from "../supabase";

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
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;
  const res = await fetchAPI<{ liked: boolean }>(
    `/likes?userId=${user.id}&projectId=${projectId}`
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
