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

interface ApplyInfoPayload {
  isAvailable: boolean;
  applyUrl?: string;
}

export const updateApplyInfo = async (data: PutApplyInfoRequest): Promise<PutApplyInfoResponse> => {
  const payload: ApplyInfoPayload = { isAvailable: data.isAvailable };

  // '지원 가능' 상태일 때만 applyUrl을 페이로드에 포함합니다.
  if (data.isAvailable) {
    payload.applyUrl = data.applyUrl;
  }

  const response = await axiosInstance.put('/admin/apply', payload);
  return response.data;
};


