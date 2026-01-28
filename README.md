# NaviDate

> 우리 둘만을 위한 학습하는 데이트 추천 서비스

## 프로젝트 개요

NaviDate는 대중적인 서비스가 아닌, **특정 커플 2명만을 위한** 개인화 데이트 추천 웹서비스입니다.

### 핵심 차별점
- **1:1 개인화**: 오직 우리 커플만을 위한 추천
- **피드백 학습**: 데이트 후 평가 → AI 학습 → 점점 정확해지는 추천
- **맥락 인식**: 날씨, 예산, 시간, 컨디션 반영
- **히스토리 축적**: 우리만의 데이트 아카이브

---

## 프로젝트 구조

```
NaviDate/
├── README.md
├── package.json
├── agents/
│   ├── pm-agent.ts          # PM 판단 에이전트
│   └── pm-agent-prompt.md   # 에이전트 시스템 프롬프트
├── research/
│   └── market-research.md   # 시장조사 보고서
└── data/
    ├── couple-profile.json      # 커플 프로필 데이터
    ├── feedback-history.json    # 피드백 기록
    └── recommendation-log.json  # 추천 이력
```

---

## PM Agent 사용법

### 설치

```bash
cd NaviDate
npm install
```

### 환경변수 설정

```bash
# .env 파일 생성
ANTHROPIC_API_KEY=your_api_key_here
```

### 실행

```bash
npm run pm
```

### 명령어

| 명령어 | 설명 | 예시 |
|--------|------|------|
| `/eval [기능]` | 기능 RICE 평가 | `/eval 날씨 기반 실내/외 추천` |
| `/compare` | 여러 기능 우선순위 비교 | 기능들 쉼표로 입력 |
| `/tech [질문]` | 기술 결정 자문 | `/tech DB는 뭘 쓸까요?` |
| `/mvp` | MVP 범위 검토 | 기능 목록 입력 |
| `/reset` | 대화 초기화 | |
| `/quit` | 종료 | |

### 예시 대화

```
🎯 PM Agent > /eval 데이트 후 이모지 평가 기능

⏳ 기능 평가 중...

## 기능 평가: 데이트 후 이모지 평가

### RICE 스코어
| 항목 | 점수 | 근거 |
|------|------|------|
| Reach | 8/10 | 매 데이트 후 사용 |
| Impact | 3/3 | 학습 루프의 핵심 |
| Confidence | 90% | 검증된 UX 패턴 |
| Effort | 0.5 | 1일 이내 구현 |
| **Total** | **43.2** | |

### CVF 검증
- [✓] 두 사람 모두 가치: 각자 평가
- [✓] 공동 경험 강화: 데이트 회고
- [✓] 피드백 루프 기여: 학습의 핵심
- [✓] 데이트 실행 도움: 다음 추천 개선

### 판단
P0 - MVP 필수 기능

### 권장 다음 단계
1. 이모지 5종 선정 (😍😊😐😕😢)
2. 1탭 평가 UI 설계
3. 피드백 저장 스키마 정의
```

---

## 시장조사 요약

### 기존 서비스의 한계
- **비트윈, 썸원**: 기록 중심, 추천 기능 없음
- **Cupla, Cobble**: 일회성 추천, 학습 없음

### NaviDate 기회
- 피드백 기반 학습 시스템 = **블루오션**
- 2명 전용 = 복잡도 감소, 개인화 극대화

자세한 내용: `research/market-research.md`

---

## 개발 로드맵

### Phase 1: MVP (핵심 루프)
- [ ] 커플 연결 (초대 코드)
- [ ] 프로필 설정 (취향 입력)
- [ ] 데이트 추천 요청
- [ ] 코스 생성 및 표시
- [ ] 피드백 수집
- [ ] 기본 학습 반영

### Phase 2: 가치 강화
- [ ] 히스토리 뷰
- [ ] 기념일 연동
- [ ] 지도 시각화

### Phase 3: 확장
- [ ] 서프라이즈 모드
- [ ] 캘린더 동기화

---

## 기술 스택 (예정)

| 구분 | 기술 | 선택 이유 |
|------|------|-----------|
| Frontend | Next.js + TypeScript | SEO, 빠른 개발 |
| Styling | Tailwind CSS | 빠른 UI 구현 |
| Backend | Next.js API Routes | 서버 분리 불필요 |
| Database | Supabase | 무료, 실시간 |
| AI | Claude API | 추천 로직 |
| Map | 카카오맵 SDK | 국내 최적화 |
| Deploy | Vercel | 무료, 자동 배포 |

---

## 라이선스

Private - 개인 프로젝트
