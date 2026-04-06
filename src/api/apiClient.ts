import axios from 'axios'

const apiClient = axios.create({
  // Vite proxy forwards /api → http://localhost:8080 in dev
  baseURL: '/api/v1/auth',
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT on every request if it exists
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default apiClient