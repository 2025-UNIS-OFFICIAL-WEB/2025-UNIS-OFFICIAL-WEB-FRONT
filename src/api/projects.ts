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

    // ✅ 명세에 따라 JSON 객체를 data라는 이름으로 감쌈
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

    // ⛳ 서버가 `@RequestPart("data")`로 받으므로 반드시 wrapping 필요
    const jsonBlob = new Blob([JSON.stringify(jsonPart)], {
      type: 'application/json'
    })

    formData.append('data', jsonBlob)
    formData.append('image', data.image)

    console.log('📋 [ADD_PROJECT] FormData entries:')
    for (const [key, value] of formData.entries()) {
      if (value instanceof Blob) {
        console.log(`${key}: Blob/File (${value.type}, ${value.size} bytes)`)
      } else {
        console.log(`${key}: ${value}`)
      }
    }

    // ⛳ Content-Type 자동 설정
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
      url: error.config?.url
    })

    if (error.response?.status === 401) {
      throw new Error('인증이 필요합니다.')
    }
    throw error
  }
}


/** 프로젝트 수정 */
export const updateProject = async (
  data: PutProjectRequest & { imageUrl: string | null }
): Promise<void> => {
  const formData = new FormData()

  // 1. JSON 객체 준비 (image 여부에 따라 imageUrl 조정)
  const requestData = {
    serviceName: data.serviceName,
    generation: data.generation,
    shortDescription: data.shortDescription,
    description: data.description,
    githubUrl: data.githubUrl || '',
    instagramUrl: data.instagramUrl || '',
    etcUrl: data.etcUrl || '',
    isAlumni: data.isAlumni,
    isOfficial: data.isOfficial,
    imageUrl: data.image ? null : data.imageUrl // ✅ 조건에 따른 처리
  }

  // 2. JSON을 File 형태로 FormData에 추가
  const jsonFile = new File(
    [JSON.stringify(requestData)],
    'data.json',
    { type: 'application/json' }
  )
  formData.append('data', jsonFile)

  // 3. 이미지가 바뀌었을 경우에만 파일로 추가
  if (data.image) {
    formData.append('image', data.image)
  }

  // 4. 서버 요청 (Content-Type 자동)
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
