import {
  View,
  Text,
  ScrollView,
  Pressable,
  Linking,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProject, deleteProject } from "@/lib/api/projects";
import { toggleLike, getLikeStatus } from "@/lib/api/likes";
import {
  getComments,
  postComment,
  deleteComment,
  type Comment,
} from "@/lib/api/comments";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import {
  Heart,
  Eye,
  ExternalLink,
  Share2,
  Bookmark,
  MessageCircle,
  Send,
  Trash2,
  Pencil,
} from "lucide-react-native";
import { useAuth } from "@/lib/auth/AuthContext";
import { toggleBookmark, getUserBookmarks } from "@/lib/bookmarks";
import React, { useState, useEffect, useCallback } from "react";
import { Share } from "react-native";
import { BASE_URL } from "@/lib/constants";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/ko";

dayjs.extend(relativeTime);
dayjs.locale("ko");

export default function ProjectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [bookmarked, setBookmarked] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [commentText, setCommentText] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const scrollViewRef = React.useRef<ScrollView>(null);
  const commentSectionY = React.useRef(0);

  const { data: project, isLoading } = useQuery({
    queryKey: ["project", id],
    queryFn: () => getProject(id!),
    enabled: !!id,
  });

  // Comments
  const { data: comments = [], refetch: refetchComments } = useQuery({
    queryKey: ["comments", id],
    queryFn: () => getComments(id!),
    enabled: !!id,
  });

  // Like status check
  useEffect(() => {
    if (!user || !id) return;
    getLikeStatus(id).then(setLiked).catch(() => {});
  }, [user, id]);

  // Sync likes count from project data
  useEffect(() => {
    if (project) setLikesCount(project.likes_count || 0);
  }, [project]);

  // Bookmark status from cached IDs
  useEffect(() => {
    if (!user || !id) return;
    const cached = queryClient.getQueryData<string[]>([
      "bookmarkIds",
      user.id,
    ]);
    if (cached) {
      setBookmarked(cached.includes(id));
    } else {
      getUserBookmarks(user.id).then((ids) => {
        queryClient.setQueryData(["bookmarkIds", user.id], ids);
        setBookmarked(ids.includes(id));
      });
    }
  }, [user, id, queryClient]);

  const handleLike = useCallback(async () => {
    if (!user) {
      router.push("/(auth)/login");
      return;
    }
    // Optimistic
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikesCount((c) => c + (wasLiked ? -1 : 1));
    try {
      const res = await toggleLike(id!);
      setLiked(res.liked);
      // Refetch project to get accurate count
      queryClient.invalidateQueries({ queryKey: ["project", id] });
    } catch (e) {
      setLiked(wasLiked);
      setLikesCount((c) => c + (wasLiked ? 1 : -1));
    }
  }, [user, liked, id, router, queryClient]);

  const handleBookmark = async () => {
    if (!user) {
      router.push("/(auth)/login");
      return;
    }
    setBookmarked((prev) => !prev);
    try {
      const result = await toggleBookmark(id!);
      setBookmarked(result);
      queryClient.invalidateQueries({ queryKey: ["bookmarkIds", user.id] });
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
    } catch (e) {
      setBookmarked((prev) => !prev);
    }
  };

  const handleShare = async () => {
    if (!project) return;
    try {
      await Share.share({
        message: `${project.title} - ${BASE_URL}/project/${project.project_id}`,
      });
    } catch (_) { /* share dismissed */ }
  };

  // Post comment mutation
  const commentMutation = useMutation({
    mutationFn: (params: { content: string; parentCommentId?: string }) =>
      postComment({ projectId: id!, ...params }),
    onSuccess: () => {
      setCommentText("");
      setReplyTo(null);
      refetchComments();
    },
  });

  const handlePostComment = () => {
    if (!user) {
      router.push("/(auth)/login");
      return;
    }
    const trimmed = commentText.trim();
    if (!trimmed) return;
    commentMutation.mutate({
      content: trimmed,
      parentCommentId: replyTo || undefined,
    });
  };

  // Delete comment
  const deleteMutation = useMutation({
    mutationFn: deleteComment,
    onSuccess: () => refetchComments(),
  });

  const handleDeleteComment = (commentId: string) => {
    Alert.alert("댓글 삭제", "정말 삭제하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: () => deleteMutation.mutate(commentId),
      },
    ]);
  };

  // Delete project
  const handleDeleteProject = () => {
    Alert.alert("프로젝트 삭제", "정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteProject(id!);
            queryClient.invalidateQueries({ queryKey: ["projects"] });
            router.back();
          } catch (e) {
            Alert.alert("오류", "프로젝트 삭제에 실패했습니다");
          }
        },
      },
    ]);
  };

  if (isLoading || !project) return <LoadingSpinner message="불러오는 중..." />;

  const isOwner = user?.id === project.user_id;
  const projectUser = project.User || project.users;
  const displayName = projectUser?.username || "Unknown";
  const avatarUrl =
    (projectUser as any)?.profile_image_url ||
    projectUser?.avatar_url ||
    `https://api.dicebear.com/7.x/initials/png?seed=${displayName}`;
  const sourceUrl =
    (project.custom_data as any)?.source_url ||
    (project as any).source_url ||
    null;

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={90}
    >
      <ScrollView
        ref={scrollViewRef}
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Thumbnail */}
        {project.thumbnail_url && (
          <Image
            source={{ uri: project.thumbnail_url }}
            className="w-full"
            style={{ aspectRatio: 4 / 3 }}
            contentFit="cover"
            transition={200}
            cachePolicy="memory-disk"
          />
        )}

        <View className="px-5 pt-5">
          {/* Title */}
          <Text className="text-2xl font-black text-slate-900 leading-8">
            {project.title}
          </Text>

          {/* Author */}
          <Pressable
            onPress={() => router.push(`/user/${project.user_id}`)}
            className="flex-row items-center mt-3"
          >
            <Image
              source={{ uri: avatarUrl }}
              className="w-9 h-9 rounded-full bg-slate-200"
              contentFit="cover"
              style={{ borderWidth: 1, borderColor: "#e2e8f0" }}
              cachePolicy="memory-disk"
            />
            <View className="ml-2.5 flex-1">
              <Text className="text-sm font-semibold text-slate-700">
                {displayName}
              </Text>
            </View>
            {isOwner && (
              <View className="flex-row items-center gap-1">
                <Pressable
                  onPress={() =>
                    router.push(`/project/edit?id=${project.project_id}`)
                  }
                  className="w-8 h-8 rounded-full items-center justify-center bg-slate-50"
                >
                  <Pencil size={14} color="#64748b" />
                </Pressable>
                <Pressable
                  onPress={handleDeleteProject}
                  className="w-8 h-8 rounded-full items-center justify-center bg-slate-50"
                >
                  <Trash2 size={14} color="#ef4444" />
                </Pressable>
              </View>
            )}
          </Pressable>

          {/* Stats & Actions */}
          <View className="flex-row items-center mt-4 py-3.5 border-y border-slate-100">
            <View className="flex-row items-center gap-1">
              <Eye size={16} color="#94a3b8" />
              <Text className="text-sm text-slate-400">
                {project.views_count || 0}
              </Text>
            </View>
            <Pressable
              onPress={handleLike}
              className="flex-row items-center gap-1 ml-4"
            >
              <Heart
                size={16}
                color={liked ? "#ef4444" : "#94a3b8"}
                fill={liked ? "#ef4444" : "none"}
              />
              <Text
                className="text-sm"
                style={{ color: liked ? "#ef4444" : "#94a3b8" }}
              >
                {likesCount}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => {
                scrollViewRef.current?.scrollTo({ y: commentSectionY.current, animated: true });
              }}
              className="flex-row items-center gap-1 ml-4"
            >
              <MessageCircle size={16} color="#94a3b8" />
              <Text className="text-sm text-slate-400">
                {comments.length}
              </Text>
            </Pressable>
            <View className="flex-1" />
            <Pressable onPress={handleBookmark} className="p-2">
              <Bookmark
                size={20}
                color={bookmarked ? "#16A34A" : "#94a3b8"}
                fill={bookmarked ? "#16A34A" : "none"}
              />
            </Pressable>
            <Pressable onPress={handleShare} className="p-2">
              <Share2 size={20} color="#94a3b8" />
            </Pressable>
          </View>

          {/* Description / Content */}
          <Text className="text-[15px] text-slate-700 leading-7 mt-4">
            {project.content_text || project.description || ""}
          </Text>

          {/* Source URL */}
          {sourceUrl && (
            <Pressable
              onPress={() => Linking.openURL(sourceUrl)}
              className="flex-row items-center gap-2 mt-6 bg-green-50 px-4 py-3.5 rounded-xl"
              style={{ borderWidth: 1, borderColor: "#dcfce7" }}
            >
              <ExternalLink size={18} color="#16A34A" />
              <Text
                className="text-sm text-green-700 font-semibold flex-1"
                numberOfLines={1}
              >
                {sourceUrl}
              </Text>
            </Pressable>
          )}

          {/* Comments Section */}
          <View className="mt-8" onLayout={(e) => { commentSectionY.current = e.nativeEvent.layout.y; }}>
            <Text className="text-base font-bold text-slate-900 mb-4">
              댓글 {comments.length > 0 && `${comments.length}`}
            </Text>

            {/* Comment list */}
            {comments.length === 0 ? (
              <View className="py-8 items-center">
                <MessageCircle size={28} color="#e2e8f0" />
                <Text className="text-sm text-slate-300 mt-2">
                  첫 번째 댓글을 남겨보세요
                </Text>
              </View>
            ) : (
              comments.map((comment) => (
                <CommentItem
                  key={comment.comment_id}
                  comment={comment}
                  currentUserId={user?.id}
                  onReply={(id) => {
                    setReplyTo(id);
                  }}
                  onDelete={handleDeleteComment}
                  router={router}
                />
              ))
            )}
          </View>
        </View>
      </ScrollView>

      {/* Comment input - fixed at bottom */}
      <View
        className="px-4 py-3 border-t border-slate-100 bg-white"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -1 },
          shadowOpacity: 0.03,
          shadowRadius: 4,
          elevation: 2,
        }}
      >
        {replyTo && (
          <View className="flex-row items-center mb-2">
            <Text className="text-xs text-green-600">답글 작성 중</Text>
            <Pressable onPress={() => setReplyTo(null)} className="ml-2">
              <Text className="text-xs text-red-400">취소</Text>
            </Pressable>
          </View>
        )}
        <View className="flex-row items-center gap-2">
          <TextInput
            className="flex-1 bg-slate-50 rounded-xl px-4 py-2.5 text-sm text-slate-900"
            placeholder={user ? "댓글을 입력하세요..." : "로그인 후 댓글을 남겨보세요"}
            placeholderTextColor="#94a3b8"
            value={commentText}
            onChangeText={setCommentText}
            onSubmitEditing={handlePostComment}
            returnKeyType="send"
            editable={!!user}
            multiline
            maxLength={500}
          />
          <Pressable
            onPress={handlePostComment}
            disabled={!commentText.trim() || commentMutation.isPending}
            className="w-10 h-10 rounded-full items-center justify-center"
            style={{
              backgroundColor:
                commentText.trim() && !commentMutation.isPending
                  ? "#16A34A"
                  : "#e2e8f0",
            }}
          >
            <Send
              size={16}
              color={
                commentText.trim() && !commentMutation.isPending
                  ? "#ffffff"
                  : "#94a3b8"
              }
            />
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

function CommentItem({
  comment,
  currentUserId,
  onReply,
  onDelete,
  router,
  depth = 0,
}: {
  comment: Comment;
  currentUserId?: string;
  onReply: (id: string) => void;
  onDelete: (id: string) => void;
  router: any;
  depth?: number;
}) {
  const avatarUrl =
    comment.user?.profile_image_url ||
    `https://api.dicebear.com/7.x/initials/png?seed=${comment.user?.username || "U"}`;
  const isOwner = currentUserId === comment.user_id;

  return (
    <View style={{ marginLeft: depth > 0 ? 28 : 0 }}>
      <View className="flex-row mb-4">
        <Pressable onPress={() => router.push(`/user/${comment.user_id}`)}>
          <Image
            source={{ uri: avatarUrl }}
            className="w-8 h-8 rounded-full bg-slate-200"
            contentFit="cover"
            cachePolicy="memory-disk"
          />
        </Pressable>
        <View className="flex-1 ml-2.5">
          <View className="flex-row items-center gap-2">
            <Text className="text-xs font-bold text-slate-700">
              {comment.user?.username || "Unknown"}
            </Text>
            <Text className="text-[10px] text-slate-300">
              {dayjs(comment.created_at).fromNow()}
            </Text>
          </View>
          <Text className="text-sm text-slate-600 mt-0.5 leading-5">
            {comment.content}
          </Text>
          <View className="flex-row items-center gap-3 mt-1">
            <Pressable onPress={() => onReply(comment.comment_id)}>
              <Text className="text-[11px] text-slate-400 font-medium">
                답글
              </Text>
            </Pressable>
            {isOwner && (
              <Pressable onPress={() => onDelete(comment.comment_id)}>
                <Trash2 size={12} color="#94a3b8" />
              </Pressable>
            )}
          </View>
        </View>
      </View>

      {/* Replies */}
      {comment.replies?.map((reply) => (
        <CommentItem
          key={reply.comment_id}
          comment={reply}
          currentUserId={currentUserId}
          onReply={onReply}
          onDelete={onDelete}
          router={router}
          depth={depth + 1}
        />
      ))}
    </View>
  );
}
