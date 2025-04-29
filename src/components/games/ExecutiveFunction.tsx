
import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ExecutiveFunctionGameProps {
  onComplete: (metrics: Record<string, any>) => void;
  isBaseline?: boolean;
}

type StimulusType = 'go' | 'nogo';

export function ExecutiveFunctionGame({ onComplete, isBaseline = false }: ExecutiveFunctionGameProps) {
  // Game state
  const [gameState, setGameState] = useState<'instruction' | 'waiting' | 'stimulus' | 'finished'>('instruction');
  const [isPaused, setIsPaused] = useState(false);
  
  // Current trial
  const [currentStimulus, setCurrentStimulus] = useState<StimulusType | null>(null);
  const [trialNumber, setTrialNumber] = useState(0);
  
  // Game metrics
  const [goTrials, setGoTrials] = useState(0);
  const [goHits, setGoHits] = useState(0);
  const [goReactionTimes, setGoReactionTimes] = useState<number[]>([]);
  const [nogoTrials, setNogoTrials] = useState(0);
  const [nogoCommissionErrors, setNogoCommissionErrors] = useState(0);
  
  // Refs for timers
  const stimulusTimer = useRef<number | null>(null);
  const isiTimer = useRef<number | null>(null);
  const stimulusStartTime = useRef<number | null>(null);
  
  // Constants
  const TOTAL_TRIALS = 40;
  const GO_RATIO = 0.7; // 70% go trials
  const STIMULUS_DURATION = 500; // ms
  const ISI = 1000; // Inter-stimulus interval in ms
  
  // Start the game
  const handleStart = () => {
    setGameState('waiting');
    setTrialNumber(0);
    setGoTrials(0);
    setGoHits(0);
    setGoReactionTimes([]);
    setNogoTrials(0);
    setNogoCommissionErrors(0);
    startNewTrial();
  };
  
  // Start a new trial
  const startNewTrial = useCallback(() => {
    // Clear any existing timers
    if (stimulusTimer.current) {
      clearTimeout(stimulusTimer.current);
    }
    if (isiTimer.current) {
      clearTimeout(isiTimer.current);
    }
    
    // Show fixation point (waiting state)
    setGameState('waiting');
    setCurrentStimulus(null);
    
    // Set timer to show stimulus
    stimulusTimer.current = window.setTimeout(() => {
      // Determine if this is a go or no-go trial
      const isGoTrial = Math.random() < GO_RATIO;
      const stimulusType: StimulusType = isGoTrial ? 'go' : 'nogo';
      
      // Update trial counts
      if (isGoTrial) {
        setGoTrials(prev => prev + 1);
      } else {
        setNogoTrials(prev => prev + 1);
      }
      
      // Show stimulus
      setCurrentStimulus(stimulusType);
      setGameState('stimulus');
      stimulusStartTime.current = Date.now();
      
      // Set timer to hide stimulus
      stimulusTimer.current = window.setTimeout(() => {
        // If this was a go trial and no response, count as omission
        if (stimulusType === 'go') {
          // No response - omission error is implicitly tracked by comparing goTrials and goHits
        }
        
        // Clear the stimulus
        setCurrentStimulus(null);
        setGameState('waiting');
        
        // Set timer for next trial
        isiTimer.current = window.setTimeout(() => {
          setTrialNumber(prev => {
            if (prev >= TOTAL_TRIALS - 1) {
              finishGame();
              return prev;
            } else {
              startNewTrial();
              return prev + 1;
            }
          });
        }, ISI);
      }, STIMULUS_DURATION);
    }, ISI);
  }, []);
  
  // Handle user response
  const handleResponse = () => {
    if (gameState !== 'stimulus' || isPaused) return;
    
    if (currentStimulus === 'go') {
      // Correct go response
      setGoHits(prev => prev + 1);
      
      // Record reaction time
      const rt = Date.now() - (stimulusStartTime.current || Date.now());
      setGoReactionTimes(prev => [...prev, rt]);
    } else if (currentStimulus === 'nogo') {
      // Commission error (responding to no-go)
      setNogoCommissionErrors(prev => prev + 1);
    }
  };
  
  // Finish the game
  const finishGame = () => {
    // Clear any timers
    if (stimulusTimer.current) {
      clearTimeout(stimulusTimer.current);
    }
    if (isiTimer.current) {
      clearTimeout(isiTimer.current);
    }
    
    setGameState('finished');
    
    // Calculate metrics
    const goTrialHitRate = goTrials > 0 ? goHits / goTrials : 0;
    const commissionsRate = nogoTrials > 0 ? nogoCommissionErrors / nogoTrials : 0;
    const omissionsCount = goTrials - goHits;
    const omissionsRate = goTrials > 0 ? omissionsCount / goTrials : 0;
    
    // Calculate mean go reaction time
    const meanGoRT = goReactionTimes.length > 0 
      ? goReactionTimes.reduce((sum, rt) => sum + rt, 0) / goReactionTimes.length 
      : 0;
    
    // Calculate inhibition accuracy
    const correctNogoResponses = nogoTrials - nogoCommissionErrors;
    const totalTrials = goTrials + nogoTrials;
    const inhibitionAccuracy = totalTrials > 0 
      ? (goHits + correctNogoResponses) / totalTrials 
      : 0;
    
    const score = calculateScore(inhibitionAccuracy, commissionsRate, omissionsRate, meanGoRT);
    
    const metrics = {
      inhibitionAccuracy,
      goTrialHitRate,
      goTrialMeanRT: meanGoRT,
      commissionErrors: commissionsRate,
      omissionErrors: omissionsRate,
      score,
    };
    
    onComplete(metrics);
  };
  
  // Toggle pause state
  const togglePause = () => {
    setIsPaused(prev => !prev);
  };
  
  // Calculate score
  const calculateScore = (
    inhibitionAccuracy: number, 
    commissionsRate: number, 
    omissionsRate: number, 
    meanGoRT: number
  ) => {
    // Base score from inhibition accuracy (0-70 points)
    const accuracyScore = inhibitionAccuracy * 70;
    
    // Penalty for commission errors (0-20 points)
    const commissionPenalty = commissionsRate * 20;
    
    // Penalty for omission errors (0-10 points)
    const omissionPenalty = omissionsRate * 10;
    
    // RT component (0-10 points, faster is better)
    // Normalize RT between 250ms (fastest expected) and 700ms (slowest expected)
    let rtScore = 0;
    if (meanGoRT > 0) {
      rtScore = Math.max(0, Math.min(10, 10 - ((meanGoRT - 250) / 450) * 10));
    }
    
    return Math.round(accuracyScore + rtScore - commissionPenalty - omissionPenalty);
  };
  
  // Effects for pause/resume
  useEffect(() => {
    if (isPaused) {
      // Clear timers during pause
      if (stimulusTimer.current) {
        clearTimeout(stimulusTimer.current);
        stimulusTimer.current = null;
      }
      if (isiTimer.current) {
        clearTimeout(isiTimer.current);
        isiTimer.current = null;
      }
    } else if (gameState !== 'instruction' && gameState !== 'finished') {
      // Resume with the current state
      // Note: This is simplified; in a real implementation, you would need to
      // track elapsed time to resume timers properly
      startNewTrial();
    }
  }, [isPaused, gameState, startNewTrial]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stimulusTimer.current) clearTimeout(stimulusTimer.current);
      if (isiTimer.current) clearTimeout(isiTimer.current);
    };
  }, []);

  return (
    <Card className="w-full max-w-md mx-auto bg-white/95 backdrop-blur-sm shadow-lg border-0">
      <CardHeader className="border-b pb-3">
        <CardTitle className="text-center">빨강엔 클릭! 파랑엔 정지!</CardTitle>
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
            <p className="text-lg">빨간색 원이 나타나면 클릭하고, 파란색 사각형이 나타나면 반응하지 마세요.</p>
            <p>집중해서 지시에 따라주세요!</p>
            <Button onClick={handleStart}>시작하기</Button>
          </div>
        )}

        {(gameState === 'waiting' || gameState === 'stimulus') && !isPaused && (
          <div className="flex flex-col items-center justify-center h-60">
            {/* Fixation cross during waiting */}
            {gameState === 'waiting' && (
              <div className="text-4xl">+</div>
            )}
            
            {/* Stimulus */}
            {gameState === 'stimulus' && (
              <div 
                className="w-40 h-40 flex items-center justify-center cursor-pointer"
                onClick={handleResponse}
              >
                {currentStimulus === 'go' && (
                  <div className="w-32 h-32 rounded-full bg-red-500 animate-scale-in"></div>
                )}
                {currentStimulus === 'nogo' && (
                  <div className="w-32 h-32 bg-blue-500 animate-scale-in"></div>
                )}
              </div>
            )}
            
            <p className="mt-8 text-sm text-muted-foreground">
              빨간 원만 클릭하세요!
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
        
        {!isPaused && (gameState === 'waiting' || gameState === 'stimulus') && (
          <div className="absolute top-4 left-4 p-2 bg-white/80 rounded text-sm">
            진행: {trialNumber + 1}/{TOTAL_TRIALS}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
