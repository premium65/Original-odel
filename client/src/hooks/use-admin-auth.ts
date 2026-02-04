import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface AdminUser {
  id: string;
  username: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string | null;
  isAdmin: number | boolean;
}

async function fetchAdminMe(): Promise<AdminUser> {
  const res = await fetch("/api/admin/auth/me", { credentials: "include" });
  if (!res.ok) {
    throw new Error("Not authenticated");
  }
  return res.json();
}

export const useAdminAuth = () => {
  const queryClient = useQueryClient();

  const { data: user, isLoading, isError } = useQuery<AdminUser>({
    queryKey: ["admin-auth"],
    queryFn: fetchAdminMe,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await fetch("/api/admin/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    },
    onSuccess: () => {
      queryClient.clear();
      window.location.href = "/admin/login";
    },
  });

  return {
    user: user || null,
    isLoading,
    isAuthenticated: !!user && !isError,
    logout: () => logoutMutation.mutate(),
    isLoggingOut: logoutMutation.isPending,
  };
};
