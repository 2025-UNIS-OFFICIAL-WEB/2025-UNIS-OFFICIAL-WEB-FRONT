import axios from 'axios'
import { setupAuthInterceptor } from '@/hooks/useAuthInterceptor'

const instance = axios.create({
  baseURL: 'https://admin-unis.com',
  timeout: 60000,
  maxContentLength: Infinity,
  maxBodyLength: Infinity,
})

setupAuthInterceptor(instance)

export default instance
