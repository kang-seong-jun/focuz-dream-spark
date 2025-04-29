
import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DecisionMakingGameProps {
  onComplete: (metrics: Record<string, any>) => void;
  isBaseline?: boolean;
}

interface Trial {
  leftCount: number;
  rightCount: number;
}

export function DecisionMakingGame({ onComplete, isBaseline = false }: DecisionMakingGameProps) {
  // Game state
  const [gameState, setGameState] = useState<'instruction' | 'playing' | 'feedback' | 'finished'>('instruction');
  const [isPaused, setIsPaused] = useState(false);
  
  // Current trial
  const [currentTrial, setCurrentTrial] = useState<Trial | null>(null);
  const [trialStartTime, setTrialStartTime] = useState<number | null>(null);
  
  // Game metrics
  const [trialNumber, setTrialNumber] = useState(0);
  const [correctResponses, setCorrectResponses] = useState(0);
  const [incorrectResponses, setIncorrectResponses] = useState(0);
  const [responseTimes, setResponseTimes] = useState<number[]>([]);
  
  // Refs for timers
  const trialTimer = useRef<number | null>(null);
  const feedbackTimer = useRef<number | null>(null);
  
  // Constants - reduced trials from 30 to 10
  const TOTAL_TRIALS = 10;
  const TRIAL_TIMEOUT = 5000; // 5 seconds (increased from 3)
  const FEEDBACK_DURATION = 1000; // 1 second (increased from 0.5)
  
  // Generate dots positions for a given count
  const generateDots = useCallback((count: number) => {
    // For simplicity, just return the count
    return Array(count).fill(0);
  }, []);
  
  // Generate a new trial - simplified version
  const generateTrial = useCallback((): Trial => {
    // Generate two different counts between 3 and 10
    const baseCount = Math.floor(Math.random() * 4) + 3; // 3-6
    const diff = Math.floor(Math.random() * 3) + 1; // 1-3
    
    // Randomly decide which side has more
    let leftCount, rightCount;
    
    if (Math.random() < 0.5) {
      leftCount = baseCount + diff;
      rightCount = baseCount;
    } else {
      leftCount = baseCount;
      rightCount = baseCount + diff;
    }
    
    return { leftCount, rightCount };
  }, []);
  
  // Start the game
  const handleStart = () => {
    setGameState('playing');
    setTrialNumber(0);
    setCorrectResponses(0);
    setIncorrectResponses(0);
    setResponseTimes([]);
    startNewTrial();
  };
  
  // Start a new trial
  const startNewTrial = useCallback(() => {
    // Clear any existing timers
    if (trialTimer.current) {
      clearTimeout(trialTimer.current);
    }
    if (feedbackTimer.current) {
      clearTimeout(feedbackTimer.current);
    }
    
    // Generate a new trial
    const trial = generateTrial();
    setCurrentTrial(trial);
    setTrialStartTime(Date.now());
    
    // Set timeout for this trial
    trialTimer.current = window.setTimeout(() => {
      // If time runs out, count as incorrect
      setIncorrectResponses(prev => prev + 1);
      moveToNextTrial();
    }, TRIAL_TIMEOUT);
  }, [generateTrial]);
  
  // Handle user choice (left or right)
  const handleChoice = (choice: 'left' | 'right') => {
    if (!currentTrial || gameState !== 'playing' || isPaused) return;
    
    // Calculate response time
    const responseTime = Date.now() - (trialStartTime || Date.now());
    
    // Determine if the choice was correct
    const isCorrect = choice === 'left' 
      ? currentTrial.leftCount > currentTrial.rightCount
      : currentTrial.rightCount > currentTrial.leftCount;
    
    // Update metrics
    if (isCorrect) {
      setCorrectResponses(prev => prev + 1);
    } else {
      setIncorrectResponses(prev => prev + 1);
    }
    
    // Add response time to the array
    if (responseTime < TRIAL_TIMEOUT) {
      setResponseTimes(prev => [...prev, responseTime]);
    }
    
    // Clear the trial timer
    if (trialTimer.current) {
      clearTimeout(trialTimer.current);
      trialTimer.current = null;
    }
    
    // Show feedback
    setGameState('feedback');
    
    // Set timeout for next trial
    feedbackTimer.current = window.setTimeout(() => {
      moveToNextTrial();
    }, FEEDBACK_DURATION);
  };
  
  // Move to next trial or finish game
  const moveToNextTrial = () => {
    setTrialNumber(prev => prev + 1);
    
    if (trialNumber >= TOTAL_TRIALS - 1) {
      finishGame();
    } else {
      setGameState('playing');
      startNewTrial();
    }
  };
  
  // Finish the game
  const finishGame = () => {
    // Clear any timers
    if (trialTimer.current) {
      clearTimeout(trialTimer.current);
      trialTimer.current = null;
    }
    if (feedbackTimer.current) {
      clearTimeout(feedbackTimer.current);
      feedbackTimer.current = null;
    }
    
    setGameState('finished');
    
    // Calculate metrics
    const totalTrials = correctResponses + incorrectResponses;
    const accuracy = totalTrials > 0 ? correctResponses / totalTrials : 0;
    
    // Calculate mean correct RT
    const meanCorrectRT = responseTimes.length > 0 
      ? responseTimes.reduce((sum, rt) => sum + rt, 0) / responseTimes.length 
      : 0;
    
    const score = calculateScore(accuracy, meanCorrectRT);
    
    const metrics = {
      decisionAccuracy: accuracy,
      meanCorrectRT,
      score,
    };
    
    onComplete(metrics);
  };
  
  // Toggle pause state
  const togglePause = () => {
    setIsPaused(prev => !prev);
  };
  
  // Calculate score - simplified scoring
  const calculateScore = (accuracy: number, meanRT: number) => {
    // Base score from accuracy (0-80 points)
    const accuracyScore = accuracy * 80;
    
    // RT score (0-20 points, faster is better)
    const rtScore = Math.max(0, Math.min(20, 20 - ((meanRT - 500) / 2000) * 20));
    
    return Math.round(accuracyScore + rtScore);
  };
  
  // Effects for pause/resume
  useEffect(() => {
    if (isPaused) {
      // Clear timers during pause
      if (trialTimer.current) {
        clearTimeout(trialTimer.current);
        trialTimer.current = null;
      }
      if (feedbackTimer.current) {
        clearTimeout(feedbackTimer.current);
        feedbackTimer.current = null;
      }
    } else if (gameState === 'playing' && currentTrial) {
      // Resume trial timer
      const remainingTime = TRIAL_TIMEOUT - (Date.now() - (trialStartTime || Date.now()));
      if (remainingTime > 0) {
        trialTimer.current = window.setTimeout(() => {
          setIncorrectResponses(prev => prev + 1);
          moveToNextTrial();
        }, remainingTime);
      } else {
        moveToNextTrial();
      }
    }
  }, [isPaused, gameState, currentTrial, trialStartTime]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (trialTimer.current) clearTimeout(trialTimer.current);
      if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    };
  }, []);

  return (
    <Card className="w-full max-w-md mx-auto bg-white/95 backdrop-blur-sm shadow-lg border-0">
      <CardHeader className="border-b pb-3">
        <CardTitle className="text-center">더 많은 쪽 고르기</CardTitle>
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
            <p className="text-lg">좌우에 나타나는 두 상자 중 더 많은 점이 있는 쪽을 선택하세요.</p>
            <p>10번의 문제가 제시됩니다. 신속하고 정확하게 판단해주세요!</p>
            <Button onClick={handleStart}>시작하기</Button>
          </div>
        )}

        {(gameState === 'playing' || gameState === 'feedback') && !isPaused && currentTrial && (
          <div className="flex flex-col items-center w-full">
            <div className="flex justify-between w-full mt-4">
              {/* Left box */}
              <div
                className={`w-32 h-32 border-2 ${
                  gameState === 'feedback' && currentTrial.leftCount > currentTrial.rightCount
                    ? 'border-green-500'
                    : 'border-gray-300'
                } rounded-md p-2 flex flex-wrap items-center justify-center cursor-pointer`}
                onClick={() => handleChoice('left')}
              >
                {generateDots(currentTrial.leftCount).map((_, idx) => (
                  <div key={`left-${idx}`} className="w-3 h-3 bg-black rounded-full m-1"></div>
                ))}
              </div>
              
              {/* Right box */}
              <div
                className={`w-32 h-32 border-2 ${
                  gameState === 'feedback' && currentTrial.rightCount > currentTrial.leftCount
                    ? 'border-green-500'
                    : 'border-gray-300'
                } rounded-md p-2 flex flex-wrap items-center justify-center cursor-pointer`}
                onClick={() => handleChoice('right')}
              >
                {generateDots(currentTrial.rightCount).map((_, idx) => (
                  <div key={`right-${idx}`} className="w-3 h-3 bg-black rounded-full m-1"></div>
                ))}
              </div>
            </div>
            
            <p className="mt-8 text-sm text-muted-foreground">
              더 많은 점이 있는 쪽을 클릭하세요
            </p>
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
        
        {!isPaused && (gameState === 'playing' || gameState === 'feedback') && (
          <div className="absolute top-4 left-4 p-2 bg-white/80 rounded text-sm">
            진행: {trialNumber + 1}/{TOTAL_TRIALS}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
