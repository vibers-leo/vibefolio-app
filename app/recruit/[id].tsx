import { View, Text, ScrollView, Pressable, Linking } from "react-native";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getRecruitItem } from "@/lib/api/recruit";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import {
  Calendar,
  MapPin,
  Building2,
  ExternalLink,
  Bookmark,
  Share2,
} from "lucide-react-native";
import { useAuth } from "@/lib/auth/AuthContext";
import { toggleRecruitBookmark, getUserRecruitBookmarks } from "@/lib/bookmarks";
import { useState, useEffect } from "react";
import { Share } from "react-native";
import { BASE_URL } from "@/lib/constants";
import dayjs from "dayjs";

export default function RecruitDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [bookmarked, setBookmarked] = useState(false);

  const { data: item, isLoading } = useQuery({
    queryKey: ["recruit-item", id],
    queryFn: () => getRecruitItem(Number(id)),
    enabled: !!id,
  });

  // Check bookmark status from cached IDs
  useEffect(() => {
    if (!user || !id) return;
    const cached = queryClient.getQueryData<number[]>(["recruitBookmarkIds", user.id]);
    if (cached) {
      setBookmarked(cached.includes(Number(id)));
    } else {
      getUserRecruitBookmarks(user.id).then((ids) => {
        queryClient.setQueryData(["recruitBookmarkIds", user.id], ids);
        setBookmarked(ids.includes(Number(id)));
      });
    }
  }, [user, id, queryClient]);

  const handleBookmark = async () => {
    if (!user) {
      router.push("/(auth)/login");
      return;
    }
    // Optimistic update
    setBookmarked((prev) => !prev);
    try {
      const result = await toggleRecruitBookmark(Number(id));
      setBookmarked(result);
      queryClient.invalidateQueries({ queryKey: ["recruitBookmarkIds", user.id] });
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
    } catch (e) {
      setBookmarked((prev) => !prev);
      if (__DEV__) console.warn("Bookmark failed:", e);
    }
  };

  const handleShare = async () => {
    if (!item) return;
    try {
      await Share.share({
        message: `${item.title} - ${BASE_URL}/recruit/${item.id}`,
      });
    } catch (_) { /* share dismissed */ }
  };

  if (isLoading || !item) return <LoadingSpinner message="불러오는 중..." />;

  const typeConfig: Record<string, { label: string; bg: string; text: string }> = {
    job: { label: "채용", bg: "#eff6ff", text: "#2563eb" },
    contest: { label: "공모전", bg: "#f5f3ff", text: "#7c3aed" },
    event: { label: "이벤트", bg: "#ecfdf5", text: "#16a34a" },
  };
  const badge = typeConfig[item.type] || typeConfig.event;

  const daysLeft = item.date ? dayjs(item.date).diff(dayjs(), "day") : null;

  return (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Thumbnail */}
      {item.thumbnail && (
        <Image
          source={{ uri: item.thumbnail }}
          className="w-full"
          style={{ aspectRatio: 16 / 9 }}
          contentFit="cover"
          transition={200}
          cachePolicy="memory-disk"
        />
      )}

      <View className="px-5 pt-5">
        {/* Type Badge + D-Day */}
        <View className="flex-row items-center gap-2 mb-3">
          <View
            className="px-3 py-1 rounded-full"
            style={{ backgroundColor: badge.bg }}
          >
            <Text
              className="text-xs font-bold"
              style={{ color: badge.text }}
            >
              {badge.label}
            </Text>
          </View>
          {daysLeft !== null && (
            <View
              className="px-3 py-1 rounded-full"
              style={{
                backgroundColor:
                  daysLeft < 0 ? "#f1f5f9" : daysLeft === 0 ? "#fef2f2" : "#f0fdf4",
              }}
            >
              <Text
                className="text-xs font-bold"
                style={{
                  color:
                    daysLeft < 0 ? "#94a3b8" : daysLeft === 0 ? "#ef4444" : "#16a34a",
                }}
              >
                {daysLeft < 0 ? "마감" : daysLeft === 0 ? "D-DAY" : `D-${daysLeft}`}
              </Text>
            </View>
          )}
        </View>

        {/* Title */}
        <Text className="text-2xl font-black text-slate-900 leading-8">
          {item.title}
        </Text>

        {/* Meta Info */}
        <View className="mt-3 gap-2.5">
          {item.company && (
            <View className="flex-row items-center gap-2">
              <Building2 size={16} color="#16A34A" />
              <Text className="text-sm font-semibold text-green-700">
                {item.company}
              </Text>
            </View>
          )}
          {item.date && (
            <View className="flex-row items-center gap-2">
              <Calendar size={16} color="#94a3b8" />
              <Text className="text-sm text-slate-600">
                마감일: {dayjs(item.date).format("YYYY.MM.DD")}
              </Text>
            </View>
          )}
          {item.location && (
            <View className="flex-row items-center gap-2">
              <MapPin size={16} color="#94a3b8" />
              <Text className="text-sm text-slate-600">{item.location}</Text>
            </View>
          )}
        </View>

        {/* Actions */}
        <View className="flex-row items-center gap-3 mt-4 py-3.5 border-y border-slate-100">
          <Pressable
            onPress={handleBookmark}
            className="flex-row items-center gap-1.5 px-4 py-2.5 rounded-xl"
            style={{
              backgroundColor: bookmarked ? "#f0fdf4" : "#f8fafc",
              borderWidth: 1,
              borderColor: bookmarked ? "#bbf7d0" : "#e2e8f0",
            }}
          >
            <Bookmark
              size={16}
              color={bookmarked ? "#16A34A" : "#94a3b8"}
              fill={bookmarked ? "#16A34A" : "none"}
            />
            <Text
              className="text-sm font-medium"
              style={{ color: bookmarked ? "#16A34A" : "#64748b" }}
            >
              저장
            </Text>
          </Pressable>
          <Pressable
            onPress={handleShare}
            className="flex-row items-center gap-1.5 px-4 py-2.5 bg-slate-50 rounded-xl"
            style={{ borderWidth: 1, borderColor: "#e2e8f0" }}
          >
            <Share2 size={16} color="#64748b" />
            <Text className="text-sm font-medium text-slate-500">공유</Text>
          </Pressable>
        </View>

        {/* Description */}
        {item.description && (
          <Text className="text-[15px] text-slate-700 leading-7 mt-4">
            {item.description}
          </Text>
        )}

        {/* Source URL */}
        {item.source_url && (
          <Pressable
            onPress={() => Linking.openURL(item.source_url!)}
            className="flex-row items-center gap-2.5 mt-6 px-5 py-4 rounded-2xl"
            style={{
              backgroundColor: "#16A34A",
              shadowColor: "#16A34A",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 12,
              elevation: 6,
            }}
          >
            <ExternalLink size={18} color="#ffffff" />
            <Text className="text-base text-white font-bold">
              지원하기 / 원본 보기
            </Text>
          </Pressable>
        )}

        {/* Tags */}
        {item.tags && item.tags.length > 0 && (
          <View className="flex-row flex-wrap gap-2 mt-4">
            {item.tags.map((tag) => (
              <View
                key={tag}
                className="bg-slate-50 rounded-full px-3 py-1.5"
                style={{ borderWidth: 1, borderColor: "#e2e8f0" }}
              >
                <Text className="text-xs text-slate-500">{tag}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
