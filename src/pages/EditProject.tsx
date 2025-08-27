import { useEffect, useState, useRef, useCallback } from 'react'
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
  
  const [project, setProject] = useState<Project>({} as Project)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isInitialized = useRef(false)

  const fetchProject = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      console.log('📡 프로젝트 정보 요청 시작:', projectId)
      const projectData: Omit<Project, 'projectId'> = await getProjectById(projectId.toString())

      if (projectData && typeof projectData === 'object') {
        const completeData = { ...projectData, projectId: projectId }
        setProject(completeData)
        console.log('✅ 프로젝트 정보 로드 완료:', completeData)
      } else {
        throw new Error('서버에서 유효한 프로젝트 데이터를 받지 못했습니다.')
      }
    } catch (err: any) {
      console.error('❌ 프로젝트 정보 로드 에러:', err)
      const errorMessage = err?.response?.data?.message || err?.message || '프로젝트 정보를 불러오는데 실패했습니다.'
      setError(errorMessage)
      
      if (err.response?.status === 401) {
        alert('로그인이 만료되었습니다. 다시 로그인해주세요.')
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        navigate('/')
      }
    } finally {
      setLoading(false)
    }
  }, [projectId, navigate])

  useEffect(() => {
    if (isInitialized.current) return;
    
    if (!id || isNaN(projectId) || projectId <= 0) {
      setError(`잘못된 프로젝트 ID입니다: ${id}`)
      setLoading(false)
      return
    }
    
    isInitialized.current = true
    fetchProject()
  }, [id, projectId, fetchProject])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setProject(prev => ({ ...prev, [name]: type === 'number' ? Number(value) : value }))
  }

  const handleCheckedChange = (name: 'isAlumni' | 'isOfficial', checked: boolean) => {
    setProject(prev => ({ ...prev, [name]: checked }))
  }

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

      if (imageFile) {
        updateData.image = imageFile
      }

      await updateProject(updateData)
      
      alert('프로젝트가 성공적으로 수정되었습니다.')
      navigate('/projects')

    } catch (err: any) {
      console.error('❌ [SUBMIT] 프로젝트 업데이트 에러:', err)
      const errorMessage = err?.response?.data?.message || err?.message || '프로젝트 수정에 실패했습니다.'
      alert(`프로젝트 수정 실패: ${errorMessage}`)

      if (err.response?.status === 401) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        navigate('/');
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) return <Layout title="프로젝트 수정"><div className="text-center">로딩 중...</div></Layout>
  if (error) return <Layout title="프로젝트 수정"><div className="text-center text-red-500">{error}</div></Layout>
  if (!project.projectId) return <Layout title="프로젝트 수정"><div className="text-center">프로젝트 정보를 찾을 수 없습니다.</div></Layout>

  return (
    <Layout title="프로젝트 수정">
      <form onSubmit={handleSubmit} className="w-full max-w-3xl space-y-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isAlumni"
              name="isAlumni"
              checked={project.isAlumni || false}
              onCheckedChange={(checked: boolean) => handleCheckedChange('isAlumni', checked)}
            />
            <Label htmlFor="isAlumni">창업 중인 프로젝트</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isOfficial"
              name="isOfficial"
              checked={project.isOfficial || false}
              onCheckedChange={(checked: boolean) => handleCheckedChange('isOfficial', checked)}
            />
            <Label htmlFor="isOfficial">학회 프로젝트</Label>
          </div>
        </div>
        <div>
          <Label htmlFor="serviceName">서비스명 <span className="text-red-500">*</span></Label>
          <Input id="serviceName" name="serviceName" value={project.serviceName || ''} onChange={handleChange} required />
        </div>
        <div>
          <Label htmlFor="generation">기수 <span className="text-red-500">*</span></Label>
          <Input type="number" id="generation" name="generation" value={project.generation || ''} onChange={handleChange} required />
        </div>
        <div>
          <Label htmlFor="image">이미지 (선택사항 - 변경하지 않으려면 비워두세요)</Label>
          <div className="flex flex-col gap-2">
            {project.imageUrl && !imageFile && (
              <img src={project.imageUrl} alt="Current Project" className="max-w-xs h-auto rounded-md" />
            )}
            {imageFile && (
              <img src={URL.createObjectURL(imageFile)} alt="New Preview" className="max-w-xs h-auto rounded-md" />
            )}
            <Input type="file" id="image" name="image" accept="image/*" onChange={handleImageChange} />
          </div>
        </div>
        <div>
          <Label htmlFor="shortDescription">간단한 설명 <span className="text-red-500">*</span></Label>
          <Textarea id="shortDescription" name="shortDescription" value={project.shortDescription || ''} onChange={handleChange} required rows={2} />
        </div>
        <div>
          <Label htmlFor="description">세부 설명 <span className="text-red-500">*</span></Label>
          <Textarea id="description" name="description" value={project.description || ''} onChange={handleChange} required rows={6} />
        </div>
        <div>
          <Label htmlFor="githubUrl">깃허브 링크</Label>
          <Input id="githubUrl" name="githubUrl" value={project.githubUrl || ''} onChange={handleChange} placeholder="https://github.com/..." />
        </div>
        <div>
          <Label htmlFor="instagramUrl">인스타그램 링크</Label>
          <Input id="instagramUrl" name="instagramUrl" value={project.instagramUrl || ''} onChange={handleChange} placeholder="https://instagram.com/..." />
        </div>
        <div>
          <Label htmlFor="etcUrl">기타 링크</Label>
          <Input id="etcUrl" name="etcUrl" value={project.etcUrl || ''} onChange={handleChange} placeholder="링크를 입력해주세요" />
        </div>
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => navigate('/projects')} disabled={isSubmitting}>취소</Button>
          <Button type="submit" disabled={isSubmitting}>{isSubmitting ? '수정 중...' : '수정하기'}</Button>
        </div>
      </form>
    </Layout>
  )
}

export default EditProject