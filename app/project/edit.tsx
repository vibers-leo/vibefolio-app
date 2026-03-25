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
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getProject, updateProject } from "@/lib/api/projects";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Camera } from "lucide-react-native";
import { useState, useEffect } from "react";
import { pickImage } from "@/lib/imagePicker";

export default function ProjectEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: project, isLoading } = useQuery({
    queryKey: ["project", id],
    queryFn: () => getProject(id!),
    enabled: !!id,
  });

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (project) {
      setTitle(project.title || "");
      setDescription(project.content_text || project.description || "");
      setThumbnailUrl(project.thumbnail_url || "");
    }
  }, [project]);

  const handlePickThumbnail = async () => {
    setUploadingImage(true);
    try {
      const url = await pickImage();
      if (url) setThumbnailUrl(url);
    } catch (e) {
      Alert.alert("오류", "이미지 업로드에 실패했습니다");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert("오류", "제목을 입력해주세요");
      return;
    }

    setSaving(true);
    try {
      await updateProject(id!, {
        title: title.trim(),
        description: description.trim(),
        content_text: description.trim(),
        thumbnail_url: thumbnailUrl || undefined,
      });
      queryClient.invalidateQueries({ queryKey: ["project", id] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      Alert.alert("완료", "프로젝트가 수정되었습니다", [
        { text: "확인", onPress: () => router.back() },
      ]);
    } catch (e) {
      Alert.alert("오류", "프로젝트 수정에 실패했습니다");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) return <LoadingSpinner message="불러오는 중..." />;

  return (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Thumbnail */}
      <Pressable onPress={handlePickThumbnail} className="relative">
        {thumbnailUrl ? (
          <Image
            source={{ uri: thumbnailUrl }}
            className="w-full"
            style={{ aspectRatio: 16 / 9 }}
            contentFit="cover"
          />
        ) : (
          <View
            className="w-full bg-slate-100 items-center justify-center"
            style={{ aspectRatio: 16 / 9 }}
          >
            <Camera size={32} color="#94a3b8" />
            <Text className="text-sm text-slate-400 mt-2">
              썸네일 이미지 선택
            </Text>
          </View>
        )}
        {uploadingImage && (
          <View className="absolute inset-0 bg-black/30 items-center justify-center">
            <ActivityIndicator color="#ffffff" size="large" />
          </View>
        )}
        <View className="absolute bottom-3 right-3 bg-black/50 px-3 py-1.5 rounded-full">
          <Text className="text-xs text-white font-medium">변경</Text>
        </View>
      </Pressable>

      {/* Form */}
      <View className="px-5 pt-5 gap-5">
        {/* Title */}
        <View>
          <Text className="text-xs font-bold text-slate-400 mb-1.5 ml-1">
            제목
          </Text>
          <TextInput
            className="bg-slate-50 rounded-xl px-4 py-3 text-sm text-slate-900"
            value={title}
            onChangeText={setTitle}
            placeholder="프로젝트 제목"
            placeholderTextColor="#94a3b8"
            maxLength={100}
          />
        </View>

        {/* Description */}
        <View>
          <Text className="text-xs font-bold text-slate-400 mb-1.5 ml-1">
            설명
          </Text>
          <TextInput
            className="bg-slate-50 rounded-xl px-4 py-3 text-sm text-slate-900"
            value={description}
            onChangeText={setDescription}
            placeholder="프로젝트에 대한 설명을 입력하세요"
            placeholderTextColor="#94a3b8"
            multiline
            numberOfLines={6}
            maxLength={2000}
            style={{ minHeight: 150, textAlignVertical: "top" }}
          />
          <Text className="text-[10px] text-slate-300 mt-1 ml-1">
            {description.length}/2000
          </Text>
        </View>

        {/* Save Button */}
        <Pressable
          onPress={handleSave}
          disabled={saving}
          className="py-3.5 rounded-full items-center mt-4"
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
  );
}
