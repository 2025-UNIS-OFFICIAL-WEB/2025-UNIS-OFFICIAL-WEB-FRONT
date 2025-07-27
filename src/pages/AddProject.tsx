import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '@/components/Layout'
import { addProject } from '@/api/projects'
import type { PostProjectRequest } from '@/api/projects'
import useFetch from '@/hooks/useFetch'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

const AddProject = () => {
  const navigate = useNavigate()
  const { fetchData: callAddProject, loading } = useFetch(addProject)

  const [formData, setFormData] = useState({
    serviceName: '',
    generation: '',
    shortDescription: '',
    description: '',
    githubUrl: '',
    instagramUrl: '',
    etcUrl: '',
    isAlumni: false,
    isOfficial: false,
  })
  const [image, setImage] = useState<File | null>(null)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target
    
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement
      setFormData({ ...formData, [name]: checked })
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImage(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!image) {
      alert('이미지를 업로드해주세요.')
      return
    }

    const generationNumber = parseInt(formData.generation)
    if (isNaN(generationNumber) || generationNumber <= 0) {
      alert('기수는 1 이상의 숫자를 입력해주세요.')
      return
    }

    try {
      const requestData: PostProjectRequest = {
        serviceName: formData.serviceName.trim(),
        generation: generationNumber,
        shortDescription: formData.shortDescription.trim(),
        description: formData.description.trim(),
        // 빈 문자열이 아닌 경우에만 포함
        ...(formData.githubUrl.trim() && { githubUrl: formData.githubUrl.trim() }),
        ...(formData.instagramUrl.trim() && { instagramUrl: formData.instagramUrl.trim() }),
        ...(formData.etcUrl.trim() && { etcUrl: formData.etcUrl.trim() }),
        image,
        isAlumni: formData.isAlumni,
        isOfficial: formData.isOfficial,
      }

      const response = await callAddProject(requestData)
      
      if (response.status === 201) {
        alert('프로젝트 추가 성공')
        navigate('/projects')
      } else {
        alert(`프로젝트 추가 실패: ${response.message}`)
      }
    } catch (err: any) {
      console.error('프로젝트 추가 오류:', err)
      
      if (err?.response?.status === 401) {
        alert('로그인이 만료되었습니다. 다시 로그인해주세요.')
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        navigate('/')
      } else {
        const errorMessage = err?.response?.data?.message || err?.message || '프로젝트 추가에 실패했습니다.'
        alert(`프로젝트 추가 실패: ${errorMessage}`)
      }
    }
  }

  return (
    <Layout title="프로젝트 추가">
      <div className="max-w-2xl">
        <p className="text-gray-600 mb-6">
          * 이미지는 필수입니다
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isAlumni"
                name="isAlumni"
                checked={formData.isAlumni}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <Label htmlFor="isAlumni">창업 중인 프로젝트</Label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isOfficial"
                name="isOfficial"
                checked={formData.isOfficial}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <Label htmlFor="isOfficial">공식 프로젝트</Label>
            </div>
          </div>

          <div>
            <Label htmlFor="serviceName" className="mb-2 block">
              서비스명 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="serviceName"
              name="serviceName"
              value={formData.serviceName}
              onChange={handleChange}
              placeholder="최대 100자입니다."
              maxLength={100}
              required
            />
          </div>

          <div>
            <Label htmlFor="generation" className="mb-2 block">
              기수 <span className="text-red-500">*</span>
            </Label>
            <Input
              type="number"
              id="generation"
              name="generation"
              value={formData.generation}
              onChange={handleChange}
              placeholder="숫자만 입력해주세요."
              min={1}
              required
            />
          </div>

          <div>
            <Label htmlFor="image" className="mb-2 block">
              이미지 <span className="text-red-500">*</span>
            </Label>
            <Input
              type="file"
              id="image"
              name="image"
              accept="image/*"
              onChange={handleImageChange}
              required
            />
          </div>

          <div>
            <Label htmlFor="shortDescription" className="mb-2 block">
              한 줄 설명 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="shortDescription"
              name="shortDescription"
              value={formData.shortDescription}
              onChange={handleChange}
              placeholder="최대 50자입니다."
              maxLength={50}
              required
            />
          </div>

          <div>
            <Label htmlFor="description" className="mb-2 block">
              세부 설명 <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="최대 1000자입니다."
              maxLength={1000}
              rows={6}
              required
            />
          </div>

          <div>
            <Label htmlFor="githubUrl" className="mb-2 block">깃허브 링크</Label>
            <Input
              id="githubUrl"
              name="githubUrl"
              value={formData.githubUrl}
              onChange={handleChange}
              placeholder="https://github.com/.."
            />
          </div>

          <div>
            <Label htmlFor="instagramUrl" className="mb-2 block">인스타 링크</Label>
            <Input
              id="instagramUrl"
              name="instagramUrl"
              value={formData.instagramUrl}
              onChange={handleChange}
              placeholder="https://instagram.com/.."
            />
          </div>

          <div>
            <Label htmlFor="etcUrl" className="mb-2 block">기타 링크</Label>
            <Input
              id="etcUrl"
              name="etcUrl"
              value={formData.etcUrl}
              onChange={handleChange}
              placeholder="링크를 입력해주세요."
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate('/projects')}
              disabled={loading}
            >
              취소
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? '저장 중...' : '저장하기'}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  )
}

export default AddProject