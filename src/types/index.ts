
export interface User {
  id: string;
  username: string;
  nickname: string;
  baselineSleepProfile?: {
    q1: number;
    q2: number;
    q3: number;
    q4: number;
  };
  createdAt: string;
}

export interface SleepRecord {
  id: string;
  userId: string;
  timestamp: string;
  q1Answer: number;
  q2Answer: number;
  q3Answer: number;
  q4Answer: number;
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

export type GameType = 'WM' | 'RT' | 'ATT' | 'PS' | 'DM' | 'EF';

export interface GameTypeInfo {
  id: GameType;
  name: string;
  fullName: string;
  description: string;
  instructions: string;
  primaryMetric: string;
  secondaryMetrics: string[];
}

export const GAME_TYPES: Record<GameType, GameTypeInfo> = {
  'WM': {
    id: 'WM',
    name: '숫자 순서 기억하기',
    fullName: '작업 기억력',
    description: '연속으로 보여지는 숫자를 기억하고 순서대로 입력하세요',
    instructions: '화면에 나타나는 숫자를 순서대로 기억한 다음, 숫자가 모두 사라진 후 기억한 순서대로 입력하세요.',
    primaryMetric: 'memorySpan',
    secondaryMetrics: ['correctSequences', 'errorRate', 'avgTimePerSequence']
  },
  'RT': {
    id: 'RT',
    name: '초록 불을 잡아라!',
    fullName: '반응 속도',
    description: '초록색 원을 보자마자 빠르게 클릭하세요',
    instructions: '화면에 초록색 원이 나타나면 최대한 빠르게 클릭하세요. 빨간색 사각형이 나타나면 클릭하지 마세요.',
    primaryMetric: 'meanReactionTime',
    secondaryMetrics: ['stdDeviation', 'commissionErrors', 'omissionErrors']
  },
  'ATT': {
    id: 'ATT',
    name: 'X를 찾아라!',
    fullName: '주의력/집중력',
    description: '다양한 문자 중 특정 문자가 나타날 때 반응하세요',
    instructions: '화면에 연속으로 문자가 나타납니다. X를 제외한 모든 문자에 클릭하고, X가 나타나면 클릭하지 마세요.',
    primaryMetric: 'sustainedAttentionAccuracy',
    secondaryMetrics: ['omissionErrorRate', 'commissionErrorRate', 'meanRT']
  },
  'PS': {
    id: 'PS',
    name: '기호-숫자 변환',
    fullName: '정보 처리 속도',
    description: '기호와 숫자의 관계를 기억하여 빠르게 변환하세요',
    instructions: '화면 상단의 기호-숫자 짝을 기억하고, 아래에 나타나는 기호에 해당하는 숫자를 빠르게 입력하세요.',
    primaryMetric: 'correctResponses',
    secondaryMetrics: ['accuracy', 'timePerResponse']
  },
  'DM': {
    id: 'DM',
    name: '더 많은 쪽 고르기',
    fullName: '의사 결정 능력',
    description: '두 상자 중 더 많은 점이 있는 쪽을 빠르게 선택하세요',
    instructions: '좌우에 나타나는 두 상자 중 더 많은 점이 있는 쪽을 빠르게 선택하세요.',
    primaryMetric: 'decisionAccuracy',
    secondaryMetrics: ['meanCorrectRT', 'inverseEfficiencyScore']
  },
  'EF': {
    id: 'EF',
    name: '빨강엔 클릭! 파랑엔 정지!',
    fullName: '실행 기능 (억제)',
    description: '규칙에 따라 반응하거나 반응을 억제하세요',
    instructions: '빨간색 원이 나타나면 클릭하고, 파란색 사각형이 나타나면 반응하지 마세요.',
    primaryMetric: 'inhibitionAccuracy',
    secondaryMetrics: ['goTrialHitRate', 'goTrialMeanRT', 'commissionErrors', 'omissionErrors']
  }
};

export const SLEEP_QUESTIONS = [
  {
    question: "평소 몇 시간 정도 주무시는 편인가요?",
    options: ["5시간 미만", "5-6시간", "6-7시간", "7-8시간", "8시간 이상"]
  },
  {
    question: "평소 수면의 질은 어떻다고 느끼시나요?",
    options: ["매우 좋음", "좋음", "보통", "나쁨", "매우 나쁨"]
  },
  {
    question: "평소 낮 동안 얼마나 졸리다고 느끼시나요?",
    options: ["거의 안 졸림", "가끔 졸림", "자주 졸림", "항상 졸림"]
  },
  {
    question: "평소 잠을 자고 일어났을 때, 얼마나 개운하다고 느끼시나요?",
    options: ["매우 개운함", "개운함", "보통", "피곤함", "매우 피곤함"]
  }
];

export const DAILY_SLEEP_QUESTIONS = [
  {
    question: "어젯밤에는 총 몇 시간 주무셨나요?",
    options: ["5시간 미만", "5-6시간", "6-7시간", "7-8시간", "8시간 이상"]
  },
  {
    question: "어젯밤 수면의 질은 어땠다고 느끼시나요?",
    options: ["매우 좋음", "좋음", "보통", "나쁨", "매우 나쁨"]
  },
  {
    question: "지금 얼마나 졸리다고 느끼시나요?",
    options: ["전혀 안 졸림", "약간 졸림", "꽤 졸림", "매우 졸림"]
  },
  {
    question: "오늘 아침 일어났을 때 기분은 어떠셨나요?",
    options: ["매우 상쾌함", "상쾌함", "보통", "피곤함", "매우 피곤함"]
  }
];
