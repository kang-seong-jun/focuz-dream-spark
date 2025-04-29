
import { useState, useEffect, useRef } from "react";

interface UseDigitSpanGameProps {
  onComplete: (metrics: Record<string, any>) => void;
  isBaseline?: boolean;
}

export function useDigitSpanGame({ onComplete, isBaseline = false }: UseDigitSpanGameProps) {
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

  // Constants - updated timing
  const MAX_TOTAL_ROUNDS = 3; // Total 3 rounds regardless of correctness
  const NUMBER_DURATION = 150; // 0.15 second number display
  const PAUSE_DURATION = 150; // 0.15 second pause between numbers
  const FINAL_PAUSE_DURATION = 300; // 0.3 second pause after last number

  // Start the game
  const startGame = () => {
    setGameState('playing');
    setSequenceLength(7); // Start with exactly 7 digits for round 1
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

    // Create a sequence with exactly the right number of digits for this round
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
      }, 100);
      
      i++;

      if (i === newSequence.length) {
        clearInterval(timerRef.current);
        timerRef.current = null;
        
        // Added longer delay before input phase
        setTimeout(() => {
          setDisplayNumber(null);
          setPrevDisplayNumber(null);
          setIsGenerating(false);
        }, FINAL_PAUSE_DURATION);
      }
    }, NUMBER_DURATION + PAUSE_DURATION);
  };

  // Handle user input
  const handleInput = (number: number) => {
    if (isGenerating || isPaused) return;

    setInputSequence([...inputSequence, number]);
  };

  // Remove last digit from input
  const handleRemoveLastDigit = () => {
    if (isGenerating || isPaused || inputSequence.length === 0) return;
    
    setInputSequence(inputSequence.slice(0, -1));
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
      // Move to next round with exact sequence length
      setTimeout(() => {
        setShowFeedback(false);
        // Explicitly set sequence length based on round number
        if (roundsCompleted === 0) {
          // After completing round 1, set length to 8 for round 2
          setSequenceLength(8);
        } else if (roundsCompleted === 1) {
          // After completing round 2, set length to 9 for round 3
          setSequenceLength(9);
        }
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

  return {
    // Game state
    gameState,
    isPaused,
    roundsCompleted,
    sequenceLength,
    
    // Display state
    displayNumber,
    prevDisplayNumber,
    numberChanged,
    feedback,
    showFeedback,
    isGenerating,
    inputSequence,
    
    // Actions
    startGame,
    handleInput,
    handleRemoveLastDigit,
    handleSubmit,
    togglePause,
  };
}
