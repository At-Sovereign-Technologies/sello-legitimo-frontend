import apiClient from '../api/apiClient'

// Matches MessageResponse record
interface MessageResponse { message: string }

// Matches TokenResponse record  
interface TokenResponse { token: string }

export const requestOtp = async (cedula: string): Promise<string> => {
  const { data } = await apiClient.post<MessageResponse>('/login', { cedula })
  return data.message
}

export const verifyOtp = async (cedula: string, otp: string): Promise<string> => {
  const { data } = await apiClient.post<TokenResponse>('/verify', { cedula, otp })
  return data.token
}