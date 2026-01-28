import Anthropic from "@anthropic-ai/sdk";
import * as fs from "fs";
import * as path from "path";

const client = new Anthropic();

// 보안 에이전트 프롬프트 로드
const securityPrompt = fs.readFileSync(
  path.join(__dirname, "security-agent-prompt.md"),
  "utf-8"
);

interface SecurityScanResult {
  grade: string;
  score: number;
  criticalIssues: string[];
  highIssues: string[];
  mediumIssues: string[];
  recommendations: string[];
}

interface SensitiveDataMatch {
  file: string;
  line: number;
  type: string;
  content: string;
}

// 민감정보 패턴
const SENSITIVE_PATTERNS = [
  { name: "MongoDB URI", pattern: /mongodb(\+srv)?:\/\/[^\s"']+/gi },
  { name: "Password", pattern: /(password|passwd|pwd)\s*[=:]\s*["'][^"']+["']/gi },
  { name: "API Key", pattern: /(api[_-]?key|apikey)\s*[=:]\s*["'][^"']+["']/gi },
  { name: "Secret", pattern: /(secret|token)\s*[=:]\s*["'][^"']+["']/gi },
  { name: "AWS Key", pattern: /AKIA[0-9A-Z]{16}/g },
  { name: "Private Key", pattern: /-----BEGIN (RSA |EC )?PRIVATE KEY-----/g },
  { name: "JWT", pattern: /eyJ[A-Za-z0-9-_]+\.eyJ[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/]*/g },
];

// 제외할 디렉토리
const EXCLUDED_DIRS = ["node_modules", ".git", "dist", "build", ".next"];

// 스캔할 파일 확장자
const SCAN_EXTENSIONS = [".js", ".ts", ".tsx", ".jsx", ".json", ".env", ".yaml", ".yml", ".md"];

/**
 * 디렉토리 재귀 탐색
 */
function walkDir(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (!EXCLUDED_DIRS.includes(file)) {
        walkDir(filePath, fileList);
      }
    } else {
      const ext = path.extname(file).toLowerCase();
      if (SCAN_EXTENSIONS.includes(ext)) {
        fileList.push(filePath);
      }
    }
  }

  return fileList;
}

/**
 * 파일에서 민감정보 탐지
 */
function scanFileForSensitiveData(filePath: string): SensitiveDataMatch[] {
  const matches: SensitiveDataMatch[] = [];

  try {
    const content = fs.readFileSync(filePath, "utf-8");
    const lines = content.split("\n");

    lines.forEach((line, index) => {
      for (const { name, pattern } of SENSITIVE_PATTERNS) {
        // 패턴 리셋
        pattern.lastIndex = 0;

        if (pattern.test(line)) {
          // 마스킹 처리
          const maskedContent = line.replace(
            /(:\/\/[^:]+:)[^@]+(@)/g,
            "$1****$2"
          ).replace(
            /["'][^"']{8,}["']/g,
            '"****"'
          );

          matches.push({
            file: filePath,
            line: index + 1,
            type: name,
            content: maskedContent.trim().substring(0, 100),
          });
        }
      }
    });
  } catch (error) {
    // 파일 읽기 실패 시 무시
  }

  return matches;
}

/**
 * .gitignore에 .env가 포함되어 있는지 확인
 */
function checkGitignore(projectRoot: string): boolean {
  const gitignorePath = path.join(projectRoot, ".gitignore");

  if (fs.existsSync(gitignorePath)) {
    const content = fs.readFileSync(gitignorePath, "utf-8");
    return content.includes(".env");
  }

  return false;
}

/**
 * 보안 스캔 실행
 */
async function runSecurityScan(projectRoot: string): Promise<SecurityScanResult> {
  console.log("🔒 NaviDate Security Agent 보안 스캔 시작...\n");

  const criticalIssues: string[] = [];
  const highIssues: string[] = [];
  const mediumIssues: string[] = [];
  const recommendations: string[] = [];

  // 1. 민감정보 스캔
  console.log("1️⃣ 민감정보 노출 스캔 중...");
  const files = walkDir(projectRoot);
  const allMatches: SensitiveDataMatch[] = [];

  for (const file of files) {
    const matches = scanFileForSensitiveData(file);
    allMatches.push(...matches);
  }

  if (allMatches.length > 0) {
    console.log(`   ⚠️ ${allMatches.length}건의 잠재적 민감정보 발견`);

    for (const match of allMatches) {
      // .env 파일은 경고만
      if (match.file.includes(".env")) {
        mediumIssues.push(`[${match.type}] ${match.file}:${match.line}`);
      } else {
        criticalIssues.push(`[${match.type}] ${match.file}:${match.line} - 코드에 민감정보 노출 가능`);
      }
    }
  } else {
    console.log("   ✅ 민감정보 노출 없음");
  }

  // 2. .gitignore 확인
  console.log("\n2️⃣ .gitignore 설정 확인 중...");
  if (checkGitignore(projectRoot)) {
    console.log("   ✅ .env 파일이 .gitignore에 포함됨");
  } else {
    highIssues.push(".env 파일이 .gitignore에 없음 - 민감정보 커밋 위험");
    console.log("   ❌ .env 파일이 .gitignore에 없음");
  }

  // 3. 환경변수 사용 확인
  console.log("\n3️⃣ 환경변수 사용 패턴 확인 중...");
  let envUsageCount = 0;
  for (const file of files) {
    if (file.endsWith(".js") || file.endsWith(".ts")) {
      try {
        const content = fs.readFileSync(file, "utf-8");
        if (content.includes("process.env.")) {
          envUsageCount++;
        }
      } catch {}
    }
  }
  console.log(`   ℹ️ ${envUsageCount}개 파일에서 환경변수 사용`);

  // 점수 계산
  let score = 100;
  score -= criticalIssues.length * 20;
  score -= highIssues.length * 10;
  score -= mediumIssues.length * 5;
  score = Math.max(0, score);

  // 등급 결정
  let grade: string;
  if (score >= 90) grade = "A";
  else if (score >= 80) grade = "B";
  else if (score >= 70) grade = "C";
  else if (score >= 60) grade = "D";
  else grade = "F";

  // 권장사항
  if (criticalIssues.length > 0) {
    recommendations.push("코드에서 하드코딩된 민감정보를 환경변수로 이동하세요");
    recommendations.push("노출된 자격증명(비밀번호, API키)을 즉시 교체하세요");
  }
  recommendations.push("정기적인 npm audit 실행을 권장합니다");
  recommendations.push("프로덕션 환경에서는 Secret Manager 사용을 권장합니다");

  return {
    grade,
    score,
    criticalIssues,
    highIssues,
    mediumIssues,
    recommendations,
  };
}

/**
 * 보안 리포트 생성
 */
function generateSecurityReport(result: SecurityScanResult): string {
  const timestamp = new Date().toISOString();

  let report = `
# 🔒 NaviDate 보안 점검 결과

**점검 일시:** ${timestamp}
**보안 등급:** ${result.grade}
**보안 점수:** ${result.score}/100

---

## 발견된 이슈

### 🔴 Critical (${result.criticalIssues.length}건)
${result.criticalIssues.length > 0
  ? result.criticalIssues.map(i => `- ${i}`).join("\n")
  : "- 없음"}

### 🟠 High (${result.highIssues.length}건)
${result.highIssues.length > 0
  ? result.highIssues.map(i => `- ${i}`).join("\n")
  : "- 없음"}

### 🟡 Medium (${result.mediumIssues.length}건)
${result.mediumIssues.length > 0
  ? result.mediumIssues.map(i => `- ${i}`).join("\n")
  : "- 없음"}

---

## 권장 조치 사항

${result.recommendations.map((r, i) => `${i + 1}. ${r}`).join("\n")}

---

## 조치 우선순위

1. **즉시 조치** - Critical 이슈 해결
2. **24시간 내** - High 이슈 해결
3. **1주일 내** - Medium 이슈 해결

---

*NaviDate Security Agent v1.0*
*"Trust Nothing, Verify Everything"*
`;

  return report;
}

/**
 * Claude를 통한 심층 분석
 */
async function analyzeWithClaude(
  projectInfo: string,
  scanResult: SecurityScanResult
): Promise<string> {
  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2000,
    system: securityPrompt,
    messages: [
      {
        role: "user",
        content: `다음 프로젝트의 보안 스캔 결과를 분석하고 추가 권장사항을 제시해주세요:

프로젝트 정보:
${projectInfo}

스캔 결과:
- 등급: ${scanResult.grade}
- 점수: ${scanResult.score}/100
- Critical 이슈: ${scanResult.criticalIssues.length}건
- High 이슈: ${scanResult.highIssues.length}건
- Medium 이슈: ${scanResult.mediumIssues.length}건

발견된 이슈:
${[...scanResult.criticalIssues, ...scanResult.highIssues].join("\n")}

추가적인 보안 권장사항과 구체적인 조치 방법을 알려주세요.`,
      },
    ],
  });

  return response.content[0].type === "text" ? response.content[0].text : "";
}

/**
 * 메인 실행
 */
async function main() {
  const projectRoot = process.argv[2] || path.join(__dirname, "..");

  console.log("╔════════════════════════════════════════════╗");
  console.log("║    NaviDate Security Agent v1.0           ║");
  console.log("║    20년차 정보보안 전문가 에이전트        ║");
  console.log("╚════════════════════════════════════════════╝\n");

  // 보안 스캔 실행
  const scanResult = await runSecurityScan(projectRoot);

  // 리포트 생성
  console.log("\n📋 보안 리포트 생성 중...");
  const report = generateSecurityReport(scanResult);

  // 리포트 저장
  const reportPath = path.join(projectRoot, "security-report.md");
  fs.writeFileSync(reportPath, report);
  console.log(`✅ 리포트 저장됨: ${reportPath}`);

  // 결과 출력
  console.log("\n" + "=".repeat(50));
  console.log(`🔒 보안 등급: ${scanResult.grade} (${scanResult.score}/100)`);
  console.log("=".repeat(50));

  if (scanResult.criticalIssues.length > 0) {
    console.log("\n🔴 [Critical] 즉시 조치 필요:");
    scanResult.criticalIssues.forEach(issue => console.log(`   - ${issue}`));
  }

  if (scanResult.highIssues.length > 0) {
    console.log("\n🟠 [High] 24시간 내 조치 필요:");
    scanResult.highIssues.forEach(issue => console.log(`   - ${issue}`));
  }

  console.log("\n📌 권장 조치:");
  scanResult.recommendations.forEach((rec, i) => console.log(`   ${i + 1}. ${rec}`));

  return scanResult;
}

// 실행
main().catch(console.error);

export { runSecurityScan, generateSecurityReport, SensitiveDataMatch, SecurityScanResult };
