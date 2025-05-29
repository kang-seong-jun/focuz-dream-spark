import { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface WorkingMemoryGameProps {
  onComplete: (metrics: Record<string, any>) => void;
  isBaseline?: boolean;
}

export function WorkingMemoryGame({ onComplete, isBaseline = false }: WorkingMemoryGameProps) {
  const [gamePhase, setGamePhase] = useState<'instruction' | 'playing' | 'waitingForNext' | 'finished'>('instruction');
  const [sequence, setSequence] = useState<number[]>([]);
  const [userSequence, setUserSequence] = useState<number[]>([]);
  const [currentLevel, setCurrentLevel] = useState(2);
  const [showingSequence, setShowingSequence] = useState(false);
  const [activeCell, setActiveCell] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [maxLevel, setMaxLevel] = useState(2);
  const [round, setRound] = useState(1);
  const [totalRounds] = useState(8);
  const [consecutiveFailures, setConsecutiveFailures] = useState(0);

  const generateSequence = useCallback(() => {
    const newSequence = [];
    for (let i = 0; i < currentLevel; i++) {
      newSequence.push(Math.floor(Math.random() * 9));
    }
    setSequence(newSequence);
    setUserSequence([]);
  }, [currentLevel]);

  const showSequence = useCallback(() => {
    setShowingSequence(true);
    setGamePhase('playing');
    
    sequence.forEach((cellIndex, index) => {
      setTimeout(() => {
        setActiveCell(cellIndex);
        setTimeout(() => {
          setActiveCell(null);
          if (index === sequence.length - 1) {
            setShowingSequence(false);
          }
        }, 600);
      }, index * 800);
    });
  }, [sequence]);

  const handleCellClick = (cellIndex: number) => {
    if (showingSequence || gamePhase !== 'playing') return;
    
    const newUserSequence = [...userSequence, cellIndex];
    setUserSequence(newUserSequence);
    
    if (newUserSequence[newUserSequence.length - 1] !== sequence[newUserSequence.length - 1]) {
      const newConsecutiveFailures = consecutiveFailures + 1;
      setConsecutiveFailures(newConsecutiveFailures);
      
      if (newConsecutiveFailures >= 2 || round >= totalRounds) {
        setGamePhase('finished');
        return;
      }
      
      setGamePhase('waitingForNext');
      return;
    }
    
    if (newUserSequence.length === sequence.length) {
      const newScore = score + (currentLevel * 10);
      setScore(newScore);
      setMaxLevel(Math.max(maxLevel, currentLevel));
      setConsecutiveFailures(0);
      
      if (round >= totalRounds) {
        setGamePhase('finished');
        return;
      }
      
      setGamePhase('waitingForNext');
    }
  };

  useEffect(() => {
    if (gamePhase === 'playing' && sequence.length > 0) {
      showSequence();
    }
  }, [gamePhase, sequence, showSequence]);

  useEffect(() => {
    if (gamePhase === 'finished') {
      onComplete({
        score: score,
        workingMemorySpan: maxLevel,
        totalRounds: round - 1,
        accuracy: round > 1 ? ((round - 1 - consecutiveFailures) / (round - 1)) * 100 : 0
      });
    }
  }, [gamePhase, score, maxLevel, round, consecutiveFailures, onComplete]);

  const startGame = () => {
    generateSequence();
    setGamePhase('playing');
  };

  const nextRound = () => {
    const newRound = round + 1;
    setRound(newRound);
    
    if (consecutiveFailures === 0) {
      setCurrentLevel(prev => Math.min(prev + 1, 9));
    }
    
    generateSequence();
    setGamePhase('playing');
  };

  const renderGrid = () => {
    return (
      <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto mb-6">
        {Array.from({ length: 9 }, (_, index) => (
          <div
            key={index}
            className={`
              w-20 h-20 rounded-xl border-2 cursor-pointer transition-all duration-200 transform
              ${activeCell === index 
                ? 'bg-gradient-to-br from-neon-yellow to-electric-orange border-electric-orange scale-105 shadow-lg shadow-neon-yellow/50' 
                : 'bg-gradient-to-br from-electric-blue/10 to-neon-purple/10 border-electric-blue/30 hover:from-electric-blue/20 hover:to-neon-purple/20 hover:border-electric-blue hover:scale-105'
              }
              ${!showingSequence && gamePhase === 'playing' ? 'hover:shadow-md hover:shadow-electric-blue/30' : ''}
            `}
            onClick={() => handleCellClick(index)}
          />
        ))}
      </div>
    );
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-white/90 backdrop-blur-lg border-0 shadow-2xl shadow-electric-blue/20">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-xl font-bold bg-gradient-to-r from-electric-blue to-neon-purple bg-clip-text text-transparent">
          패턴 기억하기
        </CardTitle>
        {gamePhase !== 'instruction' && (
          <div className="flex justify-between text-sm font-medium text-electric-blue">
            <span>라운드: {round}/{totalRounds}</span>
            <span>레벨: {currentLevel}</span>
            <span>점수: {score}</span>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="text-center space-y-4">
        {gamePhase === 'instruction' && (
          <div className="space-y-4">
            <p className="text-electric-blue leading-relaxed font-medium">
              노란색으로 빛나는 순서를 기억하고<br />
              같은 순서로 칸을 눌러주세요
            </p>
            <Button 
              onClick={startGame}
              className="bg-gradient-to-r from-electric-blue to-neon-purple hover:from-neon-blue hover:to-electric-purple text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl hover:shadow-electric-blue/30 transition-all duration-300 transform hover:scale-105"
            >
              게임 시작
            </Button>
          </div>
        )}

        {(gamePhase === 'playing' || gamePhase === 'waitingForNext') && (
          <div className="space-y-4">
            {showingSequence && (
              <div className="text-neon-yellow font-bold text-lg animate-pulse drop-shadow-lg">
                패턴을 기억하세요...
              </div>
            )}
            {!showingSequence && gamePhase === 'playing' && (
              <div className="text-electric-blue font-bold text-lg drop-shadow-lg">
                순서대로 눌러주세요 ({userSequence.length}/{sequence.length})
              </div>
            )}
            
            {renderGrid()}
            
            {gamePhase === 'waitingForNext' && (
              <div className="space-y-4">
                {consecutiveFailures > 0 ? (
                  <div className="text-electric-pink font-bold text-lg drop-shadow-lg">틀렸습니다!</div>
                ) : (
                  <div className="text-neon-green font-bold text-lg drop-shadow-lg">정답입니다!</div>
                )}
                <Button 
                  onClick={nextRound}
                  className="bg-gradient-to-r from-neon-green to-electric-cyan hover:from-electric-cyan hover:to-neon-blue text-white font-semibold px-6 py-2 rounded-xl shadow-lg hover:shadow-xl hover:shadow-neon-green/30 transition-all duration-300 transform hover:scale-105"
                >
                  다음 라운드
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
