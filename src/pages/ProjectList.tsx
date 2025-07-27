import { useEffect, useCallback, useRef } from 'react'
import Layout from '@/components/Layout'
import ProjectListItem from '@/components/ProjectListItem'
import { getProjects, deleteProject } from '@/api/projects'
import type { Project } from '@/api/projects'
import useFetch from '@/hooks/useFetch'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Plus, RefreshCw, AlertCircle, FolderOpen } from 'lucide-react'

const ProjectList = () => {
  const navigate = useNavigate()
  const isInitialized = useRef(false) // 초기 로딩 제어
  
  const {
    data: projects,
    loading,
    error,
    fetchData: callGetProjects,
    setData: setProjects,
  } = useFetch(getProjects)
  
  const { fetchData: callDeleteProject } = useFetch(deleteProject)

  // 의존성 배열에서 error 제거
  const fetchProjects = useCallback(async () => {
    // 이미 로딩 중이면 중복 호출 방지
    if (loading) {
      console.log('⚠️ 이미 로딩 중입니다. 중복 호출을 방지합니다.')
      return
    }

    try {
      console.log('📡 프로젝트 목록 요청 시작')
      const data = await callGetProjects() as Project[]
      setProjects(data)
      console.log('✅ 프로젝트 목록 로딩 완료:', data)
    } catch (err: any) {
      console.error('❌ 프로젝트 목록 로딩 실패:', err)
      
      if (err.message === '인증이 필요합니다.') {
        alert('로그인이 만료되었습니다. 다시 로그인해주세요.')
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        navigate('/')
      } else {
        alert(`프로젝트 목록을 불러오는 데 실패했습니다: ${err.message}`)
      }
    }
  }, [callGetProjects, setProjects, loading, navigate]) // error 제거

  useEffect(() => {
    // 중복 호출 방지
    if (isInitialized.current) {
      console.log('⚠️ 이미 초기화되었습니다. 중복 호출을 방지합니다.')
      return
    }
    
    isInitialized.current = true
    console.log('🚀 컴포넌트 마운트 - 프로젝트 목록 요청')
    fetchProjects()
  }, []) // fetchProjects 의존성 제거

  const handleDelete = async (projectId: number) => {
    if (loading) {
      alert('다른 작업이 진행 중입니다. 잠시 후 다시 시도해주세요.')
      return
    }

    try {
      console.log('🗑️ 프로젝트 삭제 요청:', projectId)
      const res = await callDeleteProject(projectId)
      
      if (res.status === 200) {
        alert('프로젝트가 삭제되었습니다.')
        // 삭제 후 목록 새로고침
        await fetchProjects()
      } else {
        alert(res.message)
      }
    } catch (err: any) {
      console.error('❌ 프로젝트 삭제 실패:', err)
      
      if (err.message === '인증이 필요합니다.') {
        alert('로그인이 만료되었습니다. 다시 로그인해주세요.')
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        navigate('/')
      } else {
        alert(`프로젝트 삭제 실패: ${err.message}`)
      }
    }
  }

  // 디버깅용 렌더링 로그
  console.log('🔄 ProjectList 렌더링:', {
    loading,
    error,
    projectsCount: projects?.length || 0,
    isInitialized: isInitialized.current
  })

  return (
    <Layout title="프로젝트 관리">
      <div className="space-y-6">
        <div className="flex items-right justify-between">
          <Button asChild>
            <Link to="/addProject">
              <Plus className="mr-2 h-4 w-4" />
              프로젝트 추가
            </Link>
          </Button>
        </div>

        {/* Loading State */}
        {loading && (
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <div className="flex items-center space-x-2 text-muted-foreground">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>프로젝트를 불러오는 중...</span>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Error State */}
        {error && !loading && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>오류 발생: {error}</span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={fetchProjects}
                className="ml-2"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                다시 시도
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Empty State */}
        {projects?.length === 0 && !loading && !error && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FolderOpen className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">프로젝트가 없습니다</h3>
              <p className="text-muted-foreground text-center mb-4">
                첫 번째 프로젝트를 생성하여 시작해보세요.
              </p>
              <Button asChild>
                <Link to="/addProject">
                  <Plus className="mr-2 h-4 w-4" />
                  프로젝트 추가
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
        
        {/* Project List */}
        {projects && projects.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-muted-foreground">
                총 {projects.length}개의 프로젝트
              </span>
            </div>
            <div className="space-y-3">
              {projects.map((project) => (
                <ProjectListItem
                  key={project.projectId}
                  projectId={project.projectId}
                  serviceName={project.serviceName}
                  generation={project.generation}
                  shortDescription={project.shortDescription}
                  onDelete={handleDelete}
                  disabled={loading}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default ProjectList