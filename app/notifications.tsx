import { View, Text, FlatList, Pressable, RefreshControl } from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useState, useCallback } from "react";
import { Bell, Check, CheckCheck } from "lucide-react-native";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/ko";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  type AppNotification,
} from "@/lib/api/notifications";
import { useAuth } from "@/lib/auth/AuthContext";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

dayjs.extend(relativeTime);
dayjs.locale("ko");

function getNotificationIcon(type: string) {
  switch (type) {
    case "like":
      return "❤️";
    case "comment":
      return "💬";
    case "follow":
      return "👤";
    case "recruit":
      return "💼";
    case "system":
      return "🔔";
    default:
      return "📢";
  }
}

export default function NotificationsScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: notifications,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: async () => {
      const res = await getNotifications(50, 0);
      return res.notifications || [];
    },
    enabled: !!user,
    staleTime: 1000 * 30, // 30 seconds - notifications should be fresh
  });

  const markReadMutation = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleNotificationPress = (notification: AppNotification) => {
    // Mark as read
    if (!notification.read) {
      markReadMutation.mutate(notification.id);
    }
    // Navigate to linked content
    if (notification.link) {
      router.push(notification.link as any);
    } else if (notification.action_url) {
      router.push(notification.action_url as any);
    }
  };

  const unreadCount = notifications?.filter((n) => !n.read).length ?? 0;

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pt-3 pb-2">
        <View>
          <Text className="text-xl font-black text-gray-900">알림</Text>
          {unreadCount > 0 && (
            <Text className="text-xs text-green-600 mt-0.5">
              읽지 않은 알림 {unreadCount}개
            </Text>
          )}
        </View>
        {unreadCount > 0 && (
          <Pressable
            onPress={() => markAllReadMutation.mutate()}
            className="flex-row items-center gap-1 px-3 py-1.5 rounded-full bg-green-50"
          >
            <CheckCheck size={14} color="#16A34A" />
            <Text className="text-xs font-semibold text-green-700">
              모두 읽음
            </Text>
          </Pressable>
        )}
      </View>

      {/* List */}
      {isLoading ? (
        <LoadingSpinner message="알림 불러오는 중..." />
      ) : (
        <FlatList
          data={notifications || []}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => handleNotificationPress(item)}
              className="flex-row px-5 py-4"
              style={{
                backgroundColor: item.read ? "#ffffff" : "#f0fdf4",
                borderBottomWidth: 1,
                borderBottomColor: "#f8fafc",
              }}
            >
              {/* Icon */}
              <View className="w-10 h-10 rounded-full items-center justify-center bg-gray-50 mr-3">
                <Text className="text-lg">
                  {getNotificationIcon(item.type)}
                </Text>
              </View>

              {/* Content */}
              <View className="flex-1">
                <Text
                  className="text-sm text-gray-900 leading-5"
                  style={{ fontWeight: item.read ? "400" : "600" }}
                  numberOfLines={2}
                >
                  {item.title || item.message}
                </Text>
                {item.message && item.title && (
                  <Text className="text-xs text-gray-400 mt-0.5" numberOfLines={1}>
                    {item.message}
                  </Text>
                )}
                <Text className="text-[10px] text-gray-300 mt-1">
                  {dayjs(item.created_at).fromNow()}
                </Text>
              </View>

              {/* Read indicator */}
              {!item.read && (
                <View className="w-2 h-2 rounded-full bg-green-500 mt-2 ml-2" />
              )}
            </Pressable>
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#16A34A"
              colors={["#16A34A"]}
            />
          }
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-20">
              <View className="w-16 h-16 rounded-full bg-gray-50 items-center justify-center mb-3">
                <Bell size={28} color="#cbd5e1" />
              </View>
              <Text className="text-gray-400 text-base">알림이 없습니다</Text>
            </View>
          }
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}
