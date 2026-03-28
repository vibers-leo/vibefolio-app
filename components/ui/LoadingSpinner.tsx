import { View, ActivityIndicator, Text } from "react-native";

interface Props {
  message?: string;
}

/**
 * Supanova Premium Loading Spinner
 */
export function LoadingSpinner({ message }: Props) {
  return (
    <View className="flex-1 items-center justify-center py-12">
      <View
        style={{
          width: 56,
          height: 56,
          borderRadius: 18,
          backgroundColor: "#f0fdf4",
          alignItems: "center",
          justifyContent: "center",
          borderWidth: 1,
          borderColor: "#dcfce7",
          marginBottom: 12,
        }}
      >
        <ActivityIndicator size="small" color="#16A34A" />
      </View>
      {message && (
        <Text
          style={{
            fontSize: 13,
            color: "#94a3b8",
            fontWeight: "500",
          }}
        >
          {message}
        </Text>
      )}
    </View>
  );
}

/* Legacy SkeletonCard for compatibility */
export function SkeletonCard() {
  return (
    <View className="bg-white">
      <View
        className="w-full rounded-xl"
        style={{ aspectRatio: 4 / 3, backgroundColor: "#f1f5f9" }}
      />
      <View style={{ paddingTop: 10, gap: 6 }}>
        <View style={{ height: 14, backgroundColor: "#f1f5f9", borderRadius: 7, width: "75%" }} />
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: "#f1f5f9" }} />
          <View style={{ height: 10, backgroundColor: "#f1f5f9", borderRadius: 5, width: 60 }} />
        </View>
      </View>
    </View>
  );
}
