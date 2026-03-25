import { fetchAPI } from "./client";

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  bio: string;
  profile_image_url: string;
  cover_image_url: string | null;
  role: string;
  created_at: string;
}

export async function getUserProfile(id: string): Promise<UserProfile> {
  const res = await fetchAPI<{ user: UserProfile }>(`/users/${id}`);
  return res.user;
}

export async function updateUserProfile(
  id: string,
  data: {
    username?: string;
    bio?: string;
    profile_image_url?: string;
  }
): Promise<UserProfile> {
  const res = await fetchAPI<{ user: UserProfile }>(`/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  return res.user;
}
