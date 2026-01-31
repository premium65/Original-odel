import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertWithdrawal } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useWithdrawals() {
  return useQuery({
    queryKey: [api.withdrawals.list.path],
    queryFn: async () => {
      const res = await fetch(api.withdrawals.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch withdrawals");
      return api.withdrawals.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateWithdrawal() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertWithdrawal) => {
      const res = await fetch(api.withdrawals.create.path, {
        method: api.withdrawals.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to request withdrawal");
      return api.withdrawals.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.withdrawals.list.path] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({ title: "Request Sent", description: "Withdrawal request submitted for approval" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

export function useApproveWithdrawal() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.withdrawals.approve.path, { id });
      const res = await fetch(url, { method: api.withdrawals.approve.method, credentials: "include" });
      if (!res.ok) throw new Error("Failed to approve withdrawal");
      return api.withdrawals.approve.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.withdrawals.list.path] });
      toast({ title: "Approved", description: "Withdrawal marked as approved" });
    },
  });
}

export function useRejectWithdrawal() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, reason }: { id: number; reason: string }) => {
      const url = buildUrl(api.withdrawals.reject.path, { id });
      const res = await fetch(url, {
        method: api.withdrawals.reject.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to reject withdrawal");
      return api.withdrawals.reject.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.withdrawals.list.path] });
      toast({ title: "Rejected", description: "Withdrawal request rejected" });
    },
  });
}
