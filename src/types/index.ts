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
    name: '숫자',
    fullName: '숫자 기억',
    description: '화면에 나타나는 숫자를 순서대로 기억하세요',
    primaryMetric: 'memorySpan'
  },
  'RT': {
    name: '반응',
    fullName: '반응 속도',
    description: '초록 불을 잡아라! 초록색 원이 나타나면 빠르게 탭하세요',
    primaryMetric: 'meanReactionTime'
  },
  'ATT': {
    name: '주의',
    fullName: '주의력',
    description: 'X를 찾아라! X가 아닌 모든 글자에 반응하세요',
    primaryMetric: 'sustainedAttentionAccuracy'
  },
  'PS': {
    name: '처리',
    fullName: '처리 속도',
    description: '기호-숫자 변환! 기호에 맞는 숫자를 빠르게 입력하세요',
    primaryMetric: 'correctResponses'
  },
  'DM': {
    name: '판단',
    fullName: '판단력',
    description: '더 많은 쪽 고르기! 더 많은 양이 있는 쪽을 선택하세요',
    primaryMetric: 'decisionAccuracy'
  },
  'WM2': {
    name: '패턴',
    fullName: '패턴 기억',
    description: '화면에 나타나는 패턴을 기억하고 같은 순서로 재현하세요',
    primaryMetric: 'workingMemorySpan'
  }
};

// Define sleep questionnaire interface
export interface SleepQuestion {
  question: string;
  options: string[];
}

// Define baseline sleep questions
export const SLEEP_QUESTIONS: SleepQuestion[] = [
  {
    question: "평소 수면 시간은 어느 정도입니까?",
    options: [
      "5시간 미만",
      "5-6시간",
      "7-8시간", 
      "9-10시간",
      "10시간 초과"
    ]
  },
  {
    question: "잠드는데 얼마나 걸리나요?",
    options: [
      "5분 이내",
      "5-15분",
      "15-30분",
      "30분-1시간", 
      "1시간 이상"
    ]
  },
  {
    question: "낮에 졸린 느낌이 자주 드나요?",
    options: [
      "거의 없음",
      "가끔 있음",
      "자주 있음", 
      "매우 자주 있음"
    ]
  },
  {
    question: "아침에 일어날 때 컨디션이 어떠신가요?",
    options: [
      "매우 개운함",
      "개운함",
      "보통", 
      "피곤함",
      "매우 피곤함"
    ]
  }
];

// Define daily sleep questions
export const DAILY_SLEEP_QUESTIONS: SleepQuestion[] = [
  {
    question: "어젯밤 수면 시간은 어느 정도였나요?",
    options: [
      "5시간 미만",
      "5-6시간",
      "7-8시간", 
      "9-10시간",
      "10시간 초과"
    ]
  },
  {
    question: "어젯밤 잠드는데 얼마나 걸렸나요?",
    options: [
      "5분 이내",
      "5-15분",
      "15-30분",
      "30분-1시간", 
      "1시간 이상"
    ]
  },
  {
    question: "오늘 낮에 졸린 느낌이 있나요?",
    options: [
      "거의 없음",
      "가끔 있음",
      "자주 있음", 
      "매우 자주 있음"
    ]
  },
  {
    question: "오늘 아침 일어났을 때 컨디션이 어땠나요?",
    options: [
      "매우 개운함",
      "개운함",
      "보통", 
      "피곤함",
      "매우 피곤함"
    ]
  }
];
