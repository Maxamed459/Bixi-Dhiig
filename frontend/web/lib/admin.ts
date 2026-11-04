import { apiClient } from "./api";
import type { BloodType, DonationStatus, RequestStatus, UrgencyLevel } from "./blood-requests";
import type { AdminPermission, Paginated, UserRole } from "./types";

export type AccountStatus = "ACTIVE" | "INACTIVE" | "DELETED";
export type NotificationChannel = "WHATSAPP" | "EMAIL";
export type NotificationStatus = "SENT" | "FAILED";

export interface AdminUser {
  id: string;
  display_name: string;
  email: string;
  phone?: string | null;
  avater?: string | null;
  role: UserRole;
  isSuperAdmin: boolean;
  permissions: AdminPermission[];
  bloodType?: BloodType | null;
  city?: string | null;
  receiveAlerts: boolean;
  last_login_at?: string | null;
  is_email_verified: boolean;
  active: boolean;
  is_deleted: boolean;
  createdAt: string;
  updatedAt: string;
  hospital?: {
    id: string;
    name: string;
    licenseNumber?: string | null;
    phone?: string | null;
    address?: string | null;
    city?: string | null;
    active: boolean;
  } | null;
  _count?: { bloodRequests: number; donations: number };
}

export interface AdminUserDetail extends AdminUser {
  oauthAccounts: {
    provider: string | null;
    providerUserId?: string | null;
    createdAt: string;
  }[];
  bloodRequests: {
    id: string;
    patientName: string;
    bloodType: BloodType;
    urgency: UrgencyLevel;
    status: RequestStatus;
    unitsNeeded: number;
    unitsFulfilled: number;
    createdAt: string;
  }[];
  donations: {
    id: string;
    unitsOffered: number;
    status: DonationStatus;
    createdAt: string;
    bloodRequest: { id: string; patientName: string; bloodType: BloodType; status: RequestStatus };
  }[];
}

export interface AdminUserFilters {
  search?: string;
  role?: UserRole | "";
  status?: AccountStatus | "";
  bloodType?: BloodType | "";
  city?: string;
  page?: number;
  limit?: number;
}

export interface CreateAdminUserInput {
  display_name: string;
  email: string;
  password: string;
  phone?: string;
  role: UserRole;
  permissions?: AdminPermission[];
  isSuperAdmin?: boolean;
  bloodType?: BloodType;
  city?: string;
  is_email_verified?: boolean;
  receiveAlerts?: boolean;
  hospitalName?: string;
  licenseNumber?: string;
  address?: string;
}

export interface UpdateAdminUserInput {
  display_name?: string;
  email?: string;
  password?: string;
  phone?: string | null;
  role?: UserRole;
  permissions?: AdminPermission[];
  isSuperAdmin?: boolean;
  bloodType?: BloodType | null;
  city?: string | null;
  is_email_verified?: boolean;
  receiveAlerts?: boolean;
  active?: boolean;
  hospitalName?: string;
  licenseNumber?: string | null;
  address?: string | null;
}

export interface AdminRecentUser {
  id: string;
  display_name: string;
  email: string;
  role: UserRole;
  bloodType?: BloodType | null;
  city?: string | null;
  active: boolean;
  is_email_verified: boolean;
  createdAt: string;
}

export interface AdminRecentRequest {
  id: string;
  patientName: string;
  bloodType: BloodType;
  urgency: UrgencyLevel;
  status: RequestStatus;
  unitsNeeded: number;
  unitsFulfilled: number;
  hospitalName: string;
  city: string;
  createdAt: string;
  requester: { id: string; display_name: string; role: UserRole };
  _count: { donations: number };
}

export interface AdminRecentDonation {
  id: string;
  unitsOffered: number;
  status: DonationStatus;
  createdAt: string;
  donor: { id: string; display_name: string; email: string };
  bloodRequest: {
    id: string;
    patientName: string;
    bloodType: BloodType;
    city: string;
    status: RequestStatus;
  };
}

export interface AdminStats {
  users: {
    total: number;
    active: number;
    verified: number;
    deleted: number;
    newThisWeek: number;
    byRole: Partial<Record<UserRole, number>>;
    donorsByBloodType: Partial<Record<BloodType, number>>;
  };
  requests: {
    total: number;
    pending: number;
    live: number;
    fulfilled: number;
    rejected: number;
    cancelled: number;
    newThisWeek: number;
    byStatus: Partial<Record<RequestStatus, number>>;
    byDay: { date: string; count: number }[];
  };
  donations: {
    total: number;
    pending: number;
    accepted: number;
    completed: number;
    declined: number;
    cancelled: number;
    completedUnits: number;
    byStatus: Partial<Record<DonationStatus, number>>;
  };
  notifications: { sent: number; failed: number };
  recent: {
    users?: AdminRecentUser[];
    requests: AdminRecentRequest[];
    donations?: AdminRecentDonation[];
  };
}

export interface AdminDonation {
  id: string;
  donorId: string;
  bloodRequestId: string;
  unitsOffered: number;
  status: DonationStatus;
  scheduledAt?: string | null;
  completedAt?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  donor: { id: string; display_name: string; email: string; phone?: string | null };
  bloodRequest: {
    id: string;
    patientName: string;
    bloodType: BloodType;
    urgency: UrgencyLevel;
    status: RequestStatus;
    city: string;
    hospitalName: string;
    requester: { id: string; display_name: string };
  };
  confirmedBy?: { id: string; display_name: string } | null;
}

export interface AdminDonationFilters {
  status?: DonationStatus | "";
  bloodType?: BloodType | "";
  city?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface NotificationLog {
  id: string;
  userId?: string | null;
  channel: NotificationChannel;
  event: string;
  target: string;
  status: NotificationStatus;
  error?: string | null;
  createdAt: string;
}

export interface NotificationLogFilters {
  channel?: NotificationChannel | "";
  status?: NotificationStatus | "";
  event?: string;
  search?: string;
  page?: number;
  limit?: number;
}

const data = <T>(body: { data: T }): T => body.data;

const clean = <T extends object>(filters: T) =>
  Object.fromEntries(
    Object.entries(filters).filter(
      ([, value]) => value !== "" && value !== undefined && value !== null,
    ),
  );

export async function getAdminStats(): Promise<AdminStats> {
  const res = await apiClient.get("/admin/stats");
  return data(res.data);
}

export async function listAdminUsers(
  filters: AdminUserFilters,
): Promise<Paginated<AdminUser>> {
  const res = await apiClient.get("/admin/users", { params: clean(filters) });
  return data(res.data);
}

export async function getAdminUser(id: string): Promise<AdminUserDetail> {
  const res = await apiClient.get(`/admin/users/${id}`);
  return data(res.data);
}

export async function createAdminUser(input: CreateAdminUserInput): Promise<AdminUser> {
  const res = await apiClient.post("/admin/users", input);
  return data(res.data);
}export async function updateAdminUser(
  id: string,
  input: UpdateAdminUserInput,
): Promise<AdminUser> {
  const res = await apiClient.patch(`/admin/users/${id}`, input);
  return data(res.data);
}

export async function deleteAdminUser(id: string): Promise<AdminUser> {
  const res = await apiClient.delete(`/admin/users/${id}`);
  return data(res.data);
}

export async function listAdminDonations(
  filters: AdminDonationFilters,
): Promise<Paginated<AdminDonation>> {
  const res = await apiClient.get("/admin/donations", { params: clean(filters) });
  return data(res.data);
}

export async function listNotificationLogs(
  filters: NotificationLogFilters,
): Promise<Paginated<NotificationLog>> {
  const res = await apiClient.get("/admin/notifications", { params: clean(filters) });
  return data(res.data);
}
