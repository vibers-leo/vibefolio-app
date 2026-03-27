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
  Dimensions,
} from "react-native";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProject, getProjects, deleteProject, type Project } from "@/lib/api/projects";
import { toggleLike, getLikeStatus } from "@/lib/api/likes";
import {
  getComments,
  postComment,
  deleteComment,
  type Comment,
} from "@/lib/api/comments";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { IconButton } from "@/components/ui/IconButton";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
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
  ChevronLeft,
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

const { width: SCREEN_WIDTH } = Dimensions.get("window");

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

  // 좋아요 버튼 애니메이션
  const likeScale = useSharedValue(1);
  const likeAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: likeScale.value }],
  }));

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

  // Related projects
  const { data: relatedData } = useQuery({
    queryKey: ["related-projects", id],
    queryFn: () => getProjects({ limit: 6, sort: "popular" }),
    enabled: !!id,
  });
  const relatedProjects = relatedData?.projects?.filter(
    (p) => p.project_id !== id
  )?.slice(0, 4) ?? [];

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
    // 바운스 애니메이션
    likeScale.value = withSpring(1.3, { damping: 4, stiffness: 300 }, () => {
      likeScale.value = withSpring(1, { damping: 8, stiffness: 200 });
    });
    // Optimistic
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikesCount((c) => c + (wasLiked ? -1 : 1));
    try {
      const res = await toggleLike(id!);
      setLiked(res.liked);
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
    null;
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
        {/* 썸네일 — 웹과 동일하게 클린한 이미지 표시, 그라데이션 최소화 */}
        <View className="relative">
          {project.thumbnail_url ? (
            <Image
              source={{ uri: project.thumbnail_url }}
              className="w-full"
              style={{ aspectRatio: 4 / 3 }}
              contentFit="cover"
              transition={200}
              cachePolicy="memory-disk"
            />
          ) : (
            <View
              className="w-full bg-gray-100 items-center justify-center"
              style={{ aspectRatio: 4 / 3 }}
            >
              <Text className="text-5xl">{"🎨"}</Text>
            </View>
          )}

          {/* 소유자 액션 — 우상단 */}
          {isOwner && (
            <View className="absolute top-4 right-4 flex-row" style={{ gap: 6 }}>
              <IconButton
                onPress={() =>
                  router.push(`/project/edit?id=${project.project_id}`)
                }
                size={36}
                bg="rgba(0,0,0,0.4)"
              >
                <Pencil size={15} color="#ffffff" />
              </IconButton>
              <IconButton
                onPress={handleDeleteProject}
                size={36}
                bg="rgba(0,0,0,0.4)"
              >
                <Trash2 size={15} color="#ef4444" />
              </IconButton>
            </View>
          )}
        </View>

        <View className="px-5" style={{ paddingTop: 16 }}>
          {/* 제목 — 웹: text-2xl font-black */}
          <Animated.View entering={FadeInDown.delay(100).duration(300)}>
            <Text className="text-2xl font-black text-slate-900 leading-8">
              {project.title}
            </Text>
          </Animated.View>

          {/* 작성자 정보 */}
          <Animated.View entering={FadeInDown.delay(150).duration(300)}>
            <Pressable
              onPress={() => router.push(`/user/${project.user_id}`)}
              className="flex-row items-center mt-3.5"
            >
              <Avatar uri={avatarUrl} name={displayName} size={40} />
              <View className="ml-3 flex-1">
                <Text className="text-sm font-bold text-slate-800">
                  {displayName}
                </Text>
                {(projectUser as any)?.expertise && (
                  <Text className="text-[11px] text-slate-400 mt-0.5">
                    {typeof (projectUser as any).expertise === "string"
                      ? (projectUser as any).expertise
                      : "크리에이터"}
                  </Text>
                )}
              </View>
            </Pressable>
          </Animated.View>

          {/* 액션 바 — 좋아요, 북마크, 공유 */}
          <Animated.View entering={FadeInDown.delay(200).duration(300)}>
            <View className="flex-row items-center mt-4 py-3 border-y border-slate-100">
              {/* 조회수 */}
              <View className="flex-row items-center gap-1.5">
                <Eye size={16} color="#94a3b8" />
                <Text className="text-sm text-slate-400">
                  {project.views_count || 0}
                </Text>
              </View>

              {/* 좋아요 */}
              <Pressable
                onPress={handleLike}
                className="flex-row items-center gap-1.5 ml-4"
              >
                <Animated.View style={likeAnimatedStyle}>
                  <Heart
                    size={18}
                    color={liked ? "#ef4444" : "#94a3b8"}
                    fill={liked ? "#ef4444" : "none"}
                  />
                </Animated.View>
                <Text
                  className="text-sm font-semibold"
                  style={{ color: liked ? "#ef4444" : "#94a3b8" }}
                >
                  {likesCount}
                </Text>
              </Pressable>

              {/* 댓글 */}
              <Pressable
                onPress={() => {
                  scrollViewRef.current?.scrollTo({ y: commentSectionY.current, animated: true });
                }}
                className="flex-row items-center gap-1.5 ml-4"
              >
                <MessageCircle size={16} color="#94a3b8" />
                <Text className="text-sm text-slate-400">
                  {comments.length}
                </Text>
              </Pressable>

              <View className="flex-1" />

              {/* 북마크 */}
              <IconButton onPress={handleBookmark} size={40}>
                <Bookmark
                  size={20}
                  color={bookmarked ? "#16A34A" : "#94a3b8"}
                  fill={bookmarked ? "#16A34A" : "none"}
                />
              </IconButton>

              {/* 공유 */}
              <IconButton onPress={handleShare} size={40}>
                <Share2 size={20} color="#94a3b8" />
              </IconButton>
            </View>
          </Animated.View>

          {/* 본문 */}
          <Animated.View entering={FadeInDown.delay(250).duration(300)}>
            <Text className="text-[15px] text-slate-700 leading-7 mt-4">
              {project.content_text || project.description || ""}
            </Text>
          </Animated.View>

          {/* 소스 URL */}
          {sourceUrl && (
            <Animated.View entering={FadeInDown.delay(300).duration(300)}>
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
            </Animated.View>
          )}

          {/* 관련 프로젝트 캐러셀 */}
          {relatedProjects.length > 0 && (
            <View className="mt-10">
              <Text className="text-base font-bold text-slate-900 mb-4">
                다른 프로젝트
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 12 }}
              >
                {relatedProjects.map((rp) => (
                  <Pressable
                    key={rp.project_id}
                    onPress={() => router.push(`/project/${rp.project_id}`)}
                    style={{ width: SCREEN_WIDTH * 0.42 }}
                  >
                    <View
                      className="overflow-hidden bg-gray-100"
                      style={{ borderRadius: 12 }}
                    >
                      {rp.thumbnail_url ? (
                        <Image
                          source={{ uri: rp.thumbnail_url }}
                          style={{ width: "100%", aspectRatio: 4 / 3 }}
                          contentFit="cover"
                          cachePolicy="memory-disk"
                        />
                      ) : (
                        <View
                          className="w-full bg-gray-100 items-center justify-center"
                          style={{ aspectRatio: 4 / 3 }}
                        >
                          <Text className="text-2xl">{"🎨"}</Text>
                        </View>
                      )}
                    </View>
                    <Text
                      className="text-xs font-semibold text-slate-700 mt-2 px-0.5"
                      numberOfLines={1}
                    >
                      {rp.title}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}

          {/* 댓글 섹션 */}
          <View className="mt-10" onLayout={(e) => { commentSectionY.current = e.nativeEvent.layout.y; }}>
            <Text className="text-base font-bold text-slate-900 mb-4">
              댓글 {comments.length > 0 && `${comments.length}`}
            </Text>

            {comments.length === 0 ? (
              <View className="py-10 items-center rounded-2xl" style={{ backgroundColor: "#fafafa" }}>
                <MessageCircle size={32} color="#e2e8f0" />
                <Text className="text-sm text-slate-400 mt-2.5 font-medium">
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

      {/* 댓글 입력 — 하단 고정 */}
      <View
        className="px-4 py-3 border-t border-slate-100 bg-white"
      >
        {replyTo && (
          <View className="flex-row items-center mb-2">
            <Text className="text-xs text-green-600 font-medium">답글 작성 중</Text>
            <Pressable onPress={() => setReplyTo(null)} className="ml-2">
              <Text className="text-xs text-red-400 font-medium">취소</Text>
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
    null;
  const isOwner = currentUserId === comment.user_id;

  return (
    <View style={{ marginLeft: depth > 0 ? 28 : 0 }}>
      <View className="flex-row mb-4">
        <Pressable onPress={() => router.push(`/user/${comment.user_id}`)}>
          <Avatar
            uri={avatarUrl}
            name={comment.user?.username || "U"}
            size={32}
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
