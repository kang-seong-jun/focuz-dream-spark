
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { MainLayout } from "@/layouts/MainLayout";

export default function Intro() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<'info' | 'privacy'>('info');
  const [privacyChecked, setPrivacyChecked] = useState(false);

  return (
    <MainLayout withNavigation={false}>
      <div className="min-h-[calc(100vh-2rem)] flex flex-col items-center justify-center p-4">
        {currentStep === 'info' ? (
          <div className="max-w-md mx-auto text-center space-y-8 animate-fade-in">
            <h1 className="text-3xl font-bold">잠과 퍼포먼스의 연결고리 찾기</h1>
            
            <div className="space-y-6">
              <div className="flex flex-col items-center space-y-3 p-4 border rounded-lg bg-white/80">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">1</div>
                <h2 className="font-semibold">먼저, 당신의 평소 수면 습관과 현재 인지 능력을 측정해요.</h2>
                <p className="text-sm text-muted-foreground">초기 설정을 통해 기준점을 만들어요</p>
              </div>
              
              <div className="flex flex-col items-center space-y-3 p-4 border rounded-lg bg-white/80">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">2</div>
                <h2 className="font-semibold">매일 간단한 수면 체크 후, 미니 게임을 플레이해요.</h2>
                <p className="text-sm text-muted-foreground">단 2분만에 수면과 인지 능력을 기록해요</p>
              </div>
              
              <div className="flex flex-col items-center space-y-3 p-4 border rounded-lg bg-white/80">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">3</div>
                <h2 className="font-semibold">수면과 게임 결과의 관계를 확인하고 맞춤 조언을 받으세요.</h2>
                <p className="text-sm text-muted-foreground">당신만의 패턴을 발견하고 개선해요</p>
              </div>
            </div>
            
            <Button 
              className="w-full" 
              size="lg"
              onClick={() => setCurrentStep('privacy')}
            >
              다음
            </Button>
          </div>
        ) : (
          <div className="max-w-md mx-auto space-y-6 p-6 bg-white/95 rounded-lg shadow-sm animate-fade-in">
            <h1 className="text-2xl font-bold text-center">소중한 정보, 안전하게 활용됩니다.</h1>
            
            <div className="space-y-4 text-sm">
              <p>FOCUZ는 사용자가 입력한 수면 데이터와 게임 결과를 수집하여 분석에 활용합니다. 이는 개인화된 수면-인지 기능 관계 분석과 서비스 개선을 위해서만 사용됩니다.</p>
              
              <p>수집하는 정보:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>사용자가 입력한 수면 관련 데이터</li>
                <li>인지 능력 게임의 결과 데이터</li>
                <li>서비스 사용 패턴</li>
              </ul>
              
              <p>모든 데이터는 암호화되어 안전하게 보관되며, 제3자에게 제공되지 않습니다.</p>
              
              <div className="text-right">
                <a href="#" className="text-primary underline text-sm">개인정보처리방침</a>
              </div>
            </div>
            
            <div className="pt-4 border-t flex items-start space-x-2">
              <Checkbox 
                id="privacy-consent" 
                checked={privacyChecked}
                onCheckedChange={(checked) => setPrivacyChecked(checked === true)}
              />
              <Label 
                htmlFor="privacy-consent" 
                className="text-sm font-normal"
              >
                개인정보 수집 및 이용에 동의합니다.
              </Label>
            </div>
            
            <Button 
              className="w-full" 
              size="lg"
              disabled={!privacyChecked}
              onClick={() => navigate("/register")}
            >
              동의하고 계속하기
            </Button>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
