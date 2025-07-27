import axios from 'axios'

const instance = axios.create({
  baseURL: 'https://admin-unis.com',
  timeout: 60000, // 60초 타임아웃 (파일 업로드 고려)
  maxContentLength: Infinity,
  maxBodyLength: Infinity,
})

// FormData 요청시 Content-Type을 설정하지 않음 (브라우저가 자동 설정)
instance.defaults.headers.common['Content-Type'] = 'application/json'

export default instance