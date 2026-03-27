// 상수 정의
const API_URL =
  process.env.EXPO_PUBLIC_API_URL || "https://www.vibefolio.net";

export const API_BASE = `${API_URL}/api`;
export const BASE_URL = API_URL;

export const GENRE_CATEGORIES = [
  { value: "photo", label: "포토" },
  { value: "animation", label: "웹툰/애니" },
  { value: "graphic", label: "그래픽" },
  { value: "design", label: "디자인" },
  { value: "video", label: "영상" },
  { value: "cinema", label: "영화·드라마" },
  { value: "audio", label: "오디오" },
  { value: "3d", label: "3D" },
  { value: "text", label: "텍스트" },
  { value: "code", label: "코드" },
  { value: "webapp", label: "웹/앱" },
  { value: "game", label: "게임" },
] as const;

export const FIELD_CATEGORIES = [
  { value: "finance", label: "경제/금융" },
  { value: "healthcare", label: "헬스케어" },
  { value: "beauty", label: "뷰티/패션" },
  { value: "pet", label: "반려" },
  { value: "fnb", label: "F&B" },
  { value: "travel", label: "여행/레저" },
  { value: "education", label: "교육" },
  { value: "it", label: "IT" },
  { value: "lifestyle", label: "라이프스타일" },
  { value: "business", label: "비즈니스" },
  { value: "art", label: "문화/예술" },
  { value: "marketing", label: "마케팅" },
] as const;
