import apiClient from "./apiClient"

export const requestOtp = async (cedula: string) => {
  await apiClient.post("/api/v1/auth/login", { cedula })
}

export const verifyOtp = async (cedula: string, otp: string) => {
  const response = await apiClient.post("/api/v1/auth/verify", {
    cedula,
    otp
  })

  return response.data.token
}
