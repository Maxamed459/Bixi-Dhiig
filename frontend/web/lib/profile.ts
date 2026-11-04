import { apiClient } from "./api";
import type { BloodType } from "./blood-requests";
import type { User } from "./types";

export interface ProfileUpdateInput {
  display_name?: string;
  phone?: string;
  bloodType?: BloodType;
  city?: string;
  receiveAlerts?: boolean;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export async function updateMyProfile(input: ProfileUpdateInput): Promise<User> {
  const res = await apiClient.patch("/users/me", input);
  return res.data.data as User;
}

export async function changeMyPassword(input: ChangePasswordInput): Promise<{ message?: string }> {
  const res = await apiClient.post("/auth/change-password", input);
  return res.data as { message?: string };
}
