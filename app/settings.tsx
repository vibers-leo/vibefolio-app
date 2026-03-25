import { View, Text, Pressable, ScrollView, Alert, Switch, Linking } from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Bell,
  Shield,
  FileText,
  HelpCircle,
  ChevronRight,
  LogOut,
  Trash2,
} from "lucide-react-native";
import { useAuth } from "@/lib/auth/AuthContext";
import { BASE_URL } from "@/lib/constants";
import {
  registerForPushNotifications,
  savePushToken,
  removePushToken,
} from "@/lib/notifications";

export default function SettingsScreen() {
  const router = useRouter();
  const { user, userProfile, signOut } = useAuth();
  const [pushEnabled, setPushEnabled] = useState(true);

  const handlePushToggle = async (value: boolean) => {
    setPushEnabled(value);
    if (value) {
      const token = await registerForPushNotifications();
      if (token) await savePushToken(token);
    } else {
      await removePushToken();
    }
  };

  const handleSignOut = () => {
    Alert.alert("로그아웃", "정말 로그아웃 하시겠습니까?", [
      { text: "취소", style: "cancel" },
      { text: "로그아웃", style: "destructive", onPress: signOut },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top"]}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="px-5 pt-3 pb-4">
          <Text className="text-xl font-black text-gray-900">설정</Text>
        </View>

        {/* Account Section */}
        {user && (
          <View
            className="mx-4 mb-4 bg-white rounded-2xl p-4 overflow-hidden"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.04,
              shadowRadius: 6,
              elevation: 2,
            }}
          >
            <Text className="text-xs font-bold text-gray-400 mb-3 px-1">
              계정 정보
            </Text>
            <View className="flex-row items-center">
              <Image
                source={{
                  uri:
                    userProfile?.avatar_url ||
                    `https://api.dicebear.com/7.x/initials/png?seed=${userProfile?.display_name || "U"}`,
                }}
                className="w-12 h-12 rounded-full bg-slate-200"
                contentFit="cover"
              />
              <View className="ml-3 flex-1">
                <Text className="text-sm font-bold text-gray-900">
                  {userProfile?.display_name || "User"}
                </Text>
                <Text className="text-xs text-gray-400">
                  {userProfile?.email || user.email}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Notification Settings */}
        <View
          className="mx-4 mb-4 bg-white rounded-2xl overflow-hidden"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.04,
            shadowRadius: 6,
            elevation: 2,
          }}
        >
          <Text className="text-xs font-bold text-gray-400 pt-4 px-4 mb-2">
            알림
          </Text>
          <View className="flex-row items-center px-4 py-3.5">
            <Bell size={18} color="#16A34A" />
            <Text className="flex-1 text-sm font-medium text-gray-700 ml-3">
              푸시 알림
            </Text>
            <Switch
              value={pushEnabled}
              onValueChange={handlePushToggle}
              trackColor={{ false: "#e2e8f0", true: "#bbf7d0" }}
              thumbColor={pushEnabled ? "#16A34A" : "#f4f4f5"}
            />
          </View>
        </View>

        {/* Info Section */}
        <View
          className="mx-4 mb-4 bg-white rounded-2xl overflow-hidden"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.04,
            shadowRadius: 6,
            elevation: 2,
          }}
        >
          <Text className="text-xs font-bold text-gray-400 pt-4 px-4 mb-2">
            정보
          </Text>
          <SettingsItem
            icon={<Shield size={18} color="#64748b" />}
            label="개인정보 처리방침"
            onPress={() =>
              Linking.openURL(`${BASE_URL}/policy/privacy`)
            }
          />
          <SettingsItem
            icon={<FileText size={18} color="#64748b" />}
            label="이용약관"
            onPress={() =>
              Linking.openURL(`${BASE_URL}/policy/terms`)
            }
          />
          <SettingsItem
            icon={<HelpCircle size={18} color="#64748b" />}
            label="고객센터"
            onPress={() =>
              Linking.openURL(`mailto:duscontactus@gmail.com`)
            }
            isLast
          />
        </View>

        {/* App Info */}
        <View className="mx-4 mb-4 items-center py-4">
          <Text className="text-xs text-gray-300">Vibefolio v1.0.0</Text>
        </View>

        {/* Sign Out */}
        {user && (
          <Pressable
            onPress={handleSignOut}
            className="mx-4 bg-white rounded-2xl px-4 py-4 flex-row items-center"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.04,
              shadowRadius: 6,
              elevation: 2,
            }}
          >
            <LogOut size={18} color="#ef4444" />
            <Text className="text-red-500 font-semibold ml-3 text-sm">
              로그아웃
            </Text>
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function SettingsItem({
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
      className="flex-row items-center px-4 py-3.5"
      style={
        !isLast
          ? { borderBottomWidth: 1, borderBottomColor: "#f8fafc" }
          : undefined
      }
    >
      {icon}
      <Text className="flex-1 text-sm font-medium text-gray-700 ml-3">
        {label}
      </Text>
      <ChevronRight size={16} color="#cbd5e1" />
    </Pressable>
  );
}
