# RePoint Pilates

필라테스 센터를 위한 통합 운영 관리 시스템 — 홍보용 정적 PWA 랜딩과 React 어드민, Express API를 하나의 monorepo로 통합한 프로젝트.

## 프로젝트 구성

```
my-repoint-pilates-v2/
├── apps/
│   ├── landing/    홍보용 정적 PWA (vanilla HTML/CSS/JS, Service Worker)
│   ├── admin/      관리자 SPA (React 19 + Vite 7 + React Router 7 + Recharts)
│   └── api/        백엔드 API (Express 5 + Prisma 5 + PostgreSQL)
├── packages/
│   └── shared/     공유 타입 패키지 (admin/api 공통 enum 등)
├── PRD/            제품 요구사항 문서
└── PLAN/           구현 계획 (통합 단계 로드맵 포함)
```

자세한 가이드는 [CLAUDE.md](CLAUDE.md)와 [PLAN/PLAN.md](PLAN/PLAN.md) 참고.

## 기능 (PRD 요약)

- **회원 관리** — 회원 정보, 회원권, 신체 평가/운동 처방
- **실시간 예약** — 예약/취소/대기, 노쇼 패널티
- **수업 관리** — 개인/듀엣/그룹/대그룹 유형
- **강사 관리** — 스케줄 및 휴무
- **결제 시스템** — 회원권 결제, 환불, 영수증
- **자동 알림** — 예약 확인, 리마인더, 만료 알림
- **대시보드** — 매출, 회원 현황, 강사별 수업 현황

## 시작하기

### 사전 준비

- Node.js 20+ / npm 10+
- Docker & Docker Compose (Postgres 사용 시)

### 설치

```bash
npm install
```

워크스페이스 전체 의존성이 한 번에 설치된다.

### 개발 서버 실행

```bash
# 1) Postgres 띄우기
docker compose up -d db

# 2) Prisma 준비 (apps/api)
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed   # admin 계정 시드 (Phase 2 이후 활성화)

# 3) API 실행
npm run dev:api       # http://localhost:3000

# 4) 어드민 실행 (별도 터미널)
npm run dev:admin     # http://localhost:5173

# 5) 랜딩 실행 (선택, 별도 터미널)
npm run dev:landing   # http://localhost:3001
```

### Docker 풀스택

```bash
docker compose up
```

랜딩(`:3001`), 어드민(`:5173`), API(`:3000`), Postgres(`:5432`)가 함께 뜬다. API 컨테이너는 부팅 시 Prisma 스키마를 자동 적용한다.

## 환경 변수

| 키 | 위치 | 기본값 |
|---|---|---|
| `DATABASE_URL` | `apps/api/.env` | `postgresql://postgres:postgres@localhost:5432/pilates?schema=public` |
| `PORT` | `apps/api/.env` | `3000` |
| `JWT_SECRET` | `apps/api/.env` | (Phase 2에서 도입) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | `apps/api/.env` | (Phase 2에서 도입) |
| `VITE_API_URL` | `apps/admin/.env` | `http://localhost:3000` |

## 통합 진행 상태

본 저장소는 별도였던 [my-repoint-Pilates](https://github.com/EhEo/my-repoint-Pilates) (홍보 사이트 + NestJS 어드민)를 흡수해 단일 프로젝트로 통합 중이다. 작업 브랜치는 `feature/integrate-landing-and-auth`이며, 단계별 진행 상황은 [PLAN/PLAN.md](PLAN/PLAN.md)의 "통합 단계 로드맵" 섹션 참고.

- ✅ **Integration Phase 1** — Monorepo 재편성
- ⬜ **Integration Phase 1.5** — 기존 v2 빌드 에러 정리 (타입 에러 3건)
- ⬜ **Integration Phase 2** — JWT 인증 도입
- ⬜ **Integration Phase 3** — 회원권 별도 테이블 (Membership)
- ⬜ **Integration Phase 4** — 결제 모델 (Payment)
- ⬜ **Integration Phase 5** — 신체평가/강사스케줄/알림/대시보드 확장
- ⬜ **Integration Phase 6** — 정리 (mock 제거, enum 일관성)

## 라이선스

ISC
