
import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface WorkingMemoryGameProps {
  onComplete: (metrics: Record<string, any>) => void;
  isBaseline?: boolean;
}

export function WorkingMemoryGame({ onComplete, isBaseline = false }: WorkingMemoryGameProps) {
  // Game state
  const [gameState, setGameState] = useState<'instruction' | 'playing' | 'waitingForNext' | 'finished'>('instruction');
  const [isPaused, setIsPaused] = useState(false);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [pattern, setPattern] = useState<number[]>([]);
  const [playerPattern, setPlayerPattern] = useState<number[]>([]);
  const [isShowingPattern, setIsShowingPattern] = useState(false);
  const [currentPatternIndex, setCurrentPatternIndex] = useState(0);
  const [patternCompleted, setPatternCompleted] = useState(false);
  
  // Game settings
  const MAX_ROUNDS = 10;
  const INITIAL_PATTERN_LENGTH = 3;
  const PATTERN_FLASH_TIME = 500; // ms
  const PATTERN_PAUSE_TIME = 300; // ms
  
  // Refs
  const patternTimerRef = useRef<number | null>(null);
  
  // Game grid setup - 3x3 grid of squares (positions 0-8)
  const gridPositions = Array(9).fill(0).map((_, i) => i);
  
  // Initialize or reset game
  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setRound(0);
    setPatternCompleted(false);
    startNewRound();
  };
  
  // Start a new round
  const startNewRound = useCallback(() => {
    // Generate new pattern - current length is base length + round number
    const patternLength = INITIAL_PATTERN_LENGTH + Math.min(round, 5); // Max length of 8
    const newPattern: number[] = [];
    
    for (let i = 0; i < patternLength; i++) {
      // Generate random position (0-8)
      const position = Math.floor(Math.random() * 9);
      newPattern.push(position);
    }
    
    setPattern(newPattern);
    setPlayerPattern([]);
    setIsShowingPattern(true);
    setCurrentPatternIndex(0);
    setPatternCompleted(false);
    
    // Start showing pattern sequence
    showPattern(newPattern);
  }, [round]);
  
  // Show the pattern sequence
  const showPattern = (patternToShow: number[]) => {
    if (patternTimerRef.current) {
      clearTimeout(patternTimerRef.current);
    }
    
    setCurrentPatternIndex(-1);
    
    const showNextInPattern = (index: number) => {
      if (index >= patternToShow.length) {
        // Pattern finished showing
        setIsShowingPattern(false);
        setCurrentPatternIndex(-1);
        return;
      }
      
      setCurrentPatternIndex(index);
      
      // Show for PATTERN_FLASH_TIME ms
      patternTimerRef.current = window.setTimeout(() => {
        setCurrentPatternIndex(-1);
        
        // Pause before showing next
        patternTimerRef.current = window.setTimeout(() => {
          showNextInPattern(index + 1);
        }, PATTERN_PAUSE_TIME);
      }, PATTERN_FLASH_TIME);
    };
    
    // Start showing pattern after a brief pause
    patternTimerRef.current = window.setTimeout(() => {
      showNextInPattern(0);
    }, 500);
  };
  
  // Handle player tile click
  const handleTileClick = (position: number) => {
    if (isShowingPattern || isPaused || gameState !== 'playing' || patternCompleted) return;
    
    const newPlayerPattern = [...playerPattern, position];
    setPlayerPattern(newPlayerPattern);
    
    // Check if this selection matches the pattern so far
    if (pattern[playerPattern.length] !== position) {
      // Wrong selection
      finishGame();
      return;
    }
    
    // Check if player completed the pattern
    if (newPlayerPattern.length === pattern.length) {
      // Pattern completed successfully - increase score
      setScore(prev => prev + pattern.length * 10);
      setPatternCompleted(true);
      
      // Move to next round or finish game
      if (round >= MAX_ROUNDS - 1) {
        finishGame();
      } else {
        // Wait for user to proceed to next round
        setGameState('waitingForNext');
      }
    }
  };

  // Handle proceeding to next round (user initiated)
  const handleNextRound = () => {
    setRound(prev => prev + 1);
    setGameState('playing');
    startNewRound();
  };
  
  // Finish the game
  const finishGame = () => {
    if (patternTimerRef.current) {
      clearTimeout(patternTimerRef.current);
    }
    
    setGameState('finished');
    
    // Calculate metrics
    const maxPatternLength = Math.max(
      INITIAL_PATTERN_LENGTH,
      INITIAL_PATTERN_LENGTH + round
    );
    
    const workingMemorySpan = maxPatternLength;
    const accuracy = Math.min(1, score / (MAX_ROUNDS * INITIAL_PATTERN_LENGTH * 10));
    
    const metrics = {
      workingMemorySpan,
      accuracy,
      score,
      totalRounds: round + 1,
    };
    
    // Send results
    setTimeout(() => {
      onComplete(metrics);
    }, 1500);
  };
  
  // Toggle pause state
  const togglePause = () => {
    setIsPaused(prev => !prev);
  };
  
  // Clean up on component unmount
  useEffect(() => {
    return () => {
      if (patternTimerRef.current) {
        clearTimeout(patternTimerRef.current);
      }
    };
  }, []);
  
  // Effect for handling rounds
  useEffect(() => {
    if (round > 0 && gameState === 'playing' && !isPaused) {
      startNewRound();
    }
  }, [round, gameState, isPaused, startNewRound]);
  
  return (
    <Card className="w-full max-w-md mx-auto bg-white/95 backdrop-blur-sm shadow-lg border-0">
      <CardHeader className="border-b pb-3">
        <CardTitle className="text-center">패턴 기억하기</CardTitle>
        <div className="absolute right-4 top-4">
          {gameState === 'playing' && (
            <Button variant="outline" size="sm" onClick={togglePause}>
              {isPaused ? "계속하기" : "일시정지"}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-6 pb-4 min-h-[300px] flex flex-col items-center justify-center">
        {gameState === 'instruction' && (
          <div className="text-center space-y-4">
            <p className="text-lg">화면에 나타나는 타일 패턴을 기억한 후, 같은 순서대로 클릭하세요.</p>
            <p>각 라운드마다 패턴이 점점 길어집니다.</p>
            <Button onClick={startGame}>시작하기</Button>
          </div>
        )}

        {gameState === 'playing' && !isPaused && (
          <div className="flex flex-col items-center w-full">
            <div className="mb-6">
              <p className="text-sm text-muted-foreground mb-2">
                {isShowingPattern ? "패턴 기억하기" : "패턴 입력하기"}
              </p>
              <p className="text-sm">
                라운드: {round + 1}/{MAX_ROUNDS} | 점수: {score}
              </p>
            </div>
            
            <div className="grid grid-cols-3 gap-2 w-64 h-64">
              {gridPositions.map((position) => (
                <div 
                  key={position}
                  className={`
                    w-20 h-20 rounded-md cursor-pointer transition-all
                    ${currentPatternIndex === pattern.indexOf(position) && pattern.includes(position) 
                      ? 'bg-focus-purple scale-110' 
                      : 'bg-slate-200 hover:bg-slate-300'}
                  `}
                  onClick={() => handleTileClick(position)}
                >
                </div>
              ))}
            </div>
            
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">
                {isShowingPattern 
                  ? "패턴을 기억하세요..."  
                  : patternCompleted 
                    ? "패턴 완성!" 
                    : `${playerPattern.length}/${pattern.length} 선택됨`
                }
              </p>
            </div>
          </div>
        )}

        {gameState === 'waitingForNext' && !isPaused && (
          <div className="text-center space-y-4">
            <p className="text-lg">패턴을 성공적으로 완성했습니다!</p>
            <p>
              현재 점수: {score} | 라운드: {round + 1}/{MAX_ROUNDS}
            </p>
            <Button onClick={handleNextRound}>
              다음 라운드로 진행
            </Button>
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
            <p>최종 점수: {score}</p>
            <p>계산 중...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
