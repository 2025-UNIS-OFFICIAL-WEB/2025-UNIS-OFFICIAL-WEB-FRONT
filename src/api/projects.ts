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
    const formData = new FormData()

    const jsonPart = {
      serviceName: data.serviceName,
      shortDescription: data.shortDescription,
      description: data.description,
      githubUrl: data.githubUrl || '',
      instagramUrl: data.instagramUrl || '',
      etcUrl: data.etcUrl || '',
      generation: data.generation,
      isAlumni: data.isAlumni,
      isOfficial: data.isOfficial
    }

    const jsonBlob = new Blob([JSON.stringify(jsonPart)], {
      type: 'application/json'
    })

    formData.append('data', jsonBlob)
    formData.append('image', data.image)

    const response = await axiosInstance.post('/admin/projects/add', formData)
    return response.data
  } catch (error: any) {
    console.error('❌ [ADD_PROJECT] Failed:', {
      status: error.response?.status,
      message: error.response?.data?.message,
      url: error.config?.url
    })
    if (error.response?.status === 401) {
      throw new Error('인증이 필요합니다.')
    }
    throw error
  }
}


/* 프로젝트 수정 */
export const updateProject = async (
  data: PutProjectRequest
): Promise<void> => {
  const formData = new FormData()

  const jsonPart = {
    serviceName: data.serviceName,
    shortDescription: data.shortDescription,
    description: data.description,
    githubUrl: data.githubUrl || '',
    instagramUrl: data.instagramUrl || '',
    etcUrl: data.etcUrl || '',
    generation: data.generation,
    isAlumni: data.isAlumni,
    isOfficial: data.isOfficial
  }

  const jsonBlob = new Blob([JSON.stringify(jsonPart)], {
    type: 'application/json'
  })

  formData.append('data', jsonBlob)

  if (data.image) {
    formData.append('image', data.image)
  }

  await axiosInstance.put<ApiResponse<null>>(
    `/admin/projects/${data.projectId}/update`,
    formData
  )
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
