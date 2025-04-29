
import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { DAILY_SLEEP_QUESTIONS } from "@/types";

interface DailySleepQuestionCardProps {
  questionNumber: number;
  onComplete: (answer: number) => void;
  totalQuestions?: number;
}

export function DailySleepQuestionCard({ 
  questionNumber, 
  onComplete,
  totalQuestions = 4
}: DailySleepQuestionCardProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  
  const questionData = DAILY_SLEEP_QUESTIONS[questionNumber - 1];
  
  if (!questionData) {
    return <div>질문을 찾을 수 없습니다.</div>;
  }
  
  const handleNext = () => {
    if (selectedOption !== null) {
      onComplete(selectedOption);
    }
  };
  
  return (
    <Card className="w-full max-w-md mx-auto bg-white/95 backdrop-blur-sm shadow-lg border-0">
      <CardHeader className="border-b pb-3">
        <CardTitle className="text-center">
          오늘의 컨디션 체크 ({questionNumber}/{totalQuestions})
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 pb-4">
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-center mb-6">{questionData.question}</h3>
          
          <RadioGroup
            className="space-y-3"
            value={selectedOption?.toString()}
            onValueChange={(value) => setSelectedOption(parseInt(value))}
          >
            {questionData.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2 border rounded-md p-3 hover:bg-slate-50 transition-colors">
                <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`} className="flex-grow cursor-pointer">
                  {`${index + 1}. ${option}`}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4">
        <Button 
          className="w-full" 
          onClick={handleNext}
          disabled={selectedOption === null}
        >
          {questionNumber === totalQuestions ? "게임 시작하기" : "다음"}
        </Button>
      </CardFooter>
    </Card>
  );
}
