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
  useWindowDimensions,
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
  ArrowUpRight,
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
  const { width: screenWidth } = useWindowDimensions();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [bookmarked, setBookmarked] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [commentText, setCommentText] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const scrollViewRef = React.useRef<ScrollView>(null);
  const commentSectionY = React.useRef(0);

  const likeScale = useSharedValue(1);
  const likeAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: likeScale.value }],
  }));

  const { data: project, isLoading } = useQuery({
    queryKey: ["project", id],
    queryFn: () => getProject(id!),
    enabled: !!id,
  });

  const { data: comments = [], refetch: refetchComments } = useQuery({
    queryKey: ["comments", id],
    queryFn: () => getComments(id!),
    enabled: !!id,
  });

  const { data: relatedData } = useQuery({
    queryKey: ["related-projects", id],
    queryFn: () => getProjects({ limit: 6, sort: "popular" }),
    enabled: !!id,
  });
  const relatedProjects =
    relatedData?.projects
      ?.filter((p) => p.project_id !== id)
      ?.slice(0, 4) ?? [];

  useEffect(() => {
    if (!user || !id) return;
    getLikeStatus(id).then(setLiked).catch(() => {});
  }, [user, id]);

  useEffect(() => {
    if (project) setLikesCount(project.likes_count || 0);
  }, [project]);

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
    likeScale.value = withSpring(1.3, { damping: 4, stiffness: 300 }, () => {
      likeScale.value = withSpring(1, { damping: 8, stiffness: 200 });
    });
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
    } catch (_) {}
  };

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
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ━━━ Hero Image — 풀 와이드, 웹 매칭 ━━━ */}
        <View className="relative">
          {project.thumbnail_url ? (
            <Image
              source={{ uri: project.thumbnail_url }}
              className="w-full"
              style={{ aspectRatio: 16 / 9 }}
              contentFit="cover"
              transition={350}
              cachePolicy="memory-disk"
            />
          ) : (
            <View
              className="w-full items-center justify-center"
              style={{ aspectRatio: 16 / 9, backgroundColor: "#f8fafc" }}
            >
              <Text style={{ fontSize: 56 }}>{"🎨"}</Text>
            </View>
          )}

          {/* 하단 그라데이션 — 프리미엄 페이드 */}
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.02)", "rgba(255,255,255,0.8)", "rgba(255,255,255,1)"]}
            locations={[0, 0.3, 0.7, 1]}
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 80,
            }}
          />

          {/* 소유자 액션 */}
          {isOwner && (
            <View
              className="absolute top-4 right-4 flex-row"
              style={{ gap: 8 }}
            >
              <Pressable
                onPress={() =>
                  router.push(`/project/edit?id=${project.project_id}`)
                }
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 12,
                  backgroundColor: "rgba(0,0,0,0.5)",
                  alignItems: "center",
                  justifyContent: "center",
                  backdropFilter: "blur(10px)",
                }}
              >
                <Pencil size={15} color="#ffffff" />
              </Pressable>
              <Pressable
                onPress={handleDeleteProject}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 12,
                  backgroundColor: "rgba(0,0,0,0.5)",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Trash2 size={15} color="#ef4444" />
              </Pressable>
            </View>
          )}
        </View>

        <View className="px-5" style={{ paddingTop: 8 }}>
          {/* ━━━ 제목 — Supanova 타이포그래피 (웹 매칭) ━━━ */}
          <Animated.View entering={FadeInDown.delay(80).duration(400)}>
            <Text
              style={{
                fontSize: 26,
                fontWeight: "900",
                color: "#0f172a",
                lineHeight: 34,
                letterSpacing: -0.6,
              }}
            >
              {project.title}
            </Text>
            {/* 작성일 */}
            <Text
              style={{
                fontSize: 12,
                color: "#cbd5e1",
                fontWeight: "500",
                marginTop: 6,
                letterSpacing: -0.1,
              }}
            >
              {dayjs(project.created_at).format("YYYY.MM.DD")}
            </Text>
          </Animated.View>

          {/* ━━━ 작성자 — 프리미엄 프로필 카드 ━━━ */}
          <Animated.View entering={FadeInDown.delay(130).duration(350)}>
            <Pressable
              onPress={() => router.push(`/user/${project.user_id}`)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 16,
                padding: 12,
                borderRadius: 16,
                backgroundColor: "#fafbfc",
                borderWidth: 1,
                borderColor: "#f1f5f9",
              }}
            >
              <Avatar uri={avatarUrl} name={displayName} size={40} ring />
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "800",
                    color: "#0f172a",
                  }}
                >
                  {displayName}
                </Text>
                {(projectUser as any)?.expertise && (
                  <Text
                    style={{
                      fontSize: 11,
                      color: "#94a3b8",
                      marginTop: 2,
                    }}
                  >
                    {typeof (projectUser as any).expertise === "string"
                      ? (projectUser as any).expertise
                      : "크리에이터"}
                  </Text>
                )}
              </View>
              <ArrowUpRight size={16} color="#cbd5e1" />
            </Pressable>
          </Animated.View>

          {/* ━━━ Supanova 액션 바 — 웹 매칭 ━━━ */}
          <Animated.View entering={FadeInDown.delay(180).duration(400)}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 16,
                paddingVertical: 12,
                paddingHorizontal: 2,
                borderTopWidth: 1,
                borderBottomWidth: 1,
                borderColor: "rgba(0,0,0,0.04)",
              }}
            >
              {/* 조회수 */}
              <View
                className="flex-row items-center"
                style={{
                  gap: 5,
                  paddingHorizontal: 12,
                  paddingVertical: 7,
                  borderRadius: 999,
                  backgroundColor: "#f8fafc",
                  borderWidth: 1,
                  borderColor: "rgba(0,0,0,0.04)",
                }}
              >
                <Eye size={14} color="#94a3b8" />
                <Text style={{ fontSize: 13, color: "#64748b", fontWeight: "700" }}>
                  {project.views_count || 0}
                </Text>
              </View>

              {/* 좋아요 — 프리미엄 pill 버튼 */}
              <Pressable
                onPress={handleLike}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 5,
                  marginLeft: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 7,
                  borderRadius: 999,
                  backgroundColor: liked ? "#fef2f2" : "#f8fafc",
                  borderWidth: 1,
                  borderColor: liked ? "#fecaca" : "rgba(0,0,0,0.04)",
                }}
              >
                <Animated.View style={likeAnimatedStyle}>
                  <Heart
                    size={15}
                    color={liked ? "#ef4444" : "#94a3b8"}
                    fill={liked ? "#ef4444" : "none"}
                  />
                </Animated.View>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "700",
                    color: liked ? "#ef4444" : "#64748b",
                  }}
                >
                  {likesCount}
                </Text>
              </Pressable>

              {/* 댓글 */}
              <Pressable
                onPress={() => {
                  scrollViewRef.current?.scrollTo({
                    y: commentSectionY.current,
                    animated: true,
                  });
                }}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 5,
                  marginLeft: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 7,
                  borderRadius: 999,
                  backgroundColor: "#f8fafc",
                  borderWidth: 1,
                  borderColor: "rgba(0,0,0,0.04)",
                }}
              >
                <MessageCircle size={14} color="#94a3b8" />
                <Text style={{ fontSize: 13, color: "#64748b", fontWeight: "700" }}>
                  {comments.length}
                </Text>
              </Pressable>

              <View className="flex-1" />

              {/* 북마크 — 프리미엄 pill */}
              <Pressable
                onPress={handleBookmark}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 999,
                  backgroundColor: bookmarked ? "#f0fdf4" : "#f8fafc",
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 1,
                  borderColor: bookmarked ? "#bbf7d0" : "rgba(0,0,0,0.04)",
                }}
              >
                <Bookmark
                  size={17}
                  color={bookmarked ? "#16A34A" : "#94a3b8"}
                  fill={bookmarked ? "#16A34A" : "none"}
                />
              </Pressable>

              {/* 공유 */}
              <Pressable
                onPress={handleShare}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 999,
                  backgroundColor: "#f8fafc",
                  alignItems: "center",
                  justifyContent: "center",
                  marginLeft: 6,
                  borderWidth: 1,
                  borderColor: "rgba(0,0,0,0.04)",
                }}
              >
                <Share2 size={17} color="#94a3b8" />
              </Pressable>
            </View>
          </Animated.View>

          {/* ━━━ 본문 — 프리미엄 타이포그래피 ━━━ */}
          <Animated.View entering={FadeInDown.delay(230).duration(350)}>
            <Text
              style={{
                fontSize: 15,
                color: "#475569",
                lineHeight: 26,
                marginTop: 20,
                letterSpacing: 0.1,
              }}
            >
              {project.content_text || project.description || ""}
            </Text>
          </Animated.View>

          {/* ━━━ 소스 URL — 프리미엄 링크 카드 ━━━ */}
          {sourceUrl && (
            <Animated.View entering={FadeInDown.delay(280).duration(350)}>
              <Pressable
                onPress={() => Linking.openURL(sourceUrl)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: 24,
                  padding: 16,
                  borderRadius: 16,
                  backgroundColor: "#f0fdf4",
                  borderWidth: 1,
                  borderColor: "#dcfce7",
                  gap: 10,
                }}
              >
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    backgroundColor: "#dcfce7",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ExternalLink size={16} color="#16A34A" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 11, color: "#16A34A", fontWeight: "700", marginBottom: 2 }}>
                    소스 링크
                  </Text>
                  <Text
                    style={{ fontSize: 13, color: "#15803d", fontWeight: "500" }}
                    numberOfLines={1}
                  >
                    {sourceUrl}
                  </Text>
                </View>
                <ArrowUpRight size={14} color="#86efac" />
              </Pressable>
            </Animated.View>
          )}

          {/* ━━━ 관련 프로젝트 — 프리미엄 캐러셀 ━━━ */}
          {relatedProjects.length > 0 && (
            <View style={{ marginTop: 40 }}>
              <Text
                style={{
                  fontSize: 17,
                  fontWeight: "800",
                  color: "#0f172a",
                  marginBottom: 16,
                  letterSpacing: -0.3,
                }}
              >
                다른 프로젝트
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 14 }}
              >
                {relatedProjects.map((rp) => (
                  <Pressable
                    key={rp.project_id}
                    onPress={() => router.push(`/project/${rp.project_id}`)}
                    style={{ width: screenWidth * 0.42 }}
                  >
                    <View
                      style={{
                        borderRadius: 14,
                        overflow: "hidden",
                        backgroundColor: "#f8fafc",
                        borderWidth: 1,
                        borderColor: "#f1f5f9",
                        shadowColor: "#0f172a",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.04,
                        shadowRadius: 6,
                        elevation: 2,
                      }}
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
                          className="w-full items-center justify-center"
                          style={{ aspectRatio: 4 / 3, backgroundColor: "#f8fafc" }}
                        >
                          <Text style={{ fontSize: 24 }}>{"🎨"}</Text>
                        </View>
                      )}
                    </View>
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "700",
                        color: "#475569",
                        marginTop: 8,
                        paddingHorizontal: 2,
                      }}
                      numberOfLines={1}
                    >
                      {rp.title}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}

          {/* ━━━ 댓글 섹션 — 프리미엄 ━━━ */}
          <View
            style={{ marginTop: 40 }}
            onLayout={(e) => {
              commentSectionY.current = e.nativeEvent.layout.y;
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 20,
                gap: 8,
              }}
            >
              <Text
                style={{
                  fontSize: 17,
                  fontWeight: "800",
                  color: "#0f172a",
                  letterSpacing: -0.3,
                }}
              >
                댓글
              </Text>
              {comments.length > 0 && (
                <View
                  style={{
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                    borderRadius: 999,
                    backgroundColor: "#f0fdf4",
                  }}
                >
                  <Text style={{ fontSize: 12, fontWeight: "800", color: "#16A34A" }}>
                    {comments.length}
                  </Text>
                </View>
              )}
            </View>

            {comments.length === 0 ? (
              <View
                style={{
                  paddingVertical: 40,
                  alignItems: "center",
                  borderRadius: 20,
                  backgroundColor: "#fafbfc",
                  borderWidth: 1,
                  borderColor: "#f1f5f9",
                }}
              >
                <View
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 16,
                    backgroundColor: "#f1f5f9",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 12,
                  }}
                >
                  <MessageCircle size={24} color="#cbd5e1" />
                </View>
                <Text style={{ fontSize: 14, color: "#94a3b8", fontWeight: "600" }}>
                  첫 번째 댓글을 남겨보세요
                </Text>
              </View>
            ) : (
              comments.map((comment) => (
                <CommentItem
                  key={comment.comment_id}
                  comment={comment}
                  currentUserId={user?.id}
                  onReply={(id) => setReplyTo(id)}
                  onDelete={handleDeleteComment}
                  router={router}
                />
              ))
            )}
          </View>
        </View>
      </ScrollView>

      {/* ━━━ 댓글 입력 — 프리미엄 하단 바 ━━━ */}
      <View
        style={{
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderTopWidth: 1,
          borderTopColor: "#f1f5f9",
          backgroundColor: "#ffffff",
        }}
      >
        {replyTo && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 8,
              paddingHorizontal: 4,
            }}
          >
            <View
              style={{
                width: 3,
                height: 16,
                borderRadius: 2,
                backgroundColor: "#16A34A",
                marginRight: 8,
              }}
            />
            <Text style={{ fontSize: 12, color: "#16A34A", fontWeight: "600" }}>
              답글 작성 중
            </Text>
            <Pressable onPress={() => setReplyTo(null)} style={{ marginLeft: 8 }}>
              <Text style={{ fontSize: 12, color: "#ef4444", fontWeight: "600" }}>
                취소
              </Text>
            </Pressable>
          </View>
        )}
        <View className="flex-row items-center" style={{ gap: 8 }}>
          <View
            style={{
              flex: 1,
              backgroundColor: "#f8fafc",
              borderRadius: 14,
              paddingHorizontal: 16,
              paddingVertical: 10,
              borderWidth: 1,
              borderColor: "#f1f5f9",
              minHeight: 44,
            }}
          >
            <TextInput
              style={{
                fontSize: 14,
                color: "#0f172a",
                fontWeight: "500",
              }}
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
          </View>
          <Pressable
            onPress={handlePostComment}
            disabled={!commentText.trim() || commentMutation.isPending}
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            {commentText.trim() && !commentMutation.isPending ? (
              <LinearGradient
                colors={["#22c55e", "#16A34A"]}
                style={{
                  width: 44,
                  height: 44,
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 14,
                }}
              >
                <Send size={16} color="#ffffff" />
              </LinearGradient>
            ) : (
              <View
                style={{
                  width: 44,
                  height: 44,
                  backgroundColor: "#f1f5f9",
                  borderRadius: 14,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Send size={16} color="#cbd5e1" />
              </View>
            )}
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

/* ━━━ 프리미엄 댓글 아이템 ━━━ */
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
  const avatarUrl = comment.user?.profile_image_url || null;
  const isOwner = currentUserId === comment.user_id;

  return (
    <View style={{ marginLeft: depth > 0 ? 32 : 0 }}>
      <View
        style={{
          flexDirection: "row",
          marginBottom: 16,
          paddingBottom: 16,
          borderBottomWidth: depth === 0 ? 1 : 0,
          borderBottomColor: "#f8fafc",
        }}
      >
        <Pressable onPress={() => router.push(`/user/${comment.user_id}`)}>
          <Avatar
            uri={avatarUrl}
            name={comment.user?.username || "U"}
            size={32}
          />
        </Pressable>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <View
            className="flex-row items-center"
            style={{ gap: 8, marginBottom: 4 }}
          >
            <Text style={{ fontSize: 13, fontWeight: "800", color: "#0f172a" }}>
              {comment.user?.username || "Unknown"}
            </Text>
            <Text style={{ fontSize: 11, color: "#cbd5e1", fontWeight: "500" }}>
              {dayjs(comment.created_at).fromNow()}
            </Text>
          </View>
          <Text
            style={{
              fontSize: 14,
              color: "#475569",
              lineHeight: 21,
            }}
          >
            {comment.content}
          </Text>
          <View
            className="flex-row items-center"
            style={{ gap: 16, marginTop: 8 }}
          >
            <Pressable onPress={() => onReply(comment.comment_id)}>
              <Text style={{ fontSize: 12, color: "#94a3b8", fontWeight: "700" }}>
                답글
              </Text>
            </Pressable>
            {isOwner && (
              <Pressable onPress={() => onDelete(comment.comment_id)}>
                <Trash2 size={13} color="#cbd5e1" />
              </Pressable>
            )}
          </View>
        </View>
      </View>

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
