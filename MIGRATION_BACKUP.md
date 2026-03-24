# vibefolio-app 이전 백업 문서
> 생성일: 2026-03-24 | Windows → Mac Mini 이전용

---

## 1. 프로젝트 개요
- **앱 이름**: Vibefolio
- **설명**: 창작자와 평가자가 함께하는 프로젝트 평가 플랫폼 (myratingis 모바일 버전)
- **기술 스택**: Expo 54, React Native 0.81, TypeScript, Supabase, NativeWind
- **번들 ID**: net.vibefolio.app
- **EAS 계정**: juuuno1116
- **EAS 프로젝트 ID**: 0fadd9e1-510c-43f9-a45c-742502b16bd5
- **웹 연동**: https://www.vibefolio.net (API_BASE)

---

## 2. 현재 상태

### 빌드 상태
| 플랫폼 | 상태 | 비고 |
|--------|------|------|
| Android | 빌드 완료 (AAB) | 스토어 제출 대기 |
| iOS | 미빌드 | Apple Developer 인증서 설정 필요 |
| TypeScript | 에러 0개 | 2026-03-22 확인 |

### 완료된 기능
- 프로젝트 피드 (무한 스크롤, 카테고리 필터, 정렬)
- 프로젝트 상세 (좋아요, 북마크, 댓글, 공유)
- 빠른 프로젝트 등록 (quick-post)
- 채용/공고 목록
- 사용자 프로필 (편집, 설정)
- 소셜 로그인 (Google OAuth)
- 푸시 알림 (Expo Notifications)
- Deep Linking (vibefolio.net)
- 검색 기능

---

## 3. 맥미니에서 바로 해야 할 일

### Step 1: iOS 빌드
```bash
cd vibefolio-app
npm install
npx eas-cli login  # juuuno1116

# iOS 프로덕션 빌드 (인터랙티브 모드 - 맥에서만)
npx eas-cli build --platform ios --profile production
```
- Apple ID 로그인 프롬프트 → 계정 정보 입력
- Distribution Certificate 생성 → Yes
- Provisioning Profile 생성 → Yes
- 빌드 완료까지 약 15-30분

### Step 2: 앱스토어 제출
```bash
# iOS
npx eas-cli submit --platform ios

# Android
npx eas-cli submit --platform android
```

### Step 3: 스토어 에셋 준비
- 스크린샷: iPhone 6.7" (1290×2796), 6.5" (1242×2688), 5.5" (1242×2208)
- 앱 아이콘: 1024×1024 (assets/icon.png 기반)
- 앱 설명문 (한국어)
- 프로모션 텍스트
- 개인정보처리방침: https://www.vibefolio.net/policy/privacy
- 이용약관: https://www.vibefolio.net/policy/terms

---

## 4. 환경변수 (eas.json에 포함)
> ⚠️ 실제 키는 `eas.json` 파일에서 확인하세요
```bash
EXPO_PUBLIC_SUPABASE_URL=https://iougjxzscsonbibxjhad.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<eas.json 참고>
```

---

## 5. app.json 주요 설정 (iOS)
```json
{
  "ios": {
    "bundleIdentifier": "net.vibefolio.app",
    "buildNumber": "1",
    "supportsTablet": true,
    "config": { "usesNonExemptEncryption": false },
    "infoPlist": {
      "NSCameraUsageDescription": "프로젝트 사진을 찍기 위해 카메라 접근이 필요합니다",
      "NSPhotoLibraryUsageDescription": "프로젝트 이미지를 업로드하기 위해...",
      "NSUserNotificationsUsageDescription": "새로운 프로젝트, 댓글, 좋아요 알림..."
    }
  }
}
```

---

## 6. 알려진 이슈
1. **DB 테이블 `User`**: 모바일은 `User` (대문자) 테이블 사용 — 웹의 `profiles`와 다름
2. **expo-doctor 타임아웃**: 네트워크 환경에 따라 스키마 검증 실패 (무시 가능)
3. **eas-cli 버전**: 18.4.0 최신 버전 업그레이드 권장 (`npm install -g eas-cli`)

---

**이 문서와 함께 `npx eas-cli build --platform ios --profile production` 실행하면 됩니다.**
