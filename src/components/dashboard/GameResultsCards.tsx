
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { useGame } from "@/context/GameContext";
import { GameType, GAME_TYPES } from "@/types";
import { Award, Clock, Check } from "lucide-react";

export function GameResultsCards() {
  const { user } = useAuth();
  const { getLatestGameResult, getBaselineResults } = useGame();
  
  if (!user) return null;

  // Get results for the three main games
  const rtResult = getLatestGameResult(user.id, 'RT');
  const psResult = getLatestGameResult(user.id, 'PS');
  const wmResult = getLatestGameResult(user.id, 'WM2');
  
  // Format reaction time result
  const formatRT = () => {
    if (!rtResult) {
      const baselineResult = getBaselineResults(user.id).find(r => r.gameType === 'RT');
      if (!baselineResult) return "아직 측정되지 않음";
      return `평균 반응 시간: ${parseFloat(baselineResult.metrics.averageReactionTime.toFixed(3))/1000}s`;
    }
    return `평균 반응 시간: ${parseFloat(rtResult.metrics.averageReactionTime.toFixed(3))/1000}s`;
  };
  
  // Format processing speed result
  const formatPS = () => {
    if (!psResult) {
      const baselineResult = getBaselineResults(user.id).find(r => r.gameType === 'PS');
      if (!baselineResult) return "아직 측정되지 않음";
      return `처리 항목: ${baselineResult.metrics.itemsProcessed}개 (정확도: ${Math.round(baselineResult.metrics.accuracy * 100)}%)`;
    }
    return `처리 항목: ${psResult.metrics.itemsProcessed}개 (정확도: ${Math.round(psResult.metrics.accuracy * 100)}%)`;
  };
  
  // Format working memory result
  const formatWM = () => {
    if (!wmResult) {
      const baselineResult = getBaselineResults(user.id).find(r => r.gameType === 'WM2');
      if (!baselineResult) return "아직 측정되지 않음";
      return `점수: ${baselineResult.metrics.score} (최대 패턴: ${baselineResult.metrics.workingMemorySpan})`;
    }
    return `점수: ${wmResult.metrics.score} (최대 패턴: ${wmResult.metrics.workingMemorySpan})`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
      <Card className="bg-white/95 backdrop-blur-sm border-0">
        <CardContent className="flex items-center p-4">
          <div className="bg-focus-blue/10 rounded-full p-2 mr-3">
            <Clock className="h-5 w-5 text-focus-blue" />
          </div>
          <div>
            <h3 className="font-medium text-sm">{GAME_TYPES.RT.name}</h3>
            <p className="text-sm text-muted-foreground">{formatRT()}</p>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-white/95 backdrop-blur-sm border-0">
        <CardContent className="flex items-center p-4">
          <div className="bg-focus-purple/10 rounded-full p-2 mr-3">
            <Check className="h-5 w-5 text-focus-purple" />
          </div>
          <div>
            <h3 className="font-medium text-sm">{GAME_TYPES.PS.name}</h3>
            <p className="text-sm text-muted-foreground">{formatPS()}</p>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-white/95 backdrop-blur-sm border-0">
        <CardContent className="flex items-center p-4">
          <div className="bg-focus-blue/10 rounded-full p-2 mr-3">
            <Award className="h-5 w-5 text-focus-blue" />
          </div>
          <div>
            <h3 className="font-medium text-sm">{GAME_TYPES.WM2.name}</h3>
            <p className="text-sm text-muted-foreground">{formatWM()}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
