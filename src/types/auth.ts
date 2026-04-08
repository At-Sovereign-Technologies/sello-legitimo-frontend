export interface GenerateOtpRequest {
  cedula: string;
}

export interface VerifyOtpRequest {
  cedula: string;
  otp: string;
}

export interface VerifyOtpResponse {
  token: string;
}

export interface GenerateOtpResponse {
  message: string;
}
