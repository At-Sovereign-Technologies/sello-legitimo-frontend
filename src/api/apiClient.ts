import axios from "axios"

const API_URL = import.meta.env.VITE_API_URL

// STEP 1 → pedir OTP
export const requestOtp = async (cedula: string): Promise<void> => {
  await axios.post(`${API_URL}/api/v1/auth/login`, {
    cedula
  })
}

// STEP 2 → verificar OTP y recibir token
export const verifyOtp = async (cedula: string, otp: string): Promise<string> => {
  const response = await axios.post(`${API_URL}/api/v1/auth/verify`, {
    cedula,
    otp
  })

  return response.data.token
}
