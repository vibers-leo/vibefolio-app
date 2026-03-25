import { View, Text, FlatList, Pressable, RefreshControl } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useCallback } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { getUserBookmarks, getUserRecruitBookmarks } from "@/lib/bookmarks";
import { getProject, type Project } from "@/lib/api/projects";
import { getRecruitItem, type RecruitItem } from "@/lib/api/recruit";
import { ProjectCard } from "@/components/ui/ProjectCard";
import { RecruitCard } from "@/components/ui/RecruitCard";
import { LoadingSpinner, SkeletonCard } from "@/components/ui/LoadingSpinner";

const TABS = [
  { key: "projects", label: "프로젝트" },
  { key: "recruit", label: "채용/공모전" },
] as const;

export default function BookmarksScreen() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"projects" | "recruit">("projects");
  const [refreshing, setRefreshing] = useState(false);

  // Fetch bookmarked project IDs, then fetch each project detail
  const {
    data: projectBookmarks,
    isLoading: projectsLoading,
    refetch: refetchProjects,
  } = useQuery({
    queryKey: ["bookmarks", "projects", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const ids = await getUserBookmarks(user.id);
      if (ids.length === 0) return [];
      // Fetch all bookmarked projects in parallel
      const projects = await Promise.all(
        ids.map((id) => getProject(String(id)).catch(() => null))
      );
      return projects.filter(Boolean) as Project[];
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 2,
  });

  // Fetch bookmarked recruit IDs, then fetch each recruit detail
  const {
    data: recruitBookmarks,
    isLoading: recruitLoading,
    refetch: refetchRecruit,
  } = useQuery({
    queryKey: ["bookmarks", "recruit", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const ids = await getUserRecruitBookmarks(user.id);
      if (ids.length === 0) return [];
      const items = await Promise.all(
        ids.map((id) => getRecruitItem(id).catch(() => null))
      );
      return items.filter(Boolean) as RecruitItem[];
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 2,
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchProjects(), refetchRecruit()]);
    setRefreshing(false);
  }, [refetchProjects, refetchRecruit]);

  const isLoading = activeTab === "projects" ? projectsLoading : recruitLoading;

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header */}
      <View className="px-5 pt-3 pb-2">
        <Text className="text-xl font-black text-gray-900">북마크</Text>
        <Text className="text-xs text-gray-400 mt-0.5">
          저장한 프로젝트와 채용/공모전
        </Text>
      </View>

      {/* Tabs */}
      <View className="flex-row px-4 mb-2 gap-2">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          const count =
            tab.key === "projects"
              ? projectBookmarks?.length ?? 0
              : recruitBookmarks?.length ?? 0;
          return (
            <Pressable
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              className="px-4 py-2 rounded-full flex-row items-center gap-1.5"
              style={{
                backgroundColor: isActive ? "#0f172a" : "#f8fafc",
                borderWidth: isActive ? 0 : 1,
                borderColor: "#e2e8f0",
              }}
            >
              <Text
                className="text-sm font-semibold"
                style={{ color: isActive ? "#ffffff" : "#64748b" }}
              >
                {tab.label}
              </Text>
              {count > 0 && (
                <View
                  className="px-1.5 rounded-full"
                  style={{
                    backgroundColor: isActive ? "#ffffff30" : "#e2e8f0",
                  }}
                >
                  <Text
                    className="text-[10px] font-bold"
                    style={{ color: isActive ? "#ffffff" : "#64748b" }}
                  >
                    {count}
                  </Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>

      {/* List */}
      {isLoading ? (
        <View className="px-2 pt-8">
          <SkeletonCard />
          <View style={{ height: 16 }} />
          <SkeletonCard />
        </View>
      ) : activeTab === "projects" ? (
        <FlatList
          data={projectBookmarks || []}
          keyExtractor={(item) => item.project_id}
          renderItem={({ item }) => (
            <View className="px-2">
              <ProjectCard project={item} />
            </View>
          )}
          ItemSeparatorComponent={() => <View style={{ height: 40 }} />}
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
              <Text className="text-3xl mb-3">{"📌"}</Text>
              <Text className="text-gray-400 text-base">
                저장한 프로젝트가 없습니다
              </Text>
            </View>
          }
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <FlatList
          data={recruitBookmarks || []}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <View className="px-4">
              <RecruitCard item={item} />
            </View>
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
              <Text className="text-3xl mb-3">{"📌"}</Text>
              <Text className="text-gray-400 text-base">
                저장한 채용/공모전이 없습니다
              </Text>
            </View>
          }
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}
