
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MainLayout } from "@/layouts/MainLayout";
import { SleepQuestionCard } from "@/components/onboarding/SleepQuestionCard";
import { useSleep } from "@/context/SleepContext";
import { useAuth } from "@/context/AuthContext";

export default function BaselineSleepQuestions() {
  const { questionNumber } = useParams<{ questionNumber: string }>();
  const [answers, setAnswers] = useState<number[]>([]);
  const navigate = useNavigate();
  const { saveBaselineSleepProfile } = useSleep();
  const { user } = useAuth();

  // Redirect if no user
  useEffect(() => {
    if (!user) {
      navigate('/register');
    }
  }, [user, navigate]);

  // Parse question number or default to 1
  const currentQuestion = questionNumber ? parseInt(questionNumber) : 1;
  
  // Handle answer selection
  const handleAnswer = (answer: number) => {
    // Save answer
    const newAnswers = [...answers];
    newAnswers[currentQuestion - 1] = answer;
    setAnswers(newAnswers);
    
    // Navigate to next question or cognitive baseline intro
    if (currentQuestion < 4) {
      navigate(`/onboarding/sleep/${currentQuestion + 1}`);
    } else {
      // Save baseline sleep profile
      saveBaselineSleepProfile(newAnswers);
      navigate('/onboarding/cognitive');
    }
  };

  return (
    <MainLayout withNavigation={false}>
      <div className="min-h-[calc(100vh-2rem)] flex flex-col items-center justify-center p-4">
        <SleepQuestionCard
          questionNumber={currentQuestion}
          onComplete={handleAnswer}
        />
      </div>
    </MainLayout>
  );
}
