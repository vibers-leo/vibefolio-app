import * as ImagePicker from "expo-image-picker";
import { supabase } from "./supabase";
import { decode } from "base64-arraybuffer";

export async function pickImage(): Promise<string | null> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: true,
    aspect: [16, 9],
    quality: 0.8,
    base64: true,
  });

  if (result.canceled || !result.assets[0]) return null;

  const asset = result.assets[0];

  if (!asset.base64) {
    if (__DEV__) console.warn("No base64 data from image picker");
    return null;
  }

  // Upload to Supabase Storage
  const fileName = `app_upload_${Date.now()}.jpg`;
  const filePath = `thumbnails/${fileName}`;

  const { error } = await supabase.storage
    .from("project-images")
    .upload(filePath, decode(asset.base64!), {
      contentType: "image/jpeg",
      upsert: true,
    });

  if (error) {
    if (__DEV__) console.error("Upload failed:", error);
    return null;
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("project-images").getPublicUrl(filePath);

  return publicUrl;
}

export async function takePhoto(): Promise<string | null> {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== "granted") {
    if (__DEV__) console.warn("Camera permission not granted");
    return null;
  }

  const result = await ImagePicker.launchCameraAsync({
    allowsEditing: true,
    aspect: [16, 9],
    quality: 0.8,
    base64: true,
  });

  if (result.canceled || !result.assets[0]?.base64) return null;

  const asset = result.assets[0];
  const fileName = `app_photo_${Date.now()}.jpg`;
  const filePath = `thumbnails/${fileName}`;

  const { error } = await supabase.storage
    .from("project-images")
    .upload(filePath, decode(asset.base64!), {
      contentType: "image/jpeg",
      upsert: true,
    });

  if (error) {
    if (__DEV__) console.error("Upload failed:", error);
    return null;
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("project-images").getPublicUrl(filePath);

  return publicUrl;
}
