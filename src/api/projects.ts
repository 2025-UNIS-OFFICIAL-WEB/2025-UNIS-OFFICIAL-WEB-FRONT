import axiosInstance from './axiosInstance'

export interface Project {
  projectId: number
  serviceName: string
  generation: number
  shortDescription: string
  description: string
  imageUrl: string
  githubUrl: string | null
  instagramUrl: string | null
  etcUrl: string | null
  isAlumni: boolean
  isOfficial: boolean
}

export interface PostProjectRequest {
  serviceName: string
  generation: number
  shortDescription: string
  description: string
  githubUrl?: string
  instagramUrl?: string
  etcUrl?: string
  image: File
  isAlumni: boolean
  isOfficial: boolean
}

export interface PutProjectRequest {
  projectId: number
  serviceName: string
  generation: number
  shortDescription: string
  description: string
  githubUrl?: string
  instagramUrl?: string
  etcUrl?: string
  image?: File
  isAlumni: boolean
  isOfficial: boolean
}

export interface ApiResponse<T> {
  status: number
  message: string
  data: T | null
}

export const getProjects = async (): Promise<Project[]> => {
  const response = await axiosInstance.get('/admin/projects')
  return response.data.data
}

export const getProjectById = async (projectId: string): Promise<Project> => {
  const response = await axiosInstance.get(`/admin/projects/${projectId}`)
  return response.data.data
}

export const addProject = async (data: PostProjectRequest): Promise<ApiResponse<any>> => {
  try {
    console.log('📡 [ADD_PROJECT] Starting project creation...')
    
    const formData = new FormData()

    // ✅ FormData 구성 - API 명세서와 정확히 일치
    formData.append('image', data.image)
    formData.append('serviceName', data.serviceName)
    formData.append('generation', String(data.generation))
    formData.append('shortDescription', data.shortDescription)
    formData.append('description', data.description)
    formData.append('githubUrl', data.githubUrl || '')
    formData.append('instagramUrl', data.instagramUrl || '')
    formData.append('etcUrl', data.etcUrl || '')
    formData.append('isAlumni', String(data.isAlumni))
    formData.append('isOfficial', String(data.isOfficial))

    console.log('📋 [ADD_PROJECT] FormData entries:')
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`${key}: File(${value.name}, ${value.size} bytes, ${value.type})`)
      } else {
        console.log(`${key}: ${value}`)
      }
    }

    // ✅ deleteProject처럼 명시적으로 헤더 설정하지 않음 (인터셉터가 처리)
    const response = await axiosInstance.post('/admin/projects/add', formData)

    console.log('✅ [ADD_PROJECT] Success:', {
      status: response.status,
      projectId: response.data.data?.projectId
    })
    
    return response.data
  } catch (error: any) {
    console.error('❌ [ADD_PROJECT] Failed:', {
      status: error.response?.status,
      message: error.response?.data?.message,
      headers: error.response?.headers,
      url: error.config?.url
    })
    
    if (error.response?.status === 401) {
      throw new Error('인증이 필요합니다.')
    }
    throw error
  }
}

export const updateProject = async (data: PutProjectRequest): Promise<ApiResponse<null>> => {
  try {
    console.log('📡 [UPDATE_PROJECT] Starting project update...', { projectId: data.projectId })
    
    const formData = new FormData()

    // ✅ 이미지가 있을 때만 추가
    if (data.image) {
      formData.append('image', data.image)
    }

    formData.append('serviceName', data.serviceName)
    formData.append('generation', String(data.generation))
    formData.append('shortDescription', data.shortDescription)
    formData.append('description', data.description)
    formData.append('githubUrl', data.githubUrl || '')
    formData.append('instagramUrl', data.instagramUrl || '')
    formData.append('etcUrl', data.etcUrl || '')
    formData.append('isAlumni', String(data.isAlumni))
    formData.append('isOfficial', String(data.isOfficial))

    console.log('📋 [UPDATE_PROJECT] FormData entries:')
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`${key}: File(${value.name}, ${value.size} bytes, ${value.type})`)
      } else {
        console.log(`${key}: ${value}`)
      }
    }

    const response = await axiosInstance.put(
      `/admin/projects/${data.projectId}/update`,
      formData
    )

    console.log('✅ [UPDATE_PROJECT] Success:', response.data)
    return response.data
  } catch (error: any) {
    console.error('❌ [UPDATE_PROJECT] Failed:', {
      status: error.response?.status,
      message: error.response?.data?.message,
      projectId: data.projectId
    })
    
    if (error.response?.status === 401) {
      throw new Error('인증이 필요합니다.')
    }
    throw error
  }
}

export const deleteProject = async (projectId: number): Promise<ApiResponse<null>> => {
  try {
    console.log('📡 [DELETE_PROJECT] Deleting project...', { projectId })
    
    const response = await axiosInstance.delete(`/admin/projects/${projectId}/delete`)

    console.log('✅ [DELETE_PROJECT] Success:', response.data)
    return response.data
  } catch (error: any) {
    console.error('❌ [DELETE_PROJECT] Failed:', {
      status: error.response?.status,
      message: error.response?.data?.message,
      projectId
    })
    
    if (error.response?.status === 401) {
      throw new Error('인증이 필요합니다.')
    }
    throw error
  }
}
