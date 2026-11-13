import axios from 'axios'
import { attachAuthToken, normalizeApiError } from './interceptors'

const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
  timeout: 15_000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

attachAuthToken(http)
normalizeApiError(http)

export default http
