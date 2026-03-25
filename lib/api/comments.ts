import { fetchAPI } from "./client";

export interface Comment {
  comment_id: string;
  project_id: number;
  user_id: string;
  content: string;
  parent_comment_id: string | null;
  is_deleted: boolean;
  created_at: string;
  user: {
    username: string;
    profile_image_url: string;
  };
  replies?: Comment[];
}

export async function getComments(
  projectId: string | number
): Promise<Comment[]> {
  const res = await fetchAPI<{ comments: Comment[] }>(
    `/comments?projectId=${projectId}`
  );
  return res.comments || [];
}

export async function postComment(params: {
  projectId: string | number;
  content: string;
  parentCommentId?: string;
}): Promise<Comment> {
  const res = await fetchAPI<{ comment: Comment }>("/comments", {
    method: "POST",
    body: JSON.stringify({
      projectId: Number(params.projectId),
      content: params.content,
      parentCommentId: params.parentCommentId,
    }),
  });
  return res.comment;
}

export async function deleteComment(commentId: string): Promise<void> {
  await fetchAPI(`/comments?commentId=${commentId}`, {
    method: "DELETE",
  });
}
