## 전략 문서 (개발 전 반드시 숙지)
- **전략 진단 리포트**: `data/STRATEGY_ANALYSIS.md`
- **웹 버전 전략**: `../vibefolio-nextjs/data/STRATEGY_ANALYSIS.md` 참조
- **PM 공통 지침**: 맥미니 루트 `pm.md`

### 전략 핵심 요약
- 모바일은 웹 포트폴리오의 빠른 조회 + 맞춤 채용공고 알림 채널로 포지셔닝
- Q2 우선순위: 1) App Store/Play Store 배포 완료 2) 웹-모바일 포트폴리오 동기화 API 구축
- 포트폴리오 모바일 편집 기능 부재 → 웹 필수 사용 → 앱 활성화율 저하. 긴급 해결 필요
- 모바일 DAU는 웹 DAU의 70% 수준 목표 (Q2 말 웹 50명 → 모바일 30명)

---

# Vibefolio App (바이브폴리오)

## 프로젝트 개요
개발자/디자이너를 위한 포트폴리오 & 프로젝트 매칭 모바일 앱.
Expo (React Native) 기반, Supabase 백엔드.

## 기술 스택
- Framework: Expo SDK 54 + Expo Router v6
- Language: TypeScript
- UI: NativeWind (Tailwind CSS for React Native)
- 상태 관리: Zustand, TanStack React Query
- 백엔드: Supabase (Auth, DB, Storage)
- 알림: Expo Notifications

## 개발 규칙

### 코드 스타일
- TypeScript strict mode 사용
- 한글 우선 원칙: 모든 UI 텍스트와 주석은 한국어
- 시맨틱 라인 브레이크: UI 텍스트는 의미 단위로 줄바꿈

### 디자인 준수
- NativeWind(Tailwind) 유틸리티 클래스 사용
- 색상 토큰은 tailwind.config.js 참조

### Git 규칙
- 커밋 메시지: 한글 (feat:, fix:, refactor:, chore: 접두사)
- 브랜치: main → feature/기능명

## 주요 명령어
```bash
bun install        # 의존성 설치
bun start          # Expo 개발 서버
bun run ios        # iOS 시뮬레이터
bun run android    # Android 에뮬레이터
```

## 디렉토리 구조
```
app/
├── _layout.tsx          # 루트 레이아웃 (QueryClient, Auth, 알림)
├── (tabs)/              # 탭 네비게이션
├── (auth)/              # 인증 모달
├── project/             # 프로젝트 상세/편집
├── recruit/             # 채용 상세
└── user/                # 유저 프로필
components/              # 공통 컴포넌트
lib/
├── supabase.ts          # Supabase 클라이언트
├── auth/                # 인증 관련
└── notifications.ts     # 푸시 알림
```

## 상위 브랜드
- 회사: 계발자들 (Vibers)
- 도메인: vibers.co.kr
