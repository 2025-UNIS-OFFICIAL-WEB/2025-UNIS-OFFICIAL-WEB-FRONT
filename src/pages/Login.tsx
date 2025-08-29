import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { login } from '@/api/auth';
import { setTokens } from '@/lib/token';
import { CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { accessToken, refreshToken } = await login({ password });
      setTokens(accessToken, refreshToken);
      navigate('/apply');
    } catch (err) {
      let errorMessage = '알 수 없는 오류가 발생했습니다.';
      if (axios.isAxiosError(err)) {
        errorMessage = err.response?.data?.message || '로그인에 실패했습니다. 비밀번호를 확인해주세요.';
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen lg:grid lg:grid-cols-2">
      {/* 왼쪽 브랜딩 패널 */}
      <div className="hidden bg-muted lg:flex flex-col items-center justify-center p-8">
        <div className="flex flex-col items-center text-center space-y-4">
            <img 
              src="/unis_symbol.svg" 
              alt="UNIS Logo" 
              className="w-16 h-16"
            />
            <div className="space-y-2">
                <h1 className="text-3xl font-bold">UNIS Admin</h1>
                <p className="text-muted-foreground">유니스 공식 웹사이트 어드민 페이지입니다.</p>
            </div>
        </div>
      </div>
      
      {/* 오른쪽 폼 패널 */}
      <div className="flex items-center justify-center p-4">
        <div className="w-full max-w-sm mx-auto">
          <CardHeader className="text-center space-y-4">
            <div className="space-y-1">
              <CardTitle className="text-2xl font-bold">관리자 로그인</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">비밀번호</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                />
              </div>

              {error && (
                  <div className="flex items-center gap-2 text-sm font-medium text-destructive bg-destructive/10 p-3 rounded-md">
                    <AlertCircle className="h-4 w-4" />
                    <p>{error}</p>
                  </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    확인 중...
                  </>
                ) : (
                  '로그인'
                )}
              </Button>
            </form>
          </CardContent>
        </div>
      </div>
    </div>
  );
};

export default Login;

