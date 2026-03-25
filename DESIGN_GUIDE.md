# Vibefolio App 디자인 가이드

## 색상 시스템

### 브랜드 색상 (tailwind.config.js)
| 토큰 | 값 | 용도 |
|------|-----|------|
| `primary` | `#16A34A` | 주요 액션 (초록) |
| `primary-dark` | `#15803D` | 호버/프레스 |
| `primary-light` | `#dcfce7` | 연한 배경 |
| `accent` | `#84CC16` | 보조 강조 (라임) |
| `background` | `#f8fafc` | 전체 배경 |
| `surface` | `#ffffff` | 카드/서피스 |
| `text-primary` | `#0f172a` | 기본 텍스트 |
| `text-secondary` | `#64748b` | 보조 텍스트 |
| `border` | `#e2e8f0` | 테두리 |

## 타이포그래피
- 시스템 기본 폰트 사용 (React Native 기본)
- 헤딩: fontWeight "700" (Bold)
- 본문: 기본 weight

## 네비게이션 스타일
- 헤더 배경: `#ffffff`
- 헤더 그림자: 없음 (`headerShadowVisible: false`)
- 뒤로가기 색상: `#16A34A` (primary)
- 뒤로가기 텍스트: "뒤로"

## 화면 구성
- 탭 네비게이션: 하단 탭
- 인증: 모달 프레젠테이션
- 상세 페이지: 스택 푸시 (헤더 표시)
- 상태바: dark 스타일

## 컨텐츠 배경
- 기본 `contentStyle.backgroundColor`: `#ffffff`
