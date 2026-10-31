"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  approveBloodRequest,
  cancelBloodRequest,
  createBloodRequest,
  getBloodRequest,
  listBloodRequests,
  listDonationsForRequest,
  listMyBloodRequests,
  rejectBloodRequest,
  updateDonationStatus,
  type BloodRequest,
  type Paginated,
  type RequestFilters,
} from "@/lib/blood-requests";

export const requestKeys = {
  all: ["blood-requests"] as const,
  list: (filters: RequestFilters, scope: string) => ["blood-requests", "list", scope, filters] as const,
  detail: (id: string) => ["blood-requests", "detail", id] as const,
  donations: (id: string) => ["blood-requests", "donations", id] as const,
};

const PAGE_SIZE = 10;

/**
 * Lists requests either from the paginated endpoint ("all") or from /mine ("mine").
 * /mine has no filters/pagination server-side, so those are applied here to keep the
 * table behaving the same in both scopes.
 */
export function useRequestsList(filters: RequestFilters, scope: "all" | "mine" = "all") {
  return useQuery<Paginated<BloodRequest>>({
    queryKey: requestKeys.list(filters, scope),
    placeholderData: keepPreviousData,
    queryFn: async () => {
      if (scope === "all") return listBloodRequests({ ...filters, limit: filters.limit ?? PAGE_SIZE });

      const mine = await listMyBloodRequests();
      const city = filters.city?.trim().toLowerCase();
      const filtered = mine.filter(
        (r) =>
          (!filters.status || r.status === filters.status) &&
          (!filters.bloodType || r.bloodType === filters.bloodType) &&
          (!filters.urgency || r.urgency === filters.urgency) &&
          (!city || r.city.toLowerCase() === city),
      );
      const limit = filters.limit ?? PAGE_SIZE;
      const page = filters.page ?? 1;
      return {
        items: filtered.slice((page - 1) * limit, page * limit),
        total: filtered.length,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(filtered.length / limit)),
      };
    },
  });
}

export function useBloodRequest(id: string) {
  return useQuery({ queryKey: requestKeys.detail(id), queryFn: () => getBloodRequest(id), enabled: Boolean(id) });
}

export function useRequestDonations(id: string, enabled: boolean) {
  return useQuery({
    queryKey: requestKeys.donations(id),
    queryFn: () => listDonationsForRequest(id),
    enabled: Boolean(id) && enabled,
  });
}

function useInvalidateRequests() {
  const client = useQueryClient();
  return () => client.invalidateQueries({ queryKey: requestKeys.all });
}

export function useCreateRequest() {
  const invalidate = useInvalidateRequests();
  return useMutation({ mutationFn: createBloodRequest, onSuccess: invalidate });
}

export function useApproveRequest() {
  const invalidate = useInvalidateRequests();
  return useMutation({ mutationFn: (id: string) => approveBloodRequest(id), onSuccess: invalidate });
}

export function useRejectRequest() {
  const invalidate = useInvalidateRequests();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => rejectBloodRequest(id, reason),
    onSuccess: invalidate,
  });
}

export function useCancelRequest() {
  const invalidate = useInvalidateRequests();
  return useMutation({ mutationFn: (id: string) => cancelBloodRequest(id), onSuccess: invalidate });
}

export function useUpdateDonation() {
  const invalidate = useInvalidateRequests();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: "ACCEPTED" | "DECLINED" | "COMPLETED" }) =>
      updateDonationStatus(id, status),
    onSuccess: invalidate,
  });
}
