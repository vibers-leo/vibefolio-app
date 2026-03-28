import { View, Text } from "react-native";
import { memo } from "react";
import { LinearGradient } from "expo-linear-gradient";

type BadgeVariant = "popular" | "new" | "category" | "tech" | "audit";

interface Props {
  label: string;
  variant?: BadgeVariant;
  bg?: string;
  textColor?: string;
}

/**
 * Supanova Premium Badge
 * - 그라데이션 배경 + 글래스 보더
 * - 웹의 premium badge 스타일 복제
 */
const VARIANT_STYLES: Record<
  BadgeVariant,
  { colors: [string, string]; text: string; borderColor: string }
> = {
  popular: {
    colors: ["#fbbf24", "#f59e0b"],
    text: "#78350f",
    borderColor: "rgba(251,191,36,0.4)",
  },
  new: {
    colors: ["#818cf8", "#6366f1"],
    text: "#ffffff",
    borderColor: "rgba(129,140,248,0.4)",
  },
  category: {
    colors: ["#a78bfa", "#8b5cf6"],
    text: "#ffffff",
    borderColor: "rgba(167,139,250,0.4)",
  },
  tech: {
    colors: ["#22d3ee", "#06b6d4"],
    text: "#ffffff",
    borderColor: "rgba(34,211,238,0.4)",
  },
  audit: {
    colors: ["#fb923c", "#ea580c"],
    text: "#ffffff",
    borderColor: "rgba(251,146,60,0.4)",
  },
};

export const Badge = memo(function Badge({
  label,
  variant = "category",
  bg,
  textColor,
}: Props) {
  const style = VARIANT_STYLES[variant];
  return (
    <View
      style={{
        borderRadius: 999,
        borderWidth: 1,
        borderColor: style.borderColor,
        overflow: "hidden",
      }}
    >
      <LinearGradient
        colors={bg ? [bg, bg] : (style.colors as any)}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingHorizontal: 10,
          paddingVertical: 3,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <Text
          style={{
            color: textColor || style.text,
            fontSize: 9,
            fontWeight: "900",
            letterSpacing: 0.8,
          }}
        >
          {label}
        </Text>
      </LinearGradient>
    </View>
  );
});
