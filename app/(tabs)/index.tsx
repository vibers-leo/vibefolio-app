import {
  View,
  Text,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  TextInput,
  Modal,
  useWindowDimensions,
  Image as RNImage,
} from "react-native";
import { useRouter } from "expo-router";
import { useInfiniteQuery } from "@tanstack/react-query";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeIn,
  FadeInDown,
} from "react-native-reanimated";
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
  Sparkles,
} from "lucide-react-native";
import { getProjects, type Project } from "@/lib/api/projects";
import { ProjectCard } from "@/components/ui/ProjectCard";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { SkeletonGridCard } from "@/components/ui/Skeleton";
import { useState, useCallback, useMemo, useRef } from "react";
import { LinearGradient } from "expo-linear-gradient";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const LIMIT = 12;

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
  const { width: screenWidth } = useWindowDimensions();
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
      {/* ━━━ Supanova Header — 웹 매칭 ━━━ */}
      <View
        style={{
          height: 56,
          borderBottomWidth: 1,
          borderBottomColor: "rgba(0,0,0,0.04)",
        }}
      >
        <View
          className="flex-row items-center justify-between px-5"
          style={{ flex: 1 }}
        >
          <View className="flex-row items-center" style={{ gap: 3 }}>
            <RNImage
              source={require("@/assets/vibefolio-logo.png")}
              style={{ width: 120, height: 28 }}
              resizeMode="contain"
            />
          </View>

          <View className="flex-row items-center" style={{ gap: 8 }}>
            {/* 검색 버튼 */}
            <Pressable
              onPress={() => {
                setShowSearch(true);
                setTimeout(() => searchInputRef.current?.focus(), 100);
              }}
              style={{
                width: 38,
                height: 38,
                borderRadius: 999,
                backgroundColor: "#f8fafc",
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 1,
                borderColor: "rgba(0,0,0,0.04)",
              }}
            >
              <Search size={17} color="#64748b" />
            </Pressable>

            {/* 알림 버튼 */}
            <Pressable
              onPress={() => router.push("/notifications")}
              style={{
                width: 38,
                height: 38,
                borderRadius: 999,
                backgroundColor: "#f8fafc",
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 1,
                borderColor: "rgba(0,0,0,0.04)",
              }}
            >
              <Bell size={17} color="#64748b" />
            </Pressable>

            {/* 새 프로젝트 — 프리미엄 그라데이션 pill */}
            <Pressable
              onPress={() => router.push("/project/quick-post")}
              style={{
                width: 38,
                height: 38,
                borderRadius: 999,
                overflow: "hidden",
                shadowColor: "#16A34A",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              <LinearGradient
                colors={["#22c55e", "#16A34A"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Plus size={17} color="#ffffff" strokeWidth={2.5} />
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </View>

      {/* ━━━ Search Overlay — 프리미엄 ━━━ */}
      <Modal visible={showSearch} animationType="fade" transparent>
        <View className="flex-1" style={{ backgroundColor: "rgba(255,255,255,0.98)" }}>
          <SafeAreaView edges={["top"]}>
            <View className="flex-row items-center px-5 py-3" style={{ gap: 10 }}>
              <View
                style={{
                  flex: 1,
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "#f8fafc",
                  borderRadius: 14,
                  paddingHorizontal: 16,
                  height: 48,
                  borderWidth: 1.5,
                  borderColor: "#16A34A",
                  shadowColor: "#16A34A",
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                }}
              >
                <Search size={16} color="#16A34A" />
                <TextInput
                  ref={searchInputRef}
                  style={{
                    flex: 1,
                    marginLeft: 10,
                    fontSize: 15,
                    color: "#0f172a",
                    fontWeight: "500",
                  }}
                  placeholder="프로젝트 검색..."
                  placeholderTextColor="#94a3b8"
                  value={searchInput}
                  onChangeText={setSearchInput}
                  onSubmitEditing={handleSearch}
                  returnKeyType="search"
                  autoFocus
                />
                {searchInput.length > 0 && (
                  <Pressable
                    onPress={() => setSearchInput("")}
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      backgroundColor: "#e2e8f0",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <X size={12} color="#64748b" />
                  </Pressable>
                )}
              </View>
              <Pressable
                onPress={() => {
                  setShowSearch(false);
                  if (!search) setSearchInput("");
                }}
              >
                <Text style={{ fontSize: 15, fontWeight: "600", color: "#64748b" }}>
                  취소
                </Text>
              </Pressable>
            </View>
          </SafeAreaView>
        </View>
      </Modal>

      {/* ━━━ Active search indicator — 프리미엄 ━━━ */}
      {search ? (
        <View
          style={{
            marginHorizontal: 16,
            marginBottom: 8,
            marginTop: 4,
            backgroundColor: "#f0fdf4",
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 10,
            flexDirection: "row",
            alignItems: "center",
            borderWidth: 1,
            borderColor: "#dcfce7",
          }}
        >
          <Search size={14} color="#16A34A" />
          <Text style={{ flex: 1, marginLeft: 8, fontSize: 13, color: "#15803d" }}>
            "<Text style={{ fontWeight: "800" }}>{search}</Text>" 검색 결과
          </Text>
          <Pressable
            onPress={clearSearch}
            style={{
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 8,
              backgroundColor: "#dcfce7",
            }}
          >
            <Text style={{ fontSize: 12, fontWeight: "700", color: "#16A34A" }}>
              취소
            </Text>
          </Pressable>
        </View>
      ) : null}

      {/* ━━━ Category Pills — Supanova 웹 매칭 ━━━ */}
      <View
        style={{
          borderBottomWidth: 1,
          borderBottomColor: "rgba(0,0,0,0.04)",
        }}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingVertical: 10,
            gap: 7,
          }}
        >
          {CATEGORIES.map((cat) => {
            const isActive = category === cat.value;
            const IconComp = cat.Icon;
            return (
              <Pressable
                key={cat.value}
                onPress={() => setCategory(cat.value)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 5,
                  paddingHorizontal: 13,
                  paddingVertical: 7,
                  borderRadius: 999,
                  backgroundColor: isActive ? "#0f172a" : "transparent",
                  borderWidth: 1,
                  borderColor: isActive ? "#0f172a" : "#e2e8f0",
                  // 프리미엄 그림자 (활성 상태)
                  ...(isActive
                    ? {
                        shadowColor: "#0f172a",
                        shadowOffset: { width: 0, height: 3 },
                        shadowOpacity: 0.18,
                        shadowRadius: 8,
                        elevation: 4,
                      }
                    : {}),
                }}
              >
                <IconComp
                  size={13}
                  color={isActive ? "#ffffff" : "#94a3b8"}
                  strokeWidth={isActive ? 2.5 : 1.8}
                />
                <Text
                  style={{
                    fontSize: 12.5,
                    color: isActive ? "#ffffff" : "#64748b",
                    fontWeight: isActive ? "700" : "500",
                    letterSpacing: -0.1,
                  }}
                >
                  {cat.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Sort row — 프리미엄 정렬 */}
        <View className="flex-row items-center justify-end px-4 pb-2.5">
          <Pressable
            onPress={() => setShowSort(!showSort)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 5,
              paddingHorizontal: 12,
              paddingVertical: 7,
              borderRadius: 10,
              backgroundColor: showSort ? "#f0fdf4" : "#fafbfc",
              borderWidth: 1,
              borderColor: showSort ? "#bbf7d0" : "#f1f5f9",
            }}
          >
            <ArrowUpDown
              size={12}
              color={showSort ? "#16A34A" : "#94a3b8"}
            />
            <Text
              style={{
                fontSize: 12,
                color: showSort ? "#16A34A" : "#64748b",
                fontWeight: "700",
              }}
            >
              {sortLabel}
            </Text>
            <ChevronDown
              size={11}
              color={showSort ? "#16A34A" : "#94a3b8"}
            />
          </Pressable>
        </View>

        {/* Sort dropdown — 프리미엄 드롭다운 */}
        {showSort && (
          <View
            className="absolute right-4 bg-white z-50"
            style={{
              top: 60,
              borderRadius: 14,
              paddingVertical: 6,
              shadowColor: "#0f172a",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.12,
              shadowRadius: 20,
              elevation: 12,
              borderWidth: 1,
              borderColor: "#f1f5f9",
              minWidth: 150,
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
                  paddingHorizontal: 18,
                  paddingVertical: 11,
                  borderRadius: 10,
                  marginHorizontal: 5,
                  backgroundColor:
                    sort === opt.value ? "#f0fdf4" : "transparent",
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    color: sort === opt.value ? "#16A34A" : "#475569",
                    fontWeight: sort === opt.value ? "700" : "400",
                  }}
                >
                  {sort === opt.value ? `✓  ${opt.label}` : `    ${opt.label}`}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>

      {/* ━━━ Feed — 2-column Supanova 그리드 ━━━ */}
      {isLoading ? (
        <View
          className="px-3.5 pt-4"
          style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}
        >
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <View key={i} style={{ width: (screenWidth - 28 - 12) / 2 }}>
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
            paddingHorizontal: 14,
            gap: 12,
          }}
          ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
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
              <View className="py-8 items-center">
                <LoadingSpinner message="더 많은 프로젝트 불러오는 중..." />
              </View>
            ) : !hasNextPage && projects.length > 0 ? (
              <View className="py-12 items-center" style={{ gap: 6 }}>
                <View
                  style={{
                    width: 40,
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: "#e2e8f0",
                  }}
                />
                <Text style={{ fontSize: 12, color: "#cbd5e1", fontWeight: "500" }}>
                  모든 프로젝트를 불러왔습니다
                </Text>
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-24 px-10">
              {/* 프리미엄 빈 상태 */}
              <View
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 24,
                  backgroundColor: "#f0fdf4",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 20,
                  borderWidth: 1,
                  borderColor: "#dcfce7",
                }}
              >
                <Sparkles size={36} color="#86efac" />
              </View>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "800",
                  color: "#0f172a",
                  marginBottom: 8,
                }}
              >
                프로젝트가 없습니다
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: "#94a3b8",
                  textAlign: "center",
                  lineHeight: 22,
                }}
              >
                {search
                  ? `"${search}"에 대한 결과를 찾을 수 없습니다`
                  : "가장 먼저 프로젝트를 등록해보세요!"}
              </Text>
              {!search && (
                <Pressable
                  onPress={() => router.push("/project/quick-post")}
                  style={{
                    marginTop: 20,
                    borderRadius: 999,
                    overflow: "hidden",
                  }}
                >
                  <LinearGradient
                    colors={["#22c55e", "#16A34A"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                      paddingHorizontal: 28,
                      paddingVertical: 13,
                      shadowColor: "#16A34A",
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.3,
                      shadowRadius: 12,
                    }}
                  >
                    <Text style={{ color: "#ffffff", fontWeight: "800", fontSize: 14 }}>
                      프로젝트 올리기
                    </Text>
                  </LinearGradient>
                </Pressable>
              )}
            </View>
          }
          contentContainerStyle={{ paddingTop: 4, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}
