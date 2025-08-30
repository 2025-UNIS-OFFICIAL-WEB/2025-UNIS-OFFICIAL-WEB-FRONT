import { useEffect, useState, useCallback } from 'react'
import Layout from '@/components/Layout'
import ProjectListItem from '@/components/ProjectListItem'
import { getProjects, deleteProject } from '@/api/projects'
import type { Project } from '@/api/projects'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Plus, RefreshCw, AlertCircle, FolderOpen } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

const ProjectList = () => {
  const { toast } = useToast()

  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProjects = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getProjects()
      setProjects(data)
    } catch (err) {
      setError('프로젝트 목록을 불러오는 데 실패했습니다.')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  const handleDelete = async (projectId: number) => {
    try {
      await deleteProject(projectId)
      toast({
        title: '성공',
        description: '프로젝트가 성공적으로 삭제되었습니다.',
      })
      await fetchProjects()
    } catch (err) {
      toast({
        variant: 'destructive',
        title: '오류',
        description: '프로젝트 삭제에 실패했습니다.',
      })
      console.error(err)
    }
  }

  const renderContent = () => {
    if (isLoading) {
      return (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="flex items-center space-x-2 text-muted-foreground">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>프로젝트를 불러오는 중...</span>
            </div>
          </CardContent>
        </Card>
      )
    }

    if (error) {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
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
      )
    }

    if (projects.length === 0) {
      return (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <FolderOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">프로젝트가 없습니다</h3>
            <p className="text-muted-foreground mb-4">
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
      )
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            총 {projects.length}개의 프로젝트
          </span>
        </div>
        <div className="space-y-3">
          {projects.map((p) => (
            <ProjectListItem
              key={p.projectId}
              projectId={p.projectId}
              serviceName={p.serviceName}
              generation={p.generation}
              shortDescription={p.shortDescription}
              onDelete={handleDelete}
              disabled={isLoading}
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <Layout title="프로젝트 관리">
      <div className="flex items-center justify-end mb-6">
        <Button asChild>
          <Link to="/addProject">
            <Plus className="mr-2 h-4 w-4" />
            프로젝트 추가
          </Link>
        </Button>
      </div>
      {renderContent()}
    </Layout>
  )
}

export default ProjectList
