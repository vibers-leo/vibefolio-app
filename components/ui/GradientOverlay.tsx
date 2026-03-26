import { View } from "react-native";
import { memo } from "react";
import { LinearGradient } from "expo-linear-gradient";

interface Props {
  /** 방향: "bottom" = 아래서 위로 어두워짐, "top" = 위에서 아래로 */
  direction?: "bottom" | "top";
  /** 높이 비율 (0-1, 기본 0.5 = 하단 50%) */
  heightRatio?: number;
  /** 투명도 (0-1, 기본 0.6) */
  opacity?: number;
}

export const GradientOverlay = memo(function GradientOverlay({
  direction = "bottom",
  heightRatio = 0.5,
  opacity = 0.6,
}: Props) {
  const colors = [
    "transparent",
    `rgba(0,0,0,${opacity * 0.3})`,
    `rgba(0,0,0,${opacity})`,
  ];

  return (
    <View
      className="absolute left-0 right-0"
      style={
        direction === "bottom"
          ? { bottom: 0, height: `${heightRatio * 100}%` }
          : { top: 0, height: `${heightRatio * 100}%` }
      }
      pointerEvents="none"
    >
      <LinearGradient
        colors={direction === "bottom" ? (colors as any) : ([...colors].reverse() as any)}
        style={{ flex: 1 }}
      />
    </View>
  );
});
