import { Tabs } from "expo-router";
import { View } from "react-native";
import { Home, Briefcase, User } from "lucide-react-native";

/**
 * Supanova Premium Tab Bar
 * - 미니멀 클린 탭 바
 * - 활성 인디케이터 도트
 * - 프리미엄 그림자
 */
export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#0f172a",
        tabBarInactiveTintColor: "#cbd5e1",
        tabBarStyle: {
          borderTopWidth: 0,
          backgroundColor: "#ffffff",
          height: 64,
          paddingBottom: 8,
          paddingTop: 6,
          shadowColor: "#0f172a",
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.04,
          shadowRadius: 12,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "700",
          letterSpacing: 0.2,
        },
        tabBarIconStyle: {
          marginBottom: -2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "발견하기",
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: "center" }}>
              {focused && (
                <View
                  style={{
                    position: "absolute",
                    top: -8,
                    width: 20,
                    height: 3,
                    borderRadius: 2,
                    backgroundColor: "#16A34A",
                  }}
                />
              )}
              <Home
                size={22}
                color={color}
                strokeWidth={focused ? 2.5 : 1.8}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="recruit"
        options={{
          title: "연결하기",
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: "center" }}>
              {focused && (
                <View
                  style={{
                    position: "absolute",
                    top: -8,
                    width: 20,
                    height: 3,
                    borderRadius: 2,
                    backgroundColor: "#16A34A",
                  }}
                />
              )}
              <Briefcase
                size={22}
                color={color}
                strokeWidth={focused ? 2.5 : 1.8}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "마이",
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: "center" }}>
              {focused && (
                <View
                  style={{
                    position: "absolute",
                    top: -8,
                    width: 20,
                    height: 3,
                    borderRadius: 2,
                    backgroundColor: "#16A34A",
                  }}
                />
              )}
              <User
                size={22}
                color={color}
                strokeWidth={focused ? 2.5 : 1.8}
              />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
