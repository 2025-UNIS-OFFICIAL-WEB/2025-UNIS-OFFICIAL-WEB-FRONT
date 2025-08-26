import Layout from '@/components/Layout'
import { useState } from 'react'
import { updateApplyInfo } from '@/api/apply'
import useFetch from '@/hooks/useFetch'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Save } from 'lucide-react'
import { clearTokens } from '@/lib/token'

const Apply = () => {
  const navigate = useNavigate()

  const [isAvailable, setIsAvailable] = useState<boolean>(true)
  const [applyUrl, setApplyUrl] = useState<string>('')

  const { fetchData: callUpdateApplyInfo, loading: updateLoading } = useFetch(updateApplyInfo)

  const handleSubmit = async () => {
    try {
      const res = await callUpdateApplyInfo({ isAvailable, applyUrl })
      if (res.status === 200) {
        alert('저장 완료되었습니다.')
      } else {
        alert(res.message ?? '저장에 실패했습니다.')
      }
    } catch (err: any) {
      if (err?.response?.status === 401) {
        clearTokens()
        navigate('/')
        return
      }
      console.error('Failed to update apply info:', err)
      alert(`저장 중 오류 발생: ${err?.message ?? 'Unknown error'}`)
    }
  }

  return (
    <Layout title="지원 관리">
      <div className="space-y-6 pt-8">
        <div className="space-y-6">
          {/* 지원 가능 여부 */}
          <div className="space-y-4">
            <div>
              <Label className="text-md font-medium">지원 가능 여부</Label>
              <p className="text-xs text-muted-foreground mt-1">
                현재 지원 접수를 받고 있는지 설정합니다.
              </p>
            </div>

            <RadioGroup
              value={isAvailable ? 'true' : 'false'}
              onValueChange={(value) => setIsAvailable(value === 'true')}
              className="grid grid-cols-2 gap-4 max-w-md"
            >
              <div className="flex items-center space-x-2 rounded-lg border p-3 transition-colors hover:bg-accent">
                <RadioGroupItem value="true" id="available" />
                <Label htmlFor="available" className="flex-1 cursor-pointer">
                  <div className="font-medium">지원 가능</div>
                  <div className="text-xs text-muted-foreground">현재 지원을 받고 있습니다</div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 rounded-lg border p-3 transition-colors hover:bg-accent">
                <RadioGroupItem value="false" id="unavailable" />
                <Label htmlFor="unavailable" className="flex-1 cursor-pointer">
                  <div className="font-medium">지원 불가능</div>
                  <div className="text-xs text-muted-foreground">현재 지원을 받지 않습니다</div>
                </Label>
              </div>
            </RadioGroup>

            <Alert className={isAvailable ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'}>
              <AlertDescription className={isAvailable ? 'text-green-800' : 'text-orange-800'}>
                {isAvailable
                  ? '✅ 현재 지원 접수가 활성화되어 있습니다.'
                  : '⚠️ 현재 지원 접수가 비활성화되어 있습니다.'}
              </AlertDescription>
            </Alert>
          </div>

          <Separator />

          {/* 지원하기 링크 */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="applyUrl" className="text-md font-medium flex items-center gap-2">
                지원하기 링크
              </Label>
              <p className="text-xs text-muted-foreground mt-1">
                {isAvailable
                  ? '지원자들이 접근할 수 있는 지원 링크를 입력해주세요.'
                  : '지원이 불가능한 상태에서는 링크 입력이 필요하지 않습니다.'}
              </p>
            </div>

            <div className="space-y-2">
              <Input
                id="applyUrl"
                type="url"
                value={applyUrl}
                onChange={(e) => setApplyUrl(e.target.value)}
                placeholder="https://forms.google.com/... 또는 다른 지원 링크"
                className="w-full"
                disabled={!isAvailable}
                required={isAvailable}
              />
            </div>
          </div>

          <Separator />

          {/* 저장 버튼 */}
          <div className="flex justify-end pt-2">
            <Button
              onClick={handleSubmit}
              disabled={updateLoading || (isAvailable && !applyUrl.trim())}
              size="lg"
              className="min-w-[120px]"
            >
              {updateLoading ? (
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
        </div>
      </div>
    </Layout>
  )
}

export default Apply