import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { useGame } from "@/context/GameContext";

interface DigitSpanGameProps {
  onComplete: (metrics: Record<string, any>) => void;
  isBaseline?: boolean;
}

export function DigitSpanGame({ onComplete, isBaseline = false }: DigitSpanGameProps) {
  // Game state
  const [gameState, setGameState] = useState<'instruction' | 'showing' | 'input' | 'feedback' | 'finished'>('instruction');
  const [currentSequence, setCurrentSequence] = useState<number[]>([]);
  const [userInput, setUserInput] = useState<number[]>([]);
  const [sequenceLength] = useState(7); // Fixed at 7 digits to make the game shorter
  const [currentDigitIndex, setCurrentDigitIndex] = useState(0);
  const [failuresAtCurrentLength, setFailuresAtCurrentLength] = useState(0);
  const [correctSequences, setCorrectSequences] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [totalResponseTime, setTotalResponseTime] = useState(0);
  const [digitKey, setDigitKey] = useState(0); // Key for animation triggering
  
  const [isPaused, setIsPaused] = useState(false);
  
  // For a real app, we might want to have a limit for how many attempts
  const MAX_FAILURES = 2;

  // Generate a random sequence of digits
  const generateSequence = useCallback((length: number): number[] => {
    const sequence = [];
    for (let i = 0; i < length; i++) {
      sequence.push(Math.floor(Math.random() * 10)); // 0-9
    }
    return sequence;
  }, []);

  // Start a new trial
  const startNewTrial = useCallback(() => {
    setCurrentSequence(generateSequence(sequenceLength));
    setUserInput([]);
    setCurrentDigitIndex(0);
    setGameState('showing');
  }, [generateSequence, sequenceLength]);

  // Show the next digit in the sequence
  useEffect(() => {
    if (gameState === 'showing' && !isPaused) {
      // If we've shown all digits, move to input phase
      if (currentDigitIndex >= currentSequence.length) {
        setGameState('input');
        setStartTime(Date.now());
        return;
      }

      // Show the current digit with animation
      setDigitKey(prev => prev + 1);
      
      // Show the current digit
      const timer = setTimeout(() => {
        setCurrentDigitIndex(prev => prev + 1);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [currentDigitIndex, currentSequence.length, gameState, isPaused]);

  // Handle user input
  const handleDigitInput = (digit: number) => {
    setUserInput(prev => [...prev, digit]);
  };

  // Check the sequence after user completes input
  const checkSequence = () => {
    if (startTime) {
      setTotalResponseTime(prev => prev + (Date.now() - startTime));
    }
    
    setTotalAttempts(prev => prev + 1);
    
    // Check if the sequences match
    let isCorrect = true;
    if (userInput.length !== currentSequence.length) {
      isCorrect = false;
    } else {
      for (let i = 0; i < userInput.length; i++) {
        if (userInput[i] !== currentSequence[i]) {
          isCorrect = false;
          break;
        }
      }
    }

    if (isCorrect) {
      setCorrectSequences(prev => prev + 1);
      setGameState('feedback');
      toast({
        title: "정답입니다!",
        description: "다음 단계로 넘어갑니다.",
      });
      
      // We're keeping sequence length constant, so just reset failures
      setFailuresAtCurrentLength(0);
      
      // If they've done enough correct sequences (e.g., 3), finish the game
      if (correctSequences >= 2) { // After 3 correct answers (this one is the 3rd)
        finishGame();
      } else {
        // Start new trial after brief pause
        setTimeout(() => {
          startNewTrial();
        }, 1500);
      }
    } else {
      setGameState('feedback');
      toast({
        title: "틀렸습니다",
        description: "다시 시도합니다.",
        variant: "destructive",
      });
      
      // If they got it wrong, increment failure counter
      const newFailures = failuresAtCurrentLength + 1;
      setFailuresAtCurrentLength(newFailures);
      
      // If they've failed the maximum number of times, finish the game
      if (newFailures >= MAX_FAILURES) {
        finishGame();
      } else {
        // Otherwise try again with same length
        setTimeout(() => {
          startNewTrial();
        }, 1500);
      }
    }
  };

  // Finish the game and report metrics
  const finishGame = () => {
    setGameState('finished');
    
    const metrics = {
      memorySpan: sequenceLength,
      correctSequences,
      totalAttempts,
      errorRate: totalAttempts > 0 ? 1 - (correctSequences / totalAttempts) : 0,
      avgTimePerSequence: correctSequences > 0 ? totalResponseTime / correctSequences : 0,
    };
    
    onComplete(metrics);
  };

  // Start the game
  const handleStart = () => {
    startNewTrial();
  };

  // Handle pause/resume
  const togglePause = () => {
    setIsPaused(prev => !prev);
  };

  // Reset user input
  const resetInput = () => {
    setUserInput([]);
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-white/95 backdrop-blur-sm shadow-lg border-0">
      <CardHeader className="border-b pb-3">
        <CardTitle className="text-center">숫자 순서 기억하기</CardTitle>
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
            <p className="text-lg">화면에 나타나는 숫자를 순서대로 기억한 다음, 숫자가 모두 사라진 후 기억한 순서대로 입력하세요.</p>
            <p>기억할 숫자 개수: {sequenceLength}개</p>
            <Button onClick={handleStart}>시작하기</Button>
          </div>
        )}

        {gameState === 'showing' && !isPaused && (
          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">숫자를 기억하세요</p>
            {currentDigitIndex < currentSequence.length ? (
              <div className="relative h-24 flex items-center justify-center">
                <div 
                  key={digitKey}
                  className="text-6xl font-bold absolute transform transition-transform duration-300 animate-[slide-up_0.3s_ease-out]"
                >
                  {currentSequence[currentDigitIndex]}
                </div>
              </div>
            ) : (
              <div className="text-xl">숫자를 입력할 준비를 하세요...</div>
            )}
          </div>
        )}

        {gameState === 'input' && !isPaused && (
          <div className="text-center space-y-6">
            <p className="text-sm text-muted-foreground">기억한 숫자를 순서대로 입력하세요</p>
            
            <div className="flex justify-center gap-2 mb-4">
              {userInput.map((digit, index) => (
                <div key={index} className="w-8 h-10 border-b-2 border-primary flex items-center justify-center">
                  {digit}
                </div>
              ))}
              {Array(sequenceLength - userInput.length).fill(0).map((_, index) => (
                <div key={`empty-${index}`} className="w-8 h-10 border-b-2 border-muted flex items-center justify-center">
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
                <Button 
                  key={digit} 
                  variant="outline" 
                  className="w-12 h-12 text-lg"
                  onClick={() => handleDigitInput(digit)}
                  disabled={userInput.length >= sequenceLength}
                >
                  {digit}
                </Button>
              ))}
              <Button 
                variant="outline" 
                className="w-12 h-12 text-lg"
                onClick={resetInput}
              >
                ⌫
              </Button>
              <Button 
                key={0} 
                variant="outline" 
                className="w-12 h-12 text-lg"
                onClick={() => handleDigitInput(0)}
                disabled={userInput.length >= sequenceLength}
              >
                0
              </Button>
              <Button 
                variant="outline" 
                className="w-12 h-12 text-lg bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={checkSequence}
                disabled={userInput.length < sequenceLength}
              >
                ✓
              </Button>
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
            <p>점수 계산 중...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
