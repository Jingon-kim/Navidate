/**
 * NaviDate TPM Agent
 * 20년차 시니어 TPM의 배포/테스트 전문 에이전트
 */

import Anthropic from "@anthropic-ai/sdk";
import * as fs from "fs";
import * as path from "path";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

// 타입 정의
interface DeploymentScore {
  codeQuality: number;
  security: number;
  performance: number;
  testing: number;
  environment: number;
  total: number;
}

interface CheckResult {
  category: string;
  item: string;
  status: "pass" | "warn" | "fail";
  message: string;
}

interface DeploymentReport {
  score: DeploymentScore;
  checks: CheckResult[];
  criticalIssues: string[];
  highIssues: string[];
  recommendations: string[];
  deployable: "yes" | "conditional" | "no";
}

interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
}

// TPM 에이전트 시스템 프롬프트
const TPM_SYSTEM_PROMPT = `당신은 NaviDate의 20년차 시니어 Technical Program Manager입니다.

## 핵심 정체성
- 웹 애플리케이션 배포 전문가 (Vercel, AWS, GCP)
- 테스트 전략 및 QA 스페셜리스트
- CI/CD 파이프라인 설계 경험
- 보안 취약점 분석 능력
- 성능 최적화 및 모니터링 전문
- 장애 대응 및 롤백 전략 수립

## 핵심 원칙
- "배포 전 한 번 더 확인" - 꼼꼼함이 생명
- 리스크 기반 의사결정
- 문서화 철저
- 장애 0건 목표
- 금요일 오후 배포 절대 금지

## 프로젝트 컨텍스트
NaviDate는 커플 전용 데이트 추천 서비스입니다.
- Frontend: React 19 + TypeScript + Vite + Tailwind CSS
- Backend: Node.js + Express 5 + Socket.io
- Database: MongoDB Atlas
- 배포 목표: Vercel (Frontend) + Railway/Render (Backend)

## 체크리스트 영역

### 1. 코드 품질 (20점)
- ESLint/Prettier 에러 0건
- TypeScript 컴파일 에러 0건
- 콘솔 에러/경고 없음
- 미사용 코드 제거

### 2. 보안 (25점)
- JWT 인증 구현
- 비밀번호 해싱
- SQL/NoSQL Injection 방어
- XSS 방어
- 환경변수 보안

### 3. 성능 (20점)
- Lighthouse 점수 > 80
- API 응답시간 < 200ms
- 번들 크기 최적화
- 이미지 최적화

### 4. 테스트 (20점)
- 단위 테스트 존재
- API 테스트
- E2E 테스트
- 수동 QA 완료

### 5. 환경설정 (15점)
- 환경변수 설정
- CORS 설정
- DB 연결 검증
- 빌드 성공

## 위험 등급
- Critical (배포 차단): 빌드 실패, 보안 취약점, DB 연결 실패
- High (수정 후 배포): 테스트 실패, 성능 저하
- Medium (경고 후 배포): 린트 경고, 문서 미비
- Low (기록 후 배포): 코드 스타일

## 응답 원칙
1. 체크리스트 기반 점검
2. 점수화된 평가
3. Critical 이슈 우선 보고
4. 구체적 해결책 제시
5. 롤백 계획 항상 포함

## 절대 하지 않을 것
- 테스트 없이 배포 승인
- 보안 이슈 무시
- 롤백 계획 없이 진행
- 환경변수 하드코딩 묵인
- 프로덕션 DB 직접 수정 허용`;

// TPM 에이전트 클래스
class TPMAgent {
  private client: Anthropic;
  private conversationHistory: ConversationMessage[] = [];
  private projectPath: string;

  constructor(projectPath?: string) {
    this.client = new Anthropic();
    this.projectPath = projectPath || path.join(__dirname, "../데이트채팅서비스");
  }

  // 프로젝트 구조 분석
  private async analyzeProject(): Promise<string> {
    let analysis = "\n\n## 프로젝트 현황\n";

    // package.json 확인
    const frontendPkg = this.readJsonSafe(
      path.join(this.projectPath, "frontend/package.json")
    );
    const backendPkg = this.readJsonSafe(
      path.join(this.projectPath, "backend/package.json")
    );

    if (frontendPkg) {
      analysis += `\n### Frontend Dependencies\n`;
      analysis += `- React: ${frontendPkg.dependencies?.react || "N/A"}\n`;
      analysis += `- TypeScript: ${frontendPkg.devDependencies?.typescript || "N/A"}\n`;
    }

    if (backendPkg) {
      analysis += `\n### Backend Dependencies\n`;
      analysis += `- Express: ${backendPkg.dependencies?.express || "N/A"}\n`;
      analysis += `- Mongoose: ${backendPkg.dependencies?.mongoose || "N/A"}\n`;
    }

    // 환경변수 확인
    const envExists = fs.existsSync(
      path.join(this.projectPath, "backend/.env")
    );
    analysis += `\n### Environment\n`;
    analysis += `- Backend .env: ${envExists ? "존재" : "없음"}\n`;

    return analysis;
  }

  // JSON 파일 안전하게 읽기
  private readJsonSafe(filePath: string): any | null {
    try {
      return JSON.parse(fs.readFileSync(filePath, "utf-8"));
    } catch {
      return null;
    }
  }

  // 빌드 테스트 실행
  async runBuildTest(): Promise<string> {
    console.log("⏳ 빌드 테스트 실행 중...");

    try {
      const { stdout, stderr } = await execAsync(
        "npm run build",
        { cwd: path.join(this.projectPath, "frontend") }
      );
      return `✅ 빌드 성공\n${stdout}`;
    } catch (error: any) {
      return `❌ 빌드 실패\n${error.stderr || error.message}`;
    }
  }

  // 린트 검사 실행
  async runLintCheck(): Promise<string> {
    console.log("⏳ 린트 검사 실행 중...");

    try {
      const { stdout, stderr } = await execAsync(
        "npm run lint",
        { cwd: path.join(this.projectPath, "frontend") }
      );
      return `✅ 린트 통과\n${stdout}`;
    } catch (error: any) {
      return `⚠️ 린트 경고/에러\n${error.stdout || error.message}`;
    }
  }

  // npm audit 실행
  async runSecurityAudit(): Promise<string> {
    console.log("⏳ 보안 감사 실행 중...");

    let result = "";

    try {
      const { stdout: frontendAudit } = await execAsync(
        "npm audit --json",
        { cwd: path.join(this.projectPath, "frontend") }
      );
      result += `### Frontend Audit\n${frontendAudit}\n`;
    } catch (error: any) {
      result += `### Frontend Audit\n${error.stdout || "감사 완료"}\n`;
    }

    try {
      const { stdout: backendAudit } = await execAsync(
        "npm audit --json",
        { cwd: path.join(this.projectPath, "backend") }
      );
      result += `### Backend Audit\n${backendAudit}\n`;
    } catch (error: any) {
      result += `### Backend Audit\n${error.stdout || "감사 완료"}\n`;
    }

    return result;
  }

  // 메시지 전송 및 응답 받기
  async ask(userMessage: string): Promise<string> {
    this.conversationHistory.push({
      role: "user",
      content: userMessage,
    });

    const projectAnalysis = await this.analyzeProject();
    const systemPrompt = TPM_SYSTEM_PROMPT + projectAnalysis;

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

  // 배포 준비도 종합 평가
  async evaluateDeploymentReadiness(): Promise<string> {
    const prompt = `NaviDate 프로젝트의 배포 준비도를 종합 평가해주세요.

다음 형식으로 응답해주세요:

## 배포 준비도 평가

### 종합 점수: X/100

### 카테고리별 점수
| 카테고리 | 점수 | 상태 |
|---------|------|------|
| 코드 품질 | X/20 | ✅/⚠️/❌ |
| 보안 | X/25 | ✅/⚠️/❌ |
| 성능 | X/20 | ✅/⚠️/❌ |
| 테스트 | X/20 | ✅/⚠️/❌ |
| 환경설정 | X/15 | ✅/⚠️/❌ |

### Critical 이슈 (배포 차단)
1. [이슈와 해결방법]

### High 이슈 (수정 권장)
1. [이슈와 해결방법]

### 배포 전 필수 조치
1. [구체적 액션]
2. [구체적 액션]

### 배포 가능 여부
[✅ 배포 가능 / ⚠️ 조건부 가능 / ❌ 배포 불가]

### 권장 배포 절차
1. [단계]
2. [단계]`;

    return this.ask(prompt);
  }

  // Vercel 배포 가이드
  async getVercelDeploymentGuide(): Promise<string> {
    const prompt = `NaviDate 프로젝트의 Vercel 배포 가이드를 작성해주세요.

현재 상황:
- Frontend: React + Vite (데이트채팅서비스/frontend)
- Backend: Express + Socket.io (데이트채팅서비스/backend)
- Database: MongoDB Atlas

다음 내용을 포함해주세요:
1. 프론트엔드 Vercel 배포 단계
2. 백엔드 배포 옵션 (Vercel Serverless vs Railway)
3. 환경변수 설정 목록
4. vercel.json 설정 예시
5. 배포 후 확인 사항
6. 흔한 문제와 해결책`;

    return this.ask(prompt);
  }

  // 보안 점검
  async performSecurityReview(): Promise<string> {
    const prompt = `NaviDate 프로젝트의 보안 점검을 수행해주세요.

다음 항목을 점검해주세요:

### 인증/인가
- JWT 토큰 구현 상태
- 비밀번호 해싱 (bcrypt)
- 세션 관리

### 입력 검증
- SQL/NoSQL Injection 방어
- XSS 방어
- CSRF 방어

### 민감 정보
- 환경변수 관리
- API 키 노출 여부
- 로그 내 민감정보

### 네트워크
- HTTPS 강제
- CORS 설정
- 헤더 보안

각 항목에 대해:
- [✅/⚠️/❌] 상태
- 현재 구현 상태
- 필요한 조치`;

    return this.ask(prompt);
  }

  // 테스트 전략 제안
  async proposeTestStrategy(): Promise<string> {
    const prompt = `NaviDate 프로젝트의 테스트 전략을 제안해주세요.

현재 기능:
- 회원가입/로그인
- 커플 코드 연결
- 실시간 채팅
- AI 추천
- 커플 싱크 (스와이프)

다음 내용을 포함해주세요:

### 단위 테스트
- 테스트할 함수/컴포넌트
- 추천 테스트 프레임워크
- 예시 테스트 코드

### 통합 테스트
- API 엔드포인트 테스트
- DB 연동 테스트

### E2E 테스트
- 핵심 시나리오
- 추천 도구 (Playwright/Cypress)

### 테스트 우선순위
1. [가장 중요한 테스트]
2. [두번째]
3. [세번째]`;

    return this.ask(prompt);
  }

  // 롤백 계획 수립
  async createRollbackPlan(): Promise<string> {
    const prompt = `NaviDate 배포의 롤백 계획을 수립해주세요.

다음 내용을 포함해주세요:

### 롤백 트리거 조건
- 자동 롤백 조건
- 수동 롤백 판단 기준

### 롤백 절차
1. Vercel 롤백 명령
2. Git 기반 롤백
3. DB 롤백 (필요시)

### 롤백 체크리스트
- [ ] 확인 항목들

### 롤백 후 조치
- 원인 분석
- 재배포 기준

### 비상 연락망
- 에스컬레이션 단계`;

    return this.ask(prompt);
  }

  // 성능 최적화 권장사항
  async getPerformanceRecommendations(): Promise<string> {
    const prompt = `NaviDate 프로젝트의 성능 최적화 권장사항을 제시해주세요.

다음 영역을 분석해주세요:

### 프론트엔드
- 번들 크기 최적화
- 코드 스플리팅
- 이미지 최적화
- 캐싱 전략

### 백엔드
- API 응답 시간
- DB 쿼리 최적화
- 커넥션 풀링
- 캐싱 (Redis)

### 실시간 통신
- Socket.io 최적화
- 재연결 전략

### 측정 방법
- Lighthouse 점수 목표
- API 성능 기준
- 모니터링 도구`;

    return this.ask(prompt);
  }

  // 대화 초기화
  resetConversation(): void {
    this.conversationHistory = [];
  }
}

// CLI 인터페이스
async function main() {
  const agent = new TPMAgent();

  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║              NaviDate TPM Agent v1.0                          ║
║         20년차 시니어 TPM의 배포/테스트 전문가                  ║
╠═══════════════════════════════════════════════════════════════╣
║  명령어:                                                       ║
║  /deploy    - 배포 준비도 종합 평가                            ║
║  /vercel    - Vercel 배포 가이드                               ║
║  /security  - 보안 점검                                        ║
║  /test      - 테스트 전략 제안                                 ║
║  /rollback  - 롤백 계획 수립                                   ║
║  /perf      - 성능 최적화 권장사항                             ║
║  /build     - 빌드 테스트 실행                                 ║
║  /lint      - 린트 검사 실행                                   ║
║  /audit     - 보안 감사 (npm audit)                            ║
║  /reset     - 대화 초기화                                      ║
║  /quit      - 종료                                             ║
║                                                                ║
║  또는 자유롭게 질문하세요.                                      ║
╚═══════════════════════════════════════════════════════════════╝
  `);

  const readline = await import("readline");
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const prompt = () => {
    rl.question("\n🔧 TPM Agent > ", async (input: string) => {
      const trimmed = input.trim();

      if (!trimmed) {
        prompt();
        return;
      }

      if (trimmed === "/quit") {
        console.log("TPM Agent를 종료합니다. 안전한 배포 되세요!");
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

        switch (trimmed) {
          case "/deploy":
            console.log("\n⏳ 배포 준비도 평가 중...\n");
            response = await agent.evaluateDeploymentReadiness();
            break;
          case "/vercel":
            console.log("\n⏳ Vercel 배포 가이드 생성 중...\n");
            response = await agent.getVercelDeploymentGuide();
            break;
          case "/security":
            console.log("\n⏳ 보안 점검 중...\n");
            response = await agent.performSecurityReview();
            break;
          case "/test":
            console.log("\n⏳ 테스트 전략 수립 중...\n");
            response = await agent.proposeTestStrategy();
            break;
          case "/rollback":
            console.log("\n⏳ 롤백 계획 수립 중...\n");
            response = await agent.createRollbackPlan();
            break;
          case "/perf":
            console.log("\n⏳ 성능 최적화 분석 중...\n");
            response = await agent.getPerformanceRecommendations();
            break;
          case "/build":
            response = await agent.runBuildTest();
            break;
          case "/lint":
            response = await agent.runLintCheck();
            break;
          case "/audit":
            response = await agent.runSecurityAudit();
            break;
          default:
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
export { TPMAgent, DeploymentScore, CheckResult, DeploymentReport };

// 직접 실행 시
main().catch(console.error);
