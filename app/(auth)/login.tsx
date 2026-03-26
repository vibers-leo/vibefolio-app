import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Mail, Lock, Eye, EyeOff } from "lucide-react-native";
import * as WebBrowser from "expo-web-browser";
import { makeRedirectUri } from "expo-auth-session";

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert("오류", "이메일과 비밀번호를 입력해주세요");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) throw error;
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

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      const redirectTo = makeRedirectUri({ path: "auth/callback" });
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
          skipBrowserRedirect: true,
        },
      });
      if (error) throw error;
      if (data.url) {
        const result = await WebBrowser.openAuthSessionAsync(
          data.url,
          redirectTo
        );
        if (result.type === "success" && result.url) {
          // Extract tokens from URL fragment
          const url = new URL(result.url);
          const params = new URLSearchParams(
            url.hash ? url.hash.substring(1) : url.search.substring(1)
          );
          const accessToken = params.get("access_token");
          const refreshToken = params.get("refresh_token");

          if (accessToken && refreshToken) {
            await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            router.replace("/(tabs)");
          }
        }
      }
    } catch (e: any) {
      Alert.alert("Google 로그인 실패", e.message || "다시 시도해주세요");
    } finally {
      setGoogleLoading(false);
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
            Vibefolio
          </Text>
          <Text className="text-sm text-slate-400 mt-1">
            크리에이터 포트폴리오 플랫폼
          </Text>
        </View>

        {/* Google Login */}
        <Pressable
          onPress={handleGoogleLogin}
          disabled={googleLoading}
          className="h-14 rounded-full flex-row items-center justify-center mb-4"
          style={{
            backgroundColor: "#ffffff",
            borderWidth: 1,
            borderColor: "#e2e8f0",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.06,
            shadowRadius: 4,
            elevation: 2,
          }}
        >
          {googleLoading ? (
            <ActivityIndicator color="#4285F4" />
          ) : (
            <>
              <Text className="text-lg mr-2">G</Text>
              <Text className="text-slate-700 font-semibold text-base">
                Google로 계속하기
              </Text>
            </>
          )}
        </Pressable>

        {/* Divider */}
        <View className="flex-row items-center my-4">
          <View className="flex-1 h-px bg-slate-200" />
          <Text className="mx-4 text-xs text-slate-400">또는</Text>
          <View className="flex-1 h-px bg-slate-200" />
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
            placeholder="비밀번호"
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

        {/* Forgot Password */}
        <View className="items-end mb-4">
          <Pressable onPress={() => router.push("/(auth)/forgot-password")}>
            <Text className="text-sm text-slate-400">
              비밀번호를 잊으셨나요?
            </Text>
          </Pressable>
        </View>

        {/* Login Button */}
        <Pressable
          onPress={handleLogin}
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
            {loading ? "로그인 중..." : "로그인"}
          </Text>
        </Pressable>

        {/* Sign Up Link */}
        <View className="flex-row items-center justify-center mt-6">
          <Text className="text-slate-400">계정이 없으신가요? </Text>
          <Pressable onPress={() => router.push("/(auth)/signup")}>
            <Text className="text-green-600 font-bold">회원가입</Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
