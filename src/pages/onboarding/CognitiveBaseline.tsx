
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MainLayout } from "@/layouts/MainLayout";
import { useGame } from "@/context/GameContext";
import { GameType, GAME_TYPES } from "@/types";
import { DigitSpanGame } from "@/components/games/DigitSpanGame";
import { ReactionTimeGame } from "@/components/games/ReactionTimeGame";
import { AttentionGame } from "@/components/games/AttentionGame";
import { ProcessingSpeedGame } from "@/components/games/ProcessingSpeedGame";
import { DecisionMakingGame } from "@/components/games/DecisionMakingGame";
import { WorkingMemoryGame } from "@/components/games/WorkingMemoryGame";

export default function CognitiveBaseline() {
  const navigate = useNavigate();
  const { saveGameResult, startGame } = useGame();
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'complete'>('intro');
  const [currentGameIndex, setCurrentGameIndex] = useState(0);
  
  // List of games for baseline in fixed order
  // Fix ordering here to ensure game 5 (DM) goes directly to game 6 (WM2)
  const gameOrder: GameType[] = ['WM', 'RT', 'ATT', 'PS', 'DM', 'WM2'];
  const currentGame = gameOrder[currentGameIndex];
  
  const handleStartBaseline = () => {
    startGame(currentGame); // Set the current game in context
    setGameState('playing');
  };
  
  const handleGameComplete = (metrics: Record<string, any>) => {
    // Save game result as baseline
    saveGameResult(metrics, true);
    
    // Move to next game or complete
    if (currentGameIndex < gameOrder.length - 1) {
      const nextGame = gameOrder[currentGameIndex + 1];
      setCurrentGameIndex(currentGameIndex + 1);
      // Start the next game in the context
      startGame(nextGame);
    } else {
      setGameState('complete');
    }
  };
  
  const handleFinish = () => {
    navigate('/dashboard');
  };
  
  const renderCurrentGame = () => {
    switch(currentGame) {
      case 'WM':
        return (
          <DigitSpanGame 
            onComplete={handleGameComplete} 
            isBaseline={true} 
          />
        );
      case 'RT':
        return (
          <ReactionTimeGame 
            onComplete={handleGameComplete} 
            isBaseline={true} 
          />
        );
      case 'ATT':
        return (
          <AttentionGame 
            onComplete={handleGameComplete} 
            isBaseline={true} 
          />
        );
      case 'PS':
        return (
          <ProcessingSpeedGame 
            onComplete={handleGameComplete} 
            isBaseline={true} 
          />
        );
      case 'DM':
        return (
          <DecisionMakingGame 
            onComplete={handleGameComplete} 
            isBaseline={true} 
          />
        );
      case 'WM2':
        return (
          <WorkingMemoryGame 
            onComplete={handleGameComplete} 
            isBaseline={true} 
          />
        );
      default:
        return null;
    }
  };
  
  return (
    <MainLayout withNavigation={false}>
      <div className="min-h-[calc(100vh-2rem)] flex flex-col items-center justify-center p-4">
        {gameState === 'intro' && (
          <div className="max-w-md mx-auto p-6 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg space-y-6">
            <h1 className="text-2xl font-bold text-center">현재 인지 능력 측정하기</h1>
            
            <p className="text-center">
              이제 당신의 현재 인지 능력을 파악하기 위한 6가지 게임을 진행합니다. 
              각 게임은 평소 플레이하는 것과 동일한 버전이며, 완료까지 약 15~20분 이상 소요될 수 있습니다.
            </p>
            
            <p className="text-center font-medium">
              집중할 수 있는 조용한 환경에서 시작해주시기 바랍니다.
            </p>
            
            <Button 
              className="w-full" 
              size="lg"
              onClick={handleStartBaseline}
            >
              측정 시작하기
            </Button>
          </div>
        )}
        
        {gameState === 'playing' && (
          <div className="w-full max-w-md">
            <div className="mb-4 text-center">
              <p className="text-sm text-muted-foreground">
                초기 능력 측정 ({currentGameIndex + 1}/6): {GAME_TYPES[currentGame].fullName}
              </p>
            </div>
            
            {renderCurrentGame()}
          </div>
        )}
        
        {gameState === 'complete' && (
          <div className="max-w-md mx-auto p-6 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg space-y-6 text-center">
            <h1 className="text-2xl font-bold">측정 완료!</h1>
            
            <p className="text-lg">
              초기 인지 능력 측정이 완료되었습니다. 
              이제 대시보드에서 당신의 프로필을 확인하고, 매일의 컨디션 변화를 기록해보세요.
            </p>
            
            <Button 
              className="w-full" 
              size="lg"
              onClick={handleFinish}
            >
              대시보드로 이동
            </Button>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
