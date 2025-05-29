
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { useGame } from "@/context/GameContext";
import { GameType, GAME_TYPES } from "@/types";
import { Zap, Cpu, Brain } from "lucide-react";

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
      return `점수: ${baselineResult.metrics.score} / 100점 (최대 패턴: ${baselineResult.metrics.workingMemorySpan})`;
    }
    return `점수: ${wmResult.metrics.score} / 100점 (최대 패턴: ${wmResult.metrics.workingMemorySpan})`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
      <Card className="relative overflow-hidden bg-gradient-to-br from-neon-yellow/20 to-electric-orange/20 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 group">
        <div className="absolute inset-0 bg-gradient-to-br from-neon-yellow/10 to-electric-orange/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <CardContent className="flex items-center p-6 relative z-10">
          <div className="bg-gradient-to-br from-neon-yellow to-electric-orange rounded-2xl p-3 mr-4 shadow-lg">
            <Zap className="h-6 w-6 text-black" />
          </div>
          <div>
            <h3 className="font-bold text-base text-gray-800 mb-1">{GAME_TYPES.RT.name}</h3>
            <p className="text-sm text-gray-700 font-medium">{formatRT()}</p>
          </div>
        </CardContent>
      </Card>
      
      <Card className="relative overflow-hidden bg-gradient-to-br from-electric-blue/20 to-neon-purple/20 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 group">
        <div className="absolute inset-0 bg-gradient-to-br from-electric-blue/10 to-neon-purple/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <CardContent className="flex items-center p-6 relative z-10">
          <div className="bg-gradient-to-br from-electric-blue to-neon-purple rounded-2xl p-3 mr-4 shadow-lg">
            <Cpu className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-base text-gray-800 mb-1">{GAME_TYPES.PS.name}</h3>
            <p className="text-sm text-gray-700 font-medium">{formatPS()}</p>
          </div>
        </CardContent>
      </Card>
      
      <Card className="relative overflow-hidden bg-gradient-to-br from-electric-pink/20 to-neon-purple/20 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 group">
        <div className="absolute inset-0 bg-gradient-to-br from-electric-pink/10 to-neon-purple/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <CardContent className="flex items-center p-6 relative z-10">
          <div className="bg-gradient-to-br from-electric-pink to-neon-purple rounded-2xl p-3 mr-4 shadow-lg">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-base text-gray-800 mb-1">{GAME_TYPES.WM2.name}</h3>
            <p className="text-sm text-gray-700 font-medium">{formatWM()}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
