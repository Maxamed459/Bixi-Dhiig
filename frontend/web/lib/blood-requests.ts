import { apiClient } from "./api";
import type { CreateRequestFormValues } from "./validation";

export type BloodType = CreateRequestFormValues["bloodType"];
export type UrgencyLevel = CreateRequestFormValues["urgency"];
export type RequestStatus = "PENDING" | "APPROVED" | "REJECTED" | "FULFILLED" | "CANCELLED";
export type DonationStatus = "PENDING" | "ACCEPTED" | "COMPLETED" | "DECLINED" | "CANCELLED";

export interface BloodRequest {
  id: string;
  requesterId: string;
  patientName: string;
  bloodType: BloodType;
  unitsNeeded: number;
  unitsFulfilled: number;
  urgency: UrgencyLevel;
  hospitalName: string;
  city: string;
  address?: string | null;
  contactPhone: string;
  notes?: string | null;
  status: RequestStatus;
  approvedAt?: string | null;
  rejectionReason?: string | null;
  createdAt: string;
  updatedAt: string;
  requester?: { id: string; display_name: string; role: string; phone?: string | null };
  _count?: { donations: number };
}

export interface Donation {
  id: string;
  donorId: string;
  bloodRequestId: string;
  unitsOffered: number;
  status: DonationStatus;
  scheduledAt?: string | null;
  completedAt?: string | null;
  notes?: string | null;
  createdAt: string;
  donor: { id: string; display_name: string; phone?: string | null };
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface RequestFilters {
  status?: RequestStatus | "";
  bloodType?: BloodType | "";
  urgency?: UrgencyLevel | "";
  city?: string;
  page?: number;
  limit?: number;
}

// Every backend response is { success, message, data } — peel the envelope off.
const data = <T>(body: { data: T }): T => body.data;

export async function listBloodRequests(filters: RequestFilters): Promise<Paginated<BloodRequest>> {
  const params = Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== "" && value !== undefined),
  );
  const res = await apiClient.get("/blood-requests", { params });
  return data(res.data);
}

export async function listMyBloodRequests(): Promise<BloodRequest[]> {
  const res = await apiClient.get("/blood-requests/mine");
  return data(res.data);
}

export async function getBloodRequest(id: string): Promise<BloodRequest> {
  const res = await apiClient.get(`/blood-requests/${id}`);
  return data(res.data);
}

export async function createBloodRequest(values: CreateRequestFormValues): Promise<BloodRequest> {
  const res = await apiClient.post("/blood-requests", {
    ...values,
    address: values.address || undefined,
    notes: values.notes || undefined,
  });
  return data(res.data);
}

export async function pledgeDonation(input: { bloodRequestId: string; unitsOffered: number; notes?: string }): Promise<Donation> {
  const res = await apiClient.post("/donations", input);
  return data(res.data);
}

export async function approveBloodRequest(id: string): Promise<BloodRequest> {
  const res = await apiClient.patch(`/blood-requests/${id}/approve`);
  return data(res.data);
}

export async function rejectBloodRequest(id: string, reason?: string): Promise<BloodRequest> {
  const res = await apiClient.patch(`/blood-requests/${id}/reject`, { reason: reason || undefined });
  return data(res.data);
}

export async function cancelBloodRequest(id: string): Promise<BloodRequest> {
  const res = await apiClient.patch(`/blood-requests/${id}/cancel`);
  return data(res.data);
}

export async function fulfillBloodRequest(id: string): Promise<BloodRequest> {
  const res = await apiClient.patch(`/blood-requests/${id}/fulfill`);
  return data(res.data);
}

export async function listDonationsForRequest(requestId: string): Promise<Donation[]> {
  const res = await apiClient.get(`/donations/request/${requestId}`);
  return data(res.data);
}

export async function updateDonationStatus(
  id: string,
  status: "ACCEPTED" | "DECLINED" | "COMPLETED",
): Promise<Donation> {
  const res = await apiClient.patch(`/donations/${id}/status`, { status });
  return data(res.data);
}
