# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

필라테스 센터 운영 관리 시스템 (회원/예약/수업/강사/대시보드 + 홍보용 랜딩). PRD는 [PRD/PRD.md](PRD/PRD.md), 단계별 실행 계획은 [PLAN/PLAN.md](PLAN/PLAN.md)에 있다. PRD가 현재 구현 범위보다 넓으니, Members / Classes / Instructors / Reservations / Dashboard 외 기능(인증, 회원권 별도 테이블, 결제, 신체평가, 알림 등)은 [PLAN/PLAN.md](PLAN/PLAN.md)의 통합 단계 로드맵에 따라 점진적으로 추가된다.

## 저장소 구조 (npm workspaces)

```text
my-repoint-pilates-v2/
├── apps/
│   ├── admin/      ← React 19 + Vite 7 + RR7 + Recharts (관리자 SPA)
│   ├── api/        ← Express 5 + Prisma 5 + Postgres
│   └── landing/    ← 정적 PWA 홍보 사이트 (vanilla HTML/CSS/JS, Service Worker)
├── packages/
│   └── shared/     ← 공유 타입 패키지 (현재 골격만, Phase 2 이후 enum 단일 소스화 예정)
├── PRD/PRD.md
├── PLAN/PLAN.md    ← 통합 단계 로드맵 포함
├── docker-compose.yml
└── package.json    ← workspaces 매니페스트
```

같은 도메인(필라테스 운영 관리)을 다루던 별도 저장소 `my-repoint-Pilates`의 자산을 본 저장소로 흡수해 통합 중이다. 통합 작업 브랜치는 `feature/integrate-landing-and-auth`.

## 주요 명령어

루트에서 실행 (npm workspaces).

```bash
# 의존성 설치 (워크스페이스 전체)
npm install

# 개발 서버
npm run dev:landing    # http://localhost:3001 (정적, npx serve)
npm run dev:admin      # http://localhost:5173 (Vite)
npm run dev:api        # http://localhost:3000 (nodemon + ts-node)

# 빌드
npm run build:admin    # tsc -b && vite build (apps/admin/dist)
npm run build:api      # tsc → apps/api/dist

# 린트
npm run lint:admin

# Prisma (apps/api/prisma)
npm run prisma:generate
npm run prisma:migrate
npm run prisma:studio
npm run prisma:seed
```

Docker 풀스택 — 루트에서 `docker-compose up`. landing(`:3001`), admin(`:5173`), api(`:3000`), Postgres(`:5432`, db `pilates`, user/pass `postgres/postgres`)가 함께 뜬다. api 컨테이너는 부팅 시 `prisma generate && prisma db push && build && start`를 실행하므로 새 DB도 자동 스키마 적용.

## 아키텍처 메모

**API 엔드포인트.** 모든 라우트는 [apps/api/src/index.ts](apps/api/src/index.ts)에서 `/api` 하위에 마운트: `/api/auth`(공개), 그리고 `/api/members`, `/api/memberships`, `/api/classes`, `/api/instructors`, `/api/instructor-schedules`, `/api/instructor-leaves`, `/api/reservations`, `/api/dashboard`(전부 `[requireAuth, requireRole('ADMIN')]` 적용 — Phase 2). 어드민은 [apps/admin/src/utils/api.ts](apps/admin/src/utils/api.ts)의 공통 `request<T>()` 헬퍼로 호출하며, 토큰은 [apps/admin/src/utils/auth.ts](apps/admin/src/utils/auth.ts)에서 `localStorage`로 관리하고 401이 떨어지면 자동으로 세션을 비우고 `/login`으로 보낸다. `VITE_API_URL` 기본값은 `http://localhost:3000`.

**인증.** JWT(`HS256`, 기본 만료 `7d`). 시드 ([apps/api/prisma/seed.ts](apps/api/prisma/seed.ts))가 `.env`의 `ADMIN_EMAIL`/`ADMIN_PASSWORD`로 admin User를 upsert하고, 시드는 도메인 데이터(`Reservation`/`ClassSession`/`Member`/`Instructor`)만 비우며 **`User` 테이블은 보존한다**. `prisma:seed` 스크립트는 `ts-node prisma/seed.ts` 단일 소스 — 손수 컴파일된 `seed.js`는 더 이상 존재하지 않음. [seed-api.js](apps/api/seed-api.js)도 admin 로그인 후 `Authorization: Bearer ...`로 호출. 환경변수는 [apps/api/.env.example](apps/api/.env.example) 참고, 실값은 gitignored `.env`. 미들웨어는 [apps/api/src/middleware/requireAuth.ts](apps/api/src/middleware/requireAuth.ts)에서 `req.user: JwtPayload`를 attach.

**회원권 모델 (Phase 3 + Phase 4 mini).** `Member` 에는 더 이상 `remainingSessions/totalSessions/membershipType` 컬럼이 없다. 대신 별도 `Membership` 테이블이 횟수권을 표현 (`totalCount`, `remainingCount`, `startDate`, 필수 `endDate`, `status`). 정책: **회원당 단일 활성 회원권만 허용** — 스키마 unique 제약은 없고 [routes/memberships.ts](apps/api/src/routes/memberships.ts)에서 신규 발급 시 기존 ACTIVE 를 자동 CANCELLED 처리. PERIOD/MIXED 회원권, HOLD 상태는 미도입(YAGNI). 만료일은 PATCH 로 항상 수정 가능. **결제는 본격 Payment 모델 대신 Membership 의 플래그(`paid`, `paidAt`, `refundedAt`, `paymentNote`)만 두고 admin 이 수기로 토글** — Phase 4 (mini). 환불 시 회원권 status 자동 변경은 하지 않음 (admin 이 명시적으로 CANCELLED 로 토글). 할부는 도입하지 않음.

**예약 불변식 (Phase 3).** [routes/reservations.ts](apps/api/src/routes/reservations.ts) 의 생성/취소가 모두 `prisma.$transaction` 안에 있다. 생성 시 (1) ClassSession 정원 체크, (2) 활성·미만료·잔여 ≥1 인 Membership 조회 후 `endDate` 가까운 순으로 1건 차감, (3) `ClassSession.enrolled` 증가. 활성 회원권이 없으면 400 으로 차단. 취소 시 같은 회원의 가장 가까운 ACTIVE 회원권에 환불 — 결과적으로 발급한 회원권으로 환불되지 않을 수 있다는 점에 유의 (단일 활성 정책 하에선 실무상 문제 없음).

**Enum 대소문자 / rename.** Prisma enum 은 대문자(`ACTIVE`, `BEGINNER`, `CONFIRMED`)로 통일. **Phase 3 에서 기존 `enum MembershipType { GROUPS PRIVATE DUET }` 는 사실 수업 유형이라 `enum ClassType` 으로 rename**, `ClassSession.type` 도 같이 변경. [apps/admin/src/types/index.ts](apps/admin/src/types/index.ts) 는 일부 소문자 union 이 호환성으로 남아 있고 `ReservationStatus` 만 양쪽을 받도록 되어 있는데, Phase 6 에서 일괄 정리. **새 코드를 추가할 때는 항상 대문자를 따른다.**

**Mock 데이터 vs 실제 API.** `apps/admin/src/utils/mock*Data.ts`가 `api.ts`와 같이 존재한다. 페이지마다 둘 중 어느 것을 쓰는지 다를 수 있으므로, API 변경이 UI에 반영될지 확인하기 전에 해당 페이지를 먼저 확인할 것. Phase 6에서 정리.

**스타일링.** CSS 프레임워크 없음. 디자인 토큰은 [apps/admin/src/styles/variables.css](apps/admin/src/styles/variables.css)의 CSS custom property로 정의 (HSL 3쌍을 `hsl(var(--color-*))`로 소비, `--space-*`, `--radius-*`, `--shadow-*`). 컴포넌트는 인라인 `<style>`이나 글로벌 클래스명을 사용. `.dark` 토큰 오버라이드는 정의되어 있지만 테마 토글 UI는 미연결.

**라우팅.** `Sidebar` + `Header` + `<Outlet />` 구성의 단일 `MainLayout` 쉘 아래 `/`, `/members`, `/memberships`, `/classes`, `/schedules`, `/reservations` 페이지가 마운트. 전체 쉘은 [RequireAuth](apps/admin/src/components/auth/RequireAuth.tsx)로 감싸고, 공개 `/login`만 그 바깥. `/settings`는 플레이스홀더, 매칭되지 않는 경로는 `/`로 리다이렉트.

**강사 스케줄/휴무 (Phase 5B).** 강사별 반복 가용 시간은 `InstructorSchedule { dayOfWeek (0=Sun..6=Sat), startTime "HH:mm", endTime "HH:mm" }` (instructor당 다수 슬롯). 휴무는 `InstructorLeave { startDate, endDate, reason? }` 로 일자 범위 override. **현재 ClassSession 생성 시점에 가용성을 강제 검사하지 않는다** — 데이터만 노출하고 스케줄 충돌 정책은 admin 판단에 맡김. 대강(substitution) 워크플로우는 미도입. Instructor 삭제 시 schedules/leaves 는 cascade 삭제. 어드민 [/schedules](apps/admin/src/pages/Schedules.tsx) 페이지에서 강사 picker로 골라 인라인 추가/삭제.

**랜딩 페이지.** [apps/landing](apps/landing)은 빌드 단계 없는 vanilla HTML/CSS/JS다. [apps/landing/index.html](apps/landing/index.html) 단일 파일이 거의 모든 콘텐츠를 담고 있고, [service-worker.js](apps/landing/service-worker.js)가 PWA 오프라인 캐시를 담당한다. 어드민과 무관하게 단독 호스팅 가능 (정적 호스팅 대상).

## 알아두면 좋은 컨벤션

- TypeScript 설정은 [apps/admin/tsconfig.app.json](apps/admin/tsconfig.app.json) (어드민 `src/`)과 [apps/admin/tsconfig.node.json](apps/admin/tsconfig.node.json) (Vite 설정)으로 나뉜다. 서버는 별도 [apps/api/tsconfig.json](apps/api/tsconfig.json)을 사용.
- Prisma `ClassSession`은 `date`를 `DateTime`으로, `startTime`/`endTime`을 `String`(`"HH:mm"`)으로 저장. [apps/api/src/routes/classes.ts](apps/api/src/routes/classes.ts)의 날짜 필터는 `YYYY-MM-DD` 쿼리 파라미터로부터 UTC 하루 범위를 만든다.
- PRD/PLAN 문서와 UI 문자열에 한국어가 자유롭게 섞여 있다. 별도 요청 없이 번역하지 말 것.
- 통합 진행 단계는 [PLAN/PLAN.md](PLAN/PLAN.md)의 "통합 단계 로드맵"에 있다. **단계마다 커밋 후 사용자 확인을 거친 뒤 다음 Phase로 진행**.
