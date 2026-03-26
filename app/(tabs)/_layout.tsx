import { Tabs } from "expo-router";
import { Home, Briefcase, User } from "lucide-react-native";

/**
 * 탭 네비게이터 — 웹의 컬러 시스템 복제
 * - 배경: 순수 화이트 (#ffffff)
 * - 활성 탭: green-600 (#16A34A) — 웹의 primary
 * - 비활성 탭: slate-400 (#94a3b8)
 * - 상단 보더: 웹의 border color (#e2e8f0 → #f1f5f9 for subtlety)
 */
export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#16A34A",
        tabBarInactiveTintColor: "#94a3b8",
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: "#e2e8f0",
          backgroundColor: "#ffffff",
          height: 60,
          paddingBottom: 8,
          paddingTop: 4,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -1 },
          shadowOpacity: 0.03,
          shadowRadius: 4,
          elevation: 4,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "발견하기",
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="recruit"
        options={{
          title: "연결하기",
          tabBarIcon: ({ color, size }) => (
            <Briefcase size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "마이",
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
