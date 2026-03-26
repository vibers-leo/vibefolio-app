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

const VARIANT_STYLES: Record<BadgeVariant, { bg: string; text: string }> = {
  popular: { bg: "#fbbf24", text: "#78350f" },
  new: { bg: "#4f46e5", text: "#ffffff" },
  category: { bg: "#6366f1", text: "#ffffff" },
  tech: { bg: "#8b5cf6", text: "#ffffff" },
  audit: { bg: "#ea580c", text: "#ffffff" },
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
      className="px-2 py-0.5 rounded-full"
      style={{ backgroundColor: bg || style.bg }}
    >
      <Text
        className="text-[9px] font-black tracking-wide"
        style={{ color: textColor || style.text }}
      >
        {label}
      </Text>
    </View>
  );
});
