import { View, Text, Pressable, Dimensions } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Heart, Eye, MessageCircle } from "lucide-react-native";
import { memo, useCallback, useState } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeIn,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
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
    badges.push({ label: "NEW", variant: "new" });
  }
  return badges;
}

function addCommas(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

export const ProjectCard = memo(function ProjectCard({ project, index = 0 }: Props) {
  const router = useRouter();
  const scale = useSharedValue(1);
  const [imageLoaded, setImageLoaded] = useState(false);

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
    scale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
  }, []);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  }, []);

  return (
    <Animated.View
      entering={FadeIn.delay(index * 60).duration(300)}
      style={{ width: CARD_WIDTH }}
    >
      <AnimatedPressable
        onPress={() => router.push(`/project/${project.project_id}`)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={animatedStyle}
      >
        {/* 썸네일 영역 */}
        <View
          className="relative overflow-hidden bg-gray-100"
          style={{
            borderRadius: 14,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4,
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
              onLoad={() => setImageLoaded(true)}
            />
          ) : (
            <View
              className="w-full bg-gray-100 items-center justify-center"
              style={{ aspectRatio: 4 / 3 }}
            >
              <Text className="text-3xl">{"🎨"}</Text>
            </View>
          )}

          {/* 하단 그라데이션 오버레이 */}
          <View
            className="absolute bottom-0 left-0 right-0"
            style={{ height: "45%" }}
            pointerEvents="none"
          >
            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.55)"]}
              style={{ flex: 1 }}
            />
          </View>

          {/* 뱃지 */}
          {badges.length > 0 && (
            <View className="absolute top-2 left-2 gap-1">
              {badges.map((b) => (
                <Badge key={b.label} label={b.label} variant={b.variant} />
              ))}
            </View>
          )}

          {/* 하단 오버레이 통계 */}
          <View className="absolute bottom-2 left-2.5 right-2.5 flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <View className="flex-row items-center gap-0.5">
                <Heart size={10} color="#ffffff" />
                <Text className="text-[10px] font-bold text-white">
                  {addCommas(project.likes_count || 0)}
                </Text>
              </View>
              <View className="flex-row items-center gap-0.5">
                <Eye size={10} color="rgba(255,255,255,0.8)" />
                <Text className="text-[10px] font-semibold" style={{ color: "rgba(255,255,255,0.8)" }}>
                  {addCommas(project.views_count || 0)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* 카드 하단 정보 */}
        <View className="pt-2.5 px-0.5">
          {/* 제목 */}
          <Text
            className="text-[13px] font-bold text-gray-900"
            numberOfLines={1}
          >
            {project.title}
          </Text>

          {/* 유저 정보 */}
          <Pressable
            onPress={() => router.push(`/user/${project.user_id}`)}
            className="flex-row items-center mt-1.5 gap-1.5"
          >
            <Avatar uri={avatarUrl} name={displayName} size={18} />
            <Text
              className="text-[11px] text-gray-500"
              numberOfLines={1}
              style={{ maxWidth: CARD_WIDTH - 40 }}
            >
              {displayName}
            </Text>
          </Pressable>
        </View>
      </AnimatedPressable>
    </Animated.View>
  );
});
