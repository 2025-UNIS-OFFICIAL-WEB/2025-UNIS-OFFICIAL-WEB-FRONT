import axiosInstance from './axiosInstance';

// ===== 타입 정의 ===== //
export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T | null;
}

export interface Project {
  projectId: number;
  serviceName: string;
  generation: number;
  shortDescription: string;
  description: string;
  imageUrl: string;
  githubUrl: string | null;
  instagramUrl: string | null;
  etcUrl: string | null;
  isAlumni: boolean;
  isOfficial: boolean;
}

export type PostProjectRequest = Omit<Project, 'projectId' | 'imageUrl'> & {
  image: File;
};

export type PutProjectRequest = Omit<Project, 'imageUrl'> & {
  image?: File;
};

// --- 중복 로직을 줄이기 위한 헬퍼 함수 --- //
const createProjectFormData = (
  data: {
    serviceName: string;
    generation: number;
    shortDescription: string;
    description: string;
    githubUrl: string | null;
    instagramUrl: string | null;
    etcUrl: string | null;
    isAlumni: boolean;
    isOfficial: boolean;
  }, 
  image?: File
): FormData => {
  const formData = new FormData();

  const metadata = {
    serviceName: data.serviceName,
    generation: data.generation,
    shortDescription: data.shortDescription,
    description: data.description,
    githubUrl: data.githubUrl || '',
    instagramUrl: data.instagramUrl || '',
    etcUrl: data.etcUrl || '',
    isAlumni: data.isAlumni,
    isOfficial: data.isOfficial,
  };

  const jsonBlob = new Blob([JSON.stringify(metadata)], { type: 'application/json' });
  formData.append('data', jsonBlob);

  if (image) {
    formData.append('image', image);
  }

  return formData;
};

// ===== API 함수 ===== //
export const getProjects = async (): Promise<Project[]> => {
  try {
    const response = await axiosInstance.get<ApiResponse<Project[]>>('/admin/projects');
    return response.data.data || [];
  } catch (error) {
    console.error('❌ [GET_PROJECTS] Failed:', error);
    throw error;
  }
};

export const getProjectById = async (projectId: string): Promise<Project> => {
  try {
    const response = await axiosInstance.get<ApiResponse<Project>>(`/admin/projects/${projectId}`);
    if (!response.data.data) {
      throw new Error(`Project with ID ${projectId} not found.`);
    }
    return response.data.data;
  } catch (error) {
    console.error(`❌ [GET_PROJECT_BY_ID: ${projectId}] Failed:`, error);
    throw error;
  }
};

export const addProject = async (data: PostProjectRequest): Promise<ApiResponse<{ projectId: number }>> => {
  try {
    const formData = createProjectFormData(data, data.image);
    const response = await axiosInstance.post('/admin/projects/add', formData);
    return response.data;
  } catch (error) {
    console.error('❌ [ADD_PROJECT] Failed:', error);
    throw error;
  }
};

export const updateProject = async (data: PutProjectRequest): Promise<ApiResponse<null>> => {
  try {
    const formData = createProjectFormData(data, data.image);
    const response = await axiosInstance.put<ApiResponse<null>>(
      `/admin/projects/${data.projectId}/update`,
      formData
    );
    return response.data;
  } catch (error) {
    console.error(`❌ [UPDATE_PROJECT: ${data.projectId}] Failed:`, error);
    throw error;
  }
};

export const deleteProject = async (projectId: number): Promise<ApiResponse<null>> => {
  try {
    const response = await axiosInstance.delete(`/admin/projects/${projectId}/delete`);
    return response.data;
  } catch (error) {
    console.error(`❌ [DELETE_PROJECT: ${projectId}] Failed:`, error);
    throw error;
  }
};

