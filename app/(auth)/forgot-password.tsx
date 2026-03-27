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
import { Mail, CheckCircle } from "lucide-react-native";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

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
      <View className="flex-1 px-6 justify-center">
        {/* Logo */}
        <View className="items-center mb-10">
          <View className="w-14 h-14 rounded-2xl bg-green-600 items-center justify-center mb-3">
            <Text className="text-white font-black text-2xl">V</Text>
          </View>
          <Text className="text-2xl font-black text-slate-900">
            비밀번호 찾기
          </Text>
          <Text className="text-sm text-slate-400 mt-1">
            가입한 이메일로 재설정 링크를 보내드려요
          </Text>
        </View>

        {sent ? (
          /* 전송 완료 상태 */
          <View className="items-center">
            <View className="w-16 h-16 rounded-full bg-green-50 items-center justify-center mb-4">
              <CheckCircle size={32} color="#16A34A" />
            </View>
            <Text className="text-lg font-bold text-slate-900 mb-2">
              이메일을 확인해주세요
            </Text>
            <Text className="text-sm text-slate-400 text-center leading-5 mb-8">
              {email}으로{"\n"}
              비밀번호 재설정 링크를 보냈습니다.{"\n"}
              메일함을 확인해주세요.
            </Text>

            {/* 로그인으로 돌아가기 */}
            <Pressable
              onPress={() => router.replace("/(auth)/login")}
              className="h-14 rounded-full items-center justify-center w-full"
              style={{
                backgroundColor: "#16A34A",
                shadowColor: "#16A34A",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 12,
                elevation: 6,
              }}
            >
              <Text className="text-white font-bold text-base">
                로그인으로 돌아가기
              </Text>
            </Pressable>
          </View>
        ) : (
          /* 이메일 입력 상태 */
          <>
            {/* Email */}
            <View className="flex-row items-center bg-slate-50 rounded-xl border border-slate-200 px-4 h-14 mb-6">
              <Mail size={20} color="#94a3b8" />
              <TextInput
                className="flex-1 ml-3 text-base text-slate-900"
                placeholder="이메일"
                placeholderTextColor="#94a3b8"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>

            {/* 재설정 링크 전송 버튼 */}
            <Pressable
              onPress={handleResetPassword}
              disabled={loading}
              className="h-14 rounded-full items-center justify-center"
              style={{
                backgroundColor: loading ? "#86efac" : "#16A34A",
                shadowColor: "#16A34A",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: loading ? 0 : 0.3,
                shadowRadius: 12,
                elevation: loading ? 0 : 6,
              }}
            >
              <Text className="text-white font-bold text-base">
                {loading ? "전송 중..." : "재설정 링크 보내기"}
              </Text>
            </Pressable>

            {/* 로그인 링크 */}
            <View className="flex-row items-center justify-center mt-6">
              <Text className="text-slate-400">비밀번호가 기억나셨나요? </Text>
              <Pressable onPress={() => router.push("/(auth)/login")}>
                <Text className="text-green-600 font-bold">로그인</Text>
              </Pressable>
            </View>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}
