import { useEffect, useState, useRef, useCallback } from 'react' // useCallback 추가
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

  // STEP 0: project의 타입을 Project로 단언하여 null 체크를 줄입니다.
  const [project, setProject] = useState<Project>({} as Project) 
  const [imageFile, setImageFile] = useState<File | null>(null) // 이미지 파일 상태 추가

  const [loading, setLoading] = useState(true) // 초기 로딩 상태를 true로 설정
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const isInitialized = useRef(false)

  // useCallback으로 fetchProject 함수를 감싸 불필요한 재생성을 방지합니다.
  const fetchProject = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      console.log('📡 프로젝트 정보 요청 시작:', projectId)
      const response = await getProjectById(projectId.toString())
      const projectData = (response as any).data || response
      setProject(projectData) // fetched 데이터로 상태 설정
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
    }
  }, [projectId, navigate]) // 의존성 배열에 projectId와 navigate 추가

  useEffect(() => {
    if (isInitialized.current) {
      return
    }
    
    if (!id || isNaN(projectId) || projectId <= 0) {
      setError(`잘못된 프로젝트 ID입니다: ${id}`)
      setLoading(false)
      return
    }
    
    isInitialized.current = true
    fetchProject()
  }, [id, projectId, fetchProject]) // 의존성 배열에 fetchProject 추가

  // STEP 1: 모든 입력 변경을 처리하는 핸들러 함수 생성
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target

    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement
      setProject(prev => ({ ...prev!, [name]: checked }))
    } else if (type === 'number') {
      setProject(prev => ({ ...prev!, [name]: Number(value) }))
    } else {
      setProject(prev => ({ ...prev!, [name]: value }))
    }
  }

  // 이미지 파일 변경 핸들러
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!project || isSubmitting) return

    setIsSubmitting(true)

    try {
      // STEP 3: 상태(state)를 기반으로 업데이트 데이터 구성
      const updateData: PutProjectRequest = {
        projectId,
        serviceName: project.serviceName,
        generation: project.generation,
        shortDescription: project.shortDescription,
        description: project.description,
        githubUrl: project.githubUrl || undefined,
        instagramUrl: project.instagramUrl || undefined,
        etcUrl: project.etcUrl || undefined,
        isAlumni: project.isAlumni,
        isOfficial: project.isOfficial,
      }
      
      // 이미지가 새로 선택된 경우에만 image 추가
      if (imageFile) {
        updateData.image = imageFile
        console.log('📷 [SUBMIT] New image file selected:', imageFile.name)
      }

      console.log('📤 [SUBMIT] Sending update request:', updateData)

      const response = await updateProject(updateData)
      console.log('✅ [SUBMIT] Update successful:', response)

      alert('프로젝트가 성공적으로 수정되었습니다.')
      navigate('/projects')

    } catch (err: any) {
      console.error('❌ [SUBMIT] 프로젝트 업데이트 에러:', err)
      const errorMessage = err?.response?.data?.message || err?.message || '프로젝트 수정에 실패했습니다.'
      alert(`프로젝트 수정 실패: ${errorMessage}`)
      // 인증 에러 처리는 동일
      if (err.response?.status === 401) {
        // ...
        navigate('/')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // 초기 로딩, 에러, 유효하지 않은 ID에 대한 UI 렌더링
  if (loading) {
    return <Layout title="프로젝트 수정"><div className="text-center">로딩 중...</div></Layout>
  }
  
  if (error) {
    return <Layout title="프로젝트 수정"><div className="text-center text-red-500">{error}</div></Layout>
  }

  if (!project.projectId) { // project 데이터가 비어있을 경우 (초기값 또는 로드 실패)
    return <Layout title="프로젝트 수정"><div className="text-center">프로젝트 정보를 찾을 수 없습니다.</div></Layout>
  }

  return (
    <Layout title="프로젝트 수정">
      <form onSubmit={handleSubmit} className="w-full max-w-3xl space-y-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isAlumni"
              name="isAlumni"
              checked={project.isAlumni}
              onCheckedChange={(checked) => {
                // shadcn/ui의 Checkbox는 onCheckedChange를 사용합니다.
                // 이 이벤트를 모방하여 handleChange를 호출합니다.
                
                handleChange({
                  target: { name: 'isAlumni', value: '', type: 'checkbox', checked },
                } as React.ChangeEvent<HTMLInputElement>)
              }}
            />
            <Label htmlFor="isAlumni">창업 중인 프로젝트</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isOfficial"
              name="isOfficial"
              checked={project.isOfficial}
              onCheckedChange={(checked) => {
                handleChange({
                  target: { name: 'isOfficial', value: '', type: 'checkbox', checked },
                } as React.ChangeEvent<HTMLInputElement>)
              }}
            />
            <Label htmlFor="isOfficial">학회 프로젝트</Label>
          </div>
        </div>
        
        {/* 모든 Input, Textarea에 value와 onChange를 연결합니다 */}
        <div>
          <Label htmlFor="serviceName">서비스명 <span className="text-red-500">*</span></Label>
          <Input
            id="serviceName"
            name="serviceName"
            value={project.serviceName || ''}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="generation">기수 <span className="text-red-500">*</span></Label>
          <Input
            type="number"
            id="generation"
            name="generation"
            value={project.generation || ''}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="image">이미지 (선택사항 - 변경하지 않으려면 비워두세요)</Label>
          <div className="flex flex-col gap-2">
            {project.imageUrl && !imageFile && (
              <img src={project.imageUrl} alt="Current Project" className="max-w-xs h-auto rounded-md" />
            )}
            {/* 이미지 파일 선택 시 미리보기 (선택적 구현) */}
            {imageFile && (
              <img src={URL.createObjectURL(imageFile)} alt="New Preview" className="max-w-xs h-auto rounded-md" />
            )}
            <Input type="file" id="image" name="image" accept="image/*" onChange={handleImageChange} />
          </div>
        </div>
        <div>
          <Label htmlFor="shortDescription">간단한 설명 <span className="text-red-500">*</span></Label>
          <Textarea
            id="shortDescription"
            name="shortDescription"
            value={project.shortDescription || ''}
            onChange={handleChange}
            required
            rows={2}
          />
        </div>
        {/* ... 다른 폼 요소들도 동일하게 value와 onChange를 적용 ... */}
        <div>
          <Label htmlFor="description">세부 설명 <span className="text-red-500">*</span></Label>
          <Textarea
            id="description"
            name="description"
            value={project.description || ''}
            onChange={handleChange}
            required
            rows={6}
          />
        </div>
        <div>
          <Label htmlFor="githubUrl">깃허브 링크</Label>
          <Input
            id="githubUrl"
            name="githubUrl"
            value={project.githubUrl || ''}
            onChange={handleChange}
            placeholder="https://github.com/..."
          />
        </div>
        <div>
          <Label htmlFor="instagramUrl">인스타그램 링크</Label>
          <Input
            id="instagramUrl"
            name="instagramUrl"
            value={project.instagramUrl || ''}
            onChange={handleChange}
            placeholder="https://instagram.com/..."
          />
        </div>
        <div>
          <Label htmlFor="etcUrl">기타 링크</Label>
          <Input
            id="etcUrl"
            name="etcUrl"
            value={project.etcUrl || ''}
            onChange={handleChange}
            placeholder="링크를 입력해주세요"
          />
        </div>

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => navigate('/projects')} disabled={isSubmitting}>
            취소
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? '수정 중...' : '수정하기'}
          </Button>
        </div>
      </form>
    </Layout>
  )
}

export default EditProject