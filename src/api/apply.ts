import axiosInstance from './axiosInstance'

export interface PutApplyInfoRequest {
  isAvailable: boolean
  applyUrl: string
}

export interface PutApplyInfoResponse {
  status: number
  message: string
  data: null
}

export const updateApplyInfo = async (
  data: PutApplyInfoRequest
): Promise<PutApplyInfoResponse> => {
  const payload: any = { isAvailable: data.isAvailable }

  // 지원 가능 상태일 때만 applyUrl 포함
  if (data.isAvailable) {
    payload.applyUrl = data.applyUrl
  }

  const response = await axiosInstance.put('/admin/apply', payload)
  return response.data
}

