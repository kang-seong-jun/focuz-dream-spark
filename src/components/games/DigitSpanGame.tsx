
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDigitSpanGame } from "@/hooks/useDigitSpanGame";
import { 
  InstructionScreen, 
  PauseScreen, 
  GameScreen, 
  CompletedScreen 
} from "./digit-span/GameUI";

interface DigitSpanGameProps {
  onComplete: (metrics: Record<string, any>) => void;
  isBaseline?: boolean;
}

export function DigitSpanGame({ onComplete, isBaseline = false }: DigitSpanGameProps) {
  const {
    gameState,
    isPaused,
    roundsCompleted,
    sequenceLength,
    displayNumber,
    prevDisplayNumber,
    numberChanged,
    feedback,
    showFeedback,
    isGenerating,
    inputSequence,
    startGame,
    handleInput,
    handleRemoveLastDigit,
    handleSubmit,
    togglePause,
  } = useDigitSpanGame({ onComplete, isBaseline });

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
        {gameState === 'instruction' && <InstructionScreen onStart={startGame} />}

        {gameState === 'playing' && !isPaused && (
          <GameScreen
            isGenerating={isGenerating}
            displayNumber={displayNumber}
            numberChanged={numberChanged}
            sequenceLength={sequenceLength}
            roundsCompleted={roundsCompleted}
            showFeedback={showFeedback}
            feedback={feedback}
            inputSequence={inputSequence}
            onInput={handleInput}
            onRemoveLastDigit={handleRemoveLastDigit}
            onSubmit={handleSubmit}
          />
        )}

        {isPaused && <PauseScreen onResume={togglePause} />}

        {gameState === 'finished' && <CompletedScreen />}
      </CardContent>
    </Card>
  );
}
