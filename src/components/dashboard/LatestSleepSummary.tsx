
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { useSleep } from "@/context/SleepContext";
import { useGame } from "@/context/GameContext";
import { GAME_TYPES } from "@/types";

export function LatestSleepSummary() {
  const { user } = useAuth();
  const { getLatestSleepRecord } = useSleep();
  const { getLatestGameResult } = useGame();

  if (!user) return null;

  const latestSleep = getLatestSleepRecord(user.id);
  const latestGame = getLatestGameResult(user.id);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ko-KR', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit', 
      minute: '2-digit'
    }).format(date);
  };

  // Format the game result display
  const formatGameResult = () => {
    if (!latestGame) return "아직 게임 기록이 없습니다";

    const gameInfo = GAME_TYPES[latestGame.gameType];
    
    // Primary metric value
    const metricValue = latestGame.metrics[gameInfo.primaryMetric];
    
    // Format the value based on the metric type
    let formattedValue = metricValue;
    if (typeof metricValue === 'number') {
      if (latestGame.gameType === 'RT') {
        formattedValue = `${metricValue.toFixed(0)}ms`;
      } else if (gameInfo.primaryMetric.toLowerCase().includes('accuracy') || 
                gameInfo.primaryMetric.toLowerCase().includes('rate')) {
        formattedValue = `${(metricValue * 100).toFixed(1)}%`;
      } else if (metricValue < 1) {
        formattedValue = metricValue.toFixed(2);
      } else {
        formattedValue = metricValue.toFixed(1);
      }
    }

    return `${gameInfo.name}: ${formattedValue}`;
  };

  return (
    <Card className="bg-white/95 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">오늘의 요약</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {latestSleep ? (
          <>
            <div className="flex justify-between">
              <span className="text-muted-foreground">마지막 체크인</span>
              <span className="font-medium">{formatDate(latestSleep.timestamp)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">수면 점수</span>
              <span className="font-medium">{latestSleep.calculatedSleepScore}점</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">최근 게임</span>
              <span className="font-medium">{formatGameResult()}</span>
            </div>
          </>
        ) : (
          <p className="text-center py-4 text-muted-foreground">
            오늘의 컨디션을 체크하고 게임을 시작하세요!
          </p>
        )}
      </CardContent>
    </Card>
  );
}
