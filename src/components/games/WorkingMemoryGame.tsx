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
  const [patternShowTime, setPatternShowTime] = useState(1000); // 1초로 시작
  const MAX_ROUNDS = 3;
  
  // Refs for timers
  const timerRef = useRef<number | null>(null);
  const gameCompleted = useRef<boolean>(false);
  
  // Initialize or reset game
  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setRound(0);
    setGridSize(4); // 4x4 grid for first round
    setPatternLength(4); // 4 cells for first round
    setPatternShowTime(1000); // 1초로 시작
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
    
    // Hide the pattern after patternShowTime
    timerRef.current = window.setTimeout(() => {
      setIsShowingPattern(false);
    }, patternShowTime);
  };
  
  // Handle cell click
  const handleCellClick = (cellIndex: number) => {
    if (isShowingPattern || isPaused || gameState !== 'playing' || patternCompleted) return;
    
    // Check if cell is already selected
    if (selectedCells.includes(cellIndex)) return;
    
    // Add to selected cells
    setSelectedCells(prev => [...prev, cellIndex]);
    
    // Check if selection is correct
    const isCorrect = pattern.includes(cellIndex);
    
    if (isCorrect) {
      setCorrectSelections(prev => prev + 1);
      setScore(prev => prev + 10);
    } else {
      setIncorrectSelections(prev => prev + 1);
    }
    
    // Check if we've selected enough cells
    if (selectedCells.length + 1 >= patternLength) {
      // Pattern completed
      setPatternCompleted(true);
      
      // Wait for user to proceed to next round
      setGameState('waitingForNext');
    }
  };
  
  // Handle proceeding to next round
  const handleNextRound = () => {
    const nextRound = round + 1;
    setRound(nextRound);

    // Update grid size, pattern length, and show time based on round
    if (nextRound === 1) {
      // Round 2: 5x5 grid, 6 cells, 1초
      setGridSize(5);
      setPatternLength(6);
      setPatternShowTime(1000);
    } else if (nextRound === 2) {
      // Round 3: 6x6 grid, 8 cells, 1.2초
      setGridSize(6);
      setPatternLength(8);
      setPatternShowTime(1200);
    }

    setGameState('playing');
    setPatternCompleted(false);
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
    
    // Calculate metrics
    const totalSelections = correctSelections + incorrectSelections;
    const accuracy = totalSelections > 0 ? correctSelections / totalSelections : 0;
    
    // Determine working memory span based on the highest pattern length completed
    let workingMemorySpan = 4; // Default to first round pattern length
    
    if (round >= 1) {
      workingMemorySpan = 6; // Second round pattern length
    }
    
    const metrics = {
      workingMemorySpan,
      accuracy,
      score,
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
            <p>총 3라운드로 진행되며, 라운드마다 기억해야 할 패턴이 더 복잡해집니다.</p>
            <Button onClick={startGame}>시작하기</Button>
          </div>
        )}

        {gameState === 'playing' && !isPaused && (
          <div className="flex flex-col items-center w-full">
            <div className="mb-4">
              <p className="text-sm text-muted-foreground mb-2">
                {isShowingPattern ? "패턴 기억하기" : "패턴 입력하기"}
              </p>
              <p className="text-sm">
                라운드: {round + 1}/{MAX_ROUNDS} | 점수: {score}
              </p>
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
            <p className="text-lg">패턴 입력 완료!</p>
            <p>
              맞은 갯수: {correctSelections} | 틀린 갯수: {incorrectSelections} | 점수: {score}
            </p>
            {round < MAX_ROUNDS - 1 ? (
              <Button onClick={handleNextRound}>
                다음 라운드로 진행
              </Button>
            ) : (
              <Button onClick={handleGameComplete}>
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
            <p>최종 점수: {score}</p>
            <p>계산 중...</p>
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
