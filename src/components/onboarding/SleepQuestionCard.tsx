import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { SLEEP_QUESTIONS } from "@/types";

interface SleepQuestionCardProps {
  questionNumber: number;
  onComplete: (answer: number) => void;
}

export function SleepQuestionCard({ questionNumber, onComplete }: SleepQuestionCardProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const question = SLEEP_QUESTIONS[questionNumber - 1];

  const handleSubmit = () => {
    if (selectedOption !== null) {
      onComplete(selectedOption);
    }
  };

  return (
    <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-center">
          {question.headline}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center mb-6">
          {question.question}
        </div>

        <RadioGroup
          className="space-y-4"
          value={selectedOption?.toString()}
          onValueChange={(value) => setSelectedOption(parseInt(value))}
        >
          {question.options.map((option, index) => (
            <div key={index} className="flex items-center space-x-2">
              <RadioGroupItem value={index.toString()} id={`option-${index}`} />
              <Label htmlFor={`option-${index}`} className="cursor-pointer">
                {option}
              </Label>
            </div>
          ))}
        </RadioGroup>

        <Button
          className="w-full mt-6"
          onClick={handleSubmit}
          disabled={selectedOption === null}
        >
          다음
        </Button>
      </CardContent>
    </Card>
  );
}
