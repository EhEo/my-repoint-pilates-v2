# Project Implementation Plan: Pilates Management System

## 1. Project Overview
 Based on `PRD/PRD.md`, we are building a comprehensive Pilates Center Management System. The system aims to automate administration, improve member experience, and provide data-driven insights.

## 2. Technical Stack & Execution Criteria

### 2.1 Tech Stack (Proposed)
- **Frontend**: React (Vite)
- **Backend**: Node.js + Express (TypeScript)
- **Database**: PostgreSQL (Dockerized) or Mock for MVP
- **Infrastructure**: Docker & Docker Compose
- **Language**: TypeScript (Full Stack)
- **Styling**: Vanilla CSS (focused on Modern, Premium Aesthetics as per guidelines, using CSS Variables for theming)
- **State Management**: React Context or Zustand

### 2.2 Execution Standards
- **Component Design**: Atomic Design principles (Atoms, Molecules, Organisms).
- **Responsive Design**: Mobile-first approach, ensuring "Member" persona can easily book via mobile.
- **Code Quality**: ESLint + Prettier for formatting. Modular file structure.
- **UX/UI**: High-quality, "Premium" feel with smooth micro-interactions (hover, transitions) as requested.

## 3. Implementation Phases

### Phase 1: Foundation & Design System (Completed)
- Initialize Vite Project with TypeScript.
- Set up global CSS tokens (colors, typography, spacing).
- Create core UI components.
- Implement Navigation structure.

### Phase 1.5: Backend & Infrastructure (New)
- **Server**: Initialize Node.js + Express + TypeScript backend.
- **Docker**: Create Dockerfiles for Frontend and Backend.
- **Compose**: Set up docker-compose.yml for orchestration.
- **Database**: Connect basic PostgreSQL container (optional for now, can start with in-memory or mock).

### Phase 2: Member Management (Core)
- **Features**: Member Registration, List View, Search/Filter, Detail View.
- **Physical Assessment**: UI for inputting body measurements and charting changes (Chart.js or similar).
- **Deliverable**: Functional Member Mgmt Module.

### Phase 3: Class & Instructor Management
- **Features**: Instructor Profiles, Schedule Setting, Class Creation (Group/Private).
- **Scheduler UI**: Weekly/Monthly calendar view for admins/instructors.
- **Deliverable**: Class Scheduling Interface.

### Phase 4: Reservation System (Key Feature)
- **Features**: Booking flow for Members, Attendance Tracking for Instructors.
- **Logic**: Capacity checks, Cancellation windows, Membership quota deduction.
- **Deliverable**: End-to-end Reservation Flow.

### Phase 5: Dashboard & Analytics
- **Features**: Admin Dashboard (Revenue, Active Members), Instructor Dashboard (Today's Classes).
- **Reports**: Visual graphs and stats.

## 4. Immediate Next Steps
1. Initialize the repository structure.
2. Define the basic Design System (Color Palette, Typography).
3. Build the 'Shell' of the application (Layout, Navigation).

---

# 통합 계획 (my-repoint-Pilates 흡수)

기존 [my-repoint-Pilates](https://github.com/EhEo/my-repoint-Pilates) 레포의 자산(홍보용 정적 PWA 랜딩 + JWT 인증 모듈)을 본 레포(`my-repoint-pilates-v2`)로 흡수해 **하나의 통합 프로젝트**로 만든다. 본 v2를 베이스로 삼고, Pilates 레포는 흡수 후 폐기 또는 archived 처리 예정.

## 5. 통합 결정 사항

| 항목 | 결정 |
|---|---|
| 베이스 레포 | `my-repoint-pilates-v2` |
| 통합 작업 브랜치 | `feature/integrate-landing-and-auth` |
| 인증 도입 | 예 (Pilates의 NestJS auth를 Express 미들웨어로 단순 포팅) |
| Prisma enum 표기 | **대문자(UPPERCASE)** — v2 기존 컨벤션 유지 |
| 회원권 모델 | **별도 `Membership` 테이블** 분리 (결제·기간 관리 확장 대비) |
| 정적 랜딩 | `apps/landing/`로 흡수 (Pilates의 `index.html`, SW, manifest 등 그대로) |
| Postgres 호스트 포트 | 5432 유지 (v2 기존 값) |

## 6. 통합 단계 로드맵

### ✅ Integration Phase 1 — Monorepo 재편성 (구조만) — 완료
**목표**: 코드 변경 없이 디렉토리 구조만 재편성. 빌드/실행이 그대로 되는지 검증.

- [x] v2를 npm workspaces로 변환
- [x] 기존 v2 루트 프런트엔드를 `apps/admin/`으로 이동 (git mv, 내용 변경 없음)
- [x] 기존 `server/`를 `apps/api/`로 이동
- [x] Pilates 레포의 정적 랜딩 자산을 `apps/landing/`으로 복사 (`index.html`, `src/css/`, `src/js/`, `service-worker.js`, `manifest.json`, `offline.html`, `public/icons/`)
- [x] `packages/shared/` 골격(공유 타입용)
- [x] 루트 [package.json](../package.json) → workspaces 매니페스트 (`@repoint/admin`, `@repoint/api`, `@repoint/landing`, `@repoint/shared`)
- [x] 루트 [docker-compose.yml](../docker-compose.yml) → landing(`:3001`) 추가, 기존 admin/api/db 유지
- [x] [CLAUDE.md](../CLAUDE.md), [README.md](../README.md) 새 구조 반영 갱신
- [x] `npm install` (워크스페이스, 419 packages, 0 vulnerabilities)

**검증 결과**:
- ✅ 워크스페이스 의존성 설치 성공
- ⚠️ `npm run build:admin`/`build:api`에서 빌드 에러 3건 발견 — 이는 이번 통합 작업이 아니라 **v2 main에 원래 있던 코드 이슈**임 (`git diff --stat -M` 0 byte 변경으로 검증 완료). 아래 Phase 1.5에서 별도 처리.
- ℹ️ Dev 모드(vite/ts-node)는 타입 에러를 차단하지 않으므로 정상 동작 가능 상태.

### ✅ Integration Phase 1.5 — 기존 v2 빌드 에러 정리 (소규모) — 완료

**목표**: v2 main에서 누적된 타입 에러 3건을 해소해 `npm run build:admin/build:api`가 green 통과하게 한다. Phase 2 이후 의존성/스키마 변경으로 새 빌드 에러가 섞이기 전에 깨끗한 baseline을 확보.

- [x] [apps/admin/src/components/Dashboard/RevenueChart.tsx:43](../apps/admin/src/components/Dashboard/RevenueChart.tsx) — Recharts v3의 `Formatter<ValueType, NameType>` 시그니처에 안 맞던 명시적 타입을 제거하고 추론에 맡김
- [x] [apps/admin/src/pages/Reservations.tsx:7](../apps/admin/src/pages/Reservations.tsx) — 사용되지 않는 `Reservation` import 제거
- [x] [apps/api/src/routes/dashboard.ts](../apps/api/src/routes/dashboard.ts) — `Prisma.ReservationGetPayload<{ include: ... }>` 등 Prisma 생성 타입을 활용해 `acc`/`curr`/`r` 파라미터 타입 명시
- [x] 검증: `npm run build:admin && npm run build:api` 각각 exit code 0
- 작은 단위 커밋 1건으로 처리

### ✅ Integration Phase 2 — JWT 인증 도입 — 완료

- [x] Pilates의 NestJS auth를 Express 미들웨어로 포팅 ([apps/api/src/middleware/requireAuth.ts](../apps/api/src/middleware/requireAuth.ts))
- [x] 의존성 추가: `bcryptjs`, `jsonwebtoken`, `@types/bcryptjs`, `@types/jsonwebtoken`
- [x] Prisma 스키마: `User { id email password role createdAt updatedAt }` + `enum Role { ADMIN INSTRUCTOR MEMBER }`
- [x] JWT 헬퍼 ([apps/api/src/lib/auth.ts](../apps/api/src/lib/auth.ts)) — `signToken/verifyToken/hashPassword/verifyPassword`
- [x] 신규 라우트: `POST /api/auth/login`, `GET /api/auth/me` ([apps/api/src/routes/auth.ts](../apps/api/src/routes/auth.ts))
- [x] 기존 `/api/{members,classes,instructors,reservations,dashboard}` 전부에 `[requireAuth, requireRole('ADMIN')]` 일괄 적용 ([apps/api/src/index.ts](../apps/api/src/index.ts))
- [x] 어드민 SPA: `/login` 페이지 + `RequireAuth` 래퍼 + Header 로그아웃 + 401 시 자동 로그인 리다이렉트 + `localStorage` JWT
- [x] [apps/api/prisma/seed.ts](../apps/api/prisma/seed.ts)에 `ADMIN_EMAIL`/`ADMIN_PASSWORD` upsert 추가 (User 테이블은 보존)
- [x] [apps/api/seed-api.js](../apps/api/seed-api.js)는 admin 로그인 후 모든 호출에 `Authorization: Bearer ...` 주입
- [x] `prisma:seed` 스크립트를 `ts-node prisma/seed.ts`로 단일화 (수기 컴파일된 `seed.js` 제거)
- [x] [.env](../apps/api/.env)에 임시 `JWT_SECRET`/`ADMIN_*` 채움 + [.env.example](../apps/api/.env.example) 추가
- [x] Dockerfile CMD에 `npm run prisma:seed` 추가, docker-compose `api` 서비스에 `env_file` 연결
- [x] 검증: `npm run build:admin && npm run build:api` 모두 exit 0

### ✅ Integration Phase 3 — 회원권 분리 (PRD 3.2) — 완료

사용자 결정 반영: 횟수권만, 단일 활성, 만료일 수정 가능. PERIOD/MIXED, HOLD 등 미사용 enum 값은 YAGNI 차원에서 미도입.

- [x] 기존 `Member.remainingSessions/totalSessions/membershipType` 컬럼 제거
- [x] 기존 `enum MembershipType { GROUPS PRIVATE DUET }` 를 `enum ClassType` 으로 rename (사실은 수업 유형이었음). `ClassSession.type` 도 함께 변경
- [x] 신규 모델 `Membership { id memberId totalCount remainingCount startDate endDate status }` + `enum MembershipStatus { ACTIVE EXPIRED CANCELLED }` ([apps/api/prisma/schema.prisma](../apps/api/prisma/schema.prisma))
- [x] 단일 활성 회원권 정책: 신규 발급 시 기존 ACTIVE 회원권을 자동 CANCELLED 처리 (애플리케이션 로직, [routes/memberships.ts](../apps/api/src/routes/memberships.ts))
- [x] 예약 생성/취소를 `prisma.$transaction` 으로 감싸 활성 회원권의 `remainingCount` 를 차감/복구. 만료(`endDate < now`)·잔여 0 인 경우 400 차단. 정원 초과도 함께 차단 ([routes/reservations.ts](../apps/api/src/routes/reservations.ts))
- [x] 신규 라우트 `GET/POST/PATCH/DELETE /api/memberships` (PATCH 가 endDate 수정 — 사용자 핵심 요구) — admin-only
- [x] [seed.ts](../apps/api/prisma/seed.ts): Member 에 legacy 필드 없이 시드, 각 회원에게 90일 만료 횟수권 1건 발급
- [x] 어드민: `types/index.ts` 에 Membership 타입 + ClassType rename, `utils/api.ts` 에 fetchMemberships/createMembership/updateMembership/deleteMembership 추가
- [x] MemberCard 가 활성 회원권 요약(잔여/총량/만료일) 표시, MemberForm 에서 legacy 필드 제거
- [x] 신규 페이지 `/memberships` (목록 + 발급 + 만료일 수정) + Sidebar 엔트리 추가
- [x] mockData.ts 는 무효화돼 빈 stub 으로 비워둠 (Phase 6 에서 일괄 제거)
- [x] 검증: `npm run build:admin && npm run build:api` 모두 exit 0

### ✅ Integration Phase 4 (mini) — 결제 플래그만 도입 — 완료

사용자 결정 반영: 본격 Payment 모델은 나중에. 현재는 **수기 표기** 가능한 플래그만 추가하고, 할부(installments)는 도입하지 않음.

- [x] [Membership](../apps/api/prisma/schema.prisma) 에 `paid`, `paidAt`, `refundedAt`, `paymentNote` 컬럼 추가 (모두 nullable/default false)
- [x] PATCH /api/memberships 가 위 4개 컬럼을 수기로 갱신 허용
- [x] [Memberships](../apps/admin/src/pages/Memberships.tsx) 페이지: 테이블에 Payment 컬럼(Paid/Unpaid/Refunded 배지) 추가, 편집 모달에 결제·환불 fieldset + "Mark paid/refunded today" 버튼 + 자유 텍스트 메모
- [x] 환불 시 회원권 status 자동 변경은 하지 않음 — admin 이 별도로 CANCELLED 로 토글 (정책상 명시적 결정이 안전)
- [x] 검증: `npm run build:admin && npm run build:api` exit 0

**미도입 (Phase 4+ 또는 별도 단계로 미룸)**:

- 별도 `Payment` 테이블 / `PaymentMethod` / `PaymentStatus` enum
- 결제 수단별 처리, 영수증 발행
- 부분 환불 (현재는 환불 여부만 boolean-ish — refundedAt 의 존재 여부)
- 할부 (사용자 요청으로 취소)

### Integration Phase 5 — 부가 기능 (선택, PRD 기반)

- ⚠️ **신체 평가** (PRD 3.1.4 일부): `Assessment` 모델 — Phase 5A 로 **최소 범위**만 도입 완료. **자세/유연성/근력/운동 처방/사진/리포트는 미도입** (PRD 의 큰 절반). 핵심 추적 지표(키/체중/BMI/체지방/근육량) + 메모만
- ✅ **강사 스케줄/휴무** (PRD 3.5.2): `InstructorSchedule`, `InstructorLeave` 모델 — Phase 5B 로 분리 완료. 대강 신청/승인 워크플로우는 별도 단계로 미룸
- ✅ **알림 시스템** (PRD 3.7): `Notification` 큐 모델 + 채널 어댑터(이메일/SMS/카카오 알림톡은 스텁) — Phase 5C 로 분리 완료
- ✅ **대시보드 매출 위젯 확장** (PRD 3.8): `dashboard.ts` 에 일/주/월/년 매출 집계 — Phase 5D 로 분리 완료

#### ✅ Integration Phase 5E — 어드민 i18n (한/영 전환) — 완료

기존 어드민 UI 표면이 거의 영어였고 일부 보조 텍스트만 한국어인 상태였음. `react-i18next` 도입해 페이지·컴포넌트 표면을 모두 토큰 기반으로 바꾸고 한·영 토글 추가.

- [x] 의존성: `react-i18next`, `i18next`, `i18next-browser-languagedetector`
- [x] [src/i18n/index.ts](../apps/admin/src/i18n/index.ts) — 초기화, fallback `ko`, `localStorage` 로 언어 영속화 (key: `repoint.lang`)
- [x] [locales/ko.json](../apps/admin/src/i18n/locales/ko.json) / [locales/en.json](../apps/admin/src/i18n/locales/en.json) — 네임스페이스(`common`, `nav`, `auth`, `dashboard`, `charts`, `members`, `memberships`, `assessments`, `schedules`, `notifications`, `reservations`, `classes`, `instructors`, `modal`, `header`)로 구성
- [x] [LanguageToggle](../apps/admin/src/components/layout/LanguageToggle.tsx) — Header 에 Globe 아이콘 + 현재 언어 코드 표시, 클릭 시 ko ↔ en
- [x] `tsconfig.app.json` 에 `resolveJsonModule: true` 추가
- [x] 번역 적용: Sidebar, Header, Login, Dashboard, RevenueChart, AttendanceChart, Members + MemberCard + MemberForm, Memberships, Assessments, Schedules, Notifications, Reservations + ReservationCard, Classes + ClassCard + ClassDetailModal, InstructorCard + InstructorForm, Modal
- [x] enum-derived 표시(`status`, `type`, `recipient`, `level`, `dayOfWeek`)는 raw value 를 className 으로 유지하면서 `t()` 로만 라벨 번역. 백엔드가 발행하는 알림 본문 등은 한국어 그대로 (사용자별 lang 선호도 미전달이라 발행 시점 언어가 적절)
- [x] 검증: `npm run build:admin && npm run build:api` exit 0

**비-범위 / 알려진 누락**:

- 백엔드 발행 메시지(알림 title/body)는 한국어 고정. 후일 user 의 lang preference 가 도입되면 발행 시 분기 가능
- `/settings` placeholder 한 줄(`<div>Settings Page (Coming Soon)</div>`)은 placeholder 라 그대로 둠

#### ⚠️ Integration Phase 5A (minimal) — 신체 평가 (최소 범위) — 완료

PRD 3.1.4 의 측정 항목은 30+ 개로 매우 광범위. 본 단계에서는 **장기 추적에 핵심인 지표 5개 + 메모만** 다루고 자세 분석/유연성/근력/운동 처방/사진 Before-After/PDF 리포트는 모두 미도입.

- [x] Schema: `Assessment { id, memberId, date, heightCm?, weightKg?, bmi?, bodyFatPct?, muscleMassKg?, notes? }` ([apps/api/prisma/schema.prisma](../apps/api/prisma/schema.prisma)). Member 에 `assessments` 관계 + cascade 삭제. `(memberId, date)` 인덱스
- [x] [routes/assessments.ts](../apps/api/src/routes/assessments.ts): CRUD + BMI 자동 계산 (height/weight 둘 다 있을 때 라우트 레이어에서 계산해 저장). PATCH 는 머지 후 BMI 재계산
- [x] 어드민 [/assessments](../apps/admin/src/pages/Assessments.tsx) 페이지: 회원 picker + Trend 차트(체중/BMI/체지방을 좌·우 Y축 dual-axis line) + Add Measurement 폼 + History 테이블(삭제). Sidebar 에 HeartPulse 아이콘으로 엔트리 추가
- [x] 검증: `npm run build:admin && npm run build:api` exit 0

**비-범위 (PRD 3.1.4 의 미도입 영역)**:

- 체형 분석 (어깨/골반/다리 길이/척추 측만)
- 유연성 (전굴, 고관절/어깨/햄스트링 가동범위)
- 근력 평가 (코어/상체/하체/균형 1-5점)
- 자세 분석 (거북목/라운드숄더/골반 기울기/무릎 정렬)
- 통증·병력 구조화 (현재 자유 텍스트 notes 로만)
- 운동 처방 / 프로그램 설계 / 홈케어
- Before-After 사진
- PDF 리포트
- 4주 평가 주기 알림

#### ✅ Integration Phase 5C — 알림 시스템 — 완료

- [x] Schema: `Notification` + `enum NotificationType { RESERVATION_CONFIRMED, RESERVATION_CANCELLED, MEMBERSHIP_EXPIRY }` + `NotificationChannel { APP, SMS, KAKAO, EMAIL }` + `NotificationStatus { PENDING, SENT, FAILED }` + `RecipientType { MEMBER, INSTRUCTOR, ADMIN }`. `payload` 는 Json, `recipientType, recipientId` 인덱스
- [x] [lib/notifications.ts](../apps/api/src/lib/notifications.ts): `enqueueAndDispatch()` — 레코드 생성 후 즉시 채널 어댑터 호출, 성공 시 SENT/sentAt, 실패는 FAILED/errorMessage 로 기록. 어댑터는 모두 콘솔 로깅 stub
- [x] [routes/notifications.ts](../apps/api/src/routes/notifications.ts): GET (필터: recipientType / recipientId / status / type), PATCH (수동 토글), DELETE
- [x] `POST /api/notifications/scan-expiries` — ACTIVE 회원권의 만료 7/3/1일 전 알림을 일괄 발행. 24시간 내 같은 (memberId, type) 중복 발행 방지. 스케줄러 도입 전까지 admin 이 수동 호출
- [x] [reservations.ts](../apps/api/src/routes/reservations.ts) 트리거: 예약 생성 시 회원에게 RESERVATION_CONFIRMED + 강사에게 신규 예약 알림. 취소 시 강사에게 RESERVATION_CANCELLED. **트랜잭션 외부에서 발행** — stub 실패가 비즈니스 로직을 롤백하지 않도록
- [x] 어드민 [/notifications](../apps/admin/src/pages/Notifications.tsx) 페이지: All/Sent/Pending/Failed 필터, "Scan membership expiries" 버튼, 행별 삭제. Sidebar 엔트리 추가
- [x] 검증: `npm run build:admin && npm run build:api` exit 0

**비-범위**: 클래스 2시간 전 리마인더 (스케줄러 필요), 자동 대기→확정 전환, 실제 SMS/카카오/이메일 송신 (어댑터는 stub).

#### ✅ Integration Phase 5D — 대시보드 매출 위젯 확장 — 완료

- [x] [GET /api/dashboard/revenue?granularity=DAY|WEEK|MONTH|YEAR](../apps/api/src/routes/dashboard.ts) — 시계열 버킷팅 (cash-flow 관점: paidAt 기준 +gross, refundedAt 기준 +refunds, net = gross - refunds)
- [x] 기본 윈도우: DAY=30일, WEEK=12주, MONTH=12개월, YEAR=5년. `from`/`to` 쿼리로 override 가능
- [x] 결측 버킷은 0 으로 채워 x-축 연속성 보장. 주 단위는 ISO(월요일) 기준
- [x] 단가 상수를 [lib/pricing.ts](../apps/api/src/lib/pricing.ts) 로 추출 (Payment 도입 시 제거 예정)
- [x] [RevenueChart](../apps/admin/src/components/Dashboard/RevenueChart.tsx) 를 mock 에서 실 API 로 전환 — Day/Week/Month/Year 탭 selector, KRW 축약 포맷터(`만`/`억`), tooltip 에 gross/refunds/net 분해, 빈 상태/로딩 처리
- [x] Dashboard stat 카드의 매출 표시를 `$` 에서 `₩` 로 교체
- [x] mockDashboardData 의 무효 항목(MOCK_REVENUE_DATA, MOCK_DASHBOARD_STATS, MOCK_RECENT_ACTIVITY) 제거. AttendanceChart 가 쓰는 MOCK_ATTENDANCE_DATA 만 보존 (Phase 6 일괄 정리)
- [x] 검증: `npm run build:admin && npm run build:api` exit 0

**비-범위**: 회원 분석/수업 분석/강사 실적/예약률 리포트 (PRD 3.8.2 의 다른 항목들). Payment 모델 도입 후 매출 단가가 진짜 데이터로 바뀌면 이 엔드포인트의 unitPrice 곱셈도 자연스럽게 사라진다.

#### ✅ Integration Phase 5B — 강사 스케줄/휴무 — 완료

- [x] [schema.prisma](../apps/api/prisma/schema.prisma): `InstructorSchedule { id, instructorId, dayOfWeek (0..6), startTime "HH:mm", endTime "HH:mm" }` + `InstructorLeave { id, instructorId, startDate, endDate, reason? }`. Instructor 에 양방향 관계 + cascade 삭제
- [x] 신규 라우트 [/api/instructor-schedules](../apps/api/src/routes/instructor-schedules.ts), [/api/instructor-leaves](../apps/api/src/routes/instructor-leaves.ts) — admin-only. 시간 형식·범위 검증 (HH:mm 정규식, dayOfWeek 0..6, start ≤ end)
- [x] [seed.ts](../apps/api/prisma/seed.ts): 시드된 강사에게 월~금 09:00–18:00 기본 가용시간 자동 생성
- [x] 어드민 신규 페이지 [/schedules](../apps/admin/src/pages/Schedules.tsx): 강사 picker + Weekly Availability / Leaves 두 패널, 인라인 추가/삭제. Sidebar 에 "Instructor Schedules" 엔트리 추가
- [x] **의도적 비-범위**: ClassSession 생성 시점의 가용성 강제 체크 없음(데이터만 노출), 대강(substitution) 워크플로우 미도입
- [x] 검증: `npm run build:admin && npm run build:api` exit 0

### Integration Phase 6 — 정리

- 기존 v2의 `apps/admin/src/utils/mock*Data.ts` 정리(완전 제거 또는 `src/__mocks__/`로 격리)
- enum 일관성 점검 — 어드민 [apps/admin/src/types/index.ts](../apps/admin/src/types/index.ts)에서 ReservationStatus 양쪽 받는 부분 정리
- ESLint 통과 / 타입체크 통과 (Phase 1.5에서 잡지 못한 잔여 이슈 + Phase 2~5에서 누적된 새 이슈)
- 통합 후 기존 [my-repoint-Pilates](https://github.com/EhEo/my-repoint-Pilates) 레포 archived 처리

## 7. 진행 원칙
- **단계마다 커밋 후 검증**. Phase 단위로 사용자 확인 후 다음 Phase 진행
- **PRD를 코드보다 앞세움**. PRD에 없는 기능은 추가하지 않음
- **트랜잭션·정원 체크 등 알려진 빈틈은 흡수하면서 같이 메우기**. 예: Phase 3에서 reservations 트랜잭션화
- **enum과 타입 단일 소스화**. Prisma 스키마 → `packages/shared`에서 타입 export → admin/api 양쪽 import

## 8. 진행 상황 트래커

| Phase | 상태 | 비고 |
| --- | --- | --- |
| Integration Phase 1 — Monorepo 재편성 | ✅ 완료 | `feature/integrate-landing-and-auth` 브랜치, 커밋 완료 |
| Integration Phase 1.5 — 기존 빌드 에러 정리 | ✅ 완료 | admin/api 빌드 green |
| Integration Phase 2 — JWT 인증 도입 | ✅ 완료 | bcrypt + jsonwebtoken, /api/* 전부 ADMIN-only, /login 페이지 |
| Integration Phase 3 — Membership 테이블 분리 | ✅ 완료 | 횟수권 단일활성, endDate 수정 가능, 예약 트랜잭션화 |
| Integration Phase 4 (mini) — 결제 플래그 | ✅ 완료 | Membership 에 paid/paidAt/refundedAt/paymentNote 수기 토글. 본격 Payment 모델은 보류 |
| Integration Phase 5B — 강사 스케줄/휴무 | ✅ 완료 | InstructorSchedule + InstructorLeave + /schedules 페이지. 대강 워크플로우 미도입 |
| Integration Phase 5D — 대시보드 매출 위젯 | ✅ 완료 | /api/dashboard/revenue 시계열, RevenueChart 실 데이터 + D/W/M/Y selector |
| Integration Phase 5C — 알림 시스템 | ✅ 완료 | Notification 모델 + 예약 트리거 + 만료 scan, 채널 어댑터는 stub |
| Integration Phase 5A (mini) — 신체 평가 | ⚠️ 부분 완료 | 핵심 지표 5종 + 메모만. 자세/유연성/근력/처방/사진/리포트 미도입 |
| Integration Phase 5E — 어드민 i18n | ✅ 완료 | react-i18next, ko/en 토글, 모든 라우트된 페이지 + 컴포넌트 번역 |
| Integration Phase 6 — 정리 | ⬜ 예정 | mock 제거, enum 일관성, Pilates 레포 archived |
