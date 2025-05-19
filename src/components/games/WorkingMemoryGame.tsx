import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";

interface WorkingMemoryGameProps {
  onComplete: (metrics: Record<string, any>) => void;
  isBaseline?: boolean;
}

// 라운드별 격자 크기와 패턴 수를 상수로 선언
const ROUND_SETTINGS = [
  { gridSize: 4, patternLength: 4, showTime: 800 },   // 1라운드
  { gridSize: 5, patternLength: 6, showTime: 1000 }, // 2라운드
  { gridSize: 6, patternLength: 8, showTime: 1200 }, // 3라운드
];

// 점수 계산 관련 상수 추가
const TOTAL_PATTERNS = 18; // 4+6+8
const MAX_SCORE = 100;
const ACCURACY_SCORE = 90; // 맞춘 개수 * 5점
const SPEED_BONUS = 10; // 소요시간 보너스 최대치

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
  const [gridSize, setGridSize] = useState(ROUND_SETTINGS[0].gridSize);
  const [patternLength, setPatternLength] = useState(ROUND_SETTINGS[0].patternLength);
  const [responseStartTime, setResponseStartTime] = useState<number | null>(null);
  
  // Game settings
  const MAX_ROUNDS = 3;
  const SPEED_BONUS_THRESHOLD = 1000; // 1 second per pattern for speed bonus
  
  // Refs for timers
  const timerRef = useRef<number | null>(null);
  const gameCompleted = useRef<boolean>(false);
  
  // 점수 누적용 state 추가
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [totalSpeedBonus, setTotalSpeedBonus] = useState(0);
  
  // Initialize or reset game
  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setRound(0);
    setGridSize(ROUND_SETTINGS[0].gridSize);
    setPatternLength(ROUND_SETTINGS[0].patternLength);
    setPatternCompleted(false);
    generatePattern(0);
  };
  
  // Generate a new pattern for the current round
  const generatePattern = (roundIndex = round) => {
    setPattern([]);
    setSelectedCells([]);
    setCorrectSelections(0);
    setIncorrectSelections(0);

    const { gridSize, patternLength } = ROUND_SETTINGS[roundIndex];
    const totalCells = gridSize * gridSize;
    const newPattern: number[] = [];
    const availableCells = Array.from({ length: totalCells }, (_, i) => i);
    for (let i = 0; i < patternLength; i++) {
      if (availableCells.length === 0) break;
      const randomIndex = Math.floor(Math.random() * availableCells.length);
      const cell = availableCells.splice(randomIndex, 1)[0];
      newPattern.push(cell);
    }
    setPattern(newPattern);
    showPattern(roundIndex, newPattern);
  };
  
  // Show the pattern to the player
  const showPattern = (roundIndex: number, patternToShow: number[]) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setIsShowingPattern(true);
    timerRef.current = window.setTimeout(() => {
      setIsShowingPattern(false);
    }, ROUND_SETTINGS[roundIndex].showTime);
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
      setPatternCompleted(true);
      // 라운드별 맞춘 개수 계산
      const roundCorrect = correctSelections + (isCorrect ? 1 : 0);
      setTotalCorrect(prev => prev + roundCorrect);
      // 라운드별 속도 보너스 계산
      const roundSpeedBonus = calculateSpeedBonus(round, responseStartTime);
      setTotalSpeedBonus(prev => prev + roundSpeedBonus);
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
    setGridSize(ROUND_SETTINGS[nextRound].gridSize);
    setPatternLength(ROUND_SETTINGS[nextRound].patternLength);
    setRound(nextRound);
    setGameState('playing');
    setPatternCompleted(false);
    setResponseStartTime(null);
    generatePattern(nextRound);
  };
  
  // Finish the game
  const finishGame = () => {
    if (gameCompleted.current) return;
    gameCompleted.current = true;
    if (timerRef.current) clearTimeout(timerRef.current);
    setGameState('finished');
    const totalScore = Math.min(MAX_SCORE, totalCorrect * 5 + totalSpeedBonus);
    const totalSelections = correctSelections + incorrectSelections;
    const accuracy = totalSelections > 0 ? correctSelections / totalSelections : 0;
    const metrics = {
      score: totalScore,
      accuracy,
      totalRounds: round + 1,
      correctSelections: totalCorrect,
      incorrectSelections,
      maxScore: MAX_SCORE
    };
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
  
  // useEffect로 gridSize, patternLength, gameState가 바뀔 때 패턴 생성 → round만 의존하도록 변경
  useEffect(() => {
    if (gameState === 'playing' && !isShowingPattern && !patternCompleted) {
      generatePattern(round);
    }
    // eslint-disable-next-line
  }, [round, gameState]);
  
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
  
  // 속도 보너스 계산 함수 분리
  const calculateSpeedBonus = (roundIndex: number, startTime: number | null) => {
    if (startTime === null) return 0;
    const patternLength = ROUND_SETTINGS[roundIndex].patternLength;
    const maxTime = patternLength * SPEED_BONUS_THRESHOLD;
    const responseTime = Date.now() - startTime;
    if (responseTime <= maxTime) {
      // 라운드별 속도 보너스: 전체 10점 중 라운드별 비율로 분배
      const roundBonus = Math.round((maxTime - responseTime) / maxTime * (SPEED_BONUS / MAX_ROUNDS));
      return roundBonus;
    }
    return 0;
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
            <p>최종 점수: {Math.min(MAX_SCORE, totalCorrect * 5 + totalSpeedBonus)} / 100점</p>
            <p>정확도 점수: {totalCorrect * 5} / 90점</p>
            <p>속도 보너스: {totalSpeedBonus} / 10점</p>
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
