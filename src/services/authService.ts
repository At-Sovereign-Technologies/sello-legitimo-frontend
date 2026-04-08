import type {
  GenerateOtpRequest,
  VerifyOtpRequest,
  VerifyOtpResponse,
  GenerateOtpResponse,
} from "../types/auth";

// Match apiClient: unset/empty → same-origin /api (gateway/Tunnel or Vite proxy).
const trim = (v: unknown) => (typeof v === "string" ? v.trim() : "")
const API_URL =
  trim(import.meta.env.VITE_AUTH_SERVICE_URL) ||
  trim(import.meta.env.VITE_API_URL) ||
  ""

export const generateOtp = async (
  data: GenerateOtpRequest
): Promise<GenerateOtpResponse> => {
  const res = await fetch(`${API_URL}/api/v1/auth/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return res.json();
};

export const verifyOtp = async (
  data: VerifyOtpRequest
): Promise<VerifyOtpResponse> => {
  const res = await fetch(`${API_URL}/api/v1/auth/verify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return res.json();
};
