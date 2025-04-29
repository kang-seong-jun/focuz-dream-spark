
import React from "react";
import { Button } from "@/components/ui/button";

interface InstructionScreenProps {
  onStart: () => void;
}

export function InstructionScreen({ onStart }: InstructionScreenProps) {
  return (
    <div className="text-center space-y-4">
      <p className="text-lg">화면에 나타나는 숫자를 순서대로 기억하세요.</p>
      <p>총 3개의 라운드를 진행하며, 7자리부터 시작합니다.</p>
      <Button onClick={onStart}>시작하기</Button>
    </div>
  );
}

interface PauseScreenProps {
  onResume: () => void;
}

export function PauseScreen({ onResume }: PauseScreenProps) {
  return (
    <div className="text-center space-y-4">
      <p className="text-xl">게임이 일시 정지되었습니다</p>
      <Button onClick={onResume}>계속하기</Button>
    </div>
  );
}

interface GameScreenProps {
  isGenerating: boolean;
  displayNumber: number | null;
  numberChanged: boolean;
  sequenceLength: number;
  roundsCompleted: number;
  showFeedback: boolean;
  feedback: string;
  inputSequence: number[];
  onInput: (number: number) => void;
  onSubmit: () => void;
}

export function GameScreen({
  isGenerating,
  displayNumber,
  numberChanged,
  sequenceLength,
  roundsCompleted,
  showFeedback,
  feedback,
  inputSequence,
  onInput,
  onSubmit,
}: GameScreenProps) {
  return (
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
              onClick={() => onInput(number)}
              className="w-16 h-12"
            >
              {number}
            </Button>
          ))}
          <Button onClick={onSubmit} className="col-span-3 w-full">
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
  );
}

interface CompletedScreenProps {}

export function CompletedScreen({}: CompletedScreenProps) {
  return (
    <div className="text-center space-y-4">
      <h3 className="text-xl font-semibold">게임 완료!</h3>
      <p>최종 점수 계산 중...</p>
    </div>
  );
}
