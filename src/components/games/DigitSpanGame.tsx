
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DigitSpanGameProps {
  onComplete: (metrics: Record<string, any>) => void;
  isBaseline?: boolean;
}

export function DigitSpanGame({ onComplete, isBaseline = false }: DigitSpanGameProps) {
  // Game state
  const [gameState, setGameState] = useState<'instruction' | 'playing' | 'finished'>('instruction');
  const [isPaused, setIsPaused] = useState(false);

  // Sequence generation
  const [currentSequence, setCurrentSequence] = useState<number[]>([]);
  const [correctSequences, setCorrectSequences] = useState<number[][]>([]);
  const [inputSequence, setInputSequence] = useState<number[]>([]);
  const [sequenceLength, setSequenceLength] = useState(7); // Start with 7
  const [prevDisplayNumber, setPrevDisplayNumber] = useState<number | null>(null);

  // UI and timing
  const [displayNumber, setDisplayNumber] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string>("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [numberChanged, setNumberChanged] = useState(false);

  // Metrics and attempts
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [correctAttempts, setCorrectAttempts] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [roundsCompleted, setRoundsCompleted] = useState(0); // Track completed rounds

  // Refs
  const timerRef = useRef<number | null>(null);

  // Constants
  const MAX_TOTAL_ROUNDS = 3; // Total 3 rounds regardless of correctness
  const NUMBER_DURATION = 700; // Faster number display (was 1000ms)
  const PAUSE_DURATION = 300; // Shorter pause between numbers (was 500ms)

  // Start the game
  const startGame = () => {
    setGameState('playing');
    setSequenceLength(7);
    setCurrentSequence([]);
    setCorrectSequences([]);
    setInputSequence([]);
    setTotalAttempts(0);
    setCorrectAttempts(0);
    setErrorCount(0);
    setRoundsCompleted(0);
    generateSequence();
  };

  // Generate a new sequence
  const generateSequence = () => {
    setIsGenerating(true);
    setDisplayNumber(null);
    setPrevDisplayNumber(null);
    setInputSequence([]);
    setFeedback("");
    setShowFeedback(false);

    const newSequence: number[] = [];
    for (let i = 0; i < sequenceLength; i++) {
      newSequence.push(Math.floor(Math.random() * 9) + 1); // Numbers 1-9
    }
    setCurrentSequence(newSequence);

    let i = 0;
    timerRef.current = window.setInterval(() => {
      setPrevDisplayNumber(displayNumber);
      setDisplayNumber(newSequence[i]);
      setNumberChanged(true);
      
      // Reset animation flag after a short delay
      setTimeout(() => {
        setNumberChanged(false);
      }, 200);
      
      i++;

      if (i === newSequence.length) {
        clearInterval(timerRef.current);
        timerRef.current = null;
        setTimeout(() => {
          setDisplayNumber(null);
          setPrevDisplayNumber(null);
          setIsGenerating(false);
        }, PAUSE_DURATION);
      }
    }, NUMBER_DURATION + PAUSE_DURATION);
  };

  // Handle user input
  const handleInput = (number: number) => {
    if (isGenerating || isPaused) return;

    setInputSequence([...inputSequence, number]);
  };

  // Submit the sequence
  const handleSubmit = () => {
    if (isGenerating || isPaused) return;

    setTotalAttempts(prev => prev + 1);
    setRoundsCompleted(prev => prev + 1);

    const isCorrect =
      inputSequence.length === currentSequence.length &&
      inputSequence.every((num, i) => num === currentSequence[i]);

    if (isCorrect) {
      setCorrectAttempts(prev => prev + 1);
      setCorrectSequences([...correctSequences, currentSequence]);
      setFeedback("정답입니다!");
    } else {
      setErrorCount(prev => prev + 1);
      setFeedback("틀렸습니다.");
    }
    
    setShowFeedback(true);

    // Check if we've completed all three rounds
    if (roundsCompleted >= MAX_TOTAL_ROUNDS - 1) {
      // End game after showing feedback
      setTimeout(() => {
        finishGame();
      }, 1500);
    } else {
      // Move to next length (7->8->9) after showing feedback
      setTimeout(() => {
        setShowFeedback(false);
        setSequenceLength(prev => prev + 1); // Increase length for next round
        generateSequence();
      }, 1500);
    }
  };

  // Finish the game
  const finishGame = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    setGameState('finished');

    // Calculate metrics
    const accuracy = totalAttempts > 0 ? correctAttempts / totalAttempts : 0;
    const errorRate = errorCount / Math.max(1, totalAttempts);
    const memorySpan = correctSequences.length > 0 ? 
      correctSequences[correctSequences.length - 1].length : 7;
    const score = calculateScore(memorySpan, accuracy, errorCount);

    const metrics = {
      memorySpan,
      accuracy,
      errorRate,
      score,
      totalAttempts,
      correctAttempts,
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

  // Calculate score
  const calculateScore = (memorySpan: number, accuracy: number, errors: number) => {
    // Base score from memory span (50-70 points)
    const spanScore = Math.min(9, memorySpan) * 7;

    // Accuracy component (0-20 points)
    const accuracyScore = accuracy * 20;

    // Error penalty (0-15 points)
    const errorPenalty = Math.min(15, errors * 5);

    return Math.round(spanScore + accuracyScore - errorPenalty);
  };

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  return (
    <Card className="w-full max-w-md mx-auto bg-white/95 backdrop-blur-sm shadow-lg border-0">
      <CardHeader className="border-b pb-3">
        <CardTitle className="text-center">숫자 기억하기</CardTitle>
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
            <p className="text-lg">화면에 나타나는 숫자를 순서대로 기억하세요.</p>
            <p>총 3개의 라운드를 진행하며, 7자리부터 시작합니다.</p>
            <Button onClick={startGame}>시작하기</Button>
          </div>
        )}

        {gameState === 'playing' && !isPaused && (
          <div className="flex flex-col items-center w-full">
            <div className="mb-6">
              <p className="text-sm text-muted-foreground mb-2">
                {isGenerating ? "숫자 기억하기" : "숫자 입력하기"}
              </p>
              <p className="text-sm">
                길이: {sequenceLength} | 라운드: {roundsCompleted + 1}/3
              </p>
            </div>

            <div className="relative h-20 flex justify-center items-center">
              {displayNumber !== null && (
                <div className={`text-5xl font-bold absolute ${numberChanged ? 'animate-slide-up' : ''}`}>
                  {displayNumber}
                </div>
              )}
              {isGenerating && displayNumber === null && (
                <div className="text-5xl font-bold">...</div>
              )}
            </div>

            {showFeedback && (
              <div className="mt-4 text-lg">{feedback}</div>
            )}

            {!isGenerating && displayNumber === null && (
              <div className="grid grid-cols-3 gap-2 mt-6">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(number => (
                  <Button
                    key={number}
                    onClick={() => handleInput(number)}
                    className="w-16 h-12"
                  >
                    {number}
                  </Button>
                ))}
                <Button onClick={handleSubmit} className="col-span-3 w-full">
                  확인
                </Button>
              </div>
            )}

            <div className="mt-4">
              <p className="text-sm text-muted-foreground">
                {inputSequence.length > 0
                  ? `입력한 숫자: ${inputSequence.join(" ")}`
                  : "숫자를 입력하세요..."}
              </p>
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
            <p>최종 점수 계산 중...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
