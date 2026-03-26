import { View } from "react-native";
import { memo, useEffect } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";

interface Props {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

/** 반짝이는 스켈레톤 플레이스홀더 */
export const Skeleton = memo(function Skeleton({
  width = "100%",
  height = 16,
  borderRadius = 8,
  style,
}: Props) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: "#f1f5f9",
        },
        animatedStyle,
        style,
      ]}
    />
  );
});

/**
 * 카드 형태 스켈레톤 — 웹 LazyImageCard 플레이스홀더와 동일
 * - 4:3 비율 회색 박스 + 제목 줄 + 아바타+이름 줄
 */
export const SkeletonGridCard = memo(function SkeletonGridCard() {
  return (
    <View style={{ flex: 1 }}>
      <Skeleton height={0} borderRadius={12} style={{ aspectRatio: 4 / 3, height: undefined }} />
      <View style={{ paddingTop: 10, gap: 6 }}>
        <Skeleton width="75%" height={13} borderRadius={6} />
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Skeleton width={18} height={18} borderRadius={9} />
          <Skeleton width={60} height={10} borderRadius={5} />
        </View>
      </View>
    </View>
  );
});
