// Admin user bypass for all admin components
export const adminUser = {
  id: "admin",
  username: "admin",
  fullName: "System Administrator",
  firstName: "System",
  lastName: "Administrator",
  profileImageUrl: null,
  isAdmin: 1
};

export const useAdminAuth = () => ({
  user: adminUser,
  isLoading: false,
  isAuthenticated: true,
  logout: () => {
    window.location.href = "/admin/login";
  },
  isLoggingOut: false
});
