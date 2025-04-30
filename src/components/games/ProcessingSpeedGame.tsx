import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ProcessingSpeedGameProps {
  onComplete: (metrics: Record<string, any>) => void;
  isBaseline?: boolean;
}

type SymbolMapping = {
  [key: string]: number;
};

export function ProcessingSpeedGame({ onComplete, isBaseline = false }: ProcessingSpeedGameProps) {
  // Game state
  const [gameState, setGameState] = useState<'instruction' | 'playing' | 'finished'>('instruction');
  const [isPaused, setIsPaused] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(15); // 60 seconds
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Game metrics
  const [correctResponses, setCorrectResponses] = useState(0);
  const [incorrectResponses, setIncorrectResponses] = useState(0);
  const [responseTimestamps, setResponseTimestamps] = useState<number[]>([]);

  const [finalMetrics, setFinalMetrics] = useState<Record<string, any> | null>(null);

  const correctResponsesRef = useRef(0);
  const incorrectResponsesRef = useRef(0);

  useEffect(() => {
    if (gameState === 'finished' && finalMetrics) {
      onComplete(finalMetrics);
    }
  }, [gameState, finalMetrics]);  

  
  // Symbol mapping and sequence
  const [symbolMapping] = useState<SymbolMapping>(() => {
    // Create a random mapping of symbols to digits 1-9
    const symbols = ['⚪', '⚫', '▲', '▼', '◆', '★', '♥', '♦', '⚡'];
    const mapping: SymbolMapping = {};
    
    // Shuffle the symbols
    const shuffled = [...symbols].sort(() => 0.5 - Math.random());
    
    // Create mapping
    for (let i = 0; i < 9; i++) {
      mapping[shuffled[i]] = i + 1;
    }
    
    return mapping;
  });
  
  const [symbolSequence] = useState<string[]>(() => {
    // Create a sequence of 80 random symbols (enough for the game)
    const symbols = Object.keys(symbolMapping);
    const sequence: string[] = [];
    
    for (let i = 0; i < 80; i++) {
      const randomIndex = Math.floor(Math.random() * symbols.length);
      sequence.push(symbols[randomIndex]);
    }
    
    return sequence;
  });
  
  // Refs for timers
  const gameTimer = useRef<number | null>(null);
  const startTime = useRef<number | null>(null);
  
  // Constants
  const GAME_DURATION = 20; // seconds
  
  // Start the game
  const handleStart = () => {
    setGameState('playing');
    setTimeRemaining(GAME_DURATION);
    setCurrentIndex(0);
    setCorrectResponses(0);
    setIncorrectResponses(0);
    setResponseTimestamps([]);
    startTime.current = Date.now();
    
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
  };
  
  // Handle digit input
  const handleDigitInput = (digit: number) => {
    if (gameState !== 'playing' || isPaused) return;
  
    // Record response timestamp
    setResponseTimestamps(prev => [...prev, Date.now()]);
  
    const currentSymbol = symbolSequence[currentIndex];
    const correctDigit = symbolMapping[currentSymbol];
  
    if (digit === correctDigit) {
      correctResponsesRef.current += 1;  
      setCorrectResponses(prev => prev + 1);
    } else {
      incorrectResponsesRef.current += 1;
      setIncorrectResponses(prev => prev + 1);
    }
  
    // If last symbol, defer finishGame outside of state update
    if (currentIndex >= symbolSequence.length - 1) {
      setCurrentIndex(currentIndex); // Just re-set
      setTimeout(() => {
        finishGame(); // ✅ DEFERRED
      }, 0);
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  };
  
  
  // Finish the game
  const finishGame = () => {
    if (gameTimer.current) {
      clearInterval(gameTimer.current);
      gameTimer.current = null;
    }
  
    setGameState('finished');
    
    // Store metrics for later
    const correct = correctResponsesRef.current;
    const incorrect = incorrectResponsesRef.current;
    const totalResponses = correct + incorrect;
    const accuracy = totalResponses > 0 ? correct / totalResponses : 0;
  
    let timePerResponse = 0;
    if (totalResponses > 0 && startTime.current !== null) {
      const totalTime = Date.now() - startTime.current; // 게임 시작부터 지금까지
      timePerResponse = totalTime / totalResponses;     // 총 걸린 시간 ÷ 반응 개수
    }
  
    const score = calculateScore(correct, accuracy);
  
    const calculatedMetrics = {
      correctResponses: correct,
      incorrectResponses: incorrect,
      accuracy,
      itemsProcessed: totalResponses,
      timePerResponse,
      score
    };
  
    setFinalMetrics(calculatedMetrics); // ← NEW STATE
  };
  
  
  // Toggle pause state
  const togglePause = () => {
    setIsPaused(prev => !prev);
  };
  
  // Calculate score
  const calculateScore = (correct: number, accuracy: number) => {
    // Base score is number of correct responses (capped at 100)
    let baseScore = Math.min(100, Math.max(0, correct * 2));
    // Apply accuracy bonus (up to 20% extra)
    const accuracyBonus = Math.max(0, accuracy) * 20;
    const score = baseScore + accuracyBonus;
    return isNaN(score) ? 0 : Math.round(score);
  };
  
  // Effects for pause/resume
  useEffect(() => {
    // Always clear previous interval
    if (gameTimer.current) {
      clearInterval(gameTimer.current);
      gameTimer.current = null;
    }
  
    // If not paused and playing, start a new timer
    if (!isPaused && gameState === 'playing') {
      gameTimer.current = window.setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            finishGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  
    // Clean up on unmount
    return () => {
      if (gameTimer.current) {
        clearInterval(gameTimer.current);
        gameTimer.current = null;
      }
    };
  }, [isPaused, gameState]);
  
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (gameTimer.current) clearInterval(gameTimer.current);
    };
  }, []);

  return (
    <Card className="w-full max-w-md mx-auto bg-white/95 backdrop-blur-sm shadow-lg border-0">
      <CardHeader className="border-b pb-3">
        <CardTitle className="text-center">기호-숫자 변환</CardTitle>
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
            <p className="text-lg">화면 상단의 기호-숫자 짝을 기억하고, 아래에 나타나는 기호에 해당하는 숫자를 빠르게 입력하세요.</p>
            <p>제한시간은 1분입니다.</p>
            <Button onClick={handleStart}>시작하기</Button>
          </div>
        )}

        {gameState === 'playing' && !isPaused && (
          <div className="flex flex-col items-center w-full">
            {/* Symbol key reference */}
            <div className="grid grid-cols-9 gap-1 p-2 mb-4 border rounded bg-slate-50">
              {Object.entries(symbolMapping).map(([symbol, digit], index) => (
                <div key={`key-${index}`} className="flex flex-col items-center">
                  <span className="text-lg">{symbol}</span>
                  <span className="text-sm">{digit}</span>
                </div>
              ))}
            </div>
            
            {/* Current symbol to match */}
            <div className="my-4">
              <div className="text-6xl font-bold">
                {symbolSequence[currentIndex]}
              </div>
            </div>
            
            {/* Number input pad */}
            <div className="grid grid-cols-3 gap-2 mt-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
                <Button 
                  key={digit} 
                  variant="outline" 
                  className="w-12 h-12 text-lg"
                  onClick={() => handleDigitInput(digit)}
                >
                  {digit}
                </Button>
              ))}
            </div>
            
            {/* Progress indicators */}
            <div className="mt-6 flex justify-between w-full text-sm">
              <div>맞춤: {correctResponses}</div>
              <div>틀림: {incorrectResponses}</div>
            </div>
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
            <p>결과</p>
            <div className="mt-4 text-base space-y-1">
              <div>맞춘 개수: <span className="font-semibold">{correctResponses}</span></div>
              <div>정확도: <span className="font-semibold">{((correctResponses + incorrectResponses) > 0 ? (correctResponses / (correctResponses + incorrectResponses) * 100).toFixed(1) : 0)}%</span></div>
              <div>
                평균 반응속도: 
                <span className="font-semibold">
                  {responseTimestamps.length > 1
                    ? ((responseTimestamps[responseTimestamps.length - 1] - responseTimestamps[0]) / (responseTimestamps.length - 1) / 1000).toFixed(1)
                    : 0}초
                </span>
              </div>

            </div>
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
