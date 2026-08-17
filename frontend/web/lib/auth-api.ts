import { apiClient } from "./api-client";
import type { AuthPayload, User } from "./types";

function unwrap<T>(body: unknown): T {
  const envelope = body as { data?: T };
  return (envelope?.data ?? body) as T;
}

export async function loginRequest(email: string, password: string): Promise<AuthPayload> {
  const res = await apiClient.post("/auth/login", { email, password });
  return unwrap<AuthPayload>(res.data);
}

export interface RegisterPayload {
  display_name: string;
  email: string;
  password: string;
  role: "hospital";
}

export async function registerRequest(payload: RegisterPayload): Promise<AuthPayload> {
  const res = await apiClient.post("/auth/register", payload);
  return unwrap<AuthPayload>(res.data);
}

export async function verifyRequest(submittedCode: string): Promise<{ user: User }> {
  const res = await apiClient.post("/auth/verify", { submittedCode });
  return unwrap<{ user: User }>(res.data);
}

export async function resendCodeRequest(): Promise<{ message?: string }> {
  const res = await apiClient.post("/auth/resend-code");
  return unwrap<{ message?: string }>(res.data);
}
