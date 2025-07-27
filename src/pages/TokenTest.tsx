import { useState } from 'react'
import { login, refreshAccessToken } from '@/api/auth'
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from '@/lib/token'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import React from 'react'

const TokenTest = () => {
  const [password, setPassword] = useState('linakanggyeorekim')
  const [loading, setLoading] = useState(false)
  const [logs, setLogs] = useState<string[]>([])
  const [tokenInfo, setTokenInfo] = useState({
    accessToken: '',
    refreshToken: '',
    accessTokenPreview: '',
    refreshTokenPreview: ''
  })

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [...prev, `[${timestamp}] ${message}`])
    console.log(message)
  }

  const updateTokenInfo = () => {
    const accessToken = getAccessToken() || ''
    const refreshToken = getRefreshToken() || ''
    
    setTokenInfo({
      accessToken,
      refreshToken,
      accessTokenPreview: accessToken ? `${accessToken.substring(0, 30)}...` : '없음',
      refreshTokenPreview: refreshToken ? `${refreshToken.substring(0, 30)}...` : '없음'
    })
  }

  const testLogin = async () => {
    setLoading(true)
    addLog('🔐 로그인 테스트 시작')
    
    try {
      addLog(`비밀번호: ${password}`)
      const response = await login({ password })
      
      addLog('✅ 로그인 성공!')
      addLog(`Access Token (앞 50자): ${response.accessToken.substring(0, 50)}...`)
      addLog(`Refresh Token (앞 50자): ${response.refreshToken.substring(0, 50)}...`)
      
      // 토큰 저장
      setTokens(response.accessToken, response.refreshToken)
      addLog('💾 토큰 localStorage에 저장 완료')
      
      updateTokenInfo()
      
    } catch (error: any) {
      addLog(`❌ 로그인 실패: ${error.message}`)
    }
    
    setLoading(false)
  }

  const testRefreshToken = async () => {
    setLoading(true)
    addLog('🔄 토큰 갱신 테스트 시작')
    
    try {
      const currentRefreshToken = getRefreshToken()
      
      if (!currentRefreshToken) {
        addLog('❌ Refresh Token이 없습니다. 먼저 로그인하세요.')
        setLoading(false)
        return
      }
      
      addLog(`현재 Refresh Token (앞 50자): ${currentRefreshToken.substring(0, 50)}...`)
      
      const response = await refreshAccessToken(currentRefreshToken)
      
      addLog('✅ 토큰 갱신 성공!')
      addLog(`새 Access Token (앞 50자): ${response.accessToken.substring(0, 50)}...`)
      addLog(`새 Refresh Token (앞 50자): ${response.refreshToken.substring(0, 50)}...`)
      
      // 새 토큰 저장
      setTokens(response.accessToken, response.refreshToken)
      addLog('💾 새 토큰 localStorage에 저장 완료')
      
      updateTokenInfo()
      
    } catch (error: any) {
      addLog(`❌ 토큰 갱신 실패: ${error.message}`)
    }
    
    setLoading(false)
  }

  const testTokenValidation = async () => {
    addLog('🔍 토큰 유효성 검사 시작')
    
    try {
      const accessToken = getAccessToken()
      const refreshToken = getRefreshToken()
      
      if (!accessToken || !refreshToken) {
        addLog('❌ 저장된 토큰이 없습니다.')
        return
      }
      
      // JWT 디코딩 (단순 base64 디코딩, 검증은 안함)
      try {
        const [payload] = accessToken.split('.')
        const decodedPayload = JSON.parse(atob(payload))
        
        addLog('📋 Access Token 정보:')
        addLog(`  - 발급 시간: ${new Date(decodedPayload.iat * 1000).toLocaleString()}`)
        addLog(`  - 만료 시간: ${new Date(decodedPayload.exp * 1000).toLocaleString()}`)
        addLog(`  - 현재 시간: ${new Date().toLocaleString()}`)
        
        const isExpired = decodedPayload.exp * 1000 < Date.now()
        addLog(`  - 만료 여부: ${isExpired ? '만료됨' : '유효함'}`)
        
      } catch (decodeError) {
        addLog('❌ 토큰 디코딩 실패 (JWT 형식이 아닐 수 있음)')
      }
      
    } catch (error: any) {
      addLog(`❌ 토큰 검사 실패: ${error.message}`)
    }
  }

  const clearAllTokens = () => {
    clearTokens()
    addLog('🗑️ 모든 토큰 삭제 완료')
    setTokenInfo({
      accessToken: '',
      refreshToken: '',
      accessTokenPreview: '없음',
      refreshTokenPreview: '없음'
    })
  }

  const clearLogs = () => {
    setLogs([])
  }

  // 컴포넌트 마운트 시 현재 토큰 정보 로드
  React.useEffect(() => {
    updateTokenInfo()
  }, [])

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>🔐 토큰 테스트 페이지</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="관리자 비밀번호 입력"
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button onClick={testLogin} disabled={loading}>
                1. 로그인 테스트
              </Button>
              <Button onClick={testRefreshToken} disabled={loading} variant="outline">
                2. 토큰 갱신 테스트
              </Button>
              <Button onClick={testTokenValidation} variant="outline">
                3. 토큰 유효성 검사
              </Button>
              <Button onClick={clearAllTokens} variant="destructive">
                토큰 삭제
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 현재 토큰 정보 */}
        <Card>
          <CardHeader>
            <CardTitle>📋 현재 토큰 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <Label>Access Token:</Label>
              <p className="text-sm font-mono bg-gray-100 p-2 rounded">
                {tokenInfo.accessTokenPreview}
              </p>
            </div>
            <div>
              <Label>Refresh Token:</Label>
              <p className="text-sm font-mono bg-gray-100 p-2 rounded">
                {tokenInfo.refreshTokenPreview}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 로그 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>📝 테스트 로그</CardTitle>
            <Button onClick={clearLogs} variant="outline" size="sm">
              로그 지우기
            </Button>
          </CardHeader>
          <CardContent>
            <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
              {logs.length === 0 ? (
                <p>로그가 없습니다. 테스트를 시작하세요.</p>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="mb-1">
                    {log}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* 사용법 안내 */}
        <Alert>
          <AlertDescription>
            <strong>테스트 순서:</strong><br/>
            1. 먼저 "로그인 테스트"를 실행하여 토큰을 발급받으세요<br/>
            2. "토큰 유효성 검사"로 토큰 정보를 확인하세요<br/>
            3. "토큰 갱신 테스트"로 새 토큰 발급을 테스트하세요<br/>
            4. 각 단계마다 로그를 확인하여 문제점을 파악하세요
          </AlertDescription>
        </Alert>
      </div>
    </div>
  )
}

export default TokenTest