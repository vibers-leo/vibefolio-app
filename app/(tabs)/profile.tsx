import { View, Text, Pressable, ScrollView, Alert } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  LogOut,
  Settings,
  ChevronRight,
  Bookmark,
  FolderOpen,
  Star,
  Bell,
  Pencil,
} from "lucide-react-native";
import { useAuth } from "@/lib/auth/AuthContext";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export default function ProfileScreen() {
  const router = useRouter();
  const { user, loading, signOut } = useAuth();

  if (loading) return <LoadingSpinner message="불러오는 중..." />;

  if (!user) {
    return (
      <SafeAreaView
        className="flex-1 bg-white items-center justify-center px-6"
        edges={["top"]}
      >
        <View className="w-20 h-20 rounded-full bg-green-50 items-center justify-center mb-4">
          <Text className="text-3xl">{"👋"}</Text>
        </View>
        <Text className="text-xl font-black text-slate-900 mb-1">
          로그인이 필요합니다
        </Text>
        <Text className="text-sm text-slate-400 mb-8 text-center">
          Vibefolio에서 프로젝트를 공유하고{"\n"}다른 크리에이터를 만나보세요
        </Text>
        <Pressable
          onPress={() => router.push("/(auth)/login")}
          className="px-10 py-3.5 rounded-full"
          style={{ backgroundColor: "#16A34A" }}
        >
          <Text className="text-white font-bold text-base">로그인</Text>
        </Pressable>
        <Pressable
          onPress={() => router.push("/(auth)/signup")}
          className="mt-3"
        >
          <Text className="text-green-600 font-semibold text-sm">
            계정이 없으신가요? 회원가입
          </Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const handleSignOut = () => {
    Alert.alert("로그아웃", "정말 로그아웃 하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "로그아웃",
        style: "destructive",
        onPress: signOut,
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top"]}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header Card */}
        <View
          className="mx-4 mt-3 bg-white rounded-2xl p-5 overflow-hidden"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.06,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          {/* Green accent bar */}
          <View
            className="absolute top-0 left-0 right-0 h-1"
            style={{ backgroundColor: "#16A34A" }}
          />

          <View className="flex-row items-center">
            <Image
              source={{
                uri:
                  user?.avatar_url ||
                  `https://api.dicebear.com/7.x/initials/png?seed=${user?.display_name || "U"}`,
              }}
              className="w-16 h-16 rounded-full bg-slate-200"
              contentFit="cover"
              style={{
                borderWidth: 2,
                borderColor: "#dcfce7",
              }}
            />
            <View className="ml-4 flex-1">
              <Text className="text-lg font-black text-slate-900">
                {user?.display_name || "User"}
              </Text>
              <Text className="text-xs text-slate-400">
                {user?.email}
              </Text>
              {user?.bio && (
                <Text
                  className="text-xs text-slate-500 mt-1"
                  numberOfLines={2}
                >
                  {user.bio}
                </Text>
              )}
            </View>
            <Pressable
              onPress={() => router.push("/profile-edit")}
              className="w-8 h-8 rounded-full items-center justify-center bg-slate-50"
              style={{ borderWidth: 1, borderColor: "#e2e8f0" }}
            >
              <Pencil size={14} color="#64748b" />
            </Pressable>
          </View>

          {/* Points */}
          <View className="mt-4 flex-row items-center bg-green-50 rounded-xl px-4 py-3">
            <Star size={16} color="#16A34A" fill="#16A34A" />
            <Text className="text-sm font-bold text-green-700 ml-2">
              {user?.points || 0}P
            </Text>
            <View className="flex-1" />
            <Text className="text-[10px] text-green-600">활동 포인트</Text>
          </View>
        </View>

        {/* Menu */}
        <View
          className="mx-4 mt-4 bg-white rounded-2xl overflow-hidden"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.04,
            shadowRadius: 6,
            elevation: 2,
          }}
        >
          <MenuItem
            icon={<FolderOpen size={20} color="#16A34A" />}
            label="내 프로젝트"
            onPress={() => {
              if (user) router.push(`/user/${user.id}`);
            }}
          />
          <MenuItem
            icon={<Bookmark size={20} color="#16A34A" />}
            label="북마크"
            onPress={() => router.push("/bookmarks")}
          />
          <MenuItem
            icon={<Bell size={20} color="#16A34A" />}
            label="알림"
            onPress={() => router.push("/notifications")}
          />
          <MenuItem
            icon={<Settings size={20} color="#16A34A" />}
            label="설정"
            onPress={() => router.push("/settings")}
            isLast
          />
        </View>

        {/* Sign Out */}
        <Pressable
          onPress={handleSignOut}
          className="mx-4 mt-4 bg-white rounded-2xl px-4 py-4 flex-row items-center"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.04,
            shadowRadius: 6,
            elevation: 2,
          }}
        >
          <LogOut size={20} color="#ef4444" />
          <Text className="text-red-500 font-semibold ml-3 text-sm">
            로그아웃
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function MenuItem({
  icon,
  label,
  onPress,
  isLast,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  isLast?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center px-4 py-4"
      style={
        !isLast
          ? { borderBottomWidth: 1, borderBottomColor: "#f8fafc" }
          : undefined
      }
    >
      {icon}
      <Text className="flex-1 text-sm font-medium text-slate-700 ml-3">
        {label}
      </Text>
      <ChevronRight size={16} color="#cbd5e1" />
    </Pressable>
  );
}
