import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";

interface WorkingMemoryGameProps {
  onComplete: (metrics: Record<string, any>) => void;
  isBaseline?: boolean;
}

export function WorkingMemoryGame({ onComplete, isBaseline = false }: WorkingMemoryGameProps) {
  // Game state
  const [gameState, setGameState] = useState<'instruction' | 'playing' | 'waitingForNext' | 'finished'>('instruction');
  const [isPaused, setIsPaused] = useState(false);
  const [score, setScore] = useState(0);
  const [previousScores, setPreviousScores] = useState<number[]>([]);
  const [round, setRound] = useState(0);
  const [isShowingPattern, setIsShowingPattern] = useState(false);
  const [patternCompleted, setPatternCompleted] = useState(false);
  
  // Selections and patterns
  const [selectedCells, setSelectedCells] = useState<number[]>([]);
  const [pattern, setPattern] = useState<number[]>([]);
  const [correctSelections, setCorrectSelections] = useState(0);
  const [incorrectSelections, setIncorrectSelections] = useState(0);
  
  // Game settings based on round
  const [gridSize, setGridSize] = useState(4); // 4x4 grid for first round
  const [patternLength, setPatternLength] = useState(4); // 4 cells for first round
  const [responseStartTime, setResponseStartTime] = useState<number | null>(null);
  
  // Game settings
  const MAX_ROUNDS = 3;
  const PATTERN_SHOW_TIMES = {
    0: 800,  // 1라운드: 0.8초
    1: 1000, // 2라운드: 1.0초
    2: 1200  // 3라운드: 1.2초
  };
  const SPEED_BONUS_THRESHOLD = 1000; // 1 second per pattern for speed bonus
  
  // Refs for timers
  const timerRef = useRef<number | null>(null);
  const gameCompleted = useRef<boolean>(false);
  
  // Initialize or reset game
  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setRound(0);
    setGridSize(4); // 4x4 grid for first round
    setPatternLength(4); // 4 patterns for first round
    setPatternCompleted(false);
    generatePattern();
  };
  
  // Generate a new pattern for the current round
  const generatePattern = () => {
    // Clear any existing pattern and selections
    setPattern([]);
    setSelectedCells([]);
    setCorrectSelections(0);
    setIncorrectSelections(0);
    
    // Generate a random pattern
    const totalCells = gridSize * gridSize;
    const newPattern: number[] = [];
    
    // Create an array of all cell indices
    const availableCells = Array.from({ length: totalCells }, (_, i) => i);
    
    // Randomly select cells for the pattern
    for (let i = 0; i < patternLength; i++) {
      if (availableCells.length === 0) break;
      
      // Random index from available cells
      const randomIndex = Math.floor(Math.random() * availableCells.length);
      // Remove and get the cell
      const cell = availableCells.splice(randomIndex, 1)[0];
      newPattern.push(cell);
    }
    
    setPattern(newPattern);
    showPattern(newPattern);
  };
  
  // Show the pattern to the player
  const showPattern = (patternToShow: number[]) => {
    // Clear existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    // Show the pattern
    setIsShowingPattern(true);
    
    // Hide the pattern after patternShowTime based on current round
    timerRef.current = window.setTimeout(() => {
      setIsShowingPattern(false);
    }, PATTERN_SHOW_TIMES[round]);
  };
  
  // Handle cell click
  const handleCellClick = (cellIndex: number) => {
    if (isShowingPattern || isPaused || gameState !== 'playing' || patternCompleted) return;
    
    // Start timing when first cell is clicked
    if (selectedCells.length === 0) {
      setResponseStartTime(Date.now());
    }
    
    // Check if cell is already selected
    if (selectedCells.includes(cellIndex)) return;
    
    // Add to selected cells
    setSelectedCells(prev => [...prev, cellIndex]);
    
    // Check if selection is correct
    const isCorrect = pattern.includes(cellIndex);
    
    if (isCorrect) {
      setCorrectSelections(prev => prev + 1);
    } else {
      setIncorrectSelections(prev => prev + 1);
    }
    
    // Check if we've selected enough cells
    if (selectedCells.length + 1 >= patternLength) {
      // Pattern completed
      setPatternCompleted(true);
      
      // Calculate score for this round
      const roundScore = calculateRoundScore(round, correctSelections + (isCorrect ? 1 : 0), responseStartTime);
      setScore(prev => prev + roundScore);
      
      // Wait for user to proceed to next round
      setGameState('waitingForNext');
    }
  };
  
  // Calculate score for a single round
  const calculateRoundScore = (roundIndex: number, correctCount: number, startTime: number | null) => {
    // Base score: 5 points per correct pattern
    const baseScore = correctCount * 5;
    
    // Speed bonus calculation (up to 10 points total across all rounds)
    let speedBonus = 0;
    if (startTime !== null) {
      const responseTime = Date.now() - startTime;
      const maxTime = patternLength * SPEED_BONUS_THRESHOLD; // 1 second per pattern
      
      if (responseTime <= maxTime) {
        // Calculate speed bonus based on response time
        speedBonus = Math.round((maxTime - responseTime) / maxTime * (10 / MAX_ROUNDS));
      }
    }
    
    return baseScore + speedBonus;
  };
  
  // Handle proceeding to next round
  const handleNextRound = () => {
    const nextRound = round + 1;
    setPreviousScores(prev => [...prev, score]);
    setRound(nextRound);
    
    // Update grid size and pattern length based on round
    if (nextRound === 1) {
      // Round 2: 5x5 grid, 6 patterns
      setGridSize(5);
      setPatternLength(6);
    } else if (nextRound === 2) {
      // Round 3: 6x6 grid, 8 patterns
      setGridSize(6);
      setPatternLength(8);
    }
    
    setGameState('playing');
    setPatternCompleted(false);
    setResponseStartTime(null);
    generatePattern();
  };
  
  // Finish the game
  const finishGame = () => {
    // Prevent multiple completions
    if (gameCompleted.current) return;
    gameCompleted.current = true;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    setGameState('finished');
    
    // Calculate final metrics
    const totalSelections = correctSelections + incorrectSelections;
    const accuracy = totalSelections > 0 ? correctSelections / totalSelections : 0;
    
    const metrics = {
      patternScore: score,
      accuracy,
      totalRounds: round + 1,
      correctSelections,
      incorrectSelections,
    };
    
    // Send results after a delay to avoid setState during render
    setTimeout(() => {
      onComplete(metrics);
    }, 300);
  };
  
  // Toggle pause state
  const togglePause = () => {
    setIsPaused(prev => !prev);
  };
  
  // Clean up on component unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);
  
  // Check if all rounds are complete
  useEffect(() => {
    if (round >= MAX_ROUNDS - 1 && patternCompleted) {
      finishGame();
    }
  }, [round, patternCompleted]);
  
  // useEffect로 gridSize, patternLength, gameState가 바뀔 때 패턴 생성
  useEffect(() => {
    if (gameState === 'playing' && !isShowingPattern && !patternCompleted) {
      generatePattern();
    }
    // eslint-disable-next-line
  }, [gridSize, patternLength, gameState]);
  
  // Generate grid cells
  const renderGrid = () => {
    const cells = [];
    const totalCells = gridSize * gridSize;
    
    for (let i = 0; i < totalCells; i++) {
      cells.push(
        <div
          key={i}
          className={`
            aspect-square rounded-md cursor-pointer transition-all
            ${isShowingPattern && pattern.includes(i)
              ? 'bg-focus-purple scale-105'
              : selectedCells.includes(i)
                ? 'bg-slate-400'
                : 'bg-slate-200 hover:bg-slate-300'
            }
          `}
          onClick={() => handleCellClick(i)}
        />
      );
    }
    
    return (
      <div 
        className={`grid gap-1 w-full max-w-xs mx-auto aspect-square`}
        style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}
      >
        {cells}
      </div>
    );
  };
  
  // Get user from auth context
  const { user } = useAuth();
  
  const calculateScore = (memorySpan: number): number => {
    return Math.min(100, Math.round((memorySpan / 10) * 100));
  };

  const handleGameComplete = () => {
    const score = calculateScore(round);
    onComplete({
      gameType: 'WM2',
      score,
      workingMemorySpan: round,
      accuracy: correctSelections / (correctSelections + incorrectSelections),
      timestamp: new Date().toISOString()
    });
  };
  
  return (
    <Card className="w-full max-w-md mx-auto bg-white/95 backdrop-blur-sm shadow-lg border-0">
      <CardHeader className="border-b pb-3">
        <CardTitle className="text-center">격자 기억하기</CardTitle>
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
            <p className="text-lg">화면에 잠시 표시되는 격자 패턴을 기억한 후, 같은 위치를 클릭하세요.</p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>1라운드: 4×4 격자에서 4개 패턴</p>
              <p>2라운드: 5×5 격자에서 6개 패턴</p>
              <p>3라운드: 6×6 격자에서 8개 패턴</p>
              <p>각 패턴 당 5점, 반응 속도에 따라 최대 10점의 보너스 점수가 주어집니다.</p>
            </div>
            <Button onClick={startGame}>시작하기</Button>
          </div>
        )}

        {gameState === 'playing' && !isPaused && (
          <div className="flex flex-col items-center w-full">
            <div className="mb-4">
              <p className="text-sm text-muted-foreground mb-2">
                {isShowingPattern ? "패턴 기억하기" : "패턴 입력하기"}
              </p>
              <div className="space-y-1 text-center">
                <p className="text-sm font-medium">
                  라운드 {round + 1}/{MAX_ROUNDS}
                </p>
                <p className="text-xs text-muted-foreground">
                  {gridSize}×{gridSize} 격자에서 {patternLength}개 패턴
                </p>
                <p className="text-sm">
                  현재 점수: {score}점
                </p>
              </div>
            </div>
            
            {renderGrid()}
            
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">
                {isShowingPattern 
                  ? "패턴을 기억하세요..."  
                  : `${selectedCells.length}/${patternLength} 선택됨`
                }
              </p>
            </div>
          </div>
        )}

        {gameState === 'waitingForNext' && !isPaused && (
          <div className="text-center space-y-4">
            <p className="text-lg">라운드 {round + 1} 완료!</p>
            <div className="space-y-2">
              <p>맞은 개수: {correctSelections} / {patternLength}</p>
              <p>이번 라운드 점수: {score - (round > 0 ? previousScores[round - 1] : 0)}점</p>
              <p>총점: {score}점</p>
            </div>
            {round < MAX_ROUNDS - 1 ? (
              <Button onClick={handleNextRound}>
                다음 라운드 시작
              </Button>
            ) : (
              <Button onClick={finishGame}>
                결과 확인하기
              </Button>
            )}
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
            <div className="space-y-2">
              <p className="text-3xl font-bold text-primary">{score}점</p>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>정확도: {((correctSelections / (correctSelections + incorrectSelections)) * 100).toFixed(1)}%</p>
                <p>총 라운드: {round + 1}/{MAX_ROUNDS}</p>
              </div>
            </div>
          </div>
        )}

        {gameState === 'complete' && (
          <div className="text-center space-y-4">
            <h3 className="text-xl font-semibold">패턴 기억하기 측정 완료!</h3>
            <div className="text-3xl font-bold text-primary">
              {calculateScore(round)}점
            </div>
            <div className="space-y-2">
              <div>최대 패턴 길이: {round}</div>
              <div>정확도: {((correctSelections / (correctSelections + incorrectSelections)) * 100).toFixed(1)}%</div>
            </div>
            <div className="text-sm text-muted-foreground">
              (패턴 길이 10: 100점 기준)
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
