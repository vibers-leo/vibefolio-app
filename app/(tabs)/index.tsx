import {
  View,
  Text,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  TextInput,
  Modal,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { useInfiniteQuery } from "@tanstack/react-query";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import {
  Plus,
  Bell,
  Search,
  X,
  Layers,
  Camera,
  Wand2,
  Palette,
  PenTool,
  Video,
  Film,
  Headphones,
  Box,
  FileText,
  Code,
  Smartphone,
  Gamepad2,
  ChevronDown,
  Sparkles,
} from "lucide-react-native";
import { getProjects, type Project } from "@/lib/api/projects";
import { ProjectCard } from "@/components/ui/ProjectCard";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { SkeletonGridCard } from "@/components/ui/Skeleton";
import { useState, useCallback, useMemo, useRef } from "react";

const LIMIT = 12;
const { width: SCREEN_WIDTH } = Dimensions.get("window");

const CATEGORIES = [
  { value: "all", label: "전체보기", Icon: Layers },
  { value: "photo", label: "포토", Icon: Camera },
  { value: "animation", label: "웹툰/애니", Icon: Wand2 },
  { value: "graphic", label: "그래픽", Icon: Palette },
  { value: "design", label: "디자인", Icon: PenTool },
  { value: "video", label: "영상", Icon: Video },
  { value: "cinema", label: "영화·드라마", Icon: Film },
  { value: "audio", label: "오디오", Icon: Headphones },
  { value: "3d", label: "3D", Icon: Box },
  { value: "text", label: "텍스트", Icon: FileText },
  { value: "code", label: "코드", Icon: Code },
  { value: "webapp", label: "웹/앱", Icon: Smartphone },
  { value: "game", label: "게임", Icon: Gamepad2 },
] as const;

const SORT_OPTIONS = [
  { value: "latest", label: "최신순" },
  { value: "popular", label: "인기순" },
  { value: "likes", label: "좋아요순" },
  { value: "views", label: "조회순" },
] as const;

export default function HomeScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState<string>("latest");
  const [showSort, setShowSort] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const searchInputRef = useRef<TextInput>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["projects", category, sort, search],
    queryFn: ({ pageParam = 1 }) =>
      getProjects({
        page: pageParam,
        limit: LIMIT,
        sort,
        genre: category === "all" ? undefined : category,
        search: search || undefined,
      }),
    getNextPageParam: (lastPage, allPages) =>
      lastPage.hasMore ? allPages.length + 1 : undefined,
    initialPageParam: 1,
  });

  const projects: Project[] =
    data?.pages.flatMap((page) => page.projects) ?? [];

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const sortLabel = useMemo(
    () => SORT_OPTIONS.find((s) => s.value === sort)?.label || "최신순",
    [sort]
  );

  const handleSearch = useCallback(() => {
    const trimmed = searchInput.trim();
    setSearch(trimmed);
    if (trimmed) setShowSearch(false);
  }, [searchInput]);

  const clearSearch = useCallback(() => {
    setSearch("");
    setSearchInput("");
  }, []);

  const renderItem = useCallback(
    ({ item, index }: { item: Project; index: number }) => (
      <ProjectCard project={item} index={index} />
    ),
    []
  );

  const keyExtractor = useCallback((item: Project) => item.project_id, []);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header - 56px */}
      <View
        className="flex-row items-center justify-between px-4"
        style={{ height: 56 }}
      >
        <View className="flex-row items-center gap-2">
          <View className="w-7 h-7 rounded-lg bg-green-600 items-center justify-center">
            <Text className="text-white font-black text-xs">V</Text>
          </View>
          <Text className="text-lg font-black text-gray-900">Vibefolio</Text>
        </View>
        <View className="flex-row items-center gap-1.5">
          <Pressable
            onPress={() => {
              setShowSearch(true);
              setTimeout(() => searchInputRef.current?.focus(), 100);
            }}
            className="w-9 h-9 rounded-full items-center justify-center"
          >
            <Search size={20} color="#6b7280" />
          </Pressable>
          <Pressable
            onPress={() => router.push("/notifications")}
            className="w-9 h-9 rounded-full items-center justify-center"
          >
            <Bell size={20} color="#6b7280" />
          </Pressable>
          <Pressable
            onPress={() => router.push("/project/quick-post")}
            className="w-9 h-9 rounded-full items-center justify-center"
            style={{ backgroundColor: "#16A34A" }}
          >
            <Plus size={18} color="#ffffff" />
          </Pressable>
        </View>
      </View>

      {/* Search overlay */}
      <Modal visible={showSearch} animationType="fade" transparent>
        <View className="flex-1 bg-white">
          <SafeAreaView edges={["top"]}>
            <View className="flex-row items-center px-4 py-2 gap-2">
              <View className="flex-1 flex-row items-center bg-slate-50 rounded-xl px-3.5 h-11">
                <Search size={16} color="#94a3b8" />
                <TextInput
                  ref={searchInputRef}
                  className="flex-1 ml-2 text-sm text-gray-900"
                  placeholder="프로젝트 검색..."
                  placeholderTextColor="#94a3b8"
                  value={searchInput}
                  onChangeText={setSearchInput}
                  onSubmitEditing={handleSearch}
                  returnKeyType="search"
                  autoFocus
                />
                {searchInput.length > 0 && (
                  <Pressable onPress={() => setSearchInput("")}>
                    <X size={16} color="#94a3b8" />
                  </Pressable>
                )}
              </View>
              <Pressable
                onPress={() => {
                  setShowSearch(false);
                  if (!search) setSearchInput("");
                }}
              >
                <Text className="text-sm font-semibold text-gray-500">취소</Text>
              </Pressable>
            </View>
          </SafeAreaView>
        </View>
      </Modal>

      {/* Active search indicator */}
      {search && (
        <View className="flex-row items-center px-4 py-2 bg-green-50 mx-4 rounded-lg mb-2">
          <Text className="text-xs text-green-700 flex-1">
            "<Text className="font-bold">{search}</Text>" 검색 결과
          </Text>
          <Pressable onPress={clearSearch}>
            <Text className="text-xs text-red-400 font-semibold">취소</Text>
          </Pressable>
        </View>
      )}

      {/* Category Filter Bar */}
      <View
        className="border-b border-gray-100"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.03,
          shadowRadius: 3,
          elevation: 1,
        }}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 8, gap: 4 }}
        >
          {CATEGORIES.map((cat) => {
            const isActive = category === cat.value;
            const IconComp = cat.Icon;
            return (
              <Pressable
                key={cat.value}
                onPress={() => setCategory(cat.value)}
                className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-full"
                style={{
                  backgroundColor: isActive ? "#f0fdf4" : "transparent",
                  borderWidth: isActive ? 1 : 0,
                  borderColor: isActive ? "#bbf7d0" : "transparent",
                }}
              >
                <IconComp
                  size={14}
                  color={isActive ? "#16A34A" : "#94a3b8"}
                />
                <Text
                  className="text-xs"
                  style={{
                    color: isActive ? "#15803d" : "#64748b",
                    fontWeight: isActive ? "700" : "500",
                  }}
                >
                  {cat.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Sort row */}
        <View className="flex-row items-center justify-between px-4 pb-2">
          <View className="flex-1" />
          <Pressable
            onPress={() => setShowSort(!showSort)}
            className="flex-row items-center gap-1 px-2.5 py-1 rounded-lg"
            style={{
              backgroundColor: showSort ? "#f0fdf4" : "#f8fafc",
              borderWidth: 1,
              borderColor: showSort ? "#bbf7d0" : "#f1f5f9",
            }}
          >
            <Text
              className="text-[11px]"
              style={{
                color: showSort ? "#16A34A" : "#6b7280",
                fontWeight: "600",
              }}
            >
              {sortLabel}
            </Text>
            <ChevronDown
              size={12}
              color={showSort ? "#16A34A" : "#6b7280"}
            />
          </Pressable>
        </View>

        {/* Sort dropdown */}
        {showSort && (
          <View className="absolute right-3 top-full bg-white rounded-xl z-50 py-1"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.12,
              shadowRadius: 12,
              elevation: 8,
              borderWidth: 1,
              borderColor: "#f1f5f9",
            }}
          >
            {SORT_OPTIONS.map((opt) => (
              <Pressable
                key={opt.value}
                onPress={() => {
                  setSort(opt.value);
                  setShowSort(false);
                }}
                className="px-4 py-2.5"
                style={{
                  backgroundColor: sort === opt.value ? "#f0fdf4" : "transparent",
                }}
              >
                <Text
                  className="text-xs"
                  style={{
                    color: sort === opt.value ? "#16A34A" : "#374151",
                    fontWeight: sort === opt.value ? "600" : "400",
                  }}
                >
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>

      {/* Feed — 2-column grid */}
      {isLoading ? (
        <View
          className="px-3 pt-6"
          style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}
        >
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <View key={i} style={{ width: (SCREEN_WIDTH - 24 - 12) / 2 }}>
              <SkeletonGridCard />
            </View>
          ))}
        </View>
      ) : (
        <FlatList
          data={projects}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          numColumns={2}
          columnWrapperStyle={{
            paddingHorizontal: 12,
            gap: 12,
          }}
          ItemSeparatorComponent={() => <View style={{ height: 20 }} />}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) fetchNextPage();
          }}
          onEndReachedThreshold={0.5}
          removeClippedSubviews
          maxToRenderPerBatch={8}
          windowSize={7}
          initialNumToRender={6}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#16A34A"
              colors={["#16A34A"]}
            />
          }
          ListHeaderComponent={
            !search ? (
              <View className="mb-4">
                {/* Hero 배너 */}
                <LinearGradient
                  colors={["#f0fdf4", "#ffffff"]}
                  style={{
                    paddingHorizontal: 16,
                    paddingTop: 20,
                    paddingBottom: 16,
                  }}
                >
                  <View className="flex-row items-center gap-2 mb-2">
                    <Sparkles size={16} color="#16A34A" />
                    <Text className="text-[11px] font-bold text-green-600 tracking-wide">
                      DISCOVER
                    </Text>
                  </View>
                  <Text className="text-xl font-black text-gray-900 leading-7">
                    크리에이터들의{"\n"}최신 프로젝트
                  </Text>
                  <Text className="text-xs text-gray-400 mt-1.5">
                    다양한 분야의 창작물을 만나보세요
                  </Text>
                </LinearGradient>
              </View>
            ) : null
          }
          ListFooterComponent={
            isFetchingNextPage ? (
              <View className="py-6 items-center">
                <LoadingSpinner message="더 많은 프로젝트 불러오는 중..." />
              </View>
            ) : !hasNextPage && projects.length > 0 ? (
              <View className="py-10 items-center">
                <Text className="text-gray-400 text-sm">
                  모든 프로젝트를 불러왔습니다
                </Text>
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-20 px-8">
              <View
                className="w-16 h-16 rounded-full items-center justify-center mb-4"
                style={{ backgroundColor: "#f0fdf4" }}
              >
                <Search size={28} color="#86efac" />
              </View>
              <Text className="text-gray-900 font-bold text-base mb-1.5">
                프로젝트가 없습니다
              </Text>
              <Text className="text-gray-400 text-sm text-center leading-5">
                {search
                  ? `"${search}"에 대한 결과를 찾을 수 없습니다`
                  : "가장 먼저 프로젝트를 등록해보세요!"}
              </Text>
              {!search && (
                <Pressable
                  onPress={() => router.push("/project/quick-post")}
                  className="mt-4 px-5 py-2.5 rounded-full"
                  style={{ backgroundColor: "#16A34A" }}
                >
                  <Text className="text-white text-sm font-bold">
                    프로젝트 올리기
                  </Text>
                </Pressable>
              )}
            </View>
          }
          contentContainerStyle={{ paddingTop: 8, paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}
