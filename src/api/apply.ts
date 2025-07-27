import axiosInstance from './axiosInstance'

export interface GetApplyInfoResponse {
  isAvailable: boolean
  applyUrl: string
}

export interface PutApplyInfoRequest {
  isAvailable: boolean
  applyUrl: string
}

export interface PutApplyInfoResponse {
  status: number
  message: string
  data: null
}

export const getApplyInfo = async (): Promise<GetApplyInfoResponse> => {
  const response = await axiosInstance.get('/admin/apply')
  return response.data.data
}

export const updateApplyInfo = async (
  data: PutApplyInfoRequest
): Promise<PutApplyInfoResponse> => {
  const response = await axiosInstance.put('/admin/apply', data)
  return response.data
}