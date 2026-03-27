import { View, Text, FlatList } from "react-native";
import { Image } from "expo-image";
import { useLocalSearchParams } from "expo-router";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { getUserProfile } from "@/lib/api/users";
import { getProjects, type Project } from "@/lib/api/projects";
import { ProjectCard } from "@/components/ui/ProjectCard";
import { LoadingSpinner, SkeletonCard } from "@/components/ui/LoadingSpinner";

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  // 유저 프로필 조회 (API 경유)
  const { data: profile } = useQuery({
    queryKey: ["user-profile", id],
    queryFn: () => getUserProfile(id!),
    enabled: !!id,
  });

  // 유저의 프로젝트 목록 (페이지네이션)
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ["user-projects", id],
    queryFn: ({ pageParam = 1 }) =>
      getProjects({ page: pageParam, limit: 20, userId: id }),
    getNextPageParam: (lastPage, allPages) =>
      lastPage.hasMore ? allPages.length + 1 : undefined,
    initialPageParam: 1,
    enabled: !!id,
  });

  const userProjects: Project[] =
    data?.pages.flatMap((page) => page.projects) ?? [];

  return (
    <FlatList
      className="flex-1 bg-white"
      data={userProjects}
      keyExtractor={(item) => item.project_id}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        <View className="items-center py-8 mx-4 mb-2">
          <Image
            source={{
              uri:
                profile?.profile_image_url ||
                `https://api.dicebear.com/7.x/initials/png?seed=${
                  profile?.username || "U"
                }`,
            }}
            className="w-20 h-20 rounded-full bg-slate-200"
            contentFit="cover"
            style={{ borderWidth: 3, borderColor: "#dcfce7" }}
          />
          <Text className="text-xl font-black text-slate-900 mt-3">
            {profile?.username || "User"}
          </Text>
          {profile?.bio && (
            <Text className="text-sm text-slate-400 mt-1.5 px-6 text-center leading-5">
              {profile.bio}
            </Text>
          )}
          {/* 프로젝트 수 */}
          <View className="mt-4 px-4 py-2 bg-green-50 rounded-full">
            <Text className="text-xs font-bold text-green-700">
              프로젝트 {userProjects.length}개
            </Text>
          </View>
        </View>
      }
      renderItem={({ item }) => (
        <View className="px-4">
          <ProjectCard project={item} />
        </View>
      )}
      onEndReached={() => {
        if (hasNextPage && !isFetchingNextPage) fetchNextPage();
      }}
      onEndReachedThreshold={0.5}
      ListFooterComponent={
        isLoading || isFetchingNextPage ? (
          <LoadingSpinner />
        ) : null
      }
      ListEmptyComponent={
        isLoading ? (
          <View className="px-4">
            <SkeletonCard />
            <SkeletonCard />
          </View>
        ) : (
          <View className="items-center py-20">
            <Text className="text-3xl mb-2">{"📂"}</Text>
            <Text className="text-slate-400">아직 프로젝트가 없습니다</Text>
          </View>
        )
      }
      contentContainerStyle={{ paddingBottom: 20 }}
    />
  );
}
