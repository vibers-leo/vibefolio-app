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
import { Mail, Lock, User, Eye, EyeOff } from "lucide-react-native";

export default function SignUpScreen() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

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

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 24,
          justifyContent: "center",
          flexGrow: 1,
        }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo */}
        <View className="items-center mb-8">
          <View className="w-14 h-14 rounded-2xl bg-green-600 items-center justify-center mb-3">
            <Text className="text-white font-black text-2xl">V</Text>
          </View>
          <Text className="text-2xl font-black text-slate-900">회원가입</Text>
          <Text className="text-sm text-slate-400 mt-1">
            Vibefolio에서 작품을 공유하세요
          </Text>
        </View>

        {/* Display Name */}
        <View className="flex-row items-center bg-slate-50 rounded-xl border border-slate-200 px-4 h-14 mb-3">
          <User size={20} color="#94a3b8" />
          <TextInput
            className="flex-1 ml-3 text-base text-slate-900"
            placeholder="이름 (닉네임)"
            placeholderTextColor="#94a3b8"
            value={displayName}
            onChangeText={setDisplayName}
          />
        </View>

        {/* Email */}
        <View className="flex-row items-center bg-slate-50 rounded-xl border border-slate-200 px-4 h-14 mb-3">
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

        {/* Password */}
        <View className="flex-row items-center bg-slate-50 rounded-xl border border-slate-200 px-4 h-14 mb-3">
          <Lock size={20} color="#94a3b8" />
          <TextInput
            className="flex-1 ml-3 text-base text-slate-900"
            placeholder="비밀번호 (6자 이상)"
            placeholderTextColor="#94a3b8"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <Pressable onPress={() => setShowPassword(!showPassword)}>
            {showPassword ? (
              <EyeOff size={20} color="#94a3b8" />
            ) : (
              <Eye size={20} color="#94a3b8" />
            )}
          </Pressable>
        </View>

        {/* Confirm Password */}
        <View className="flex-row items-center bg-slate-50 rounded-xl border border-slate-200 px-4 h-14 mb-6">
          <Lock size={20} color="#94a3b8" />
          <TextInput
            className="flex-1 ml-3 text-base text-slate-900"
            placeholder="비밀번호 확인"
            placeholderTextColor="#94a3b8"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showPassword}
          />
        </View>

        {/* Sign Up Button */}
        <Pressable
          onPress={handleSignUp}
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
            {loading ? "생성 중..." : "회원가입"}
          </Text>
        </Pressable>

        {/* Login Link */}
        <View className="flex-row items-center justify-center mt-6 mb-10">
          <Text className="text-slate-400">이미 계정이 있으신가요? </Text>
          <Pressable onPress={() => router.push("/(auth)/login")}>
            <Text className="text-green-600 font-bold">로그인</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
