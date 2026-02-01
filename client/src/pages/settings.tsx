import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  LayoutDashboard, 
  Crown, 
  Target, 
  Wallet, 
  Award,
  Calendar,
  Phone,
  Settings as SettingsIcon,
  LogOut,
  User,
  Mail,
  Lock,
  Bell,
  Globe,
  Palette,
  Hash,
  Trash2,
  Camera,
  Check,
  X,
  ChevronRight,
  Copy
} from "lucide-react";

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Crown, label: "Exclusives", path: "/exclusives" },
  { icon: Target, label: "Ad's Hub", path: "/ads-hub" },
  { icon: Wallet, label: "Payouts", path: "/withdraw", badge: true },
  { icon: Award, label: "Status", path: "/status" },
  { icon: Calendar, label: "Events", path: "/events" },
  { icon: Phone, label: "Contact", path: "/contact" },
  { icon: SettingsIcon, label: "Settings", path: "/settings" },
];

export default function Settings() {
  const [, setLocation] = useLocation();
  const [activeSidebar, setActiveSidebar] = useState("/settings");
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const { toast } = useToast();
  
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [showAvatarDialog, setShowAvatarDialog] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");

  const { data: userData, isLoading } = useQuery<any>({
    queryKey: ["/api/auth/user"],
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("PATCH", "/api/profile", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Updated",
        description: "Your settings have been saved.",
      });
      setEditingField(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update settings.",
        variant: "destructive",
      });
    }
  });

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const handleSaveField = (field: string) => {
    const data: any = {};
    if (field === "displayName") {
      const parts = editValue.trim().split(" ");
      data.firstName = parts[0] || "";
      data.lastName = parts.slice(1).join(" ") || "";
    } else if (field === "username") {
      data.username = editValue;
    } else if (field === "mobileNumber") {
      data.mobileNumber = editValue;
    }
    updateProfileMutation.mutate(data);
  };

  const handleToggleNotifications = () => {
    updateProfileMutation.mutate({ notificationsEnabled: !userData?.notificationsEnabled });
  };

  const handleLanguageChange = (value: string) => {
    updateProfileMutation.mutate({ language: value });
  };

  const handleThemeChange = (value: string) => {
    updateProfileMutation.mutate({ theme: value });
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(userData?.id || "");
    toast({
      title: "Copied",
      description: "User ID copied to clipboard.",
    });
  };

  const handleSaveAvatar = () => {
    if (avatarUrl.trim()) {
      updateProfileMutation.mutate({ profileImageUrl: avatarUrl.trim() });
      setShowAvatarDialog(false);
      setAvatarUrl("");
    }
  };

  const handleDeleteAccount = () => {
    toast({
      title: "Account Deletion",
      description: "Please contact support to delete your account.",
    });
    setShowDeleteDialog(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const firstName = userData?.firstName || "User";
  const lastName = userData?.lastName || "";
  const displayName = `${firstName} ${lastName}`.trim();

  return (
    <div className="min-h-screen bg-zinc-950 flex text-white font-sans">
      {/* Sidebar */}
      <motion.aside 
        initial={{ width: 80 }}
        animate={{ width: sidebarExpanded ? 200 : 80 }}
        transition={{ duration: 0.3 }}
        className="bg-zinc-900/50 backdrop-blur-xl border-r border-zinc-800/50 flex flex-col py-6 fixed h-full z-50"
      >
        <motion.button 
          onClick={() => setSidebarExpanded(!sidebarExpanded)}
          className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center mb-8 mx-auto cursor-pointer"
        >
          <span className="text-white font-bold text-lg">O</span>
        </motion.button>

        <nav className="flex-1 flex flex-col gap-2 px-3">
          {sidebarItems.map((item, i) => (
            <motion.button
              key={item.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * i }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setActiveSidebar(item.path);
                setLocation(item.path);
              }}
              className={`h-12 rounded-xl flex items-center gap-3 transition-all ${
                sidebarExpanded ? "px-4" : "justify-center"
              } ${
                activeSidebar === item.path 
                  ? "bg-orange-500 text-white" 
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800"
              }`}
              data-testid={`nav-${item.label.toLowerCase().replace(/[']/g, "").replace(" ", "-")}`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {sidebarExpanded && (
                <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>
              )}
            </motion.button>
          ))}
        </nav>

        <div className="mt-auto flex flex-col gap-2 px-3">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className={`h-12 rounded-xl flex items-center gap-3 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 transition-all ${
              sidebarExpanded ? "px-4" : "justify-center"
            }`}
            data-testid="button-logout"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {sidebarExpanded && <span className="text-sm font-medium whitespace-nowrap">Sign Out</span>}
          </motion.button>
          <div className={`flex items-center gap-3 ${sidebarExpanded ? "px-2" : "justify-center"}`}>
            <Avatar className="w-10 h-10 border-2 border-orange-500 flex-shrink-0">
              <AvatarImage src={userData?.profileImageUrl} />
              <AvatarFallback className="bg-zinc-700 text-white text-sm">
                {firstName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            {sidebarExpanded && (
              <span className="text-sm font-medium text-white truncate">{firstName}</span>
            )}
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <motion.main 
        animate={{ marginLeft: sidebarExpanded ? 200 : 80 }}
        transition={{ duration: 0.3 }}
        className="flex-1 p-6 overflow-auto"
      >
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-white mb-2">Account Settings</h1>
            <p className="text-zinc-400">Manage your profile and preferences</p>
          </motion.div>

          {/* Settings List */}
          <div className="space-y-2">
            {/* Avatar */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              onClick={() => {
                setAvatarUrl(userData?.profileImageUrl || "");
                setShowAvatarDialog(true);
              }}
              className="w-full bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-4 hover:bg-zinc-800/50 transition-all text-left"
              data-testid="button-edit-avatar"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center">
                    <Camera className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Avatar</p>
                    <p className="text-sm text-zinc-400">Tap to change profile picture</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12 border-2 border-zinc-700">
                    <AvatarImage src={userData?.profileImageUrl} />
                    <AvatarFallback className="bg-zinc-700 text-white">
                      {firstName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <ChevronRight className="w-5 h-5 text-zinc-500" />
                </div>
              </div>
            </motion.button>

            {/* Display Name */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center">
                    <User className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Display Name</p>
                    {editingField === "displayName" ? (
                      <Input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="mt-1 bg-zinc-800 border-zinc-700 text-white h-9"
                        autoFocus
                        data-testid="input-display-name"
                      />
                    ) : (
                      <p className="text-sm text-zinc-400">{displayName || "Not set"}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {editingField === "displayName" ? (
                    <>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleSaveField("displayName")}
                        disabled={updateProfileMutation.isPending}
                        data-testid="button-save-display-name"
                      >
                        <Check className="w-4 h-4 text-green-500" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setEditingField(null)}
                      >
                        <X className="w-4 h-4 text-red-500" />
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingField("displayName");
                        setEditValue(displayName);
                      }}
                      className="text-orange-500 hover:text-orange-400"
                      data-testid="button-edit-display-name"
                    >
                      Edit
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Username */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center">
                    <Hash className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Username</p>
                    {editingField === "username" ? (
                      <Input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="mt-1 bg-zinc-800 border-zinc-700 text-white h-9"
                        autoFocus
                        placeholder="@username"
                        data-testid="input-username"
                      />
                    ) : (
                      <p className="text-sm text-zinc-400">@{userData?.username || "not_set"}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {editingField === "username" ? (
                    <>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleSaveField("username")}
                        disabled={updateProfileMutation.isPending}
                        data-testid="button-save-username"
                      >
                        <Check className="w-4 h-4 text-green-500" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setEditingField(null)}
                      >
                        <X className="w-4 h-4 text-red-500" />
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingField("username");
                        setEditValue(userData?.username || "");
                      }}
                      className="text-orange-500 hover:text-orange-400"
                      data-testid="button-edit-username"
                    >
                      Edit
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Email */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Email</p>
                    <p className="text-sm text-zinc-400">{userData?.email || "Not set"}</p>
                  </div>
                </div>
                <div className="px-3 py-1 rounded-full bg-zinc-800 text-xs text-zinc-400">
                  Managed by Replit
                </div>
              </div>
            </motion.div>

            {/* Phone Number */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center">
                    <Phone className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Phone Number</p>
                    {editingField === "mobileNumber" ? (
                      <Input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="mt-1 bg-zinc-800 border-zinc-700 text-white h-9"
                        autoFocus
                        placeholder="+94 77 123 4567"
                        data-testid="input-phone"
                      />
                    ) : (
                      <p className="text-sm text-zinc-400">{userData?.mobileNumber || "Not set"}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {editingField === "mobileNumber" ? (
                    <>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleSaveField("mobileNumber")}
                        disabled={updateProfileMutation.isPending}
                        data-testid="button-save-phone"
                      >
                        <Check className="w-4 h-4 text-green-500" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setEditingField(null)}
                      >
                        <X className="w-4 h-4 text-red-500" />
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingField("mobileNumber");
                        setEditValue(userData?.mobileNumber || "");
                      }}
                      className="text-orange-500 hover:text-orange-400"
                      data-testid="button-edit-phone"
                    >
                      Edit
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Password */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center">
                    <Lock className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Password</p>
                    <p className="text-sm text-zinc-400">••••••••</p>
                  </div>
                </div>
                <div className="px-3 py-1 rounded-full bg-zinc-800 text-xs text-zinc-400">
                  Managed by Replit
                </div>
              </div>
            </motion.div>

            {/* Notifications */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center">
                    <Bell className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Notifications</p>
                    <p className="text-sm text-zinc-400">Receive alerts and updates</p>
                  </div>
                </div>
                <Switch
                  checked={userData?.notificationsEnabled ?? true}
                  onCheckedChange={handleToggleNotifications}
                  data-testid="switch-notifications"
                />
              </div>
            </motion.div>

            {/* Language */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center">
                    <Globe className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Language</p>
                    <p className="text-sm text-zinc-400">Choose your preferred language</p>
                  </div>
                </div>
                <Select
                  value={userData?.language || "en"}
                  onValueChange={handleLanguageChange}
                >
                  <SelectTrigger className="w-32 bg-zinc-800 border-zinc-700" data-testid="select-language">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="si">Sinhala</SelectItem>
                    <SelectItem value="ta">Tamil</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </motion.div>

            {/* Theme */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center">
                    <Palette className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Theme</p>
                    <p className="text-sm text-zinc-400">Switch between dark and light mode</p>
                  </div>
                </div>
                <Select
                  value={userData?.theme || "dark"}
                  onValueChange={handleThemeChange}
                >
                  <SelectTrigger className="w-32 bg-zinc-800 border-zinc-700" data-testid="select-theme">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </motion.div>

            {/* User ID */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center">
                    <Hash className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-white font-medium">User ID</p>
                    <p className="text-sm text-zinc-400 font-mono">{userData?.id?.slice(0, 16)}...</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCopyId}
                  className="text-zinc-400 hover:text-white"
                  data-testid="button-copy-id"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>

            {/* Divider */}
            <div className="my-4 border-t border-zinc-800" />

            {/* Logout */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              onClick={handleLogout}
              className="w-full bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-4 hover:bg-zinc-800/50 transition-all"
              data-testid="button-settings-logout"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                  <LogOut className="w-5 h-5 text-orange-500" />
                </div>
                <div className="text-left">
                  <p className="text-orange-500 font-medium">Logout</p>
                  <p className="text-sm text-zinc-400">Sign out of your account</p>
                </div>
              </div>
            </motion.button>

            {/* Delete Account */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              onClick={() => setShowDeleteDialog(true)}
              className="w-full bg-zinc-900/50 border border-red-900/30 rounded-xl p-4 hover:bg-red-950/20 transition-all"
              data-testid="button-delete-account"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-red-500" />
                </div>
                <div className="text-left">
                  <p className="text-red-500 font-medium">Delete Account</p>
                  <p className="text-sm text-zinc-400">Permanently delete your account and data</p>
                </div>
              </div>
            </motion.button>
          </div>
        </div>
      </motion.main>

      {/* Delete Account Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-red-500">Delete Account</DialogTitle>
            <DialogDescription className="text-zinc-400">
              This action cannot be undone. All your data will be permanently deleted.
              Type "DELETE" to confirm.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            placeholder="Type DELETE to confirm"
            className="bg-zinc-800 border-zinc-700 text-white"
            data-testid="input-delete-confirm"
          />
          <DialogFooter className="gap-2">
            <Button
              variant="ghost"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={deleteConfirmText !== "DELETE"}
              data-testid="button-confirm-delete"
            >
              Delete Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Avatar Dialog */}
      <Dialog open={showAvatarDialog} onOpenChange={setShowAvatarDialog}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle>Update Avatar</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Enter an image URL for your profile picture
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-center">
              <Avatar className="w-24 h-24 border-4 border-zinc-700">
                <AvatarImage src={avatarUrl || userData?.profileImageUrl} />
                <AvatarFallback className="bg-zinc-700 text-white text-2xl">
                  {firstName.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>
            <Input
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://example.com/avatar.jpg"
              className="bg-zinc-800 border-zinc-700 text-white"
              data-testid="input-avatar-url"
            />
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="ghost"
              onClick={() => setShowAvatarDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveAvatar}
              disabled={!avatarUrl.trim() || updateProfileMutation.isPending}
              className="bg-orange-500 hover:bg-orange-600"
              data-testid="button-save-avatar"
            >
              Save Avatar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
