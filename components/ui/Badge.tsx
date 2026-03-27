import { View, Text } from "react-native";
import { memo } from "react";

type BadgeVariant = "popular" | "new" | "category" | "tech" | "audit";

interface Props {
  label: string;
  variant?: BadgeVariant;
  /** 직접 색상 지정 시 사용 */
  bg?: string;
  textColor?: string;
}

/**
 * 웹 ImageCard 뱃지 스타일 복제
 * - POPULAR: bg-yellow-400 text-yellow-950
 * - NEW RELEASE: bg-indigo-600 text-white
 * - audit: bg-orange-600 text-white
 */
const VARIANT_STYLES: Record<BadgeVariant, { bg: string; text: string }> = {
  popular: { bg: "#facc15", text: "#422006" },       // yellow-400 / yellow-950
  new: { bg: "#4f46e5", text: "#ffffff" },            // indigo-600 / white
  category: { bg: "#6366f1", text: "#ffffff" },       // indigo-500
  tech: { bg: "#8b5cf6", text: "#ffffff" },           // violet-500
  audit: { bg: "#ea580c", text: "#ffffff" },          // orange-600
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
      className="px-2 py-0.5 rounded-full flex-row items-center"
      style={{
        backgroundColor: bg || style.bg,
      }}
    >
      <Text
        className="font-black"
        style={{
          color: textColor || style.text,
          fontSize: 9,
          letterSpacing: 0.5,
        }}
      >
        {label}
      </Text>
    </View>
  );
});
