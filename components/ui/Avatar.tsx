import { View, Text } from "react-native";
import { Image } from "expo-image";
import { memo } from "react";

interface Props {
  uri?: string | null;
  name?: string;
  size?: number;
  /** 프리미엄 보더 링 표시 여부 */
  ring?: boolean;
}

/**
 * Supanova Premium Avatar
 * - 이중 보더 링 (외부 green glow + 내부 white)
 * - 부드러운 그림자
 */
export const Avatar = memo(function Avatar({
  uri,
  name = "U",
  size = 32,
  ring = false,
}: Props) {
  const fallbackUrl = `https://api.dicebear.com/7.x/initials/png?seed=${name}`;
  const source = uri && uri !== "/globe.svg" ? uri : fallbackUrl;

  const ringSize = ring ? 3 : 1.5;
  const outerSize = size + ringSize * 2;

  return (
    <View
      style={{
        width: outerSize,
        height: outerSize,
        borderRadius: outerSize / 2,
        borderWidth: ringSize,
        borderColor: ring ? "#16A34A" : "#f1f5f9",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#ffffff",
        ...(ring
          ? {
              shadowColor: "#16A34A",
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 3,
            }
          : {}),
      }}
    >
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          overflow: "hidden",
          backgroundColor: "#e2e8f0",
        }}
      >
        <Image
          source={{ uri: source }}
          style={{ width: size, height: size }}
          contentFit="cover"
          cachePolicy="memory-disk"
          placeholder={undefined}
        />
      </View>
    </View>
  );
});
