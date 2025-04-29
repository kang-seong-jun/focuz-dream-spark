import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MainLayout } from "@/layouts/MainLayout";
import { useGame } from "@/context/GameContext";
import { useAuth } from "@/context/AuthContext";
import { GameType, GAME_TYPES } from "@/types";
import { ReactionTimeGame } from "@/components/games/ReactionTimeGame";
import { ProcessingSpeedGame } from "@/components/games/ProcessingSpeedGame";
import { WorkingMemoryGame } from "@/components/games/WorkingMemoryGame";
import { HexagonChart } from "@/components/dashboard/HexagonChart";
import { Card, CardContent } from "@/components/ui/card";

export default function CognitiveBaseline() {
  const navigate = useNavigate();
  const { saveGameResult, startGame, getBaselineResults } = useGame();
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'result' | 'complete'>('intro');
  const [currentGameIndex, setCurrentGameIndex] = useState(0);
  const [gameResults, setGameResults] = useState<Record<GameType, number | null>>({
    'RT': null,
    'PS': null,
    'WM2': null,
    'ATT': null,
    'DM': null,
    'WM': null
  });
  const [lastMetrics, setLastMetrics] = useState<Record<string, any> | null>(null);
  const processingGameComplete = useRef<boolean>(false);
  
  // List of games for baseline in fixed order - removed DM game
  const gameOrder: GameType[] = ['RT', 'PS', 'WM2'];
  const currentGame = gameOrder[currentGameIndex];
  
  // Debug logs to track progression between games
  useEffect(() => {
    console.log(`Current game index: ${currentGameIndex}, Current game: ${currentGame}`);
  }, [currentGameIndex, currentGame]);
  
  const handleStartBaseline = () => {
    setGameState('playing');
  };
  
  const handleGameComplete = (metrics: Record<string, any>) => {
    // Save game result as baseline
    saveGameResult(metrics, true);
    setGameResults(prev => ({
      ...prev,
      [currentGame]: getResultScore(currentGame, metrics)
    }));
    setLastMetrics(metrics);
    setGameState('result');
  };

  const handleNextGame = () => {
    if (currentGameIndex < gameOrder.length - 1) {
      setCurrentGameIndex(currentGameIndex + 1);
      setGameState('playing');
    } else {
      setGameState('complete');
    }
    setLastMetrics(null);
  };

  // Calculate a normalized score (0-100) for each game type based on metrics
  const getResultScore = (gameType: GameType, metrics: Record<string, any>): number => {
    if (typeof metrics.score === 'number' && !isNaN(metrics.score) && metrics.score !== null) {
      return Math.max(0, Math.round(metrics.score));
    }
    switch (gameType) {
      case 'RT': {
        const reactionTime = metrics.averageReactionTime || 1000;
        return Math.max(0, Math.min(100, 100 - ((reactionTime - 150) / 850) * 100));
      }
      case 'PS': {
        // 맞춘 개수와 평균 반응속도를 모두 반영한 점수화
        const correct = metrics.correctResponses || 0;
        const avgSpeed = metrics.timePerResponse || 1000;
        // 1000ms 이상이면 0점 패널티, 아니면 (맞춘개수*2)+(100-평균반응속도/10)
        let score = 0;
        if (avgSpeed >= 1000) {
          score = correct * 2;
        } else {
          score = correct * 2 + (100 - avgSpeed / 10);
        }
        return Math.max(0, Math.round(score));
      }
      case 'WM2': {
        const memorySpan = metrics.workingMemorySpan || 0;
        return Math.min(100, (memorySpan / 10) * 100);
      }
      default:
        return 50;
    }
  };
  
  const handleFinish = () => {
    navigate('/dashboard');
  };
  
  // Skip the current game and move to the next one
  const handleSkipGame = () => {
    // Prevent multiple calls
    if (processingGameComplete.current) return;
    processingGameComplete.current = true;
    
    // Check if we need to move to the next game
    if (currentGameIndex < gameOrder.length - 1) {
      // Calculate next index
      const nextIndex = currentGameIndex + 1;
      
      // Log for debugging
      console.log(`Skipping to next game: ${gameOrder[nextIndex]} (index: ${nextIndex})`);
      
      // Reset the processing flag after a short delay
      setTimeout(() => {
        processingGameComplete.current = false;
        
        // Update the state with the new index
        setCurrentGameIndex(nextIndex);
        
        // Start the next game with the new index value
        startGame(gameOrder[nextIndex]);
      }, 300);
    } else {
      // All games completed
      setGameState('complete');
      processingGameComplete.current = false;
    }
  };
  
  const renderCurrentGame = () => {
    switch(currentGame) {
      case 'RT':
        return <ReactionTimeGame onComplete={handleGameComplete} isBaseline={true} />;
      case 'PS':
        return <ProcessingSpeedGame onComplete={handleGameComplete} isBaseline={true} />;
      case 'WM2':
        return <WorkingMemoryGame onComplete={handleGameComplete} isBaseline={true} />;
      default:
        return null;
    }
  };
  
  // Format game results for display
  const formatGameResult = (gameType: GameType): string => {
    const baselineResults = getBaselineResults(user?.id || '');
    const gameResult = baselineResults.find(r => r.gameType === gameType);
    
    if (!gameResult) return '아직 측정되지 않음';
    
    switch (gameType) {
      case 'RT':
        return `평균 반응 시간: ${Math.round(gameResult.metrics.averageReactionTime)}ms`;
      case 'PS':
        return `처리 항목: ${gameResult.metrics.itemsProcessed}개 (정확도: ${Math.round(gameResult.metrics.accuracy * 100)}%)`;
      case 'WM2':
        return `기억력 점수: ${gameResult.metrics.score} (최대 패턴: ${gameResult.metrics.workingMemorySpan})`;
      default:
        return '결과 정보 없음';
    }
  };
  
  // Get user from game context
  const { user } = useAuth();
  
  // 각 게임 결과 요약
  const renderResultSummary = () => {
    if (!lastMetrics) return null;
    const score = getResultScore(currentGame, lastMetrics);
    return (
      <div className="text-center space-y-4">
        <h3 className="text-xl font-semibold">{GAME_TYPES[currentGame].fullName} 결과</h3>
        <div className="text-3xl font-bold text-primary">{score}점</div>
        <div className="mt-2 text-base">
          {currentGame === 'RT' && (
            <>
              <div>평균 반응 시간: <span className="font-semibold">{Math.round(lastMetrics.averageReactionTime)}ms</span></div>
            </>
          )}
          {currentGame === 'PS' && (
            <>
              <div>맞춘 개수: <span className="font-semibold">{lastMetrics.correctResponses}</span></div>
              <div>평균 반응속도: <span className="font-semibold">{(lastMetrics.timePerResponse || 0).toFixed(1)}ms</span></div>
              <div>정확도: <span className="font-semibold">{((lastMetrics.accuracy || 0) * 100).toFixed(1)}%</span></div>
            </>
          )}
          {currentGame === 'WM2' && (
            <>
              <div>기억 패턴 길이: <span className="font-semibold">{lastMetrics.workingMemorySpan}</span></div>
              <div>정확도: <span className="font-semibold">{((lastMetrics.accuracy || 0) * 100).toFixed(1)}%</span></div>
            </>
          )}
        </div>
        <Button className="w-full mt-4" size="lg" onClick={handleNextGame}>
          {currentGameIndex < gameOrder.length - 1 ? '다음 게임으로' : '최종 결과 보기'}
        </Button>
      </div>
    );
  };
  
  // 게임 시작 타이밍을 useEffect로 통일
  useEffect(() => {
    if (gameState === 'playing') {
      startGame(currentGame);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState, currentGame]);
  
  return (
    <MainLayout withNavigation={false}>
      <div className="min-h-[calc(100vh-2rem)] flex flex-col items-center justify-center p-4">
        {gameState === 'intro' && (
          <div className="max-w-md mx-auto p-6 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg space-y-6">
            <h1 className="text-2xl font-bold text-center">현재 인지 능력 측정하기</h1>
            
            <p className="text-center">
              이제 당신의 현재 인지 능력을 파악하기 위한 3가지 게임을 진행합니다. 
              각 게임은 평소 플레이하는 것과 동일한 버전이며, 완료까지 약 10~15분 이상 소요될 수 있습니다.
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
                초기 능력 측정 ({currentGameIndex + 1}/3): {GAME_TYPES[currentGame].fullName}
              </p>
            </div>
            
            {renderCurrentGame()}
          </div>
        )}
        
        {gameState === 'result' && (
          <div className="w-full max-w-md">
            {renderResultSummary()}
          </div>
        )}
        
        {gameState === 'complete' && (
          <div className="max-w-md mx-auto p-6 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg space-y-6">
            <h1 className="text-2xl font-bold text-center">측정 완료!</h1>
            
            <div className="h-48 mb-4">
              <HexagonChart gameResults={gameResults} className="w-full h-full" />
            </div>
            
            <div className="space-y-3">
              {gameOrder.map((gameType) => (
                <Card key={gameType} className="bg-white/80">
                  <CardContent className="py-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{GAME_TYPES[gameType].fullName}</p>
                        <p className="text-sm text-muted-foreground">{formatGameResult(gameType)}</p>
                      </div>
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        {gameResults[gameType] !== null && gameResults[gameType] !== undefined
                          ? Math.round(gameResults[gameType] as number)
                          : '-'}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="text-center mt-6">
              <div className="text-lg font-semibold">평균 점수: <span className="text-primary">{
                Math.round(
                  gameOrder.reduce((sum, type) => sum + (gameResults[type] || 0), 0) / gameOrder.length
                )
              }점</span></div>
            </div>
            
            <p className="text-center">
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
