import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertAd, type Ad } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useAds() {
  return useQuery({
    queryKey: [api.ads.list.path],
    queryFn: async () => {
      const res = await fetch(api.ads.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch ads");
      return api.ads.list.responses[200].parse(await res.json());
    },
  });
}

export function useClickAd() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.ads.click.path, { id });
      const res = await fetch(url, {
        method: api.ads.click.method,
        credentials: "include",
      });
      
      if (!res.ok) {
        if (res.status === 400) throw new Error("Validation error");
        throw new Error("Failed to process ad click");
      }
      return api.ads.click.responses[200].parse(await res.json());
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [api.ads.list.path] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] }); // Refresh balance
      toast({
        title: "Earnings Added!",
        description: `You earned ${data.earnings} LKR`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useCreateAd() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertAd) => {
      const res = await fetch(api.ads.create.path, {
        method: api.ads.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create ad");
      return api.ads.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.ads.list.path] });
      toast({ title: "Success", description: "Ad created successfully" });
    },
    onError: () => toast({ title: "Error", description: "Failed to create ad", variant: "destructive" }),
  });
}

export function useDeleteAd() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.ads.delete.path, { id });
      const res = await fetch(url, { method: api.ads.delete.method, credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete ad");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.ads.list.path] });
      toast({ title: "Deleted", description: "Ad removed successfully" });
    },
  });
}
