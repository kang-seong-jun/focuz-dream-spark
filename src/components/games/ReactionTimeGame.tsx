import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";

interface ReactionTimeGameProps {
  onComplete: (metrics: Record<string, any>) => void;
  isBaseline?: boolean;
}

export function ReactionTimeGame({ onComplete, isBaseline = false }: ReactionTimeGameProps) {
  // Game state
  const [gameState, setGameState] = useState<'instruction' | 'waiting' | 'stimulus' | 'feedback' | 'finished'>('instruction');
  const [stimulusType, setStimulusType] = useState<'target' | 'nontarget' | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isEarly, setIsEarly] = useState(false);
  
  // Game metrics
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [commissionErrors, setCommissionErrors] = useState(0);
  const [omissionErrors, setOmissionErrors] = useState(0);
  const [trialCount, setTrialCount] = useState(0);
  const [targetTrials, setTargetTrials] = useState(0);
  
  // Timer refs
  const stimulusTimer = useRef<number | null>(null);
  const responseTimer = useRef<number | null>(null);
  const stimulusStartTime = useRef<number | null>(null);
  
  // Constants
  const MAX_TRIALS = 5; // Total number of trials (5회)
  const NON_TARGET_RATIO = 0; // 빨간 네모(비타겟) 없음, 항상 target만
  const MIN_WAIT_TIME = 1000; // Minimum wait time in ms
  const MAX_WAIT_TIME = 3000; // Maximum wait time in ms
  const RESPONSE_TIMEOUT = 1500; // Maximum time to respond in ms
  
  // Reset the game state for a new trial
  const resetForNewTrial = useCallback(() => {
    setGameState('waiting');
    setStimulusType(null);
    setIsEarly(false);
    
    // Clear any existing timers
    if (stimulusTimer.current) {
      clearTimeout(stimulusTimer.current);
    }
    if (responseTimer.current) {
      clearTimeout(responseTimer.current);
    }
    
    // Determine the wait time for this trial
    const waitTime = Math.floor(Math.random() * (MAX_WAIT_TIME - MIN_WAIT_TIME) + MIN_WAIT_TIME);
    
    // Set timer for stimulus
    stimulusTimer.current = window.setTimeout(() => {
      // 항상 target만 등장
      setStimulusType('target');
      setGameState('stimulus');
      stimulusStartTime.current = Date.now();
      
      // Set timeout for response
      responseTimer.current = window.setTimeout(() => {
        // 항상 target만 등장하므로 바로 반응속도 측정
        if (stimulusType === 'target') {
          const reactionTime = Date.now() - (stimulusStartTime.current || Date.now());
          // Only count physiologically plausible reaction times
          if (reactionTime >= 100 && reactionTime <= 1500) {
            setReactionTimes(prev => [...prev, reactionTime]);
          }
        }
        handleNextTrial();
      }, RESPONSE_TIMEOUT);
    }, waitTime);
  }, [stimulusType]);
  
  // Start the game
  const handleStart = () => {
    setTrialCount(0);
    setTargetTrials(0);
    setReactionTimes([]);
    setCommissionErrors(0);
    setOmissionErrors(0);
    resetForNewTrial();
  };
  
  // Handle user click response
  const handleResponse = () => {
    // If we're not in the stimulus phase, it's either too early or during fixation
    if (gameState === 'waiting') {
      setIsEarly(true);
      setCommissionErrors(prev => prev + 1);
      toast({
        title: "너무 빠릅니다!",
        description: "자극이 나타난 후에 반응하세요.",
        variant: "destructive",
      });
      
      // Clear stimulus timer and continue with next trial
      if (stimulusTimer.current) {
        clearTimeout(stimulusTimer.current);
        stimulusTimer.current = null;
      }
      
      setTimeout(() => {
        setIsEarly(false);
        handleNextTrial();
      }, 1000);
      
      return;
    }
    
    // Clear response timer
    if (responseTimer.current) {
      clearTimeout(responseTimer.current);
      responseTimer.current = null;
    }
    
    handleNextTrial();
  };
  
  // Move to next trial or finish game
  const handleNextTrial = () => {
    // Increment trial counter
    setTrialCount(prev => prev + 1);
    
    // Update target trial count if this was a target
    if (stimulusType === 'target') {
      setTargetTrials(prev => prev + 1);
    }
    
    // Clear timers
    if (stimulusTimer.current) {
      clearTimeout(stimulusTimer.current);
      stimulusTimer.current = null;
    }
    if (responseTimer.current) {
      clearTimeout(responseTimer.current);
      responseTimer.current = null;
    }
    
    // If we've reached the max trials, finish the game
    if (trialCount >= MAX_TRIALS - 1) {
      finishGame();
    } else {
      // Otherwise start next trial
      resetForNewTrial();
    }
  };
  
  // Handle game finish
  const finishGame = () => {
    setGameState('finished');
    
    // Calculate metrics
    const validReactionTimes = reactionTimes.filter(rt => rt >= 100 && rt <= 1500);
    const averageReactionTime = validReactionTimes.length > 0 
      ? validReactionTimes.reduce((sum, rt) => sum + rt, 0) / validReactionTimes.length 
      : 0;
    
    // Calculate standard deviation
    const variance = validReactionTimes.length > 0
      ? validReactionTimes.reduce((sum, rt) => sum + Math.pow(rt - averageReactionTime, 2), 0) / validReactionTimes.length
      : 0;
    const stdDeviation = Math.sqrt(variance);
    
    // Calculate other metrics
    const totalTargetTrials = targetTrials;
    const omissionErrorRate = totalTargetTrials > 0 ? omissionErrors / totalTargetTrials : 0;
    const score = calculateScore(averageReactionTime, commissionErrors, omissionErrors);
    
    const metrics = {
      averageReactionTime,
      stdDeviation,
      commissionErrors,
      omissionErrors,
      omissionErrorRate,
      trials: trialCount,
      score,
      meanReactionTime: averageReactionTime, // For compatibility with existing code
    };
    
    onComplete(metrics);
  };
  
  // Toggle pause state
  const togglePause = () => {
    setIsPaused(prev => !prev);
  };
  
  // Calculate score based on reaction time and errors
  const calculateScore = (meanRT: number, commission: number, omission: number) => {
    // Lower reaction time is better (up to a point)
    // Fewer errors is better
    
    // Base score depends on reaction time (faster = better)
    let rtScore = 0;
    if (meanRT > 0) {
      // Map reaction time between 100ms and 500ms to a score between 100 and 0
      rtScore = Math.max(0, Math.min(100, 100 - ((meanRT - 100) / 4)));
    }
    
    // Penalty for errors (each error reduces score by 10 points)
    const errorPenalty = (commission + omission) * 10;
    
    return Math.max(0, rtScore - errorPenalty);
  };
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stimulusTimer.current) clearTimeout(stimulusTimer.current);
      if (responseTimer.current) clearTimeout(responseTimer.current);
    };
  }, []);

  // Handle pause/resume
  useEffect(() => {
    if (isPaused) {
      // Clear timers during pause
      if (stimulusTimer.current) {
        clearTimeout(stimulusTimer.current);
        stimulusTimer.current = null;
      }
      if (responseTimer.current) {
        clearTimeout(responseTimer.current);
        responseTimer.current = null;
      }
    } else if (gameState === 'waiting') {
      // Resume with a new trial if we were in waiting state
      resetForNewTrial();
    }
  }, [isPaused, gameState, resetForNewTrial]);

  return (
    <Card className="w-full max-w-md mx-auto bg-white/95 backdrop-blur-sm shadow-lg border-0">
      <CardHeader className="border-b pb-3">
        <CardTitle className="text-center">초록 불을 잡아라!</CardTitle>
        <div className="absolute right-4 top-4">
          {gameState !== 'instruction' && gameState !== 'finished' && (
            <Button variant="outline" size="sm" onClick={togglePause}>
              {isPaused ? "계속하기" : "일시정지"}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-6 pb-4 min-h-[300px] flex flex-col items-center justify-center">
        {gameState === 'instruction' && (
          <div className="text-center space-y-4">
            <p className="text-lg">화면에 초록색 원이 나타나면 최대한 빠르게 클릭하세요.</p>
            <Button onClick={handleStart}>시작하기</Button>
          </div>
        )}

        {gameState === 'waiting' && !isPaused && (
          <div className="flex flex-col items-center justify-center h-60">
            {isEarly ? (
              <p className="text-xl text-destructive font-bold">너무 빠릅니다!</p>
            ) : (
              <div className="text-4xl">+</div>
            )}
            <p className="mt-4 text-sm text-muted-foreground">자극이 나타날 때까지 기다리세요</p>
          </div>
        )}

        {gameState === 'stimulus' && !isPaused && (
          <div 
            className="w-40 h-40 flex items-center justify-center cursor-pointer"
            onClick={handleResponse}
          >
            <div className="w-32 h-32 rounded-full bg-green-500 animate-scale-in"></div>
          </div>
        )}

        {isPaused && (
          <div className="text-center space-y-4">
            <p className="text-xl">게임이 일시 정지되었습니다</p>
            <Button onClick={togglePause}>계속하기</Button>
          </div>
        )}

        {gameState === 'finished' && (
          <div className="text-center space-y-4">
            <h3 className="text-xl font-semibold">게임 완료!</h3>
            <p>점수 계산 중...</p>
          </div>
        )}
        
        {!isPaused && gameState !== 'instruction' && gameState !== 'finished' && (
          <div className="absolute top-4 left-4 p-2 bg-white/80 rounded text-sm">
            진행: {trialCount + 1}/{MAX_TRIALS}
          </div>
        )}

        {/* 매 트라이얼마다 반응속도 결과 표시 */}
        {!isPaused && gameState !== 'instruction' && gameState !== 'finished' && reactionTimes.length > 0 && (
          <div className="w-full mt-6 text-center">
            <div className="text-sm text-muted-foreground">
              최근 반응속도: <span className="font-semibold">{reactionTimes[reactionTimes.length-1]}ms</span><br />
              평균 반응속도: <span className="font-semibold">{(
                reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length
              ).toFixed(1)}ms</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
