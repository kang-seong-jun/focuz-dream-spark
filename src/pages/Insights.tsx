
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/layouts/MainLayout";
import { useAuth } from "@/context/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Insights() {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();

  // Redirect to login if no user
  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login');
    }
  }, [user, isLoading, navigate]);

  // If loading or no user, show loading
  if (isLoading || !user) {
    return <div>로딩 중...</div>;
  }

  // Sample sleep tips
  const sleepTips = [
    {
      category: "잠자리 환경 조성",
      tips: [
        "침실은 최대한 어둡고 조용하며 시원하게 유지하세요.",
        "편안한 매트리스와 베개를 사용하세요.",
        "공기 청정기를 사용하여 쾌적한 공기 질을 유지하세요."
      ]
    },
    {
      category: "취침 전 습관",
      tips: [
        "잠들기 최소 1시간 전에는 스마트폰 등 밝은 화면 사용을 자제하세요.",
        "일정한 취침 루틴을 만들어 신체에 수면 신호를 보내세요.",
        "취침 전 가벼운 스트레칭이나 명상으로 몸과 마음을 이완시키세요."
      ]
    },
    {
      category: "낮 시간 활동",
      tips: [
        "매일 같은 시간에 잠자리에 들고 일어나는 규칙적인 수면 스케줄을 지키세요.",
        "낮잠은 20-30분 이내로 제한하고, 오후 늦게는 피하세요.",
        "규칙적인 운동은 수면의 질을 향상시키지만, 취침 직전 격렬한 운동은 피하세요."
      ]
    },
    {
      category: "식단과 수면",
      tips: [
        "카페인은 수면에 영향을 줄 수 있으므로 오후 이후에는 섭취를 피하세요.",
        "취침 전 과식이나 과도한 수분 섭취는 피하세요.",
        "저녁에는 소화가 잘 되는 가벼운 식사를 하세요."
      ]
    }
  ];

  return (
    <MainLayout>
      <div className="space-y-6 pb-16">
        <h1 className="text-2xl font-bold">인사이트 및 수면 팁</h1>
        
        <Tabs defaultValue="tips" className="space-y-6">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="insights">맞춤 분석</TabsTrigger>
            <TabsTrigger value="tips">일반 수면 팁</TabsTrigger>
          </TabsList>
          
          <TabsContent value="insights" className="space-y-4">
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-lg">맞춤 분석을 위한 데이터를 수집 중입니다.</p>
                <p className="text-muted-foreground mt-2">
                  더 많은 수면 기록과 게임 결과가 쌓이면 개인화된 인사이트를 제공해 드립니다.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="tips" className="space-y-6">
            {sleepTips.map((category, index) => (
              <Card key={index}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{category.category}</CardTitle>
                </CardHeader>
                <CardContent className="pt-2">
                  <ul className="space-y-3">
                    {category.tips.map((tip, tipIndex) => (
                      <li key={tipIndex} className="flex items-start">
                        <span className="mr-2 text-focus-blue">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
