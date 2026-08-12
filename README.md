# Carrier GreenON

Carrier GreenON은 캐리어 에어컨 사용자를 위한 ESG 친환경 냉방 미션·리워드 웹앱입니다. 사용자는 가상 에어컨으로 적정 냉방 미션을 수행하고 GREEN POINT를 모아 리워드를 구매할 수 있습니다.

## 주요 사용자 흐름

1. Supabase 회원가입 및 로그인
2. 서울 실시간 날씨와 가상 Carrier 에어컨 상태 확인
3. 오늘의 GREEN MISSION 참여
4. 30분 단위 가상 IoT 시뮬레이션
5. 미션 성공 및 GREEN POINT 적립
6. GREEN WALLET에서 적립·사용내역 확인
7. GREEN REWARD SHOP에서 포인트 상품 구매
8. 구매내역, GREEN LEVEL, GREEN REPORT 확인

실제 Carrier API는 사용하지 않으며 에어컨 상태는 사용자별 Supabase 시뮬레이션 데이터입니다.

## 기술 구성

- Vite 7 + Vanilla JavaScript
- Supabase Auth, Postgres, RLS, Database Functions
- Open-Meteo 현재 날씨 API
- Render Static Site 배포

## 로컬 실행

Node.js 20.19 이상이 필요합니다.

```bash
npm ci
```

`.env.example`을 복사해 `.env`를 만들고 자신의 Supabase 공개 연결 정보를 입력합니다.

```dotenv
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_key
```

브라우저에 포함되는 `VITE_` 환경변수에는 Supabase publishable key만 사용합니다. `service_role` 또는 secret key는 어떤 경우에도 입력하거나 커밋하지 않습니다.

```bash
npm run dev
```

프로덕션 빌드 확인:

```bash
npm run build
npm run preview
```

## Supabase 데이터베이스

마이그레이션은 다음 순서로 관리됩니다.

1. `supabase/migrations/20260811072722_carrier_greenon_core_schema.sql`
2. `supabase/migrations/20260811074117_carrier_greenon_data_operations.sql`

연결된 Supabase 프로젝트에 CLI로 반영할 경우:

```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
```

보안 원칙:

- 모든 공개 스키마 사용자 테이블에 RLS 적용
- 프로필·미션·포인트·구매·에어컨 데이터는 본인 행만 조회
- 포인트 적립과 상품 구매는 인증 사용자 전용 Database Function에서 원자적으로 처리
- 포인트 잔액과 구매기록은 브라우저에서 직접 변경 불가
- 미션 보상과 구매 요청은 중복 처리 방지
- 원자적 미션·구매 함수는 `auth.uid()`를 검사하고 anon 실행을 차단하며 빈 `search_path`로 고정
- Supabase Free 플랜에서는 Pro 전용 유출 비밀번호 보호를 사용할 수 없으므로 8자 이상 비밀번호와 이메일 인증을 적용

## Render 배포 준비

루트의 `render.yaml`은 다음 설정으로 Static Site를 생성합니다.

- Build Command: `npm ci && npm run build`
- Publish Directory: `./dist`
- SPA Rewrite: `/*` → `/index.html`

Blueprint 생성 중 아래 환경변수 값은 Render 대시보드에서 직접 입력합니다.

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

현재 Render 배포 URL은 `https://carrier-greenon-fmii.onrender.com`입니다. Supabase Dashboard의 Authentication URL Configuration에서 이 주소를 Site URL과 Redirect URL로 등록해야 이메일 인증 후 배포본으로 돌아옵니다.

## 날씨 동작

기본 위치는 서울이며 Open-Meteo의 현재 기온·체감온도·습도·WMO 날씨 코드를 사용합니다. API 연결에 실패하면 샘플 날씨로 전환되고 해당 카드가 Red 경고 상태로 표시됩니다. 날씨는 실제 미션 보상 조건을 바꾸지 않고 사용자 안내 문구만 맞춤화합니다.

## 프로젝트 구조

```text
.
├─ src/
│  ├─ main.js             # 화면, 인증, Supabase 데이터 흐름
│  ├─ styles.css          # White + Blue 디자인과 Red 오류 상태
│  ├─ supabase.js         # 공개 Supabase 클라이언트 설정
│  └─ weather.js          # 날씨 API, fallback, 맞춤 미션 안내
├─ supabase/migrations/   # 스키마, RLS, 원자적 데이터 함수
├─ .env.example           # 공개 환경변수 예시
├─ render.yaml            # Render Static Site Blueprint
└─ CHECKLIST.md           # 단계별 개발 진행상황
```

## 배포 전 점검

- `npm ci`와 `npm run build` 성공
- 소스코드에 secret/service_role key가 없는지 확인
- Supabase RLS와 인증 사용자별 데이터 분리 확인
- 회원가입 이메일 인증과 로그인 확인
- 미션 성공 후 300P가 한 번만 지급되는지 확인
- 구매 후 포인트 차감과 구매내역 유지 확인
- 동일 계정으로 다른 브라우저 또는 기기에서 데이터 유지 확인
- 모바일 레이아웃과 Warning/Error Red 상태 확인

개발 진행상황과 아직 남은 수동 검증 항목은 `CHECKLIST.md`에서 관리합니다.
