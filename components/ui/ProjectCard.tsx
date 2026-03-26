import { View, Text, Pressable, Dimensions } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Heart, BarChart3 } from "lucide-react-native";
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
const CARD_PADDING = 12;
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
    badges.push({ label: "NEW RELEASE", variant: "new" });
  }
  return badges;
}

function addCommas(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

/**
 * ProjectCard — 웹 ImageCard.tsx 디자인 완전 복제
 *
 * 구조: 4:3 썸네일 (rounded-xl) → 아래 텍스트 영역
 * - 제목: 15px bold, gray-900, hover시 green-600
 * - 좌측: 아바타(20px) + 유저네임(12px gray-500)
 * - 우측: 좋아요(heart) + 조회수(chart) gray-400
 * - 뱃지: 이미지 좌상단
 * - 그라데이션 오버레이 없음 (웹과 동일)
 */
export const ProjectCard = memo(function ProjectCard({ project, index = 0 }: Props) {
  const router = useRouter();
  const scale = useSharedValue(1);
  const [pressed, setPressed] = useState(false);

  const user = project.users || project.User;
  const displayName = user?.username || "Unknown";
  const avatarUrl =
    user?.avatar_url && user.avatar_url !== "/globe.svg"
      ? user.avatar_url
      : null;
  const badges = getBadges(project);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 300 });
    setPressed(true);
  }, []);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
    setPressed(false);
  }, []);

  return (
    <Animated.View
      entering={FadeIn.delay(index * 40).duration(250)}
      style={{ width: CARD_WIDTH }}
    >
      <AnimatedPressable
        onPress={() => router.push(`/project/${project.project_id}`)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={animatedStyle}
      >
        {/* 썸네일 영역 — 4:3 비율, rounded-xl, 웹 ImageCard와 동일 */}
        <View
          className="relative overflow-hidden bg-gray-100"
          style={{
            borderRadius: 12,
          }}
        >
          {project.thumbnail_url ? (
            <Image
              source={{ uri: project.thumbnail_url }}
              style={{ width: "100%", aspectRatio: 4 / 3 }}
              contentFit="cover"
              transition={200}
              cachePolicy="memory-disk"
              placeholder={{ blurhash: "LKO2?U%2Tw=w]~RBVZRi};RPxuwH" }}
              recyclingKey={project.project_id}
            />
          ) : (
            <View
              className="w-full bg-gray-100 items-center justify-center"
              style={{ aspectRatio: 4 / 3 }}
            >
              <Text className="text-3xl">{"🎨"}</Text>
            </View>
          )}

          {/* 뱃지 — 웹과 동일하게 좌상단 */}
          {badges.length > 0 && (
            <View className="absolute top-2.5 left-2.5" style={{ gap: 6 }}>
              {badges.map((b) => (
                <Badge key={b.label} label={b.label} variant={b.variant} />
              ))}
            </View>
          )}
        </View>

        {/* 하단 정보 영역 — 웹 ImageCard pt-3 px-1 구조 복제 */}
        <View style={{ paddingTop: 10, paddingHorizontal: 2 }}>
          {/* 제목 — 웹: font-bold text-gray-900 text-[15px] truncate */}
          <Text
            className="font-bold text-gray-900"
            style={{ fontSize: 14, lineHeight: 20 }}
            numberOfLines={1}
          >
            {project.title || "제목 없음"}
          </Text>

          {/* 유저 + 통계 행 — 웹: flex items-center justify-between */}
          <View
            className="flex-row items-center justify-between"
            style={{ marginTop: 6 }}
          >
            {/* 좌측: 아바타 + 유저네임 */}
            <Pressable
              onPress={() => router.push(`/user/${project.user_id}`)}
              className="flex-row items-center flex-1"
              style={{ gap: 5, marginRight: 8 }}
            >
              <Avatar uri={avatarUrl} name={displayName} size={18} />
              <Text
                className="text-gray-500"
                style={{ fontSize: 11, maxWidth: CARD_WIDTH - 80 }}
                numberOfLines={1}
              >
                {displayName}
              </Text>
            </Pressable>

            {/* 우측: 좋아요 + 조회수 — 웹: text-xs text-gray-400 */}
            <View className="flex-row items-center" style={{ gap: 10 }}>
              <View className="flex-row items-center" style={{ gap: 3 }}>
                <Heart size={12} color="#9ca3af" />
                <Text style={{ fontSize: 11, color: "#9ca3af" }}>
                  {addCommas(project.likes_count || 0)}
                </Text>
              </View>
              <View className="flex-row items-center" style={{ gap: 3 }}>
                <BarChart3 size={12} color="#9ca3af" />
                <Text style={{ fontSize: 11, color: "#9ca3af" }}>
                  {addCommas(project.views_count || 0)}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </AnimatedPressable>
    </Animated.View>
  );
});
