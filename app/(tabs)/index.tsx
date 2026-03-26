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
  ArrowUpDown,
} from "lucide-react-native";
import { getProjects, type Project } from "@/lib/api/projects";
import { ProjectCard } from "@/components/ui/ProjectCard";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { SkeletonGridCard } from "@/components/ui/Skeleton";
import { useState, useCallback, useMemo, useRef } from "react";

const LIMIT = 12;
const { width: SCREEN_WIDTH } = Dimensions.get("window");

/**
 * 카테고리 목록 — 웹 StickyMenu의 categories 배열과 동일
 * (관심사 탭은 모바일에서 제외 — 로그인 필수 기능)
 */
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
      {/* ━━━ Header — 웹 Header.tsx 복제 ━━━
          좌: 로고 (녹색 V 박스 + "Vibefolio" 볼드)
          우: 검색, 알림, + 버튼(녹색)
      */}
      <View
        className="flex-row items-center justify-between px-4"
        style={{
          height: 56,
          borderBottomWidth: 1,
          borderBottomColor: "#f1f5f9",
        }}
      >
        <View className="flex-row items-center" style={{ gap: 8 }}>
          <View
            className="items-center justify-center"
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              backgroundColor: "#16A34A",
            }}
          >
            <Text className="text-white font-black" style={{ fontSize: 13 }}>V</Text>
          </View>
          <Text className="font-black text-gray-900" style={{ fontSize: 18 }}>
            Vibefolio
          </Text>
        </View>
        <View className="flex-row items-center" style={{ gap: 4 }}>
          <Pressable
            onPress={() => {
              setShowSearch(true);
              setTimeout(() => searchInputRef.current?.focus(), 100);
            }}
            className="items-center justify-center"
            style={{ width: 36, height: 36, borderRadius: 18 }}
          >
            <Search size={20} color="#6b7280" />
          </Pressable>
          <Pressable
            onPress={() => router.push("/notifications")}
            className="items-center justify-center"
            style={{ width: 36, height: 36, borderRadius: 18 }}
          >
            <Bell size={20} color="#6b7280" />
          </Pressable>
          <Pressable
            onPress={() => router.push("/project/quick-post")}
            className="items-center justify-center"
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: "#16A34A",
            }}
          >
            <Plus size={18} color="#ffffff" />
          </Pressable>
        </View>
      </View>

      {/* ━━━ Search overlay ━━━ */}
      <Modal visible={showSearch} animationType="fade" transparent>
        <View className="flex-1 bg-white">
          <SafeAreaView edges={["top"]}>
            <View className="flex-row items-center px-4 py-2" style={{ gap: 8 }}>
              <View
                className="flex-1 flex-row items-center"
                style={{
                  backgroundColor: "#f8fafc",
                  borderRadius: 12,
                  paddingHorizontal: 14,
                  height: 44,
                }}
              >
                <Search size={16} color="#94a3b8" />
                <TextInput
                  ref={searchInputRef}
                  className="flex-1 text-gray-900"
                  style={{ marginLeft: 8, fontSize: 14 }}
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
                <Text className="font-semibold text-gray-500" style={{ fontSize: 14 }}>
                  취소
                </Text>
              </Pressable>
            </View>
          </SafeAreaView>
        </View>
      </Modal>

      {/* ━━━ Active search indicator ━━━ */}
      {search ? (
        <View
          className="flex-row items-center mx-4 mb-2"
          style={{
            backgroundColor: "#f0fdf4",
            borderRadius: 10,
            paddingHorizontal: 14,
            paddingVertical: 8,
          }}
        >
          <Text className="flex-1 text-green-700" style={{ fontSize: 12 }}>
            "<Text className="font-bold">{search}</Text>" 검색 결과
          </Text>
          <Pressable onPress={clearSearch}>
            <Text className="text-red-400 font-semibold" style={{ fontSize: 12 }}>
              취소
            </Text>
          </Pressable>
        </View>
      ) : null}

      {/* ━━━ Category Filter — 웹 StickyMenu 카테고리 바 복제 ━━━
          - 활성: bg-green-50, border-green-200, 아이콘+텍스트 green
          - 비활성: transparent, 아이콘 slate-400, 텍스트 slate-600
      */}
      <View
        style={{
          borderBottomWidth: 1,
          borderBottomColor: "#f1f5f9",
        }}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 12,
            paddingVertical: 10,
            gap: 6,
          }}
        >
          {CATEGORIES.map((cat) => {
            const isActive = category === cat.value;
            const IconComp = cat.Icon;
            return (
              <Pressable
                key={cat.value}
                onPress={() => setCategory(cat.value)}
                className="flex-row items-center"
                style={{
                  gap: 5,
                  paddingHorizontal: 12,
                  paddingVertical: 7,
                  borderRadius: 999,
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
                  style={{
                    fontSize: 13,
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

        {/* Sort row — 웹 StickyMenu 정렬 드롭다운 복제 */}
        <View className="flex-row items-center justify-end px-4 pb-2">
          <Pressable
            onPress={() => setShowSort(!showSort)}
            className="flex-row items-center"
            style={{
              gap: 5,
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderRadius: 8,
              backgroundColor: showSort ? "#f0fdf4" : "#f8fafc",
              borderWidth: 1,
              borderColor: showSort ? "#bbf7d0" : "#f1f5f9",
            }}
          >
            <ArrowUpDown
              size={12}
              color={showSort ? "#16A34A" : "#6b7280"}
            />
            <Text
              style={{
                fontSize: 12,
                color: showSort ? "#16A34A" : "#6b7280",
                fontWeight: "700",
              }}
            >
              {sortLabel}
            </Text>
            <ChevronDown
              size={11}
              color={showSort ? "#16A34A" : "#6b7280"}
            />
          </Pressable>
        </View>

        {/* Sort dropdown — 웹과 동일한 드롭다운 */}
        {showSort && (
          <View
            className="absolute right-3 bg-white z-50"
            style={{
              top: 56,
              borderRadius: 12,
              paddingVertical: 4,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.12,
              shadowRadius: 12,
              elevation: 8,
              borderWidth: 1,
              borderColor: "#f1f5f9",
              minWidth: 140,
            }}
          >
            {SORT_OPTIONS.map((opt) => (
              <Pressable
                key={opt.value}
                onPress={() => {
                  setSort(opt.value);
                  setShowSort(false);
                }}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderRadius: 8,
                  marginHorizontal: 4,
                  backgroundColor: sort === opt.value ? "#f0fdf4" : "transparent",
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
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

      {/* ━━━ Feed — 2-column grid, 웹 grid gap-y-12 gap-x-6 복제 ━━━ */}
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
          ItemSeparatorComponent={() => <View style={{ height: 24 }} />}
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
          ListHeaderComponent={<View style={{ height: 12 }} />}
          ListFooterComponent={
            isFetchingNextPage ? (
              <View className="py-6 items-center">
                <LoadingSpinner message="더 많은 프로젝트 불러오는 중..." />
              </View>
            ) : !hasNextPage && projects.length > 0 ? (
              <View className="py-10 items-center">
                <Text className="text-gray-400" style={{ fontSize: 13 }}>
                  모든 프로젝트를 불러왔습니다
                </Text>
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-20 px-8">
              <View
                className="items-center justify-center mb-4"
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  backgroundColor: "#f0fdf4",
                }}
              >
                <Search size={28} color="#86efac" />
              </View>
              <Text className="text-gray-900 font-bold mb-1.5" style={{ fontSize: 16 }}>
                프로젝트가 없습니다
              </Text>
              <Text
                className="text-gray-400 text-center"
                style={{ fontSize: 14, lineHeight: 20 }}
              >
                {search
                  ? `"${search}"에 대한 결과를 찾을 수 없습니다`
                  : "가장 먼저 프로젝트를 등록해보세요!"}
              </Text>
              {!search && (
                <Pressable
                  onPress={() => router.push("/project/quick-post")}
                  className="mt-4"
                  style={{
                    paddingHorizontal: 20,
                    paddingVertical: 10,
                    borderRadius: 999,
                    backgroundColor: "#16A34A",
                  }}
                >
                  <Text className="text-white font-bold" style={{ fontSize: 14 }}>
                    프로젝트 올리기
                  </Text>
                </Pressable>
              )}
            </View>
          }
          contentContainerStyle={{ paddingTop: 4, paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}
