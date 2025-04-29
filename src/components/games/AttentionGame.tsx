
import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AttentionGameProps {
  onComplete: (metrics: Record<string, any>) => void;
  isBaseline?: boolean;
}

export function AttentionGame({ onComplete, isBaseline = false }: AttentionGameProps) {
  // Game state
  const [gameState, setGameState] = useState<'instruction' | 'playing' | 'finished'>('instruction');
  const [currentLetter, setCurrentLetter] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(60); // 60 seconds = 1 minute
  
  // Game metrics
  const [totalTrials, setTotalTrials] = useState(0);
  const [targetTrials, setTargetTrials] = useState(0);
  const [responseTime, setResponseTime] = useState<number[]>([]);
  const [omissionErrors, setOmissionErrors] = useState(0); // Missed non-X
  const [commissionErrors, setCommissionErrors] = useState(0); // Responded to X
  
  // Refs for timers and game mechanics
  const letterDisplayTimer = useRef<number | null>(null);
  const gameTimer = useRef<number | null>(null);
  const letterStartTime = useRef<number | null>(null);
  const userCanRespond = useRef(true);
  
  // Constants
  const LETTER_DURATION = 500; // ms
  const INTER_STIMULUS_INTERVAL = 500; // ms
  const TARGET_LETTER = 'X';
  const TARGET_PROBABILITY = 0.2; // 20% chance for target letter
  const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWYZ'; // Excludes X
  
  // Start the game
  const handleStart = () => {
    setGameState('playing');
    setTimeRemaining(60);
    setTotalTrials(0);
    setTargetTrials(0);
    setResponseTime([]);
    setOmissionErrors(0);
    setCommissionErrors(0);
    userCanRespond.current = true;
    
    // Start the game timer
    gameTimer.current = window.setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          finishGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    // Display first letter
    displayNextLetter();
  };
  
  // Display the next letter
  const displayNextLetter = useCallback(() => {
    // Clear current letter display timer
    if (letterDisplayTimer.current) {
      clearTimeout(letterDisplayTimer.current);
    }
    
    // Determine if this is a target trial
    const isTarget = Math.random() < TARGET_PROBABILITY;
    
    // Select the letter
    const letter = isTarget 
      ? TARGET_LETTER 
      : ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
    
    setCurrentLetter(letter);
    setTotalTrials(prev => prev + 1);
    if (isTarget) {
      setTargetTrials(prev => prev + 1);
    }
    
    userCanRespond.current = true;
    letterStartTime.current = Date.now();
    
    // Set timer to clear letter and show next one
    letterDisplayTimer.current = window.setTimeout(() => {
      // If no response was made for a non-target letter, count as omission error
      if (userCanRespond.current && letter !== TARGET_LETTER) {
        setOmissionErrors(prev => prev + 1);
      }
      
      setCurrentLetter(null);
      userCanRespond.current = false;
      
      // Set timer for next letter
      letterDisplayTimer.current = window.setTimeout(() => {
        if (gameState === 'playing' && !isPaused) {
          displayNextLetter();
        }
      }, INTER_STIMULUS_INTERVAL);
    }, LETTER_DURATION);
  }, [gameState, isPaused]);
  
  // Handle user response
  const handleResponse = () => {
    if (!userCanRespond.current || !currentLetter) return;
    
    userCanRespond.current = false;
    
    // If target letter, count as commission error
    if (currentLetter === TARGET_LETTER) {
      setCommissionErrors(prev => prev + 1);
    } 
    // If non-target letter, record response time
    else {
      const rt = Date.now() - (letterStartTime.current || Date.now());
      setResponseTime(prev => [...prev, rt]);
    }
  };
  
  // Finish the game
  const finishGame = () => {
    // Clear all timers
    if (gameTimer.current) {
      clearInterval(gameTimer.current);
      gameTimer.current = null;
    }
    if (letterDisplayTimer.current) {
      clearTimeout(letterDisplayTimer.current);
      letterDisplayTimer.current = null;
    }
    
    setGameState('finished');
    
    // Calculate metrics
    const nonTargetTrials = totalTrials - targetTrials;
    const omissionErrorRate = nonTargetTrials > 0 ? omissionErrors / nonTargetTrials : 0;
    const commissionErrorRate = targetTrials > 0 ? commissionErrors / targetTrials : 0;
    const meanRT = responseTime.length > 0 
      ? responseTime.reduce((sum, rt) => sum + rt, 0) / responseTime.length
      : 0;
    
    // Calculate overall sustained attention accuracy
    const correctResponses = nonTargetTrials - omissionErrors;
    const correctWithholding = targetTrials - commissionErrors;
    const sustainedAttentionAccuracy = (correctResponses + correctWithholding) / totalTrials;
    
    const score = calculateScore(sustainedAttentionAccuracy, omissionErrorRate, commissionErrorRate);
    
    const metrics = {
      sustainedAttentionAccuracy,
      omissionErrorRate,
      commissionErrorRate,
      meanRT,
      totalTrials,
      score,
    };
    
    onComplete(metrics);
  };
  
  // Toggle pause state
  const togglePause = () => {
    setIsPaused(prev => !prev);
  };
  
  // Calculate score
  const calculateScore = (accuracy: number, omissionRate: number, commissionRate: number) => {
    // Base score on accuracy (0-100)
    const baseScore = accuracy * 100;
    
    // Penalties for errors
    const omissionPenalty = omissionRate * 20;
    const commissionPenalty = commissionRate * 30; // Higher penalty for commission errors
    
    return Math.max(0, Math.min(100, baseScore - omissionPenalty - commissionPenalty));
  };
  
  // Effects for pause/resume
  useEffect(() => {
    if (isPaused) {
      // Clear timers during pause
      if (letterDisplayTimer.current) {
        clearTimeout(letterDisplayTimer.current);
        letterDisplayTimer.current = null;
      }
      if (gameTimer.current) {
        clearInterval(gameTimer.current);
        gameTimer.current = null;
      }
    } else if (gameState === 'playing') {
      // Resume game timer
      gameTimer.current = window.setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            finishGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      // Resume letter display
      if (!currentLetter) {
        displayNextLetter();
      }
    }
  }, [isPaused, gameState, currentLetter, displayNextLetter]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (letterDisplayTimer.current) clearTimeout(letterDisplayTimer.current);
      if (gameTimer.current) clearInterval(gameTimer.current);
    };
  }, []);
  
  return (
    <Card className="w-full max-w-md mx-auto bg-white/95 backdrop-blur-sm shadow-lg border-0">
      <CardHeader className="border-b pb-3">
        <CardTitle className="text-center">X를 찾아라!</CardTitle>
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
            <p className="text-lg">화면에 연속으로 문자가 나타납니다.</p>
            <p><span className="font-bold">X를 제외한</span> 모든 문자에 클릭하고, X가 나타나면 클릭하지 마세요.</p>
            <Button onClick={handleStart}>시작하기</Button>
          </div>
        )}

        {gameState === 'playing' && !isPaused && (
          <div className="flex flex-col items-center justify-center h-60">
            <div 
              className="w-32 h-32 border rounded-md flex items-center justify-center cursor-pointer m-4"
              onClick={handleResponse}
            >
              <span className="text-6xl font-bold">{currentLetter}</span>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              X가 아닌 문자만 클릭하세요
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
        
        {!isPaused && gameState === 'playing' && (
          <div className="absolute top-4 left-4 p-2 bg-white/80 rounded text-sm">
            남은시간: {timeRemaining}초
          </div>
        )}
      </CardContent>
    </Card>
  );
}
