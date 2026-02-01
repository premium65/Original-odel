const API_BASE = "/api";

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "API Error");
  }
  return res.json();
}

export const api = {
  // Auth
  login: (data: { username: string; password: string }) => fetchAPI("/admin/auth/login", { method: "POST", body: JSON.stringify(data) }),
  logout: () => fetchAPI("/admin/auth/logout", { method: "POST" }),
  getMe: () => fetchAPI("/admin/auth/me"),
  setup: () => fetchAPI("/admin/auth/setup", { method: "POST" }),

  // Users
  getUsers: () => fetchAPI("/admin/users"),
  getPendingUsers: () => fetchAPI("/admin/users/pending"),
  getAdmins: () => fetchAPI("/admin/users/admins"),
  getUser: (id: number | string) => fetchAPI(`/admin/users/${id}`),
  createUser: (data: any) => fetchAPI("/admin/users", { method: "POST", body: JSON.stringify(data) }),
  updateUser: (id: number | string, data: any) => fetchAPI(`/admin/users/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteUser: (id: number | string) => fetchAPI(`/admin/users/${id}`, { method: "DELETE" }),
  approveUser: (id: number | string) => fetchAPI(`/admin/users/${id}/approve`, { method: "POST" }),
  rejectUser: (id: number | string) => fetchAPI(`/admin/users/${id}/reject`, { method: "POST" }),
  createMilestone: (id: number | string, data: any) => fetchAPI(`/admin/users/${id}/milestone`, { method: "POST", body: JSON.stringify(data) }),
  updateBalance: (id: number | string, data: any) => fetchAPI(`/admin/users/${id}/balance`, { method: "POST", body: JSON.stringify(data) }),

  // Transactions
  getTransactions: () => fetchAPI("/admin/transactions"),
  getWithdrawals: () => fetchAPI("/admin/transactions/withdrawals"),
  getDeposits: () => fetchAPI("/admin/transactions/deposits"),
  updateWithdrawal: (id: number, data: any) => fetchAPI(`/admin/transactions/withdrawals/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  updateDeposit: (id: number, data: any) => fetchAPI(`/admin/transactions/deposits/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  // Ads
  getAds: () => fetchAPI("/admin/ads"),
  getAd: (id: number) => fetchAPI(`/admin/ads/${id}`),
  deleteAd: (id: number) => fetchAPI(`/admin/ads/${id}`, { method: "DELETE" }),

  // Settings
  getConfig: () => fetchAPI("/admin/settings/config"),
  updateConfig: (data: any) => fetchAPI("/admin/settings/config", { method: "PUT", body: JSON.stringify(data) }),
  getContacts: (type?: string) => fetchAPI(type ? `/admin/settings/contacts/${type}` : "/admin/settings/contacts"),
  createContact: (data: any) => fetchAPI("/admin/settings/contacts", { method: "POST", body: JSON.stringify(data) }),
  updateContact: (id: number, data: any) => fetchAPI(`/admin/settings/contacts/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteContact: (id: number) => fetchAPI(`/admin/settings/contacts/${id}`, { method: "DELETE" }),
  getContent: (page: string) => fetchAPI(`/admin/settings/content/${page}`),
  updateContent: (page: string, data: any) => fetchAPI(`/admin/settings/content/${page}`, { method: "PUT", body: JSON.stringify(data) }),
  getSlideshow: () => fetchAPI("/admin/settings/slideshow"),
  deleteSlide: (id: number) => fetchAPI(`/admin/settings/slideshow/${id}`, { method: "DELETE" }),

  // Dashboard
  getStats: () => fetchAPI("/admin/dashboard/stats"),
  getRecent: () => fetchAPI("/admin/dashboard/recent"),
  getChart: () => fetchAPI("/admin/dashboard/chart"),
};
