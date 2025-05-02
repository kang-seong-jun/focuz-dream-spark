export interface User {
  id: string;
  username: string;
  nickname: string;
  createdAt: string;
  baselineSleepProfile?: {
    q1: number;
    q2: number;
    q3: number;
    q4: number;
  };
}

export interface SleepRecord {
  id: string;
  userId: string;
  timestamp: string;
  answers: number[];
  calculatedSleepScore: number;
}

export interface GameResult {
  id: string;
  userId: string;
  sleepRecordId?: string;
  gameType: GameType;
  timestamp: string;
  metrics: Record<string, any>;
  isBaseline: boolean;
}

export type GameType = 'WM' | 'RT' | 'ATT' | 'PS' | 'DM' | 'WM2';

export const GAME_TYPES: Record<GameType, { name: string; fullName: string; description: string; primaryMetric?: string }> = {
  'WM': {
    name: '숫자기억\n(준비중)',
    fullName: '숫자 기억',
    description: '화면에 나타나는 숫자를 순서대로 기억하세요',
    primaryMetric: 'memorySpan'
  },
  'RT': {
    name: '반응속도',
    fullName: '반응 속도',
    description: '초록 불을 잡아라! 초록색 원이 나타나면 빠르게 탭하세요',
    primaryMetric: 'meanReactionTime'
  },
  'ATT': {
    name: '주의집중\n(준비중)',
    fullName: '주의력',
    description: 'X를 찾아라! X가 아닌 모든 글자에 반응하세요',
    primaryMetric: 'sustainedAttentionAccuracy'
  },
  'PS': {
    name: '정보처리',
    fullName: '처리 속도',
    description: '기호-숫자 변환! 기호에 맞는 숫자를 빠르게 입력하세요',
    primaryMetric: 'correctResponses'
  },
  'DM': {
    name: '의사결정\n(준비중)',
    fullName: '판단력',
    description: '더 많은 쪽 고르기! 더 많은 점이 있는 쪽을 고르세요',
    primaryMetric: 'decisionAccuracy'
  },
  'WM2': {
    name: '패턴기억',
    fullName: '패턴 기억',
    description: '화면에 나타나는 패턴을 기억하고 같은 순서로 재현하세요',
    primaryMetric: 'patternSpan'
  }
} as const;

// Define sleep questionnaire interface
export interface SleepQuestion {
  headline: string;
  question: string;
  options: string[];
}

// Define baseline sleep questions
export const SLEEP_QUESTIONS: SleepQuestion[] = [
  {
    headline: "평소 수면 습관을 알려주세요 (1/4)",
    question: "평소 몇 시간 정도 주무시는 편인가요?",
    options: [
      "① 5시간 미만",
      "② 5-6시간",
      "③ 6-7시간",
      "④ 7-8시간",
      "⑤ 8시간 이상"
    ]
  },
  {
    headline: "평소 수면 습관을 알려주세요 (2/4)",
    question: "평소 수면의 질은 어떻다고 느끼시나요?",
    options: [
      "① 매우 좋음",
      "② 좋음",
      "③ 보통",
      "④ 나쁨",
      "⑤ 매우 나쁨"
    ]
  },
  {
    headline: "평소 수면 습관을 알려주세요 (3/4)",
    question: "평소 낮 동안 얼마나 졸리다고 느끼시나요?",
    options: [
      "① 거의 안 졸림",
      "② 가끔 졸림",
      "③ 자주 졸림",
      "④ 항상 졸림"
    ]
  },
  {
    headline: "평소 수면 습관을 알려주세요 (4/4)",
    question: "평소 잠을 자고 일어났을 때, 얼마나 개운하다고 느끼시나요?",
    options: [
      "① 매우 개운함",
      "② 개운함",
      "③ 보통",
      "④ 피곤함",
      "⑤ 매우 피곤함"
    ]
  }
];

// Define daily sleep questions
export const DAILY_SLEEP_QUESTIONS: SleepQuestion[] = [
  {
    headline: "오늘의 수면 컨디션을 알려주세요 (1/4)",
    question: "오늘 몇 시간 정도 주무셨나요?",
    options: [
      "① 5시간 미만",
      "② 5-6시간",
      "③ 6-7시간",
      "④ 7-8시간",
      "⑤ 8시간 이상"
    ]
  },
  {
    headline: "오늘의 수면 컨디션을 알려주세요 (2/4)",
    question: "오늘 수면의 질은 어떻다고 느끼시나요?",
    options: [
      "① 매우 좋음",
      "② 좋음",
      "③ 보통",
      "④ 나쁨",
      "⑤ 매우 나쁨"
    ]
  },
  {
    headline: "오늘의 수면 컨디션을 알려주세요 (3/4)",
    question: "오늘 낮 동안 얼마나 졸리다고 느끼시나요?",
    options: [
      "① 거의 안 졸림",
      "② 가끔 졸림",
      "③ 자주 졸림",
      "④ 항상 졸림"
    ]
  },
  {
    headline: "오늘의 수면 컨디션을 알려주세요 (4/4)",
    question: "오늘 잠을 자고 일어났을 때, 얼마나 개운하다고 느끼시나요?",
    options: [
      "① 매우 개운함",
      "② 개운함",
      "③ 보통",
      "④ 피곤함",
      "⑤ 매우 피곤함"
    ]
  }
];

// Calculate sleep score (0-100)
export const calculateSleepScore = (answers: number[]): number => {
  if (answers.length !== 4) return 0;

  let score = 0;

  // Q1: Sleep duration (0-40 points)
  // 6-7시간(2), 7-8시간(3)은 만점, 5-6시간(1)과 8시간 이상(4)은 감점, 5시간 미만(0)은 최저점
  const durationScores = [10, 30, 40, 40, 30];
  score += durationScores[answers[0]] || 0;

  // Q2: Sleep quality (0-20 points)
  // 매우 좋음(4) -> 20점, 매우 나쁨(0) -> 0점
  score += (4 - answers[1]) * 5;

  // Q3: Daytime sleepiness (0-20 points)
  // 거의 안 졸림(3) -> 20점, 항상 졸림(0) -> 0점
  score += (3 - answers[2]) * (20/3);

  // Q4: Morning freshness (0-20 points)
  // 매우 개운함(4) -> 20점, 매우 피곤함(0) -> 0점
  score += (4 - answers[3]) * 5;

  return Math.round(score);
};
