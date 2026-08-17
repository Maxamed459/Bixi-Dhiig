import { apiClient } from "./api";
import type { AuthPayload, User } from "./types";

function unwrap<T>(body: unknown): T {
  const envelope = body as { data?: T };
  return (envelope?.data ?? body) as T;
}

export async function loginRequest(
  email: string,
  password: string,
): Promise<AuthPayload> {
  const res = await apiClient.post("/auth/login", { email, password });
  return unwrap<AuthPayload>(res.data);
}

export interface RegisterHospitalPayload {
  display_name: string;
  email: string;
  password: string;
  role: "hospital";
}

export async function registerHospitalRequest(
  payload: RegisterHospitalPayload,
): Promise<AuthPayload> {
  const res = await apiClient.post("/auth/register-hospital", payload);
  return unwrap<AuthPayload>(res.data);
}

export async function verifyRequest(submittedCode: string): Promise<User> {
  const res = await apiClient.post("/auth/verify", { submittedCode });
  return unwrap<User>(res.data.data);
}

export async function resendCodeRequest(): Promise<{ message?: string }> {
  const res = await apiClient.post("/auth/resend-code");
  return unwrap<{ message?: string }>(res.data);
}

export async function googleOauth(): Promise<{
  user: User;
  accessToken: string;
  refreshToken: string;
}> {
  const res = await apiClient.get("/auth/google");
  return unwrap<{ user: User; accessToken: string; refreshToken: string }>(
    res.data.data,
  );
}
