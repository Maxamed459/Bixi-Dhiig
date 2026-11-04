"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAdminUser,
  deleteAdminUser,
  getAdminStats,
  getAdminUser,
  listAdminDonations,
  listAdminUsers,
  listNotificationLogs,
  updateAdminUser,
  type AdminDonationFilters,
  type AdminUserFilters,
  type NotificationLogFilters,
  type UpdateAdminUserInput,
} from "@/lib/admin";

export const adminKeys = {
  all: ["admin"] as const,
  stats: () => ["admin", "stats"] as const,
  users: (filters: AdminUserFilters) => ["admin", "users", filters] as const,
  user: (id: string) => ["admin", "user", id] as const,
  donations: (filters: AdminDonationFilters) => ["admin", "donations", filters] as const,
  notifications: (filters: NotificationLogFilters) => ["admin", "notifications", filters] as const,
};

export function useAdminStats(enabled = true) {
  return useQuery({
    queryKey: adminKeys.stats(),
    queryFn: getAdminStats,
    enabled,
    staleTime: 30_000,
  });
}

export function useAdminUsers(filters: AdminUserFilters, enabled = true) {
  return useQuery({
    queryKey: adminKeys.users(filters),
    queryFn: () => listAdminUsers(filters),
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function useAdminUser(id: string) {
  return useQuery({
    queryKey: adminKeys.user(id),
    queryFn: () => getAdminUser(id),
    enabled: Boolean(id),
  });
}

export function useAdminDonations(filters: AdminDonationFilters) {
  return useQuery({
    queryKey: adminKeys.donations(filters),
    queryFn: () => listAdminDonations(filters),
    placeholderData: keepPreviousData,
  });
}

export function useNotificationLogs(filters: NotificationLogFilters) {
  return useQuery({
    queryKey: adminKeys.notifications(filters),
    queryFn: () => listNotificationLogs(filters),
    placeholderData: keepPreviousData,
  });
}

function useInvalidateAdmin() {
  const client = useQueryClient();
  return () => client.invalidateQueries({ queryKey: adminKeys.all });
}

export function useCreateAdminUser() {
  const invalidate = useInvalidateAdmin();
  return useMutation({ mutationFn: createAdminUser, onSuccess: invalidate });
}

export function useUpdateAdminUser(id: string) {
  const invalidate = useInvalidateAdmin();
  return useMutation({
    mutationFn: (input: UpdateAdminUserInput) => updateAdminUser(id, input),
    onSuccess: invalidate,
  });
}

export function useDeleteAdminUser() {
  const invalidate = useInvalidateAdmin();
  return useMutation({
    mutationFn: (id: string) => deleteAdminUser(id),
    onSuccess: invalidate,
  });
}
