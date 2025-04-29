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
            // Higher is better
            score = result.metrics.memorySpan * 10; // Assuming span 1-10
            break;
          case 'RT':
            // Lower is better (reaction time)
            score = Math.max(0, 100 - (result.metrics.meanReactionTime / 5));
            break;
          case 'PS':
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
            <CardContent className="pt-4">
              <div className="aspect-square max-w-[400px] mx-auto">
                <HexagonChart gameResults={getCognitiveData()} />
              </div>
              <div className="text-center text-sm text-muted-foreground mt-4">
                {getBaselineResults(user.id).length > 0 ? '최근 기록 기준' : '초기 측정 결과'}
              </div>
              
              {/* Add Game Results Cards */}
              <GameResultsCards />
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
