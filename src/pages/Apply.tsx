import Layout from '@/components/Layout';
import { useState } from 'react';
import axios from 'axios';
import { updateApplyInfo } from '@/api/apply';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Save, AlertCircle, CheckCircle2 } from 'lucide-react';

// --- 컴포넌트 분리: UI 피드백을 위한 Alert 컴포넌트 ---
interface FeedbackAlertProps {
  type: 'success' | 'error';
  message: string;
}

const FeedbackAlert = ({ type, message }: FeedbackAlertProps) => {
  const isSuccess = type === 'success';
  const Icon = isSuccess ? CheckCircle2 : AlertCircle;

  return (
    <Alert variant={isSuccess ? 'default' : 'destructive'} className={isSuccess ? 'bg-green-50 border-green-200' : ''}>
      <Icon className="h-4 w-4" />
      <AlertDescription className={isSuccess ? 'text-green-800' : ''}>
        {message}
      </AlertDescription>
    </Alert>
  );
};


const Apply = () => {
  const [isAvailable, setIsAvailable] = useState<boolean>(true);
  const [applyUrl, setApplyUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackAlertProps | null>(null);

  const handleSubmit = async () => {
    setIsLoading(true);
    setFeedback(null); // 이전 피드백 메시지 초기화

    try {
      const response = await updateApplyInfo({ isAvailable, applyUrl });
      if (response.status === 200) {
        setFeedback({ type: 'success', message: '성공적으로 저장되었습니다.' });
      } else {
        setFeedback({ type: 'error', message: response.message || '저장에 실패했습니다.' });
      }
    } catch (err) {
      // 인증 에러(401)는 useAuthInterceptor가 자동으로 처리하므로, 여기서는 일반적인 오류만 처리합니다.
      let errorMessage = '저장 중 알 수 없는 오류가 발생했습니다.';
      if (axios.isAxiosError(err)) {
        errorMessage = err.response?.data?.message || err.message;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      setFeedback({ type: 'error', message: errorMessage });
      console.error('Failed to update apply info:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout title="지원 관리">
      <div className="space-y-8 pt-8">
        {/* 지원 가능 여부 섹션 */}
        <div className="space-y-4">
          <div>
            <Label className="text-base font-semibold">지원 가능 여부</Label>
            <p className="text-sm text-muted-foreground mt-1">현재 지원 접수를 받고 있는지 설정합니다.</p>
          </div>
          <RadioGroup
            value={isAvailable ? 'true' : 'false'}
            onValueChange={(value) => setIsAvailable(value === 'true')}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md"
          >
            <Label htmlFor="available" className="flex items-center space-x-3 rounded-lg border p-4 cursor-pointer transition-colors hover:bg-accent [&:has([data-state=checked])]:bg-accent">
              <RadioGroupItem value="true" id="available" />
              <div>
                <div className="font-medium">지원 가능</div>
                <div className="text-xs text-muted-foreground">현재 지원을 받고 있습니다</div>
              </div>
            </Label>
            <Label htmlFor="unavailable" className="flex items-center space-x-3 rounded-lg border p-4 cursor-pointer transition-colors hover:bg-accent [&:has([data-state=checked])]:bg-accent">
              <RadioGroupItem value="false" id="unavailable" />
              <div>
                <div className="font-medium">지원 불가능</div>
                <div className="text-xs text-muted-foreground">현재 지원을 받지 않습니다</div>
              </div>
            </Label>
          </RadioGroup>
        </div>

        <Separator />

        {/* 지원하기 링크 섹션 */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="applyUrl" className="text-base font-semibold">지원하기 링크</Label>
            <p className="text-sm text-muted-foreground mt-1">
              {isAvailable ? '지원자들이 접근할 지원 링크를 입력해주세요.' : '지원이 불가능한 상태에서는 링크가 필요하지 않습니다.'}
            </p>
          </div>
          <Input
            id="applyUrl"
            type="url"
            value={applyUrl}
            onChange={(e) => setApplyUrl(e.target.value)}
            placeholder="https://forms.google.com/..."
            className="max-w-md"
            disabled={!isAvailable}
            required={isAvailable}
          />
        </div>

        <Separator />

        <div className="space-y-4">
          <div className="flex justify-end">
            <Button
              onClick={handleSubmit}
              disabled={isLoading || (isAvailable && !applyUrl.trim())}
              size="lg"
              className="min-w-[140px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  저장 중...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  설정 저장
                </>
              )}
            </Button>
          </div>

          {/* 피드백 메시지는 버튼 아래에, 전체 너비로 표시 */}
          {feedback && (
            <div className="w-full">
              <FeedbackAlert type={feedback.type} message={feedback.message} />
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Apply;

