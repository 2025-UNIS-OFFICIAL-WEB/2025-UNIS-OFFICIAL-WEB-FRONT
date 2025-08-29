import axios from 'axios'

const instance = axios.create({
  baseURL: 'https://admin-unis.com',
  timeout: 60000,
  maxContentLength: Infinity,
  maxBodyLength: Infinity,
})

export default instance
