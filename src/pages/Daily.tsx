import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/layouts/MainLayout";
import { useAuth } from "@/context/AuthContext";
import { useSleep } from "@/context/SleepContext";
import { useGame } from "@/context/GameContext";
import { DailySleepQuestionCard } from "@/components/onboarding/DailySleepQuestionCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GameType, GAME_TYPES } from "@/types";
import { ReactionTimeGame } from "@/components/games/ReactionTimeGame";
import { ProcessingSpeedGame } from "@/components/games/ProcessingSpeedGame";
import { WorkingMemoryGame } from "@/components/games/WorkingMemoryGame";

export default function Daily() {
  const { user, isLoading } = useAuth();
  const { saveDailySleepRecord } = useSleep();
  const { saveGameResult, startGame } = useGame();
  const navigate = useNavigate();

  // State
  const [answers, setAnswers] = useState<number[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [stage, setStage] = useState<'questions' | 'game' | 'results'>('questions');
  const [sleepScore, setSleepScore] = useState<number>(0);
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

  // Fixed game order as in onboarding
  const gameOrder: GameType[] = ['RT', 'PS', 'WM2'];
  const currentGame = gameOrder[currentGameIndex];

  // Redirect to login if no user
  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login');
    }
  }, [user, isLoading, navigate]);

  // Handle question answer
  const handleAnswer = (answer: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion - 1] = answer;
    setAnswers(newAnswers);
    
    if (currentQuestion < 4) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Save sleep record and proceed to game
      const sleepRecord = saveDailySleepRecord(newAnswers);
      setSleepScore(sleepRecord.calculatedSleepScore);
      setStage('game');
    }
  };

  // Calculate game score based on metrics
  const getResultScore = (gameType: GameType, metrics: Record<string, any>): number => {
    switch (gameType) {
      case 'RT': {
        const reactionTime = metrics.averageReactionTime || 1000;
        return Math.round(Math.max(0, Math.min(100, 100 - ((reactionTime - 150) / 850) * 100)));
      }
      case 'PS': {
        const correct = metrics.correctResponses ?? 0;
        const avgSpeed = metrics.timePerResponse ?? 1000;
        const accuracy = metrics.accuracy ?? 0;
        
        let baseScore = (correct / 20) * 60;  // 20개 맞추면 60점
        let speedBonus = 0;
        if (avgSpeed < 1000) {
          speedBonus = Math.round((1000 - avgSpeed) / 1000 * 20);
        }
        let accuracyBonus = Math.round(accuracy * 20);
        
        return Math.min(100, Math.round(baseScore + speedBonus + accuracyBonus));
      }
      case 'WM2': {
        return metrics.score || 0;
      }
      default:
        return 50;
    }
  };

  // Handle game completion
  const handleGameComplete = (metrics: Record<string, any>) => {
    const score = getResultScore(currentGame, metrics);
    
    // Save game result
    saveGameResult({
      ...metrics,
      score: score
    });

    setGameResults(prev => ({
      ...prev,
      [currentGame]: score
    }));
    setLastMetrics(metrics);

    if (currentGameIndex < gameOrder.length - 1) {
      // Move to next game
      setCurrentGameIndex(currentGameIndex + 1);
      startGame(gameOrder[currentGameIndex + 1]);
    } else {
      // All games completed, show results
      setStage('results');
    }
  };

  // Handle view dashboard
  const handleViewDashboard = () => {
    navigate('/dashboard');
  };

  // Handle view history
  const handleViewHistory = () => {
    navigate('/history');
  };

  // Render the current game
  const renderCurrentGame = () => {
    switch(currentGame) {
      case 'RT':
        return <ReactionTimeGame onComplete={handleGameComplete} />;
      case 'PS':
        return <ProcessingSpeedGame onComplete={handleGameComplete} />;
      case 'WM2':
        return <WorkingMemoryGame onComplete={handleGameComplete} />;
      default:
        return null;
    }
  };
  
  // Render game results
  const renderGameResults = () => {
    if (!lastMetrics) return null;
    
    const gameScores = gameOrder.map(gameType => ({
      name: GAME_TYPES[gameType].name,
      score: gameResults[gameType] || 0,
      metrics: gameType === currentGame ? lastMetrics : null
    }));

    return (
      <div className="space-y-6">
        {gameScores.map((game, index) => (
          <div key={index} className="bg-slate-50 p-4 rounded-md">
            <div className="flex justify-between mb-2">
              <span className="font-medium">{game.name}</span>
              <span className="font-medium">{game.score}점</span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Calculate average cognitive score
  const getAverageCognitiveScore = () => {
    const scores = gameOrder.map(gameType => gameResults[gameType] || 0);
    const total = scores.reduce((sum, score) => sum + score, 0);
    return Math.round(total / gameOrder.length);
  };

  // If loading or no user, show loading
  if (isLoading || !user) {
    return <div>로딩 중...</div>;
  }

  return (
    <MainLayout>
      <div className="min-h-[calc(100vh-15rem)] flex flex-col items-center justify-center p-4">
        {stage === 'questions' && (
          <DailySleepQuestionCard
            questionNumber={currentQuestion}
            onComplete={handleAnswer}
          />
        )}
        
        {stage === 'game' && (
          <div className="w-full max-w-md">
            <div className="mb-4 text-center">
              <p className="text-lg font-medium mb-2">{GAME_TYPES[currentGame].name}</p>
              <p className="text-sm text-muted-foreground mb-4">{GAME_TYPES[currentGame].description}</p>
            </div>
            
            {renderCurrentGame()}
          </div>
        )}
        
        {stage === 'results' && (
          <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm">
            <CardHeader className="border-b pb-3">
              <CardTitle className="text-center">오늘의 결과</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* Average Score */}
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">
                  {getAverageCognitiveScore()}점
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  오늘의 인지 능력 점수
                </p>
              </div>
              
              {/* Game Results */}
              <div className="space-y-3">
                <h3 className="font-medium">게임 결과</h3>
                {renderGameResults()}
              </div>
              
              {/* Sleep score */}
              <div className="space-y-3">
                <h3 className="font-medium">수면 점수</h3>
                <div className="bg-slate-50 p-4 rounded-md">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">오늘의 수면 점수:</span>
                    <span className="font-medium">{sleepScore}점</span>
                  </div>
                </div>
              </div>
              
              {/* Navigation buttons */}
              <div className="flex gap-4">
                <Button
                  className="flex-1"
                  variant="outline"
                  onClick={handleViewHistory}
                >
                  기록 보기
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleViewDashboard}
                >
                  대시보드
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
