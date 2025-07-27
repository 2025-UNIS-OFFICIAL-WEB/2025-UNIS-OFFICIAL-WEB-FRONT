import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '@/components/Layout'
import { deleteProject, getProjects } from '@/api/projects'
import type { Project } from '@/api/projects'
import useFetch from '@/hooks/useFetch'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

interface LogEntry {
  timestamp: string
  type: 'info' | 'error' | 'success'
  message: string
  details?: any
}

const DeleteProject = () => {
  const navigate = useNavigate()
  const { fetchData: callDeleteProject, loading: deleteLoading } = useFetch(deleteProject)
  const { fetchData: callGetProjects, loading: projectsLoading } = useFetch(getProjects)

  const [projectId, setProjectId] = useState('')
  const [projects, setProjects] = useState<Project[]>([])
  const [showProjects, setShowProjects] = useState(false)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [preventRedirect, setPreventRedirect] = useState(true)

  // 로그 추가 함수
  const addLog = (type: LogEntry['type'], message: string, details?: any) => {
    const newLog: LogEntry = {
      timestamp: new Date().toLocaleTimeString(),
      type,
      message,
      details
    }
    setLogs(prev => [newLog, ...prev])
    console.log(`[${type.toUpperCase()}] ${message}`, details)
  }

  // 현재 토큰 상태 확인 함수
  const checkTokenStatus = () => {
    const accessToken = localStorage.getItem('accessToken')
    const refreshToken = localStorage.getItem('refreshToken')
    
    addLog('info', '토큰 상태 확인', {
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
      accessTokenLength: accessToken?.length || 0,
      refreshTokenLength: refreshToken?.length || 0,
      accessTokenStart: accessToken ? accessToken.substring(0, 20) + '...' : 'none',
      refreshTokenStart: refreshToken ? refreshToken.substring(0, 20) + '...' : 'none'
    })

    // 토큰이 없으면 경고
    if (!accessToken) {
      addLog('error', '액세스 토큰이 없습니다. 로그인이 필요합니다.')
      return false
    }

    return true
  }

  // 프로젝트 목록 불러오기
  const handleLoadProjects = async () => {
    try {
      addLog('info', '프로젝트 목록 요청 시작...')
      
      // 토큰 상태 먼저 확인
      if (!checkTokenStatus()) {
        return
      }

      const data = await callGetProjects()
      setProjects(data)
      setShowProjects(true)
      addLog('success', `프로젝트 목록 로드 성공 (${data.length}개)`, {
        projectCount: data.length,
        projects: data.map(p => ({ id: p.projectId, name: p.serviceName }))
      })
    } catch (err: any) {
      addLog('error', '프로젝트 목록 로드 실패', {
        message: err.message,
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        stack: err.stack
      })

      if (err.message === '인증이 필요합니다.' && !preventRedirect) {
        alert('로그인이 만료되었습니다. 다시 로그인해주세요.')
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        navigate('/')
      }
    }
  }

  // 프로젝트 삭제 실행
  const handleDelete = async (id?: number) => {
    const targetId = id || parseInt(projectId)
    
    if (!targetId || isNaN(targetId) || targetId <= 0) {
      addLog('error', '유효하지 않은 프로젝트 ID', { inputId: projectId, parsedId: targetId })
      return
    }

    // 삭제 전 토큰 상태 확인
    if (!checkTokenStatus()) {
      return
    }

    // 삭제 확인
    const confirmMessage = `정말로 프로젝트 ID ${targetId}를 삭제하시겠습니까?`
    if (!confirm(confirmMessage)) {
      addLog('info', '사용자가 삭제를 취소했습니다.')
      return
    }

    addLog('info', `프로젝트 삭제 요청 시작 (ID: ${targetId})`)

    try {
      const result = await callDeleteProject(targetId)
      
      addLog('success', `삭제 API 응답 수신`, {
        status: result.status,
        message: result.message,
        data: result.data,
        fullResponse: result
      })

      if (result.status === 200) {
        addLog('success', `프로젝트 ID ${targetId} 삭제 성공`)
        setProjectId('')
        
        // 프로젝트 목록이 표시 중이면 새로고침
        if (showProjects) {
          setTimeout(() => {
            handleLoadProjects()
          }, 500) // 잠시 대기 후 목록 새로고침
        }
      } else {
        addLog('error', `삭제 실패: ${result.message}`, result)
      }
    } catch (err: any) {
      addLog('error', '프로젝트 삭제 중 예외 발생', {
        message: err.message,
        name: err.name,
        code: err.code,
        status: err.response?.status,
        statusText: err.response?.statusText,
        responseData: err.response?.data,
        responseHeaders: err.response?.headers,
        requestUrl: err.config?.url,
        requestMethod: err.config?.method,
        requestHeaders: err.config?.headers,
        stack: err.stack
      })

      if (err.message === '인증이 필요합니다.' && !preventRedirect) {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        navigate('/')
      }
    }
  }

  // 로그 클리어
  const clearLogs = () => {
    setLogs([])
    addLog('info', '로그가 클리어되었습니다.')
  }

  // 토큰 정보 확인
  const checkTokenInfo = () => {
    checkTokenStatus()
  }

  // 실제 토큰 새로고침 테스트
  const testTokenRefresh = async () => {
    try {
      addLog('info', '토큰 새로고침 테스트 시작...')
      
      const refreshToken = localStorage.getItem('refreshToken')
      if (!refreshToken) {
        addLog('error', 'Refresh Token이 없습니다.')
        return
      }

      // 실제 토큰 새로고침 API 호출
      const response = await fetch('https://admin-unis.com/admin/user/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refreshToken: refreshToken
        })
      })

      const result = await response.json()
      
      addLog('info', '토큰 새로고침 응답', { 
        status: response.status,
        result: result 
      })

      if (response.ok && result.accessToken) {
        // 새로운 토큰으로 업데이트
        localStorage.setItem('accessToken', result.accessToken)
        if (result.refreshToken) {
          localStorage.setItem('refreshToken', result.refreshToken)
        }
        addLog('success', '토큰 새로고침 성공')
      } else {
        addLog('error', `토큰 새로고침 실패: ${result.message || 'Unknown error'}`)
      }
      
    } catch (error: any) {
      addLog('error', '토큰 새로고침 테스트 실패', {
        message: error.message,
        name: error.name,
        stack: error.stack
      })
    }
  }

  // 만료된 토큰으로 실제 API 호출 테스트
  const testExpiredTokenFlow = async () => {
    try {
      addLog('info', '만료된 토큰 플로우 테스트 시작...')
      
      // 의도적으로 잘못된 토큰 설정
      localStorage.setItem('accessToken', 'expired_token_test')
      
      addLog('info', '잘못된 토큰으로 API 호출 시도...')
      
      // 프로젝트 목록 API 호출 (이때 토큰 새로고침이 자동으로 수행되어야 함)
      const data = await callGetProjects()
      
      addLog('success', '만료된 토큰 플로우 테스트 성공', {
        projectCount: data.length
      })
      
    } catch (error: any) {
      addLog('error', '만료된 토큰 플로우 테스트 실패', error)
      
      // 원래 토큰 복원 (만약 백업이 있다면)
      const originalToken = localStorage.getItem('accessToken')
      if (originalToken && originalToken === 'expired_token_test') {
        // 실제로는 원래 토큰을 복원해야 하지만, 여기서는 로그아웃 처리
        addLog('info', '원래 토큰 복원 필요 - 수동으로 다시 로그인하세요')
      }
    }
  }

  return (
    <Layout title="프로젝트 삭제 테스트">
      <div className="max-w-6xl space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-red-800 font-semibold mb-2">⚠️ 테스트 모드</h2>
          <div className="space-y-2">
            <p className="text-red-700 text-sm">
              이 페이지는 프로젝트 삭제 API를 테스트하기 위한 페이지입니다. 
              삭제된 데이터는 복구할 수 없으니 신중하게 사용해주세요.
            </p>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="preventRedirect"
                checked={preventRedirect}
                onChange={(e) => setPreventRedirect(e.target.checked)}
                className="w-4 h-4"
              />
              <Label htmlFor="preventRedirect" className="text-red-700 text-sm">
                인증 오류 시 로그인 페이지로 자동 이동 방지
              </Label>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            {/* 프로젝트 ID로 직접 삭제 */}
            <Card>
              <CardHeader>
                <CardTitle>프로젝트 ID로 직접 삭제</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="projectId" className="mb-2 block">
                    삭제할 프로젝트 ID
                  </Label>
                  <Input
                    type="number"
                    id="projectId"
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    placeholder="프로젝트 ID를 입력하세요"
                    min={1}
                  />
                </div>
                <Button 
                  onClick={() => handleDelete()}
                  disabled={deleteLoading || !projectId}
                  variant="destructive"
                  className="w-full"
                >
                  {deleteLoading ? '삭제 중...' : '프로젝트 삭제'}
                </Button>
              </CardContent>
            </Card>

            {/* 유틸리티 버튼들 */}
            <Card>
              <CardHeader>
                <CardTitle>테스트 유틸리티</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  onClick={handleLoadProjects}
                  disabled={projectsLoading}
                  variant="outline"
                  className="w-full"
                >
                  {projectsLoading ? '불러오는 중...' : '프로젝트 목록 불러오기'}
                </Button>
                <Button 
                  onClick={checkTokenInfo}
                  variant="outline"
                  className="w-full"
                >
                  토큰 정보 확인
                </Button>
                <Button 
                  onClick={testTokenRefresh}
                  variant="outline"
                  className="w-full"
                >
                  토큰 새로고침 테스트
                </Button>
                <Button 
                  onClick={testExpiredTokenFlow}
                  variant="outline"
                  className="w-full"
                >
                  만료된 토큰 플로우 테스트
                </Button>
                <Button 
                  onClick={clearLogs}
                  variant="outline"
                  className="w-full"
                >
                  로그 클리어
                </Button>
              </CardContent>
            </Card>

            {/* 프로젝트 목록 */}
            {showProjects && (
              <Card>
                <CardHeader>
                  <CardTitle>프로젝트 목록에서 선택 삭제</CardTitle>
                </CardHeader>
                <CardContent>
                  {projects.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">프로젝트가 없습니다.</p>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {projects.map((project) => (
                        <div 
                          key={project.projectId}
                          className="flex items-center justify-between border border-gray-200 rounded-lg p-3 bg-white shadow-sm"
                        >
                          <div className="flex-1 min-w-0 mr-4">
                            <div className="flex items-center space-x-3 text-sm">
                              <span className="font-bold text-blue-600">
                                ID: {project.projectId}
                              </span>
                              <span className="font-semibold">
                                {project.serviceName}
                              </span>
                              <span className="text-gray-500">
                                {project.generation}기
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 mt-1 truncate">
                              {project.shortDescription}
                            </p>
                          </div>
                          <Button
                            onClick={() => handleDelete(project.projectId)}
                            disabled={deleteLoading}
                            variant="destructive"
                            size="sm"
                          >
                            삭제
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* 로그 패널 */}
          <div className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>실시간 로그</CardTitle>
                <Button 
                  onClick={clearLogs}
                  variant="outline"
                  size="sm"
                >
                  클리어
                </Button>
              </CardHeader>
              <CardContent>
                <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-xs max-h-96 overflow-y-auto">
                  {logs.length === 0 ? (
                    <div className="text-gray-500">로그가 없습니다. 작업을 시작해보세요.</div>
                  ) : (
                    logs.map((log, index) => (
                      <div key={index} className="mb-2">
                        <div className={`font-semibold ${
                          log.type === 'error' ? 'text-red-400' :
                          log.type === 'success' ? 'text-green-400' :
                          'text-blue-400'
                        }`}>
                          [{log.timestamp}] {log.type.toUpperCase()}: {log.message}
                        </div>
                        {log.details && (
                          <div className="text-gray-300 pl-4 whitespace-pre-wrap">
                            {JSON.stringify(log.details, null, 2)}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* API 정보 */}
            <Card>
              <CardHeader>
                <CardTitle>API 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-gray-600">
                <p><strong>삭제 엔드포인트:</strong> DELETE /admin/projects/{`{id}`}</p>
                <p><strong>토큰 새로고침:</strong> POST /admin/user/refresh</p>
                <p><strong>성공 응답:</strong> {`{ status: 200, message: "Success", data: null }`}</p>
                <p><strong>실패 응답:</strong> {`{ status: 401, message: "인증이 필요합니다.", data: null }`}</p>
                <p><strong>인증:</strong> Bearer Token (Authorization 헤더)</p>
                <p><strong>현재 토큰:</strong> {localStorage.getItem('accessToken') ? '있음' : '없음'}</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 네비게이션 */}
        <div className="flex justify-between">
          <Button 
            onClick={() => navigate('/projects')}
            variant="outline"
          >
            프로젝트 목록으로 돌아가기
          </Button>
          <Button 
            onClick={() => navigate('/apply')}
            variant="outline"
          >
            지원 관리로 이동
          </Button>
        </div>
      </div>
    </Layout>
  )
}

export default DeleteProject