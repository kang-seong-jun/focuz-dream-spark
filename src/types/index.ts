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

export const GAME_TYPES: Record<GameType, { name: string; fullName: string; description: string }> = {
  'WM': {
    name: '숫자 기억하기',
    fullName: '숫자 기억하기 (Working Memory)',
    description: '화면에 나타나는 숫자를 순서대로 기억하세요'
  },
  'RT': {
    name: '반응 속도',
    fullName: '반응 속도 (Reaction Time)',
    description: '초록 불을 잡아라! 초록색 원이 나타나면 빠르게 탭하세요'
  },
  'ATT': {
    name: '주의력',
    fullName: '주의력/집중력 (Attention/Focus)',
    description: 'X를 찾아라! X가 아닌 모든 글자에 반응하세요'
  },
  'PS': {
    name: '처리 속도',
    fullName: '정보 처리 속도 (Processing Speed)',
    description: '기호-숫자 변환! 기호에 맞는 숫자를 빠르게 입력하세요'
  },
  'DM': {
    name: '의사 결정',
    fullName: '의사 결정 능력 (Decision Making)',
    description: '더 많은 쪽 고르기! 더 많은 양이 있는 쪽을 선택하세요'
  },
  'WM2': {
    name: '패턴 기억하기',
    fullName: '패턴 기억하기 (Visual Working Memory)',
    description: '화면에 나타나는 패턴을 기억하고 같은 순서로 재현하세요'
  }
};
