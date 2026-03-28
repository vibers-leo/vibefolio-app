import { View, Text, Pressable, Dimensions } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Heart, Eye } from "lucide-react-native";
import { memo, useCallback, useState } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeIn,
} from "react-native-reanimated";
import { Badge } from "./Badge";
import { Avatar } from "./Avatar";
import type { Project } from "@/lib/api/projects";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_GAP = 12;
const CARD_PADDING = 14;
const CARD_WIDTH = (SCREEN_WIDTH - CARD_PADDING * 2 - CARD_GAP) / 2;

interface Props {
  project: Project;
  index?: number;
}

function getBadges(project: Project) {
  const badges: { label: string; variant: "popular" | "new" | "category" }[] = [];
  if ((project.likes_count || 0) >= 100) {
    badges.push({ label: "POPULAR", variant: "popular" });
  }
  const daysSinceCreated = Math.floor(
    (Date.now() - new Date(project.created_at).getTime()) / (1000 * 60 * 60 * 24)
  );
  if (daysSinceCreated <= 7) {
    badges.push({ label: "NEW", variant: "new" });
  }
  return badges;
}

function addCommas(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

/**
 * Supanova Premium ProjectCard — 웹 디자인 매칭
 * - 더블 베젤 카드 (ring-1 ring-black/[0.04] 웹 매칭)
 * - 프리미엄 그림자 시스템 (웹 shadow-[0_2px_12px] 매칭)
 * - 스프링 프레스 애니메이션 (translateY -4 + scale)
 * - 4:3 썸네일 비율
 * - 세련된 통계 행
 */
export const ProjectCard = memo(function ProjectCard({ project, index = 0 }: Props) {
  const router = useRouter();
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);

  const user = project.users || project.User;
  const displayName = user?.username || "Unknown";
  const avatarUrl =
    user?.avatar_url && user.avatar_url !== "/globe.svg"
      ? user.avatar_url
      : null;
  const badges = getBadges(project);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.97, { damping: 15, stiffness: 400 });
    translateY.value = withSpring(-4, { damping: 15, stiffness: 400 });
  }, []);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 12, stiffness: 300 });
    translateY.value = withSpring(0, { damping: 12, stiffness: 300 });
  }, []);

  return (
    <Animated.View
      entering={FadeIn.delay(index * 50).duration(350)}
      style={{ width: CARD_WIDTH }}
    >
      <AnimatedPressable
        onPress={() => router.push(`/project/${project.project_id}`)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={animatedStyle}
      >
        {/* ━━━ 외부 베젤 — 웹 ring-1 ring-black/[0.04] 매칭 ━━━ */}
        <View
          style={{
            borderRadius: 18,
            borderWidth: 1,
            borderColor: "rgba(0,0,0,0.04)",
            backgroundColor: "#ffffff",
            shadowColor: "#101828",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 12,
            elevation: 4,
          }}
        >
          {/* ━━━ 썸네일 — 4:3, 내부 라운드 ━━━ */}
          <View
            style={{
              margin: 4,
              borderRadius: 14,
              overflow: "hidden",
              backgroundColor: "#f1f5f9",
            }}
          >
            {project.thumbnail_url ? (
              <Image
                source={{ uri: project.thumbnail_url }}
                style={{ width: "100%", aspectRatio: 4 / 3 }}
                contentFit="cover"
                transition={250}
                cachePolicy="memory-disk"
                placeholder={{ blurhash: "LKO2?U%2Tw=w]~RBVZRi};RPxuwH" }}
                recyclingKey={project.project_id}
              />
            ) : (
              <View
                className="w-full items-center justify-center"
                style={{ aspectRatio: 4 / 3, backgroundColor: "#f8fafc" }}
              >
                <Text style={{ fontSize: 32 }}>{"🎨"}</Text>
              </View>
            )}

            {/* 뱃지 — 좌상단 */}
            {badges.length > 0 && (
              <View
                className="absolute top-2 left-2"
                style={{ gap: 4 }}
              >
                {badges.map((b) => (
                  <Badge key={b.label} label={b.label} variant={b.variant} />
                ))}
              </View>
            )}
          </View>

          {/* ━━━ 하단 정보 영역 ━━━ */}
          <View style={{ padding: 10, paddingTop: 8 }}>
            {/* 제목 */}
            <Text
              style={{
                fontSize: 13,
                fontWeight: "800",
                color: "#0f172a",
                lineHeight: 18,
                letterSpacing: -0.2,
                marginBottom: 8,
              }}
              numberOfLines={2}
            >
              {project.title || "제목 없음"}
            </Text>

            {/* 유저 + 통계 */}
            <View className="flex-row items-center justify-between">
              {/* 유저 */}
              <Pressable
                onPress={() => router.push(`/user/${project.user_id}`)}
                className="flex-row items-center flex-1"
                style={{ gap: 5, marginRight: 6 }}
              >
                <Avatar uri={avatarUrl} name={displayName} size={18} />
                <Text
                  style={{
                    fontSize: 11,
                    color: "#64748b",
                    fontWeight: "600",
                    maxWidth: CARD_WIDTH - 90,
                  }}
                  numberOfLines={1}
                >
                  {displayName}
                </Text>
              </Pressable>

              {/* 통계 */}
              <View className="flex-row items-center" style={{ gap: 8 }}>
                <View className="flex-row items-center" style={{ gap: 3 }}>
                  <Heart size={11} color="#cbd5e1" />
                  <Text style={{ fontSize: 10, color: "#94a3b8", fontWeight: "700" }}>
                    {addCommas(project.likes_count || 0)}
                  </Text>
                </View>
                <View className="flex-row items-center" style={{ gap: 3 }}>
                  <Eye size={11} color="#cbd5e1" />
                  <Text style={{ fontSize: 10, color: "#94a3b8", fontWeight: "700" }}>
                    {addCommas(project.views_count || 0)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </AnimatedPressable>
    </Animated.View>
  );
});
