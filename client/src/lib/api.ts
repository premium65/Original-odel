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
    let errorMessage = "API Error";
    try {
      const errorData = await res.json();
      // Surface detailed server error messages
      errorMessage = errorData.error || errorData.message || errorMessage;
      if (errorData.details) {
        errorMessage += `: ${errorData.details}`;
      }
    } catch (e) {
      // If response is not JSON, use status text
      errorMessage = res.statusText || errorMessage;
    }
    throw new Error(errorMessage);
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

  // Premium Manage - Reset/Add operations
  resetUserField: (id: number | string, field: string) => fetchAPI(`/admin/users/${id}/reset`, { method: "POST", body: JSON.stringify({ field }) }),
  addUserValue: (id: number | string, field: string, amount: string) => fetchAPI(`/admin/users/${id}/add-value`, { method: "POST", body: JSON.stringify({ field, amount }) }),
  createPromotion: (id: number | string, data: { adsLimit: number; deposit: string; commission: string; pendingAmount: string }) => fetchAPI(`/admin/users/${id}/restrict`, { method: "POST", body: JSON.stringify(data) }),
  removePromotion: (id: number | string) => fetchAPI(`/admin/users/${id}/unrestrict`, { method: "POST" }),
  updateUserDetails: (id: number | string, data: any) => fetchAPI(`/admin/users/${id}/details`, { method: "PATCH", body: JSON.stringify(data) }),
  updateBankDetails: (id: number | string, data: any) => fetchAPI(`/admin/users/${id}/bank`, { method: "PATCH", body: JSON.stringify(data) }),

  // E-Voucher (Milestone Hold System)
  createEVoucher: (id: number | string, data: { milestoneAdsCount: number; milestoneAmount: string; milestoneReward: string; ongoingMilestone: string; bannerUrl?: string }) =>
    fetchAPI(`/admin/users/${id}/evoucher`, { method: "POST", body: JSON.stringify(data) }),
  unlockEVoucher: (id: number | string) => fetchAPI(`/admin/users/${id}/evoucher-unlock`, { method: "POST" }),

  // E-Bonus (Instant Reward - NO locking)
  createEBonus: (id: number | string, data: { bonusAdsCount: number; bonusAmount: string; bannerUrl?: string }) =>
    fetchAPI(`/admin/users/${id}/ebonus`, { method: "POST", body: JSON.stringify(data) }),

  // Transactions
  getTransactions: () => fetchAPI("/admin/transactions"),
  getWithdrawals: () => fetchAPI("/admin/transactions/withdrawals"),
  getDeposits: () => fetchAPI("/admin/transactions/deposits"),
  updateWithdrawal: (id: number, data: any) => fetchAPI(`/admin/transactions/withdrawals/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  updateDeposit: (id: number, data: any) => fetchAPI(`/admin/transactions/deposits/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  createManualDeposit: (data: { userId: string; amount: string; description?: string }) =>
    fetchAPI("/admin/transactions/deposits/manual", { method: "POST", body: JSON.stringify(data) }),

  // Ads
  getAds: () => fetchAPI("/admin/ads"),
  getAd: (id: number) => fetchAPI(`/admin/ads/${id}`),
  createAd: (data: any) => fetchAPI("/admin/ads", { method: "POST", body: JSON.stringify(data) }),
  updateAd: (id: number, data: any) => fetchAPI(`/admin/ads/${id}`, { method: "PUT", body: JSON.stringify(data) }),
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

  // Branding
  getBranding: () => fetchAPI("/admin/settings/branding"),
  updateBranding: (data: any) => fetchAPI("/admin/settings/branding", { method: "PUT", body: JSON.stringify(data) }),

  // Theme
  getTheme: () => fetchAPI("/admin/settings/theme"),
  updateTheme: (data: any) => fetchAPI("/admin/settings/theme", { method: "PUT", body: JSON.stringify(data) }),

  // Info Pages
  getInfoPages: () => fetchAPI("/admin/settings/info-pages"),
  getInfoPage: (slug: string) => fetchAPI(`/admin/settings/info-pages/${slug}`),
  updateInfoPage: (slug: string, data: any) => fetchAPI(`/admin/settings/info-pages/${slug}`, { method: "PUT", body: JSON.stringify(data) }),

  // Dashboard
  getStats: () => fetchAPI("/admin/dashboard/stats"),
  getRecent: () => fetchAPI("/admin/dashboard/recent"),
  getChart: () => fetchAPI("/admin/dashboard/chart"),

  // Premium Plans
  getPremiumPlans: () => fetchAPI("/admin/premium/plans"),
  getPremiumPlan: (id: number) => fetchAPI(`/admin/premium/plans/${id}`),
  createPremiumPlan: (data: any) => fetchAPI("/admin/premium/plans", { method: "POST", body: JSON.stringify(data) }),
  updatePremiumPlan: (id: number, data: any) => fetchAPI(`/admin/premium/plans/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deletePremiumPlan: (id: number) => fetchAPI(`/admin/premium/plans/${id}`, { method: "DELETE" }),
  getPremiumPurchases: () => fetchAPI("/admin/premium/purchases"),
};
