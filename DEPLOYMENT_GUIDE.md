# NaviDate 배포 가이드

> TPM 에이전트를 통한 Vercel + Render 배포 완료 문서

**작성일:** 2025-01-29
**프로젝트:** NaviDate - 커플 전용 개인화 데이트 추천 서비스

---

## 목차

1. [프로젝트 구조](#프로젝트-구조)
2. [Phase 1: 로컬 검증](#phase-1-로컬-검증)
3. [Phase 2: Vercel 프론트엔드 배포](#phase-2-vercel-프론트엔드-배포)
4. [Phase 3: Render 백엔드 배포](#phase-3-render-백엔드-배포)
5. [환경변수 설정](#환경변수-설정)
6. [보안 점검](#보안-점검)
7. [배포 URL 정리](#배포-url-정리)
8. [문제 해결](#문제-해결)

---

## 프로젝트 구조

```
NaviDate/
├── agents/                     # AI 에이전트 시스템
│   ├── pm-agent-prompt.md      # PM 에이전트 프롬프트
│   ├── pm-agent.ts
│   ├── tpm-agent-prompt.md     # TPM 에이전트 프롬프트
│   ├── tpm-agent.ts
│   ├── security-agent-prompt.md # 보안 에이전트 프롬프트
│   └── security-agent.ts
├── date-chat-service/          # 메인 서비스 (영문 폴더명)
│   ├── backend/                # Express + Socket.io 백엔드
│   │   ├── index.js
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── package.json
│   └── frontend/               # React + Vite 프론트엔드
│       ├── src/
│       ├── public/
│       ├── vite.config.ts
│       └── package.json
├── data/                       # 샘플 데이터
├── research/                   # 시장 조사
├── security-report.md          # 보안 점검 결과
├── DEPLOYMENT_GUIDE.md         # 이 문서
└── package.json
```

### 기술 스택

| 구분 | 기술 |
|------|------|
| **Frontend** | React 19, Vite 7, TailwindCSS 4, TypeScript |
| **Backend** | Express 5, Socket.io 4, Node.js |
| **Database** | MongoDB Atlas (Mongoose 9) |
| **Hosting** | Vercel (Frontend), Render (Backend) |

---

## Phase 1: 로컬 검증

### 1.1 의존성 설치
```bash
cd date-chat-service
npm run install:all
```
✅ **결과:** 취약점 0건

### 1.2 린트 검사
```bash
cd frontend && npm run lint
```
✅ **결과:** ESLint 에러 0건

### 1.3 빌드 테스트
```bash
npm run build
```
✅ **결과:**
- 빌드 시간: 1.73초
- JS 번들: 248.81 KB (기준 500KB 미만 통과)
- gzip 압축: 77.73 KB

### 1.4 로컬 프로덕션 테스트
```bash
cd frontend && npm run preview
```
✅ **결과:** http://localhost:4173 정상 실행

---

## Phase 2: Vercel 프론트엔드 배포

### 2.1 Vercel CLI 설치
```bash
npm i -g vercel
vercel --version  # v50.8.1
```

### 2.2 Vercel 로그인
```bash
vercel login
```

### 2.3 프로젝트 연결
```bash
cd date-chat-service/frontend
vercel link --yes
```
✅ **결과:** Vite 프로젝트 자동 감지

### 2.4 배포 실행
```bash
vercel --yes
```

### 2.5 배포 결과

| 환경 | URL |
|------|-----|
| **Production** | https://frontend-alpha-three-61.vercel.app |
| **Dashboard** | https://vercel.com/iankims-projects-643b0a5a/frontend |

---

## Phase 3: Render 백엔드 배포

### 3.1 플랫폼 선택

| 플랫폼 | Socket.io | 무료 티어 | 선택 |
|--------|-----------|-----------|------|
| Vercel Serverless | ❌ 미지원 | 무제한 | - |
| Railway | ✅ 지원 | $5/30일 | - |
| **Render** | ✅ 지원 | 750시간/월 | ✅ 선택 |

> Vercel Serverless는 WebSocket을 지원하지 않아 Socket.io 사용 불가

### 3.2 GitHub 저장소 연결

**저장소:** https://github.com/Jingon-kim/Navidate.git

```bash
# Git 초기화 및 푸시
git init
git remote add origin https://github.com/Jingon-kim/Navidate.git
git add .
git commit -m "Initial commit"
git push -u origin main
```

### 3.3 폴더명 변경 (중요!)

Render는 한글 폴더명을 지원하지 않음:
```
❌ 데이트채팅서비스/backend
✅ date-chat-service/backend
```

### 3.4 Render 서비스 설정

| 항목 | 값 |
|------|-----|
| **Name** | `navidate` |
| **Region** | Singapore (Southeast Asia) |
| **Branch** | `main` |
| **Root Directory** | `date-chat-service/backend` |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `node index.js` |
| **Instance Type** | `Free` |

### 3.5 배포 결과

| 항목 | URL |
|------|-----|
| **Backend API** | https://navidate.onrender.com |
| **Health Check** | https://navidate.onrender.com/health |

---

## 환경변수 설정

### Vercel (Frontend)

현재 환경변수 불필요 (API 연동 미구현 상태)

향후 필요 시:
```
VITE_API_URL=https://navidate.onrender.com
```

### Render (Backend)

| Key | Value | 설명 |
|-----|-------|------|
| `MONGODB_URI` | `mongodb+srv://...` | MongoDB Atlas 연결 문자열 |
| `NODE_ENV` | `production` | 환경 구분 |
| `FRONTEND_URL` | `https://frontend-alpha-three-61.vercel.app` | CORS 허용 도메인 |

### MongoDB Atlas 연결 문자열 형식

```
mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/navidate?retryWrites=true&w=majority
```

### MongoDB Atlas IP 허용 설정

1. MongoDB Atlas → Network Access
2. Add IP Address → **Allow Access from Anywhere** (0.0.0.0/0)

---

## 보안 점검

### 보안 에이전트 실행
```bash
npm run security
```

### 보안 점검 결과

| 항목 | 상태 |
|------|------|
| **보안 등급** | B (85/100) |
| 민감정보 하드코딩 | ✅ 없음 |
| 환경변수 사용 | ✅ 적용됨 |
| .gitignore 설정 | ✅ .env 포함 |

### 발견된 이슈 (권장 개선사항)

| 등급 | 항목 | 조치 방법 |
|------|------|----------|
| 🟠 High | 비밀번호 평문 저장 | bcrypt 해싱 적용 |
| 🟠 High | JWT 미구현 | jsonwebtoken 패키지 적용 |

### 보안 개선 코드 예시

```javascript
// bcrypt 설치: npm install bcrypt
const bcrypt = require('bcrypt');

// 회원가입 시 비밀번호 해싱
const hashedPassword = await bcrypt.hash(password, 10);

// 로그인 시 비밀번호 비교
const isValid = await bcrypt.compare(password, user.password);
```

---

## 배포 URL 정리

### Production URLs

| 서비스 | URL |
|--------|-----|
| **Frontend** | https://frontend-alpha-three-61.vercel.app |
| **Backend API** | https://navidate.onrender.com |
| **Health Check** | https://navidate.onrender.com/health |

### 관리 대시보드

| 플랫폼 | URL |
|--------|-----|
| **Vercel** | https://vercel.com/iankims-projects-643b0a5a/frontend |
| **Render** | https://dashboard.render.com |
| **MongoDB Atlas** | https://cloud.mongodb.com |
| **GitHub** | https://github.com/Jingon-kim/Navidate |

### API 엔드포인트

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/health` | 서버 상태 확인 |
| POST | `/api/auth/signup` | 회원가입 |
| POST | `/api/auth/login` | 로그인 |
| GET | `/api/auth/me` | 사용자 정보 |
| POST | `/api/couple/create` | 커플 코드 생성 |
| POST | `/api/couple/join` | 커플 연결 |
| GET | `/api/recommend` | 데이트 추천 |
| GET | `/api/chat/:coupleId` | 채팅 내역 |

---

## 문제 해결

### Render 503 에러

**원인:** Render 무료 플랜은 15분 비활성 시 서버가 sleep 상태로 전환

**해결:**
- 첫 요청 시 서버 시작까지 30초~2분 소요
- 자동으로 깨어나므로 잠시 대기

### MongoDB 연결 실패

**확인사항:**
1. MongoDB Atlas → Network Access → 0.0.0.0/0 허용
2. MONGODB_URI 환경변수 정확히 설정
3. 비밀번호에 특수문자 있으면 URL 인코딩

### 한글 폴더명 에러

**에러:** `must match re "/^[A-Za-z0-9-_./ ]*$/`

**해결:** 폴더명을 영문으로 변경
```
데이트채팅서비스 → date-chat-service
```

### Vercel 배포 실패

**확인사항:**
1. `npm run build` 로컬에서 성공하는지
2. node_modules가 .gitignore에 포함되어 있는지
3. 환경변수 필요 시 Vercel 대시보드에서 설정

---

## 다음 단계 (Phase 4)

### 배포 후 검증 체크리스트

- [ ] 프론트엔드 접속 확인
- [ ] 백엔드 Health Check 응답 확인
- [ ] MongoDB 연결 로그 확인
- [ ] 회원가입/로그인 테스트
- [ ] Socket.io 연결 테스트

### 권장 개선사항

- [ ] 프론트엔드-백엔드 API 연동
- [ ] bcrypt 비밀번호 해싱 구현
- [ ] JWT 인증 시스템 구현
- [ ] 에러 모니터링 (Sentry) 연동
- [ ] CI/CD 파이프라인 구축

---

## 에이전트 명령어

```bash
# PM 에이전트 (기획)
npm run pm

# TPM 에이전트 (배포/QA)
npm run tpm

# Security 에이전트 (보안 점검)
npm run security
```

---

*NaviDate TPM Agent v1.0*
*"배포는 신중하게, 롤백은 신속하게"*
