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
  const [sequenceLength, setSequenceLength] = useState(3);

  // UI and timing
  const [displayNumber, setDisplayNumber] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string>("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Metrics
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [correctAttempts, setCorrectAttempts] = useState(0);
  const [errorCount, setErrorCount] = useState(0);

  // Refs
  const timerRef = useRef<number | null>(null);

  // Constants
  const MAX_LENGTH = 9;
  const MIN_LENGTH = 3;
  const NUMBER_DURATION = 1000; // ms
  const PAUSE_DURATION = 500; // ms

  // Start the game
  const startGame = () => {
    setGameState('playing');
    setSequenceLength(MIN_LENGTH);
    setCurrentSequence([]);
    setCorrectSequences([]);
    setInputSequence([]);
    setTotalAttempts(0);
    setCorrectAttempts(0);
    setErrorCount(0);
    generateSequence();
  };

  // Generate a new sequence
  const generateSequence = () => {
    setIsGenerating(true);
    setDisplayNumber(null);
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
      setDisplayNumber(newSequence[i]);
      i++;

      if (i === newSequence.length) {
        clearInterval(timerRef.current);
        timerRef.current = null;
        setTimeout(() => {
          setDisplayNumber(null);
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

    const isCorrect =
      inputSequence.length === currentSequence.length &&
      inputSequence.every((num, i) => num === currentSequence[i]);

    if (isCorrect) {
      setCorrectAttempts(prev => prev + 1);
      setCorrectSequences([...correctSequences, currentSequence]);
      setFeedback("정답입니다!");
      setShowFeedback(true);

      // Increase difficulty
      if (sequenceLength < MAX_LENGTH) {
        setSequenceLength(prev => prev + 1);
      }

      // Generate next sequence after delay
      setTimeout(() => {
        setShowFeedback(false);
        generateSequence();
      }, 1500);
    } else {
      setErrorCount(prev => prev + 1);
      setFeedback("틀렸습니다. 다시 시도하세요.");
      setShowFeedback(true);

      // Reset input
      setInputSequence([]);

      // Generate same sequence after delay
      setTimeout(() => {
        setShowFeedback(false);
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
    const errorRate = 1 - accuracy;
    const memorySpan = correctSequences.length > 0 ? correctSequences[correctSequences.length - 1].length : MIN_LENGTH;
    const score = calculateScore(memorySpan, accuracy, errorRate);

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
  const calculateScore = (memorySpan: number, accuracy: number, errorRate: number) => {
    // Base score from memory span (0-70 points)
    const spanScore = memorySpan * 7;

    // Accuracy component (0-20 points)
    const accuracyScore = accuracy * 20;

    // Error penalty (0-10 points)
    const errorPenalty = errorRate * 10;

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
            <p>각 라운드마다 숫자가 점점 늘어납니다.</p>
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
                길이: {sequenceLength} | 시도: {totalAttempts} | 정답: {correctAttempts}
              </p>
            </div>

            <div className="text-5xl font-bold">
              {displayNumber !== null ? displayNumber : (isGenerating ? "..." : "")}
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
