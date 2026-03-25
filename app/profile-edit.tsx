import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Camera } from "lucide-react-native";
import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { decode } from "base64-arraybuffer";
import { useAuth } from "@/lib/auth/AuthContext";
import { updateUserProfile } from "@/lib/api/users";
import { supabase } from "@/lib/supabase";

export default function ProfileEditScreen() {
  const router = useRouter();
  const { user, userProfile, refreshProfile } = useAuth();

  const [username, setUsername] = useState(
    userProfile?.display_name || ""
  );
  const [bio, setBio] = useState(userProfile?.bio || "");
  const [avatarUrl, setAvatarUrl] = useState(
    userProfile?.avatar_url || ""
  );
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const handlePickAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      base64: true,
    });

    if (result.canceled || !result.assets[0]?.base64) return;

    setUploadingAvatar(true);
    try {
      const fileName = `avatar_${user?.id}_${Date.now()}.jpg`;
      const filePath = `avatars/${fileName}`;

      const { error } = await supabase.storage
        .from("project-images")
        .upload(filePath, decode(result.assets[0].base64!), {
          contentType: "image/jpeg",
          upsert: true,
        });

      if (error) throw error;

      const {
        data: { publicUrl },
      } = supabase.storage.from("project-images").getPublicUrl(filePath);

      setAvatarUrl(publicUrl);
    } catch (e) {
      Alert.alert("오류", "이미지 업로드에 실패했습니다");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    if (!username.trim()) {
      Alert.alert("오류", "이름을 입력해주세요");
      return;
    }

    setSaving(true);
    try {
      await updateUserProfile(user.id, {
        username: username.trim(),
        bio: bio.trim(),
        profile_image_url: avatarUrl || undefined,
      });
      await refreshProfile();
      Alert.alert("완료", "프로필이 수정되었습니다", [
        { text: "확인", onPress: () => router.back() },
      ]);
    } catch (e) {
      Alert.alert("오류", "프로필 수정에 실패했습니다");
    } finally {
      setSaving(false);
    }
  };

  const displayAvatarUrl =
    avatarUrl ||
    `https://api.dicebear.com/7.x/initials/png?seed=${username || "U"}`;

  return (
    <SafeAreaView className="flex-1 bg-white" edges={[]}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Avatar */}
        <View className="items-center pt-6 pb-4">
          <Pressable onPress={handlePickAvatar} className="relative">
            <Image
              source={{ uri: displayAvatarUrl }}
              className="w-24 h-24 rounded-full bg-slate-200"
              contentFit="cover"
              style={{ borderWidth: 3, borderColor: "#dcfce7" }}
            />
            {uploadingAvatar ? (
              <View className="absolute inset-0 rounded-full bg-black/30 items-center justify-center">
                <ActivityIndicator color="#ffffff" />
              </View>
            ) : (
              <View
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full items-center justify-center"
                style={{ backgroundColor: "#16A34A" }}
              >
                <Camera size={14} color="#ffffff" />
              </View>
            )}
          </Pressable>
          <Pressable onPress={handlePickAvatar}>
            <Text className="text-sm text-green-600 font-semibold mt-2">
              사진 변경
            </Text>
          </Pressable>
        </View>

        {/* Form */}
        <View className="px-5 gap-5">
          {/* Username */}
          <View>
            <Text className="text-xs font-bold text-slate-400 mb-1.5 ml-1">
              이름
            </Text>
            <TextInput
              className="bg-slate-50 rounded-xl px-4 py-3 text-sm text-slate-900"
              value={username}
              onChangeText={setUsername}
              placeholder="이름을 입력하세요"
              placeholderTextColor="#94a3b8"
              maxLength={30}
            />
          </View>

          {/* Bio */}
          <View>
            <Text className="text-xs font-bold text-slate-400 mb-1.5 ml-1">
              소개
            </Text>
            <TextInput
              className="bg-slate-50 rounded-xl px-4 py-3 text-sm text-slate-900"
              value={bio}
              onChangeText={setBio}
              placeholder="자기소개를 입력하세요"
              placeholderTextColor="#94a3b8"
              multiline
              numberOfLines={3}
              maxLength={200}
              style={{ minHeight: 80, textAlignVertical: "top" }}
            />
            <Text className="text-[10px] text-slate-300 mt-1 ml-1">
              {bio.length}/200
            </Text>
          </View>

          {/* Email (read-only) */}
          <View>
            <Text className="text-xs font-bold text-slate-400 mb-1.5 ml-1">
              이메일
            </Text>
            <View className="bg-slate-100 rounded-xl px-4 py-3">
              <Text className="text-sm text-slate-400">
                {userProfile?.email || user?.email}
              </Text>
            </View>
          </View>
        </View>

        {/* Save Button */}
        <View className="px-5 mt-8">
          <Pressable
            onPress={handleSave}
            disabled={saving}
            className="py-3.5 rounded-full items-center"
            style={{
              backgroundColor: saving ? "#bbf7d0" : "#16A34A",
              shadowColor: "#16A34A",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.25,
              shadowRadius: 12,
              elevation: 4,
            }}
          >
            {saving ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text className="text-white font-bold text-base">저장</Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
