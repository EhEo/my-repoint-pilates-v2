# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

필라테스 센터 운영 관리 시스템 (회원/예약/수업/강사/대시보드 + 홍보용 랜딩). PRD는 [PRD/PRD.md](PRD/PRD.md), 단계별 실행 계획은 [PLAN/PLAN.md](PLAN/PLAN.md)에 있다. PRD가 현재 구현 범위보다 넓으니, Members / Classes / Instructors / Reservations / Dashboard 외 기능(인증, 회원권 별도 테이블, 결제, 신체평가, 알림 등)은 [PLAN/PLAN.md](PLAN/PLAN.md)의 통합 단계 로드맵에 따라 점진적으로 추가된다.

## 저장소 구조 (npm workspaces)

```
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

**API 엔드포인트.** 모든 라우트는 [apps/api/src/index.ts](apps/api/src/index.ts)에서 `/api` 하위에 마운트: `/api/members`, `/api/classes`, `/api/instructors`, `/api/reservations`, `/api/dashboard`. 어드민은 [apps/admin/src/utils/api.ts](apps/admin/src/utils/api.ts)에서 호출하며 `VITE_API_URL`(기본 `http://localhost:3000`)을 읽는다. Phase 2 이후 인증이 도입되면 모든 라우트에 `requireAuth + requireRole('ADMIN')` 미들웨어가 붙는다.

**예약 불변식.** [apps/api/src/routes/reservations.ts](apps/api/src/routes/reservations.ts)에서 예약 생성/취소 시 `ClassSession.enrolled`와 `Member.remainingSessions`를 함께 갱신한다. 이 세 가지 업데이트는 **트랜잭션 안에 있지 않다** — Phase 3에서 `prisma.$transaction`으로 감싸고, `Membership` 별도 테이블이 도입되면 잔여 횟수 차감 대상도 함께 변경 예정. 정원 체크는 아직 단순화되어 있다.

**Enum 대소문자.** Prisma enum은 대문자(`ACTIVE`, `GROUPS`, `BEGINNER`, `CONFIRMED`)로 통일. 통합 결정상 v2 컨벤션을 따른다. [apps/admin/src/types/index.ts](apps/admin/src/types/index.ts)는 일부 소문자 string union이 남아 있고 `ReservationStatus`만 양쪽을 받도록 되어 있는데, Phase 6에서 일괄 정리한다. 새 코드를 추가할 때는 항상 대문자를 따른다.

**Mock 데이터 vs 실제 API.** `apps/admin/src/utils/mock*Data.ts`가 `api.ts`와 같이 존재한다. 페이지마다 둘 중 어느 것을 쓰는지 다를 수 있으므로, API 변경이 UI에 반영될지 확인하기 전에 해당 페이지를 먼저 확인할 것. Phase 6에서 정리.

**스타일링.** CSS 프레임워크 없음. 디자인 토큰은 [apps/admin/src/styles/variables.css](apps/admin/src/styles/variables.css)의 CSS custom property로 정의 (HSL 3쌍을 `hsl(var(--color-*))`로 소비, `--space-*`, `--radius-*`, `--shadow-*`). 컴포넌트는 인라인 `<style>`이나 글로벌 클래스명을 사용. `.dark` 토큰 오버라이드는 정의되어 있지만 테마 토글 UI는 미연결.

**라우팅.** `Sidebar` + `Header` + `<Outlet />` 구성의 단일 `MainLayout` 쉘 아래 `/`, `/members`, `/classes`, `/reservations` 페이지가 마운트. `/settings`는 플레이스홀더, 매칭되지 않는 경로는 `/`로 리다이렉트. Phase 2에서 `/login`과 `RequireAuth` 추가 예정.

**랜딩 페이지.** [apps/landing](apps/landing)은 빌드 단계 없는 vanilla HTML/CSS/JS다. [apps/landing/index.html](apps/landing/index.html) 단일 파일이 거의 모든 콘텐츠를 담고 있고, [service-worker.js](apps/landing/service-worker.js)가 PWA 오프라인 캐시를 담당한다. 어드민과 무관하게 단독 호스팅 가능 (정적 호스팅 대상).

## 알아두면 좋은 컨벤션

- TypeScript 설정은 [apps/admin/tsconfig.app.json](apps/admin/tsconfig.app.json) (어드민 `src/`)과 [apps/admin/tsconfig.node.json](apps/admin/tsconfig.node.json) (Vite 설정)으로 나뉜다. 서버는 별도 [apps/api/tsconfig.json](apps/api/tsconfig.json)을 사용.
- Prisma `ClassSession`은 `date`를 `DateTime`으로, `startTime`/`endTime`을 `String`(`"HH:mm"`)으로 저장. [apps/api/src/routes/classes.ts](apps/api/src/routes/classes.ts)의 날짜 필터는 `YYYY-MM-DD` 쿼리 파라미터로부터 UTC 하루 범위를 만든다.
- PRD/PLAN 문서와 UI 문자열에 한국어가 자유롭게 섞여 있다. 별도 요청 없이 번역하지 말 것.
- 통합 진행 단계는 [PLAN/PLAN.md](PLAN/PLAN.md)의 "통합 단계 로드맵"에 있다. **단계마다 커밋 후 사용자 확인을 거친 뒤 다음 Phase로 진행**.
