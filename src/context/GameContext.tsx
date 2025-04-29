import { createContext, useContext, useState, ReactNode } from 'react';
import { GameType, GameResult, GAME_TYPES } from '@/types';
import { toast } from "@/components/ui/use-toast";
import { useAuth } from './AuthContext';

interface GameContextType {
  currentGame: GameType | null;
  startGame: (gameType: GameType, isSleepRecordId?: string) => void;
  gameInProgress: boolean;
  saveGameResult: (metrics: Record<string, any>, isBaseline?: boolean) => void;
  getGameResults: (userId: string, gameType?: GameType) => GameResult[];
  getBaselineResults: (userId: string) => GameResult[];
  getLatestGameResult: (userId: string, gameType?: GameType) => GameResult | null;
  getDailyGame: () => GameType;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [currentGame, setCurrentGame] = useState<GameType | null>(null);
  const [currentSleepRecordId, setCurrentSleepRecordId] = useState<string | undefined>(undefined);
  const [gameInProgress, setGameInProgress] = useState(false);
  const { user } = useAuth();

  const startGame = (gameType: GameType, sleepRecordId?: string) => {
    setCurrentGame(gameType);
    setCurrentSleepRecordId(sleepRecordId);
    setGameInProgress(true);
  };

  const saveGameResult = (metrics: Record<string, any>, isBaseline = false) => {
    if (!user) {
      toast({
        title: "오류",
        description: "사용자 정보를 찾을 수 없습니다.",
        variant: "destructive",
      });
      return;
    }

    if (!currentGame) {
      toast({
        title: "오류",
        description: "현재 게임 정보를 찾을 수 없습니다.",
        variant: "destructive",
      });
      return;
    }

    const gameResult: GameResult = {
      id: Date.now().toString(),
      userId: user.id,
      sleepRecordId: currentSleepRecordId,
      gameType: currentGame,
      timestamp: new Date().toISOString(),
      metrics,
      isBaseline
    };

    // Save to local storage
    const storageKey = `focuz_game_results_${user.id}`;
    const existingResults = localStorage.getItem(storageKey);
    
    const results = existingResults ? JSON.parse(existingResults) : [];
    results.push(gameResult);
    
    localStorage.setItem(storageKey, JSON.stringify(results));

    setGameInProgress(false);
    setCurrentGame(null);
    setCurrentSleepRecordId(undefined);

    return gameResult;
  };

  const getGameResults = (userId: string, gameType?: GameType): GameResult[] => {
    const storageKey = `focuz_game_results_${userId}`;
    const existingResults = localStorage.getItem(storageKey);
    
    if (!existingResults) return [];
    
    const results: GameResult[] = JSON.parse(existingResults);
    
    if (gameType) {
      return results.filter(r => r.gameType === gameType);
    }
    
    return results;
  };

  const getBaselineResults = (userId: string): GameResult[] => {
    const results = getGameResults(userId);
    return results.filter(r => r.isBaseline);
  };

  const getLatestGameResult = (userId: string, gameType?: GameType): GameResult | null => {
    const results = getGameResults(userId, gameType);
    
    if (results.length === 0) return null;
    
    // Sort by timestamp descending
    results.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    return results[0];
  };

  // Get the daily game based on simple rotation
  const getDailyGame = (): GameType => {
    const gameTypes: GameType[] = ['WM', 'RT', 'ATT', 'PS', 'DM', 'WM2'];
    const today = new Date();
    // Simple rotation: day of month % number of games
    const index = today.getDate() % gameTypes.length;
    return gameTypes[index];
  };

  return (
    <GameContext.Provider value={{ 
      currentGame, 
      startGame, 
      gameInProgress,
      saveGameResult,
      getGameResults,
      getBaselineResults,
      getLatestGameResult,
      getDailyGame
    }}>
      {children}
    </GameContext.Provider>
  );
};
