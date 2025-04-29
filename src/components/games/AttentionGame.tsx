
import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AttentionGameProps {
  onComplete: (metrics: Record<string, any>) => void;
  isBaseline?: boolean;
}

export function AttentionGame({ onComplete, isBaseline = false }: AttentionGameProps) {
  // Game state
  const [gameState, setGameState] = useState<'instruction' | 'playing' | 'feedback' | 'finished'>('instruction');
  const [isPaused, setIsPaused] = useState(false);
  
  // Current stimulus
  const [currentLetter, setCurrentLetter] = useState<string>("");
  const [stimulusStartTime, setStimulusStartTime] = useState<number | null>(null);
  const [shouldRespond, setShouldRespond] = useState<boolean>(false);
  
  // Game metrics
  const [trialNumber, setTrialNumber] = useState(0);
  const [correctResponses, setCorrectResponses] = useState(0);
  const [incorrectResponses, setIncorrectResponses] = useState(0);
  const [missedResponses, setMissedResponses] = useState(0);
  const [responseTimes, setResponseTimes] = useState<number[]>([]);
  
  // Refs for timers
  const stimulusTimer = useRef<number | null>(null);
  const feedbackTimer = useRef<number | null>(null);
  
  // Constants - reduced trials and increased times
  const TOTAL_TRIALS = 10; // Changed from 30 to 10
  const STIMULUS_DURATION = 1800; // 1.8 seconds - increased from 1.2s
  const FEEDBACK_DURATION = 800; // 0.8 seconds - increased from 0.5s
  const INTER_STIMULUS_INTERVAL = 1000; // 1 second between stimuli
  
  // Get random letter excluding X
  const getRandomLetter = useCallback(() => {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWYZ";
    return letters[Math.floor(Math.random() * letters.length)];
  }, []);
  
  // Generate a new stimulus
  const generateStimulus = useCallback((): string => {
    // X appears 20% of the time
    if (Math.random() < 0.2) {
      return "X";
    } else {
      return getRandomLetter();
    }
  }, [getRandomLetter]);
  
  // Start the game
  const handleStart = () => {
    setGameState('playing');
    setTrialNumber(0);
    setCorrectResponses(0);
    setIncorrectResponses(0);
    setMissedResponses(0);
    setResponseTimes([]);
    presentNextStimulus();
  };
  
  // Present next stimulus
  const presentNextStimulus = useCallback(() => {
    // Clear any existing timers
    if (stimulusTimer.current) {
      clearTimeout(stimulusTimer.current);
    }
    if (feedbackTimer.current) {
      clearTimeout(feedbackTimer.current);
    }
    
    // Generate a new stimulus
    const letter = generateStimulus();
    setCurrentLetter(letter);
    setStimulusStartTime(Date.now());
    setShouldRespond(letter !== "X");
    
    // Set timeout for this stimulus
    stimulusTimer.current = window.setTimeout(() => {
      // If user should have responded but didn't, count as missed
      if (letter !== "X") {
        setMissedResponses(prev => prev + 1);
      }
      moveToNextTrial();
    }, STIMULUS_DURATION);
  }, [generateStimulus]);
  
  // Handle user response
  const handleResponse = () => {
    if (gameState !== 'playing' || isPaused) return;
    
    // Calculate response time
    const responseTime = Date.now() - (stimulusStartTime || Date.now());
    
    // Clear the stimulus timer
    if (stimulusTimer.current) {
      clearTimeout(stimulusTimer.current);
      stimulusTimer.current = null;
    }
    
    // Determine if the response was correct
    const isCorrect = shouldRespond;
    
    // Update metrics
    if (isCorrect) {
      setCorrectResponses(prev => prev + 1);
      if (responseTime < STIMULUS_DURATION) {
        setResponseTimes(prev => [...prev, responseTime]);
      }
    } else {
      setIncorrectResponses(prev => prev + 1);
    }
    
    // Show feedback
    setGameState('feedback');
    
    // Set timeout for next trial
    feedbackTimer.current = window.setTimeout(() => {
      moveToNextTrial();
    }, FEEDBACK_DURATION);
  };
  
  // Move to next trial or finish game
  const moveToNextTrial = () => {
    setTrialNumber(prev => prev + 1);
    
    if (trialNumber >= TOTAL_TRIALS - 1) {
      finishGame();
    } else {
      setGameState('playing');
      // Add a delay before showing the next stimulus
      setTimeout(() => {
        presentNextStimulus();
      }, INTER_STIMULUS_INTERVAL);
    }
  };
  
  // Finish the game
  const finishGame = () => {
    // Clear any timers
    if (stimulusTimer.current) {
      clearTimeout(stimulusTimer.current);
    }
    if (feedbackTimer.current) {
      clearTimeout(feedbackTimer.current);
    }
    
    setGameState('finished');
    
    // Calculate metrics
    const totalExpectedResponses = TOTAL_TRIALS * 0.8; // Expected 80% non-X stimuli
    const sustainedAttentionAccuracy = totalExpectedResponses > 0 
      ? correctResponses / totalExpectedResponses 
      : 0;
    
    const meanReactionTime = responseTimes.length > 0
      ? responseTimes.reduce((sum, rt) => sum + rt, 0) / responseTimes.length
      : 0;
    
    // Score calculation
    const score = calculateScore(sustainedAttentionAccuracy, missedResponses, incorrectResponses);
    
    const metrics = {
      sustainedAttentionAccuracy,
      correctResponses,
      missedResponses,
      incorrectResponses,
      meanReactionTime,
      score,
    };
    
    onComplete(metrics);
  };
  
  // Calculate score
  const calculateScore = (accuracy: number, misses: number, incorrects: number) => {
    // Base score from accuracy (0-80 points)
    const accuracyScore = accuracy * 80;
    
    // Penalties for misses and incorrect responses (0-20 points)
    // The more misses and incorrect responses, the lower this part of the score
    const totalTrials = TOTAL_TRIALS;
    const errorPenalty = Math.max(0, 20 - ((misses + incorrects) / totalTrials) * 40);
    
    return Math.round(accuracyScore + errorPenalty);
  };
  
  // Toggle pause state
  const togglePause = () => {
    setIsPaused(prev => !prev);
  };
  
  // Effects for pause/resume
  useEffect(() => {
    if (isPaused) {
      // Clear timers during pause
      if (stimulusTimer.current) {
        clearTimeout(stimulusTimer.current);
        stimulusTimer.current = null;
      }
      if (feedbackTimer.current) {
        clearTimeout(feedbackTimer.current);
        feedbackTimer.current = null;
      }
    } else if (gameState === 'playing' && currentLetter) {
      // Resume stimulus timer
      const remainingTime = STIMULUS_DURATION - (Date.now() - (stimulusStartTime || Date.now()));
      if (remainingTime > 0) {
        stimulusTimer.current = window.setTimeout(() => {
          if (shouldRespond) {
            setMissedResponses(prev => prev + 1);
          }
          moveToNextTrial();
        }, remainingTime);
      } else {
        moveToNextTrial();
      }
    }
  }, [isPaused, gameState, currentLetter, stimulusStartTime, shouldRespond]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stimulusTimer.current) clearTimeout(stimulusTimer.current);
      if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    };
  }, []);

  return (
    <Card className="w-full max-w-md mx-auto bg-white/95 backdrop-blur-sm shadow-lg border-0">
      <CardHeader className="border-b pb-3">
        <CardTitle className="text-center">X 찾아라!</CardTitle>
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
            <p className="text-lg">
              다양한 알파벳이 화면에 나타납니다. <strong>X가 아닌 모든 글자</strong>에 대해 화면을 탭하세요.
            </p>
            <p>
              X가 나타나면 탭하지 마세요! 10번의 문자가 제시됩니다.
            </p>
            <Button onClick={handleStart}>시작하기</Button>
          </div>
        )}

        {(gameState === 'playing' || gameState === 'feedback') && !isPaused && (
          <div className="flex flex-col items-center w-full" onClick={handleResponse}>
            <div
              className={`w-32 h-32 flex items-center justify-center rounded-md cursor-pointer ${
                gameState === 'feedback'
                  ? currentLetter === "X"
                    ? "bg-green-100" // Correct no-response for X
                    : "bg-green-500 text-white" // Correct response for non-X
                  : "bg-gray-100"
              }`}
            >
              <span className="text-7xl font-bold">{currentLetter}</span>
            </div>
            
            <p className="mt-8 text-sm text-muted-foreground">
              X 외의 모든 글자가 보이면 화면을 탭하세요
            </p>
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
        
        {!isPaused && (gameState === 'playing' || gameState === 'feedback') && (
          <div className="absolute top-4 left-4 p-2 bg-white/80 rounded text-sm">
            진행: {trialNumber + 1}/{TOTAL_TRIALS}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
