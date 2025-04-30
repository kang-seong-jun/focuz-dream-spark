import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MainLayout } from "@/layouts/MainLayout";
import { useAuth } from "@/context/AuthContext";
import { useGame } from "@/context/GameContext";
import { HexagonChart } from "@/components/dashboard/HexagonChart";
import { LatestSleepSummary } from "@/components/dashboard/LatestSleepSummary";
import { GameResultsCards } from "@/components/dashboard/GameResultsCards";
import { GameType } from '@/types';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const { getBaselineResults, getLatestGameResult } = useGame();
  
  // Redirect to login if no user
  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login');
    }
  }, [user, isLoading, navigate]);
  
  // If loading or no user, show loading
  if (isLoading || !user) {
    return <div>로딩 중...</div>;
  }

  // Get user's performance data for hexagon chart
  const getCognitiveData = () => {
    const gameTypes: GameType[] = ['WM', 'RT', 'ATT', 'PS', 'DM', 'WM2'];
    const gameResults: Record<GameType, number | null> = {
      'WM': null,
      'RT': null,
      'ATT': null, 
      'PS': null,
      'DM': null,
      'WM2': null
    };
    
    // Try to get latest results for each game type
    gameTypes.forEach(type => {
      const result = getLatestGameResult(user.id, type);
      
      if (result) {
        // Normalize the score to 0-100 scale - this is simplified
        // In a real app, you'd have proper normalization logic per game type
        let score: number;
        
        switch (type) {
          case 'WM':
          case 'WM2':
            // 패턴 기억 점수: 각 라운드별 점수 합계
            // 1라운드(4개): 20점 + 속도보너스 10점
            // 2라운드(6개): 30점 + 속도보너스 10점
            // 3라운드(8개): 40점 + 속도보너스 10점
            score = result.metrics.score || 0;
            break;
          case 'RT':
            // 반응속도 점수: 150ms가 100점, 1000ms가 0점
            const reactionTime = result.metrics.averageReactionTime || 1000;
            score = Math.round(Math.max(0, Math.min(100, 100 - ((reactionTime - 150) / 850) * 100)));
            break;
          case 'PS':
            // 정보처리 점수는 이미 0-100으로 정규화되어 있음
            score = typeof result.metrics.score === 'number' ? result.metrics.score : 0;
            break;
          default:
            // For other games, assuming metrics are already 0-100 or 0-1
            score = typeof result.metrics.primaryMetric === 'number' 
              ? (result.metrics.primaryMetric > 1 ? result.metrics.primaryMetric : result.metrics.primaryMetric * 100)
              : 50; // Default
        }
        
        gameResults[type] = Math.min(100, Math.max(0, score));
      } else {
        // Use baseline results if available
        const baselineResults = getBaselineResults(user.id);
        const baselineResult = baselineResults.find(r => r.gameType === type);
        
        if (baselineResult) {
          // Similar normalization logic
          gameResults[type] = 50; // Placeholder - would use proper normalization
        }
      }
    });
    
    return gameResults;
  };
  
  return (
    <MainLayout>
      <div className="space-y-6 pb-16">
        {/* Welcome section */}
        <div className="text-center md:text-left">
          <h1 className="text-2xl font-bold">안녕하세요, {user.nickname}님!</h1>
          <p className="text-muted-foreground">오늘의 컨디션을 체크하고 퍼포먼스를 기록해보세요.</p>
        </div>
        
        {/* Main content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left column: Hexagon profile */}
          <Card className="md:col-span-2 bg-white/95 backdrop-blur-sm border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">나의 인지 능력 프로필</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Hexagon Chart */}
                <div className="relative aspect-square w-full max-w-[300px] mx-auto">
                  <HexagonChart gameResults={getCognitiveData()} />
                </div>

                {/* Detailed Results */}
                <div className="space-y-4">
                  <div className="text-center md:text-left text-lg font-semibold mb-2">상세 결과</div>
                  
                  {/* Calculate average score */}
                  {(() => {
                    const results = getCognitiveData();
                    const scores = ['RT', 'PS', 'WM2'].map(type => results[type as GameType]).filter(score => score !== null) as number[];
                    const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
                    
                    return (
                      <div className="text-center md:text-left mb-4">
                        <span className="text-muted-foreground">전체 평균 점수: </span>
                        <span className="font-bold text-xl text-primary">{avgScore}점</span>
                      </div>
                    );
                  })()}

                  {/* Game Results */}
                  <div className="space-y-3">
                    {[
                      { type: 'RT' as GameType, name: '반응 속도', metricName: '평균 반응시간' },
                      { type: 'PS' as GameType, name: '정보 처리', metricName: '정확도/속도' },
                      { type: 'WM2' as GameType, name: '패턴 기억', metricName: '최대 패턴' }
                    ].map(game => {
                      const result = getLatestGameResult(user.id, game.type);
                      const score = getCognitiveData()[game.type];
                      
                      return (
                        <Card key={game.type} className="bg-white/80">
                          <CardContent className="py-3">
                            <div className="flex justify-between items-center">
                              <div className="space-y-1">
                                <div className="font-medium">{game.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {result ? (
                                    game.type === 'RT' ? 
                                      `${Math.round(result.metrics.averageReactionTime)}ms` :
                                    game.type === 'PS' ? 
                                      `${result.metrics.correctResponses}개 정답 (${(result.metrics.accuracy * 100).toFixed(1)}%)` :
                                    game.type === 'WM2' ? 
                                      `패턴 길이: ${result.metrics.workingMemorySpan}` :
                                      ''
                                  ) : '기록 없음'}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-semibold text-primary">
                                  {score !== null ? `${Math.round(score)}점` : '-'}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Right column: Daily summary */}
          <div className="space-y-6">
            <LatestSleepSummary />
            
            {/* Call to action */}
            <div className="bg-gradient-to-r from-focus-blue to-focus-purple rounded-lg p-6 text-white">
              <h3 className="font-bold mb-2">오늘의 체크인</h3>
              <p className="text-sm mb-4 opacity-90">지금 2분만 투자하여 오늘의 컨디션을 체크해보세요.</p>
              <Button 
                variant="secondary"
                className="w-full bg-white text-focus-purple hover:bg-white/90"
                onClick={() => navigate('/daily')}
              >
                오늘의 컨디션 체크 & 게임 시작
              </Button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
