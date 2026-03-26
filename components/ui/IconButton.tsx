import { Pressable, type ViewStyle } from "react-native";
import { memo, useCallback } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface Props {
  onPress: () => void;
  children: React.ReactNode;
  size?: number;
  bg?: string;
  style?: ViewStyle;
  disabled?: boolean;
}

/** 누르면 탄력 있게 축소되는 아이콘 버튼 */
export const IconButton = memo(function IconButton({
  onPress,
  children,
  size = 36,
  bg = "transparent",
  style,
  disabled = false,
}: Props) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.85, { damping: 15, stiffness: 300 });
  }, []);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  }, []);

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: bg,
          alignItems: "center",
          justifyContent: "center",
        },
        animatedStyle,
        style,
      ]}
    >
      {children}
    </AnimatedPressable>
  );
});
