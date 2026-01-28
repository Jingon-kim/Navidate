/**
 * NaviDate PM Agent
 * 30년차 시니어 PM 수준의 판단력을 가진 의사결정 에이전트
 */

import Anthropic from "@anthropic-ai/sdk";
import * as fs from "fs";
import * as path from "path";

// 타입 정의
interface RICEScore {
  reach: number;
  impact: number;
  confidence: number;
  effort: number;
  total: number;
}

interface CVFResult {
  bothValue: boolean;
  sharedExperience: boolean;
  feedbackLoop: boolean;
  dateExecution: boolean;
  passed: boolean;
}

interface Decision {
  summary: string;
  rice: RICEScore;
  cvf: CVFResult;
  recommendation: string;
  risks: string[];
  priority: "P0" | "P1" | "P2" | "P3";
}

interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
}

// PM 에이전트 시스템 프롬프트
const PM_SYSTEM_PROMPT = `당신은 NaviDate의 30년차 시니어 프로덕트 매니저입니다.

## 핵심 정체성
- 커플/데이트 서비스 도메인 전문가
- 개인화 추천 시스템 설계 경험
- 데이터 기반 의사결정
- 과도한 기능보다 핵심 가치 집중
- 실행 가능성 중시

## 프로젝트 컨텍스트
NaviDate는 대중적인 서비스가 아닌, 특정 커플 2명만을 위한 개인화 데이트 추천 웹서비스입니다.
핵심 차별점: 피드백 기반으로 계속 학습하여 점점 정확해지는 추천

## 판단 프레임워크

### 1. RICE 스코어 (모든 기능/결정에 적용)
- Reach (도달): 얼마나 자주 사용? (1-10)
- Impact (영향): 만족도 영향? (0.5-3)
- Confidence (확신): 성공 확신도? (20-100%)
- Effort (공수): 개발 기간 (0.5-3)
- 공식: (R × I × C) / E

### 2. CVF (Couple Value Filter)
모든 기능이 통과해야 함:
□ 두 사람 모두에게 가치
□ 공동 경험 강화
□ 피드백 루프 기여
□ 데이트 실행 도움

### 3. 복잡도 경계
- 3번 이상 탭 = 재설계
- 5개 이상 입력 = 분할
- 설명 필요한 UI = 실패

## 응답 원칙
1. 항상 근거와 함께 판단
2. RICE 점수 계산 포함
3. CVF 체크리스트 확인
4. 구체적 다음 단계 제시
5. 리스크 명시
6. 단순한 솔루션 우선

## 절대 하지 않을 것
- 확신 없이 "좋은 것 같다"
- 데이터 없이 추측 판단
- 2명 사용자 특수성 무시
- 기능 추가 쉽게 승인
- 복잡한 솔루션 먼저 제안

## 시장 조사 인사이트 (참고)
- 기존 커플앱(비트윈 등): 기록 중심, 추천 없음
- 데이트 플래닝앱: 일회성 추천, 학습 없음
- 기회: 피드백 기반 학습 + 2명 전용 개인화`;

// 시장 조사 데이터 로드
function loadMarketResearch(): string {
  const researchPath = path.join(__dirname, "../research/market-research.md");
  try {
    return fs.readFileSync(researchPath, "utf-8");
  } catch {
    return "시장 조사 데이터를 로드할 수 없습니다.";
  }
}

// 커플 프로필 로드
function loadCoupleProfile(): object | null {
  const profilePath = path.join(__dirname, "../data/couple-profile.json");
  try {
    return JSON.parse(fs.readFileSync(profilePath, "utf-8"));
  } catch {
    return null;
  }
}

// 피드백 히스토리 로드
function loadFeedbackHistory(): object[] {
  const historyPath = path.join(__dirname, "../data/feedback-history.json");
  try {
    return JSON.parse(fs.readFileSync(historyPath, "utf-8"));
  } catch {
    return [];
  }
}

// PM 에이전트 클래스
class PMAgent {
  private client: Anthropic;
  private conversationHistory: ConversationMessage[] = [];
  private marketResearch: string;

  constructor() {
    this.client = new Anthropic();
    this.marketResearch = loadMarketResearch();
  }

  // 컨텍스트 구성
  private buildContext(): string {
    const profile = loadCoupleProfile();
    const feedback = loadFeedbackHistory();

    let context = `\n\n## 현재 컨텍스트\n`;

    if (profile) {
      context += `\n### 커플 프로필\n${JSON.stringify(profile, null, 2)}\n`;
    }

    if (feedback.length > 0) {
      context += `\n### 최근 피드백 (최근 5개)\n${JSON.stringify(feedback.slice(-5), null, 2)}\n`;
    }

    context += `\n### 시장 조사 요약\n${this.marketResearch.substring(0, 2000)}...\n`;

    return context;
  }

  // 메시지 전송 및 응답 받기
  async ask(userMessage: string): Promise<string> {
    this.conversationHistory.push({
      role: "user",
      content: userMessage,
    });

    const systemPrompt = PM_SYSTEM_PROMPT + this.buildContext();

    const response = await this.client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: systemPrompt,
      messages: this.conversationHistory.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
    });

    const assistantMessage =
      response.content[0].type === "text" ? response.content[0].text : "";

    this.conversationHistory.push({
      role: "assistant",
      content: assistantMessage,
    });

    return assistantMessage;
  }

  // RICE 스코어 계산 요청
  async evaluateFeature(featureDescription: string): Promise<string> {
    const prompt = `다음 기능을 RICE 프레임워크로 평가해주세요:

기능: ${featureDescription}

다음 형식으로 응답해주세요:

## 기능 평가: [기능명]

### RICE 스코어
| 항목 | 점수 | 근거 |
|------|------|------|
| Reach | X/10 | ... |
| Impact | X/3 | ... |
| Confidence | X% | ... |
| Effort | X | ... |
| **Total** | **X.XX** | |

### CVF 검증
- [✓/✗] 두 사람 모두 가치: ...
- [✓/✗] 공동 경험 강화: ...
- [✓/✗] 피드백 루프 기여: ...
- [✓/✗] 데이트 실행 도움: ...

### 판단
[P0/P1/P2/P3] - [한 문장 결론]

### 권장 다음 단계
1. ...
2. ...

### 리스크
- ...`;

    return this.ask(prompt);
  }

  // 우선순위 비교
  async comparePriorities(features: string[]): Promise<string> {
    const prompt = `다음 기능들의 우선순위를 비교해주세요:

${features.map((f, i) => `${i + 1}. ${f}`).join("\n")}

각 기능의 RICE 점수를 계산하고, 우선순위 순서를 정해주세요.
NaviDate의 핵심 가치(커플 2명 전용, 피드백 학습)를 기준으로 판단해주세요.`;

    return this.ask(prompt);
  }

  // 기술 결정 자문
  async adviseTechnology(question: string): Promise<string> {
    const prompt = `기술 결정에 대한 자문이 필요합니다:

질문: ${question}

NaviDate 특성을 고려해주세요:
- 사용자: 2명 (커플)
- 핵심: 피드백 기반 학습
- 목표: 단순하고 유지보수 가능

다음 관점에서 답변해주세요:
1. 추천 선택지
2. 선택 근거
3. 피해야 할 것
4. 대안`;

    return this.ask(prompt);
  }

  // MVP 범위 검토
  async reviewMVPScope(proposedFeatures: string[]): Promise<string> {
    const prompt = `제안된 MVP 기능 목록을 검토해주세요:

${proposedFeatures.map((f, i) => `${i + 1}. ${f}`).join("\n")}

각 기능을 다음으로 분류해주세요:
- ✅ Must Have (MVP 필수)
- ⏳ Nice to Have (Phase 2)
- ❌ 제외 권장 (과도 설계)

그리고 빠진 핵심 기능이 있다면 제안해주세요.`;

    return this.ask(prompt);
  }

  // 대화 초기화
  resetConversation(): void {
    this.conversationHistory = [];
  }
}

// CLI 인터페이스
async function main() {
  const agent = new PMAgent();

  console.log(`
╔═══════════════════════════════════════════════════════════╗
║           NaviDate PM Agent v1.0                          ║
║           30년차 시니어 PM의 판단력                         ║
╠═══════════════════════════════════════════════════════════╣
║  명령어:                                                   ║
║  /eval [기능]  - 기능 RICE 평가                            ║
║  /compare     - 우선순위 비교 (여러 기능)                    ║
║  /tech [질문] - 기술 결정 자문                              ║
║  /mvp         - MVP 범위 검토                              ║
║  /reset       - 대화 초기화                                ║
║  /quit        - 종료                                       ║
║                                                            ║
║  또는 자유롭게 질문하세요.                                   ║
╚═══════════════════════════════════════════════════════════╝
  `);

  const readline = await import("readline");
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const prompt = () => {
    rl.question("\n🎯 PM Agent > ", async (input: string) => {
      const trimmed = input.trim();

      if (!trimmed) {
        prompt();
        return;
      }

      if (trimmed === "/quit") {
        console.log("PM Agent를 종료합니다.");
        rl.close();
        return;
      }

      if (trimmed === "/reset") {
        agent.resetConversation();
        console.log("대화가 초기화되었습니다.");
        prompt();
        return;
      }

      try {
        let response: string;

        if (trimmed.startsWith("/eval ")) {
          const feature = trimmed.substring(6);
          console.log("\n⏳ 기능 평가 중...\n");
          response = await agent.evaluateFeature(feature);
        } else if (trimmed.startsWith("/tech ")) {
          const question = trimmed.substring(6);
          console.log("\n⏳ 기술 자문 중...\n");
          response = await agent.adviseTechnology(question);
        } else if (trimmed === "/compare") {
          console.log("비교할 기능들을 입력하세요 (쉼표로 구분):");
          rl.question("> ", async (featuresInput: string) => {
            const features = featuresInput.split(",").map((f) => f.trim());
            console.log("\n⏳ 우선순위 비교 중...\n");
            const compareResponse = await agent.comparePriorities(features);
            console.log(compareResponse);
            prompt();
          });
          return;
        } else if (trimmed === "/mvp") {
          console.log("MVP 기능 목록을 입력하세요 (쉼표로 구분):");
          rl.question("> ", async (featuresInput: string) => {
            const features = featuresInput.split(",").map((f) => f.trim());
            console.log("\n⏳ MVP 범위 검토 중...\n");
            const mvpResponse = await agent.reviewMVPScope(features);
            console.log(mvpResponse);
            prompt();
          });
          return;
        } else {
          console.log("\n⏳ 분석 중...\n");
          response = await agent.ask(trimmed);
        }

        console.log(response);
      } catch (error) {
        console.error("오류 발생:", error);
      }

      prompt();
    });
  };

  prompt();
}

// 모듈 내보내기
export { PMAgent, RICEScore, CVFResult, Decision };

// 직접 실행 시
main().catch(console.error);
