
import { createContext, useContext, ReactNode } from 'react';
import { SleepRecord } from '@/types';
import { toast } from "@/components/ui/use-toast";
import { useAuth } from './AuthContext';

interface SleepContextType {
  saveBaselineSleepProfile: (answers: number[]) => void;
  saveDailySleepRecord: (answers: number[]) => SleepRecord;
  getSleepRecords: (userId: string) => SleepRecord[];
  getLatestSleepRecord: (userId: string) => SleepRecord | null;
  calculateSleepScore: (answers: number[]) => number;
}

const SleepContext = createContext<SleepContextType | undefined>(undefined);

export const useSleep = () => {
  const context = useContext(SleepContext);
  if (context === undefined) {
    throw new Error('useSleep must be used within a SleepProvider');
  }
  return context;
};

export const SleepProvider = ({ children }: { children: ReactNode }) => {
  const { user, updateUser } = useAuth();

  const calculateSleepScore = (answers: number[]): number => {
    // Calculate sleep score based on the 4 answers
    // For questions 1, 2 and 4: Higher index (except for extreme values) is better
    // For question 3: Lower index is better
    
    // Q1: Sleep duration (best: 7-8 hours)
    const q1Score = [2, 3, 4, 5, 4][answers[0]];
    
    // Q2: Sleep quality (higher is better, but inverted in our scale)
    const q2Score = [5, 4, 3, 2, 1][answers[1]];
    
    // Q3: Drowsiness (lower is better)
    const q3Score = [5, 4, 2, 1][answers[2]];
    
    // Q4: Morning feeling (higher is better, but inverted in our scale)
    const q4Score = [5, 4, 3, 2, 1][answers[3]];
    
    // Sum scores (max 20) and normalize to 0-100
    const totalScore = q1Score + q2Score + q3Score + q4Score;
    return Math.round((totalScore / 20) * 100);
  };

  const saveBaselineSleepProfile = (answers: number[]) => {
    if (!user) {
      toast({
        title: "오류",
        description: "사용자 정보를 찾을 수 없습니다.",
        variant: "destructive",
      });
      return;
    }

    const baselineSleepProfile = {
      q1: answers[0],
      q2: answers[1],
      q3: answers[2],
      q4: answers[3]
    };

    updateUser({ baselineSleepProfile });
  };

  const saveDailySleepRecord = (answers: number[]): SleepRecord => {
    if (!user) {
      throw new Error("User not found");
    }

    const sleepRecord: SleepRecord = {
      id: Date.now().toString(),
      userId: user.id,
      timestamp: new Date().toISOString(),
      q1Answer: answers[0],
      q2Answer: answers[1],
      q3Answer: answers[2],
      q4Answer: answers[3],
      calculatedSleepScore: calculateSleepScore(answers)
    };

    // Save to local storage
    const storageKey = `focuz_sleep_records_${user.id}`;
    const existingRecords = localStorage.getItem(storageKey);
    
    const records = existingRecords ? JSON.parse(existingRecords) : [];
    records.push(sleepRecord);
    
    localStorage.setItem(storageKey, JSON.stringify(records));

    return sleepRecord;
  };

  const getSleepRecords = (userId: string): SleepRecord[] => {
    const storageKey = `focuz_sleep_records_${userId}`;
    const existingRecords = localStorage.getItem(storageKey);
    
    if (!existingRecords) return [];
    
    return JSON.parse(existingRecords);
  };

  const getLatestSleepRecord = (userId: string): SleepRecord | null => {
    const records = getSleepRecords(userId);
    
    if (records.length === 0) return null;
    
    // Sort by timestamp descending
    records.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    return records[0];
  };

  return (
    <SleepContext.Provider value={{ 
      saveBaselineSleepProfile,
      saveDailySleepRecord,
      getSleepRecords,
      getLatestSleepRecord,
      calculateSleepScore
    }}>
      {children}
    </SleepContext.Provider>
  );
};
