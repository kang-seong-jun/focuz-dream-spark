
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
import { DigitSpanGame } from "@/components/games/DigitSpanGame";
import { ReactionTimeGame } from "@/components/games/ReactionTimeGame";
import { AttentionGame } from "@/components/games/AttentionGame";
import { ProcessingSpeedGame } from "@/components/games/ProcessingSpeedGame";
import { DecisionMakingGame } from "@/components/games/DecisionMakingGame";
import { ExecutiveFunctionGame } from "@/components/games/ExecutiveFunction";

export default function Daily() {
  const { user, isLoading } = useAuth();
  const { saveDailySleepRecord } = useSleep();
  const { getDailyGame, saveGameResult } = useGame();
  const navigate = useNavigate();

  // State
  const [answers, setAnswers] = useState<number[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [stage, setStage] = useState<'questions' | 'game' | 'results'>('questions');
  const [sleepScore, setSleepScore] = useState<number>(0);
  const [gameMetrics, setGameMetrics] = useState<Record<string, any> | null>(null);
  
  // Get today's game type
  const dailyGameType = getDailyGame();

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

  // Handle game completion
  const handleGameComplete = (metrics: Record<string, any>) => {
    setGameMetrics(metrics);
    
    // Save game result
    saveGameResult(metrics);
    
    // Show results
    setStage('results');
  };

  // Handle view dashboard
  const handleViewDashboard = () => {
    navigate('/dashboard');
  };

  // Handle view history
  const handleViewHistory = () => {
    navigate('/history');
  };

  // Render the current game based on daily game type
  const renderCurrentGame = () => {
    switch(dailyGameType) {
      case 'WM':
        return <DigitSpanGame onComplete={handleGameComplete} />;
      case 'RT':
        return <ReactionTimeGame onComplete={handleGameComplete} />;
      case 'ATT':
        return <AttentionGame onComplete={handleGameComplete} />;
      case 'PS':
        return <ProcessingSpeedGame onComplete={handleGameComplete} />;
      case 'DM':
        return <DecisionMakingGame onComplete={handleGameComplete} />;
      case 'EF':
        return <ExecutiveFunctionGame onComplete={handleGameComplete} />;
      default:
        return <DigitSpanGame onComplete={handleGameComplete} />;
    }
  };
  
  // Render appropriate game results based on game type
  const renderGameResults = () => {
    if (!gameMetrics) return null;
    
    switch(dailyGameType) {
      case 'WM':
        return (
          <>
            <div className="flex justify-between mb-2">
              <span className="text-muted-foreground">기억 용량:</span>
              <span className="font-medium">{gameMetrics.memorySpan}자리</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">정확도:</span>
              <span className="font-medium">{(100 - (gameMetrics.errorRate * 100)).toFixed(1)}%</span>
            </div>
          </>
        );
      case 'RT':
        return (
          <>
            <div className="flex justify-between mb-2">
              <span className="text-muted-foreground">평균 반응 시간:</span>
              <span className="font-medium">{gameMetrics.meanReactionTime.toFixed(0)}ms</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">정확도:</span>
              <span className="font-medium">
                {(100 * (1 - Math.min(gameMetrics.commissionErrors, 1) - Math.min(gameMetrics.omissionErrorRate, 1))).toFixed(1)}%
              </span>
            </div>
          </>
        );
      case 'ATT':
        return (
          <>
            <div className="flex justify-between mb-2">
              <span className="text-muted-foreground">집중력 정확도:</span>
              <span className="font-medium">{(gameMetrics.sustainedAttentionAccuracy * 100).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">평균 반응 시간:</span>
              <span className="font-medium">{gameMetrics.meanRT ? gameMetrics.meanRT.toFixed(0) : 0}ms</span>
            </div>
          </>
        );
      case 'PS':
        return (
          <>
            <div className="flex justify-between mb-2">
              <span className="text-muted-foreground">맞춘 개수:</span>
              <span className="font-medium">{gameMetrics.correctResponses}개</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">정확도:</span>
              <span className="font-medium">{(gameMetrics.accuracy * 100).toFixed(1)}%</span>
            </div>
          </>
        );
      case 'DM':
        return (
          <>
            <div className="flex justify-between mb-2">
              <span className="text-muted-foreground">결정 정확도:</span>
              <span className="font-medium">{(gameMetrics.decisionAccuracy * 100).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">평균 반응 시간:</span>
              <span className="font-medium">{gameMetrics.meanCorrectRT ? gameMetrics.meanCorrectRT.toFixed(0) : 0}ms</span>
            </div>
          </>
        );
      case 'EF':
        return (
          <>
            <div className="flex justify-between mb-2">
              <span className="text-muted-foreground">억제 정확도:</span>
              <span className="font-medium">{(gameMetrics.inhibitionAccuracy * 100).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">반응 억제 오류율:</span>
              <span className="font-medium">{(gameMetrics.commissionErrors * 100).toFixed(1)}%</span>
            </div>
          </>
        );
      default:
        return null;
    }
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
              <p className="text-lg font-medium mb-2">{GAME_TYPES[dailyGameType].name}</p>
              <p className="text-sm text-muted-foreground mb-4">{GAME_TYPES[dailyGameType].description}</p>
            </div>
            
            {renderCurrentGame()}
          </div>
        )}
        
        {stage === 'results' && gameMetrics && (
          <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm">
            <CardHeader className="border-b pb-3">
              <CardTitle className="text-center">{GAME_TYPES[dailyGameType].name} 결과</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* Score */}
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">
                  {gameMetrics.score}점
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  오늘의 점수
                </p>
              </div>
              
              {/* Game performance */}
              <div className="space-y-3">
                <h3 className="font-medium">게임 퍼포먼스</h3>
                <div className="bg-slate-50 p-4 rounded-md">
                  {renderGameResults()}
                </div>
              </div>
              
              {/* Sleep score */}
              <div className="space-y-3">
                <h3 className="font-medium">수면 점수</h3>
                <div className="bg-slate-50 p-4 rounded-md">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">이번 세션 수면 점수:</span>
                    <span className="font-medium">{sleepScore}점</span>
                  </div>
                </div>
              </div>
              
              {/* Insight */}
              <div className="bg-focus-lightPurple/50 p-4 rounded-md">
                <p className="text-sm">
                  {sleepScore > 70 
                    ? "오늘은 수면 점수가 좋네요! 컨디션을 유지하며 하루를 보내세요."
                    : "수면 점수가 평균보다 낮습니다. 오늘은 더 많은 휴식을 취하는 것이 좋겠어요."}
                </p>
              </div>
              
              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={handleViewHistory}
                >
                  히스토리 보기
                </Button>
                <Button 
                  className="flex-1"
                  onClick={handleViewDashboard}
                >
                  대시보드로 가기
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
