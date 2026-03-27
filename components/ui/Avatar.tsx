import { View, Text } from "react-native";
import { Image } from "expo-image";
import { memo } from "react";

interface Props {
  uri?: string | null;
  name?: string;
  /** 크기 (px) */
  size?: number;
}

export const Avatar = memo(function Avatar({
  uri,
  name = "U",
  size = 32,
}: Props) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const fallbackUrl = `https://api.dicebear.com/7.x/initials/png?seed=${name}`;
  const source = uri && uri !== "/globe.svg" ? uri : fallbackUrl;

  return (
    <View
      className="rounded-full overflow-hidden bg-slate-200 items-center justify-center"
      style={{
        width: size,
        height: size,
        borderWidth: 1,
        borderColor: "#f1f5f9",
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
  );
});
