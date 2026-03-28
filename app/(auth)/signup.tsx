import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { Mail, Lock, User, Eye, EyeOff, ChevronLeft } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";

/**
 * Supanova Premium Signup
 * - 글래스 카드
 * - 포커스 상태 프리미엄 보더
 * - 그라데이션 CTA
 */
export default function SignUpScreen() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  const handleSignUp = async () => {
    if (!email.trim() || !password || !displayName.trim()) {
      Alert.alert("오류", "모든 필드를 입력해주세요");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("오류", "비밀번호가 일치하지 않습니다");
      return;
    }
    if (password.length < 6) {
      Alert.alert("오류", "비밀번호는 6자 이상이어야 합니다");
      return;
    }
    setLoading(true);
    try {
      await signUp(email.trim(), password, displayName.trim());
      router.replace("/(tabs)");
    } catch (e: any) {
      Alert.alert("회원가입 실패", e.message || "다시 시도해주세요");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (field: string) => ({
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: focused === field ? "#ffffff" : "#f8fafc",
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 52,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: focused === field ? "#16A34A" : "#e2e8f0",
    ...(focused === field
      ? {
          shadowColor: "#16A34A",
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.1,
          shadowRadius: 10,
        }
      : {}),
  });

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

        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            paddingHorizontal: 24,
            justifyContent: "center",
            flexGrow: 1,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* 로고 + 타이틀 */}
          <Animated.View
            entering={FadeInDown.delay(50).duration(400)}
            style={{ alignItems: "center", marginBottom: 32 }}
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
              회원가입
            </Text>
            <Text style={{ fontSize: 14, color: "#94a3b8", marginTop: 6 }}>
              Vibefolio에서 작품을 공유하세요
            </Text>
          </Animated.View>

          {/* 글래스 카드 — 웹 매칭 */}
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
              {/* 이름 */}
              <View style={inputStyle("name")}>
                <User size={18} color={focused === "name" ? "#16A34A" : "#94a3b8"} />
                <TextInput
                  style={{ flex: 1, marginLeft: 12, fontSize: 15, color: "#0f172a", fontWeight: "500" }}
                  placeholder="이름 (닉네임)"
                  placeholderTextColor="#cbd5e1"
                  value={displayName}
                  onChangeText={setDisplayName}
                  onFocus={() => setFocused("name")}
                  onBlur={() => setFocused(null)}
                />
              </View>

              {/* 이메일 */}
              <View style={inputStyle("email")}>
                <Mail size={18} color={focused === "email" ? "#16A34A" : "#94a3b8"} />
                <TextInput
                  style={{ flex: 1, marginLeft: 12, fontSize: 15, color: "#0f172a", fontWeight: "500" }}
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
              <View style={inputStyle("password")}>
                <Lock size={18} color={focused === "password" ? "#16A34A" : "#94a3b8"} />
                <TextInput
                  style={{ flex: 1, marginLeft: 12, fontSize: 15, color: "#0f172a", fontWeight: "500" }}
                  placeholder="비밀번호 (6자 이상)"
                  placeholderTextColor="#cbd5e1"
                  value={password}
                  onChangeText={setPassword}
                  onFocus={() => setFocused("password")}
                  onBlur={() => setFocused(null)}
                  secureTextEntry={!showPassword}
                />
                <Pressable
                  onPress={() => setShowPassword(!showPassword)}
                  style={{ width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center" }}
                >
                  {showPassword ? (
                    <EyeOff size={18} color="#94a3b8" />
                  ) : (
                    <Eye size={18} color="#94a3b8" />
                  )}
                </Pressable>
              </View>

              {/* 비밀번호 확인 */}
              <View style={{ ...inputStyle("confirm"), marginBottom: 20 }}>
                <Lock size={18} color={focused === "confirm" ? "#16A34A" : "#94a3b8"} />
                <TextInput
                  style={{ flex: 1, marginLeft: 12, fontSize: 15, color: "#0f172a", fontWeight: "500" }}
                  placeholder="비밀번호 확인"
                  placeholderTextColor="#cbd5e1"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  onFocus={() => setFocused("confirm")}
                  onBlur={() => setFocused(null)}
                  secureTextEntry={!showPassword}
                />
              </View>

              {/* 회원가입 버튼 — Supanova 프리미엄 pill */}
              <Pressable
                onPress={handleSignUp}
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
                    {loading ? "생성 중..." : "회원가입"}
                  </Text>
                </LinearGradient>
              </Pressable>
            </View>
          </Animated.View>

          {/* 로그인 링크 */}
          <Animated.View
            entering={FadeInDown.delay(250).duration(400)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              marginTop: 24,
              marginBottom: 40,
            }}
          >
            <Text style={{ color: "#94a3b8", fontSize: 14 }}>
              이미 계정이 있으신가요?{" "}
            </Text>
            <Pressable onPress={() => router.push("/(auth)/login")}>
              <Text style={{ color: "#16A34A", fontWeight: "800", fontSize: 14 }}>
                로그인
              </Text>
            </Pressable>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
