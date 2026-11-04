"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppDispatch } from "@/store/hooks";
import { setUser } from "@/store/features/authSlice";
import { changeMyPassword, updateMyProfile } from "@/lib/profile";

export function useUpdateProfile() {
  const dispatch = useAppDispatch();
  const client = useQueryClient();

  return useMutation({
    mutationFn: updateMyProfile,
    onSuccess: (user) => {
      dispatch(setUser(user));
      void client.invalidateQueries({ queryKey: ["admin"] });
    },
  });
}

export function useChangePassword() {
  return useMutation({ mutationFn: changeMyPassword });
}
