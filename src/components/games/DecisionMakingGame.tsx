
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
  difficulty: 'easy' | 'medium' | 'hard';
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
  const [responseTimesByDifficulty, setResponseTimesByDifficulty] = useState<{
    easy: number[];
    medium: number[];
    hard: number[];
  }>({ easy: [], medium: [], hard: [] });
  
  // Refs for timers
  const trialTimer = useRef<number | null>(null);
  const feedbackTimer = useRef<number | null>(null);
  
  // Constants
  const TOTAL_TRIALS = 30;
  const TRIAL_TIMEOUT = 3000; // 3 seconds
  const FEEDBACK_DURATION = 500; // 0.5 seconds
  
  // Generate dots positions for a given count
  const generateDots = useCallback((count: number) => {
    // For simplicity, just return the count - in a real implementation,
    // you would compute random x,y positions within the containing box
    return Array(count).fill(0);
  }, []);
  
  // Generate a new trial
  const generateTrial = useCallback((): Trial => {
    // Determine difficulty (random distribution)
    const rand = Math.random();
    let difficulty: 'easy' | 'medium' | 'hard';
    
    if (rand < 0.33) {
      difficulty = 'easy'; // Big difference (3-5)
    } else if (rand < 0.66) {
      difficulty = 'medium'; // Medium difference (2)
    } else {
      difficulty = 'hard'; // Small difference (1)
    }
    
    // Generate counts based on difficulty
    let diff;
    if (difficulty === 'easy') {
      diff = Math.floor(Math.random() * 3) + 3; // 3-5
    } else if (difficulty === 'medium') {
      diff = 2;
    } else {
      diff = 1;
    }
    
    // Randomly decide which side has more
    const baseCount = Math.floor(Math.random() * 3) + 3; // 3-5
    let leftCount, rightCount;
    
    if (Math.random() < 0.5) {
      leftCount = baseCount + diff;
      rightCount = baseCount;
    } else {
      leftCount = baseCount;
      rightCount = baseCount + diff;
    }
    
    return { leftCount, rightCount, difficulty };
  }, []);
  
  // Start the game
  const handleStart = () => {
    setGameState('playing');
    setTrialNumber(0);
    setCorrectResponses(0);
    setIncorrectResponses(0);
    setResponseTimesByDifficulty({ easy: [], medium: [], hard: [] });
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
    
    // Add response time to appropriate difficulty category
    if (responseTime < TRIAL_TIMEOUT) {
      setResponseTimesByDifficulty(prev => ({
        ...prev,
        [currentTrial.difficulty]: [...prev[currentTrial.difficulty], responseTime]
      }));
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
    
    // Calculate mean RT for each difficulty level
    const meanRTs = {
      easy: responseTimesByDifficulty.easy.length > 0 
        ? responseTimesByDifficulty.easy.reduce((sum, rt) => sum + rt, 0) / responseTimesByDifficulty.easy.length 
        : 0,
      medium: responseTimesByDifficulty.medium.length > 0 
        ? responseTimesByDifficulty.medium.reduce((sum, rt) => sum + rt, 0) / responseTimesByDifficulty.medium.length 
        : 0,
      hard: responseTimesByDifficulty.hard.length > 0 
        ? responseTimesByDifficulty.hard.reduce((sum, rt) => sum + rt, 0) / responseTimesByDifficulty.hard.length 
        : 0
    };
    
    // Calculate overall mean correct RT
    let allCorrectRTs: number[] = [];
    Object.values(responseTimesByDifficulty).forEach(rts => {
      allCorrectRTs = allCorrectRTs.concat(rts);
    });
    
    const meanCorrectRT = allCorrectRTs.length > 0 
      ? allCorrectRTs.reduce((sum, rt) => sum + rt, 0) / allCorrectRTs.length 
      : 0;
    
    // Calculate inverse efficiency score (higher RT and lower accuracy means worse performance)
    const inverseEfficiencyScore = accuracy > 0 ? meanCorrectRT / accuracy : 0;
    
    const score = calculateScore(accuracy, meanCorrectRT);
    
    const metrics = {
      decisionAccuracy: accuracy,
      meanCorrectRT,
      inverseEfficiencyScore,
      meanRTsByDifficulty: meanRTs,
      score,
    };
    
    onComplete(metrics);
  };
  
  // Toggle pause state
  const togglePause = () => {
    setIsPaused(prev => !prev);
  };
  
  // Calculate score
  const calculateScore = (accuracy: number, meanRT: number) => {
    // Base score from accuracy (0-80 points)
    const accuracyScore = accuracy * 80;
    
    // RT score (0-20 points, faster is better)
    // Normalize RT between 300ms (fastest expected) and 2000ms (slowest expected)
    let rtScore = 0;
    if (meanRT > 0) {
      rtScore = Math.max(0, Math.min(20, 20 - ((meanRT - 300) / 1700) * 20));
    }
    
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
            <p className="text-lg">좌우에 나타나는 두 상자 중 더 많은 점이 있는 쪽을 빠르게 선택하세요.</p>
            <p>신속하고 정확하게 판단하는 것이 중요합니다!</p>
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
