import { useState } from "react";
import { MainLayout } from "@/layouts/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGame } from "@/context/GameContext";
import { useSleep } from "@/context/SleepContext";
import { useAuth } from "@/context/AuthContext";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isValid } from "date-fns";
import { ko } from "date-fns/locale";

export default function History() {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const { user } = useAuth();
  const { getGameResults } = useGame();
  const { getSleepRecords } = useSleep();

  // Get all game results and sleep records
  const gameResults = user ? getGameResults(user.id) : [];
  const sleepRecords = user ? getSleepRecords(user.id) : [];

  // Safe date parsing
  const parseDate = (dateString: string): Date | null => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      return isValid(date) ? date : null;
    } catch {
      return null;
    }
  };

  // Format date safely
  const formatDate = (dateString: string, formatStr: string): string => {
    const date = parseDate(dateString);
    if (!date) return '날짜 오류';
    try {
      return format(date, formatStr);
    } catch {
      return '날짜 오류';
    }
  };

  // Format period safely
  const formatPeriod = (record: any): string => {
    if (!record) return '날짜 오류';

    try {
      switch (period) {
        case 'daily':
          return formatDate(record.date, 'M월 d일');
        case 'weekly':
          return record.period ? record.period.replace('~', ' ~ ') : '날짜 오류';
        case 'monthly':
          return record.period ? `${record.period.slice(5)}월` : '날짜 오류';
        default:
          return '날짜 오류';
      }
    } catch {
      return '날짜 오류';
    }
  };

  // Calculate average cognitive score for a date range
  const getAverageCognitiveScore = (startDate: Date, endDate: Date) => {
    const results = gameResults.filter(result => {
      const date = parseDate(result.timestamp);
      return date && date >= startDate && date <= endDate;
    });

    if (results.length === 0) return null;

    const scores = results.map(result => result.metrics.score || 0);
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  };

  // Calculate average sleep score for a date range
  const getAverageSleepScore = (startDate: Date, endDate: Date) => {
    const records = sleepRecords.filter(record => {
      const date = parseDate(record.timestamp);
      return date && date >= startDate && date <= endDate;
    });

    if (records.length === 0) return null;

    const scores = records.map(record => record.calculatedSleepScore);
    return Math.round(scores.reduce((a, b) => a + b, 0) / records.length);
  };

  // Get daily records
  const getDailyRecords = () => {
    const records = new Map();
    
    // Group by date
    gameResults.forEach(result => {
      const date = parseDate(result.timestamp);
      if (!date) return;
      
      const dateKey = format(date, 'yyyy-MM-dd');
      if (!records.has(dateKey)) {
        records.set(dateKey, { date: dateKey, cognitiveScore: 0, sleepScore: null });
      }
      records.get(dateKey).cognitiveScore = result.metrics.score || 0;
    });

    sleepRecords.forEach(record => {
      const date = parseDate(record.timestamp);
      if (!date) return;
      
      const dateKey = format(date, 'yyyy-MM-dd');
      if (!records.has(dateKey)) {
        records.set(dateKey, { date: dateKey, cognitiveScore: null, sleepScore: 0 });
      }
      records.get(dateKey).sleepScore = record.calculatedSleepScore;
    });

    return Array.from(records.values())
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 30); // Show last 30 days
  };

  // Get weekly records
  const getWeeklyRecords = () => {
    const records = new Map();
    
    // Group by week
    [...gameResults, ...sleepRecords].forEach(record => {
      const date = parseDate(record.timestamp);
      if (!date) return;
      
      const weekStart = format(startOfWeek(date, { locale: ko }), 'yyyy-MM-dd');
      const weekEnd = format(endOfWeek(date, { locale: ko }), 'yyyy-MM-dd');
      const weekKey = `${weekStart}~${weekEnd}`;

      if (!records.has(weekKey)) {
        records.set(weekKey, {
          period: weekKey,
          cognitiveScore: getAverageCognitiveScore(startOfWeek(date, { locale: ko }), endOfWeek(date, { locale: ko })),
          sleepScore: getAverageSleepScore(startOfWeek(date, { locale: ko }), endOfWeek(date, { locale: ko }))
        });
      }
    });

    return Array.from(records.values())
      .sort((a, b) => (b.period || '').localeCompare(a.period || ''))
      .slice(0, 12); // Show last 12 weeks
  };

  // Get monthly records
  const getMonthlyRecords = () => {
    const records = new Map();
    
    // Group by month
    [...gameResults, ...sleepRecords].forEach(record => {
      const date = parseDate(record.timestamp);
      if (!date) return;
      
      const monthKey = format(date, 'yyyy-MM');

      if (!records.has(monthKey)) {
        records.set(monthKey, {
          period: monthKey,
          cognitiveScore: getAverageCognitiveScore(startOfMonth(date), endOfMonth(date)),
          sleepScore: getAverageSleepScore(startOfMonth(date), endOfMonth(date))
        });
      }
    });

    return Array.from(records.values())
      .sort((a, b) => (b.period || '').localeCompare(a.period || ''))
      .slice(0, 6); // Show last 6 months
  };

  const renderRecords = (records: any[]) => {
    if (records.length === 0) {
      return (
        <div className="text-center text-muted-foreground py-8">
          기록이 없습니다.
        </div>
      );
    }

    return records.map((record, index) => (
      <Card key={index} className="bg-white/95 backdrop-blur-sm">
        <CardContent className="py-4">
          <div className="flex justify-between items-center">
            <div className="font-medium">
              {formatPeriod(record)}
            </div>
            <div className="flex gap-4">
              <div className="text-sm">
                <span className="text-muted-foreground">수면 </span>
                <span className="font-semibold">{record.sleepScore ?? '-'}점</span>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">인지 </span>
                <span className="font-semibold">{record.cognitiveScore ?? '-'}점</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    ));
  };

  return (
    <MainLayout>
      <div className="space-y-6 pb-16">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">기록</h1>
        </div>

        <Tabs value={period} onValueChange={(value: any) => setPeriod(value)} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="daily">일별</TabsTrigger>
            <TabsTrigger value="weekly">주별</TabsTrigger>
            <TabsTrigger value="monthly">월별</TabsTrigger>
          </TabsList>

          <TabsContent value="daily" className="space-y-4 mt-4">
            {renderRecords(getDailyRecords())}
          </TabsContent>

          <TabsContent value="weekly" className="space-y-4 mt-4">
            {renderRecords(getWeeklyRecords())}
          </TabsContent>

          <TabsContent value="monthly" className="space-y-4 mt-4">
            {renderRecords(getMonthlyRecords())}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
