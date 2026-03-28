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
import { Mail, CheckCircle, ChevronLeft } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";

/**
 * Supanova Premium Forgot Password
 */
export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [focused, setFocused] = useState(false);

  const handleResetPassword = async () => {
    if (!email.trim()) {
      Alert.alert("오류", "이메일을 입력해주세요");
      return;
    }
    setLoading(true);
    try {
      await resetPassword(email.trim());
      setSent(true);
    } catch (e: any) {
      Alert.alert(
        "전송 실패",
        e.message || "이메일 전송에 실패했습니다. 다시 시도해주세요"
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
          {/* 로고 */}
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
              비밀번호 찾기
            </Text>
            <Text style={{ fontSize: 14, color: "#94a3b8", marginTop: 6, textAlign: "center" }}>
              가입한 이메일로 재설정 링크를 보내드려요
            </Text>
          </Animated.View>

          {sent ? (
            /* ━━━ 전송 완료 — 프리미엄 성공 상태 ━━━ */
            <Animated.View entering={FadeInDown.duration(400)}>
              <View
                style={{
                  backgroundColor: "#fafbfc",
                  borderRadius: 24,
                  padding: 32,
                  borderWidth: 1,
                  borderColor: "#f1f5f9",
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 20,
                    backgroundColor: "#f0fdf4",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 20,
                    borderWidth: 1,
                    borderColor: "#dcfce7",
                  }}
                >
                  <CheckCircle size={32} color="#16A34A" />
                </View>
                <Text style={{ fontSize: 18, fontWeight: "800", color: "#0f172a", marginBottom: 8 }}>
                  이메일을 확인해주세요
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: "#94a3b8",
                    textAlign: "center",
                    lineHeight: 22,
                    marginBottom: 28,
                  }}
                >
                  {email}으로{"\n"}
                  비밀번호 재설정 링크를 보냈습니다.{"\n"}
                  메일함을 확인해주세요.
                </Text>

                <Pressable
                  onPress={() => router.replace("/(auth)/login")}
                  style={{
                    height: 52,
                    borderRadius: 14,
                    overflow: "hidden",
                    width: "100%",
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
                    <Text style={{ color: "#ffffff", fontWeight: "800", fontSize: 16 }}>
                      로그인으로 돌아가기
                    </Text>
                  </LinearGradient>
                </Pressable>
              </View>
            </Animated.View>
          ) : (
            /* ━━━ 이메일 입력 ━━━ */
            <Animated.View entering={FadeInDown.delay(150).duration(400)}>
              <View
                style={{
                  backgroundColor: "#fafbfc",
                  borderRadius: 24,
                  padding: 20,
                  borderWidth: 1,
                  borderColor: "#f1f5f9",
                  shadowColor: "#0f172a",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.04,
                  shadowRadius: 16,
                  elevation: 2,
                }}
              >
                {/* 이메일 */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: "#ffffff",
                    borderRadius: 14,
                    paddingHorizontal: 16,
                    height: 52,
                    marginBottom: 20,
                    borderWidth: 1.5,
                    borderColor: focused ? "#16A34A" : "#f1f5f9",
                    ...(focused
                      ? {
                          shadowColor: "#16A34A",
                          shadowOffset: { width: 0, height: 0 },
                          shadowOpacity: 0.08,
                          shadowRadius: 8,
                        }
                      : {}),
                  }}
                >
                  <Mail size={18} color={focused ? "#16A34A" : "#94a3b8"} />
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
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                  />
                </View>

                {/* 재설정 버튼 */}
                <Pressable
                  onPress={handleResetPassword}
                  disabled={loading}
                  style={{
                    height: 52,
                    borderRadius: 14,
                    overflow: "hidden",
                    opacity: loading ? 0.7 : 1,
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
                    <Text style={{ color: "#ffffff", fontWeight: "800", fontSize: 16 }}>
                      {loading ? "전송 중..." : "재설정 링크 보내기"}
                    </Text>
                  </LinearGradient>
                </Pressable>
              </View>

              {/* 로그인 링크 */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: 24,
                }}
              >
                <Text style={{ color: "#94a3b8", fontSize: 14 }}>
                  비밀번호가 기억나셨나요?{" "}
                </Text>
                <Pressable onPress={() => router.push("/(auth)/login")}>
                  <Text style={{ color: "#16A34A", fontWeight: "800", fontSize: 14 }}>
                    로그인
                  </Text>
                </Pressable>
              </View>
            </Animated.View>
          )}
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
