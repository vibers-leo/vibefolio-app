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

/**
 * Supanova Premium Skeleton
 * - 부드러운 shimmer 애니메이션
 * - 프리미엄 색상 팔레트
 */
export const Skeleton = memo(function Skeleton({
  width = "100%",
  height = 16,
  borderRadius = 8,
  style,
}: Props) {
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.8, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
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
 * 프리미엄 카드 스켈레톤 — 이중 베젤 카드 스타일 매칭
 */
export const SkeletonGridCard = memo(function SkeletonGridCard() {
  return (
    <View
      style={{
        flex: 1,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#f1f5f9",
        backgroundColor: "#ffffff",
        padding: 4,
      }}
    >
      <Skeleton
        height={0}
        borderRadius={12}
        style={{ aspectRatio: 4 / 3, height: undefined }}
      />
      <View style={{ padding: 10, paddingTop: 8, gap: 8 }}>
        <Skeleton width="80%" height={14} borderRadius={7} />
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Skeleton width={20} height={20} borderRadius={10} />
          <Skeleton width={56} height={11} borderRadius={6} />
        </View>
      </View>
    </View>
  );
});
