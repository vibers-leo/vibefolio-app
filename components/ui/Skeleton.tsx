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
          backgroundColor: "#e5e7eb",
        },
        animatedStyle,
        style,
      ]}
    />
  );
});

/** 카드 형태 스켈레톤 (2열 그리드용) */
export const SkeletonGridCard = memo(function SkeletonGridCard() {
  return (
    <View style={{ flex: 1, paddingHorizontal: 4 }}>
      <Skeleton height={140} borderRadius={12} />
      <View style={{ paddingTop: 8, gap: 6 }}>
        <Skeleton width="75%" height={12} />
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Skeleton width={20} height={20} borderRadius={10} />
          <Skeleton width={60} height={10} />
        </View>
      </View>
    </View>
  );
});
