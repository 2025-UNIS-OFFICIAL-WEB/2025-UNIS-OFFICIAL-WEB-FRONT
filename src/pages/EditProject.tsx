import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Layout from '@/components/Layout'
import { getProjectById, updateProject } from '@/api/projects'
import type { Project, PutProjectRequest } from '@/api/projects'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'

const EditProject = () => {
  const { projectId: id } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const projectId = Number(id)
  
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const isInitialized = useRef(false)
  const isFetching = useRef(false)

  const fetchProject = async () => {
    if (isFetching.current) {
      console.log('⚠️ 이미 프로젝트 정보를 로드 중입니다.')
      return
    }

    isFetching.current = true
    setLoading(true)
    setError(null)
    
    try {
      console.log('📡 프로젝트 정보 요청 시작:', projectId)
      const response = await getProjectById(projectId.toString())
      
      const projectData = (response as any).data || response
      setProject(projectData)
      console.log('✅ 프로젝트 정보 로드 완료:', projectData)
      
    } catch (err: any) {
      console.error('❌ 프로젝트 정보 로드 에러:', err)
      const errorMessage = err?.response?.data?.message || err?.message || '프로젝트 정보를 불러오는데 실패했습니다.'
      setError(errorMessage)
      
      if (err.message === '인증이 필요합니다.' || err.response?.status === 401) {
        alert('로그인이 만료되었습니다. 다시 로그인해주세요.')
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        navigate('/')
      }
    } finally {
      setLoading(false)
      isFetching.current = false
    }
  }

  useEffect(() => {
    if (isInitialized.current) {
      console.log('⚠️ 이미 초기화되었습니다.')
      return
    }
    
    if (!id) {
      setError('프로젝트 ID가 제공되지 않았습니다.')
      return
    }
    
    if (!projectId || isNaN(projectId) || projectId <= 0) {
      setError(`잘못된 프로젝트 ID입니다: ${id}`)
      return
    }
    
    isInitialized.current = true
    console.log('🚀 EditProject 컴포넌트 마운트 - 프로젝트 정보 요청, ID:', projectId)
    fetchProject()
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!project || isSubmitting) return

    // 현재 토큰 상태 확인
    const currentToken = localStorage.getItem('accessToken')
    console.log('🔑 [SUBMIT] Current token status:', {
      hasToken: !!currentToken,
      tokenPreview: currentToken ? `${currentToken.substring(0, 20)}...` : 'none'
    })

    setIsSubmitting(true)
    
    try {
      const formData = new FormData(e.currentTarget)
      
      const isAlumniChecked = (document.getElementById('isAlumni') as HTMLInputElement)?.checked || false
      const isOfficialChecked = (document.getElementById('isOfficial') as HTMLInputElement)?.checked || false
      
      const updateData: PutProjectRequest = {
        projectId: projectId,
        serviceName: formData.get('serviceName') as string,
        generation: Number(formData.get('generation')),
        shortDescription: formData.get('shortDescription') as string,
        description: formData.get('description') as string || project.description,
        githubUrl: formData.get('githubUrl') as string || project.githubUrl || undefined,
        instagramUrl: formData.get('instagramUrl') as string || project.instagramUrl || undefined,
        etcUrl: formData.get('etcUrl') as string || project.etcUrl || undefined,
        isAlumni: isAlumniChecked,
        isOfficial: isOfficialChecked,
      }

      const imageFile = (formData.get('image') as File)
      if (imageFile && imageFile.size > 0) {
        updateData.image = imageFile
        console.log('📷 [SUBMIT] Image file selected:', {
          name: imageFile.name,
          size: imageFile.size,
          type: imageFile.type
        })
      }

      console.log('📤 [SUBMIT] Sending update request:', updateData)
      
      const response = await updateProject(updateData)
      console.log('✅ [SUBMIT] Update successful:', response)
      
      alert('프로젝트가 성공적으로 수정되었습니다.')
      navigate('/projects')
      
    } catch (err: any) {
      console.error('❌ [SUBMIT] 프로젝트 업데이트 에러:', {
        error: err,
        status: err.response?.status,
        message: err.response?.data?.message || err.message,
        config: err.config
      })
      
      const errorMessage = err?.response?.data?.message || err?.message || '프로젝트 수정에 실패했습니다.'
      
      if (err.response?.status === 401 || err.message === '인증이 필요합니다.') {
        alert('로그인이 만료되었습니다. 다시 로그인해주세요.')
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        navigate('/')
      } else {
        alert(`프로젝트 수정 실패: ${errorMessage}`)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  console.log('🔄 EditProject 렌더링:', {
    rawId: id,
    projectId,
    loading,
    error,
    hasProject: !!project,
    isInitialized: isInitialized.current,
    currentURL: window.location.href,
    pathname: window.location.pathname
  })

  if (!id || !projectId || isNaN(projectId) || projectId <= 0) {
    return (
      <Layout title="프로젝트 수정">
        <div className="text-center text-red-500 space-y-2">
          <div>잘못된 프로젝트 ID입니다.</div>
          <div className="text-sm text-gray-600">
            받은 ID: "{id || '없음'}"<br />
            현재 URL: {window.location.pathname}<br />
            변환된 숫자: {projectId || '변환 실패'}
          </div>
          <Button 
            onClick={() => navigate('/projects')}
            className="mt-4"
          >
            프로젝트 목록으로 돌아가기
          </Button>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title="프로젝트 수정">
      {loading && (
        <div className="text-center text-gray-500 mb-4">
          프로젝트 정보를 불러오는 중...
        </div>
      )}

      {error && !loading && (
        <div className="text-center text-red-500 mb-4">
          오류 발생: {error}
          <Button 
            onClick={fetchProject}
            variant="link"
            className="ml-2"
            disabled={isFetching.current}
          >
            다시 시도
          </Button>
        </div>
      )}

      {project && !loading && (
        <form onSubmit={handleSubmit} className="w-full max-w-3xl space-y-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isAlumni"
                name="isAlumni"
                defaultChecked={project.isAlumni}
              />
              <Label htmlFor="isAlumni">
                창업 중인 프로젝트
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isOfficial"
                name="isOfficial"
                defaultChecked={project.isOfficial}
              />
              <Label htmlFor="isOfficial">
                학회 프로젝트
              </Label>
            </div>
          </div>

          <div>
            <Label htmlFor="serviceName">
              서비스명 <span className="text-red-500">*</span>
            </Label>
            <Input
              type="text"
              id="serviceName"
              name="serviceName"
              defaultValue={project.serviceName}
              required
            />
          </div>

          <div>
            <Label htmlFor="generation">
              기수 <span className="text-red-500">*</span>
            </Label>
            <Input
              type="number"
              id="generation"
              name="generation"
              defaultValue={project.generation}
              required
            />
          </div>

          <div>
            <Label htmlFor="image">
              이미지 (선택사항 - 변경하지 않으려면 비워두세요)
            </Label>
            <div className="flex flex-col gap-2">
              {project.imageUrl && (
                <img
                  src={project.imageUrl}
                  alt="Current Project"
                  className="max-w-xs h-auto rounded-md"
                />
              )}
              <Input
                type="file"
                id="image"
                name="image"
                accept="image/*"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="shortDescription">
              간단한 설명 <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="shortDescription"
              name="shortDescription"
              defaultValue={project.shortDescription}
              required
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="description">
              세부 설명 <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={project.description}
              required
              rows={6}
            />
          </div>

          <div>
            <Label htmlFor="githubUrl">
              깃허브 링크
            </Label>
            <Input
              type="text"
              id="githubUrl"
              name="githubUrl"
              defaultValue={project.githubUrl || ''}
              placeholder="https://github.com/..."
            />
          </div>

          <div>
            <Label htmlFor="instagramUrl">
              인스타그램 링크
            </Label>
            <Input
              type="text"
              id="instagramUrl"
              name="instagramUrl"
              defaultValue={project.instagramUrl || ''}
              placeholder="https://instagram.com/..."
            />
          </div>

          <div>
            <Label htmlFor="etcUrl">
              기타 링크
            </Label>
            <Input
              type="text"
              id="etcUrl"
              name="etcUrl"
              defaultValue={project.etcUrl || ''}
              placeholder="링크를 입력해주세요"
            />
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/projects')}
              disabled={isSubmitting}
            >
              취소
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? '수정 중...' : '수정하기'}
            </Button>
          </div>
        </form>
      )}
    </Layout>
  )
}

export default EditProject