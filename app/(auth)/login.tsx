import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { Mail, Lock, Eye, EyeOff, ChevronLeft } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";

/**
 * Supanova Premium Login
 * - 글래스 카드 배경
 * - 그라데이션 CTA 버튼
 * - 프리미엄 입력 필드
 */
export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert("오류", "이메일과 비밀번호를 입력해주세요");
      return;
    }
    setLoading(true);
    try {
      await signIn(email.trim(), password);
      router.replace("/(tabs)");
    } catch (e: any) {
      Alert.alert(
        "로그인 실패",
        e.message || "이메일과 비밀번호를 확인해주세요"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
    >
      <SafeAreaView className="flex-1">
        {/* 뒤로 가기 */}
        <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
          <Pressable
            onPress={() => router.back()}
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: "#f8fafc",
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1,
              borderColor: "#f1f5f9",
            }}
          >
            <ChevronLeft size={20} color="#64748b" />
          </Pressable>
        </View>

        <View className="flex-1 px-6 justify-center" style={{ marginTop: -40 }}>
          {/* 로고 + 타이틀 */}
          <Animated.View
            entering={FadeInDown.delay(50).duration(400)}
            style={{ alignItems: "center", marginBottom: 40 }}
          >
            <View
              style={{
                width: 60,
                height: 60,
                borderRadius: 20,
                overflow: "hidden",
                marginBottom: 16,
                shadowColor: "#16A34A",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 16,
                elevation: 8,
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
                <Text style={{ color: "#ffffff", fontSize: 28, fontWeight: "900" }}>
                  V
                </Text>
              </LinearGradient>
            </View>
            <Text style={{ fontSize: 26, fontWeight: "900", color: "#0f172a", letterSpacing: -0.5 }}>
              로그인
            </Text>
            <Text style={{ fontSize: 14, color: "#94a3b8", marginTop: 6 }}>
              크리에이터 포트폴리오 플랫폼
            </Text>
          </Animated.View>

          {/* 글래스 카드 컨테이너 — 웹 매칭 */}
          <Animated.View entering={FadeInDown.delay(150).duration(400)}>
            <View
              style={{
                backgroundColor: "rgba(255,255,255,0.8)",
                borderRadius: 28,
                padding: 22,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.6)",
                shadowColor: "#0f172a",
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.06,
                shadowRadius: 40,
                elevation: 4,
              }}
            >
              {/* 이메일 */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: focused === "email" ? "#ffffff" : "#f8fafc",
                  borderRadius: 16,
                  paddingHorizontal: 16,
                  height: 52,
                  marginBottom: 12,
                  borderWidth: 1.5,
                  borderColor: focused === "email" ? "#16A34A" : "#e2e8f0",
                  ...(focused === "email"
                    ? {
                        shadowColor: "#16A34A",
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: 0.1,
                        shadowRadius: 10,
                      }
                    : {}),
                }}
              >
                <Mail size={18} color={focused === "email" ? "#16A34A" : "#94a3b8"} />
                <TextInput
                  style={{
                    flex: 1,
                    marginLeft: 12,
                    fontSize: 15,
                    color: "#0f172a",
                    fontWeight: "500",
                  }}
                  placeholder="이메일"
                  placeholderTextColor="#cbd5e1"
                  value={email}
                  onChangeText={setEmail}
                  onFocus={() => setFocused("email")}
                  onBlur={() => setFocused(null)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
              </View>

              {/* 비밀번호 */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: focused === "password" ? "#ffffff" : "#f8fafc",
                  borderRadius: 16,
                  paddingHorizontal: 16,
                  height: 52,
                  marginBottom: 12,
                  borderWidth: 1.5,
                  borderColor: focused === "password" ? "#16A34A" : "#e2e8f0",
                  ...(focused === "password"
                    ? {
                        shadowColor: "#16A34A",
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: 0.1,
                        shadowRadius: 10,
                      }
                    : {}),
                }}
              >
                <Lock size={18} color={focused === "password" ? "#16A34A" : "#94a3b8"} />
                <TextInput
                  style={{
                    flex: 1,
                    marginLeft: 12,
                    fontSize: 15,
                    color: "#0f172a",
                    fontWeight: "500",
                  }}
                  placeholder="비밀번호"
                  placeholderTextColor="#cbd5e1"
                  value={password}
                  onChangeText={setPassword}
                  onFocus={() => setFocused("password")}
                  onBlur={() => setFocused(null)}
                  secureTextEntry={!showPassword}
                />
                <Pressable
                  onPress={() => setShowPassword(!showPassword)}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 10,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {showPassword ? (
                    <EyeOff size={18} color="#94a3b8" />
                  ) : (
                    <Eye size={18} color="#94a3b8" />
                  )}
                </Pressable>
              </View>

              {/* 비밀번호 찾기 */}
              <View style={{ alignItems: "flex-end", marginBottom: 16 }}>
                <Pressable onPress={() => router.push("/(auth)/forgot-password")}>
                  <Text style={{ fontSize: 13, color: "#94a3b8", fontWeight: "500" }}>
                    비밀번호를 잊으셨나요?
                  </Text>
                </Pressable>
              </View>

              {/* 로그인 버튼 — Supanova 프리미엄 pill */}
              <Pressable
                onPress={handleLogin}
                disabled={loading}
                style={{
                  height: 52,
                  borderRadius: 999,
                  overflow: "hidden",
                  opacity: loading ? 0.7 : 1,
                  shadowColor: "#16A34A",
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.25,
                  shadowRadius: 16,
                  elevation: 6,
                }}
              >
                <LinearGradient
                  colors={["#22c55e", "#16A34A"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{
                    flex: 1,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ color: "#ffffff", fontWeight: "800", fontSize: 16, letterSpacing: -0.2 }}>
                    {loading ? "로그인 중..." : "로그인"}
                  </Text>
                </LinearGradient>
              </Pressable>
            </View>
          </Animated.View>

          {/* 회원가입 링크 */}
          <Animated.View
            entering={FadeInDown.delay(250).duration(400)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              marginTop: 24,
            }}
          >
            <Text style={{ color: "#94a3b8", fontSize: 14 }}>
              계정이 없으신가요?{" "}
            </Text>
            <Pressable onPress={() => router.push("/(auth)/signup")}>
              <Text style={{ color: "#16A34A", fontWeight: "800", fontSize: 14 }}>
                회원가입
              </Text>
            </Pressable>
          </Animated.View>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
