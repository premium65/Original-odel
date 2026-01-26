import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { 
  LayoutDashboard, Users, Star, Crown, Calendar, BookOpen, TrendingUp,
  CreditCard, DollarSign, UserCog, Target, UserCheck, ChevronDown, ChevronRight,
  Globe, Phone, Mail, MessageCircle, Info, FileText, Shield, FileQuestion,
  Home, ShoppingBag, Image, Type, Palette, Settings, Megaphone, Receipt
} from "lucide-react";

interface MenuItem {
  title: string;
  url?: string;
  icon: any;
  isNew?: boolean;
  isPremium?: boolean;
}

interface SubGroup {
  title: string;
  icon: any;
  items: MenuItem[];
}

interface MenuGroup {
  label: string;
  icon: any;
  color: string;
  isNew?: boolean;
  items?: (MenuItem | SubGroup)[];
  single?: boolean;
  url?: string;
}

const menuGroups: MenuGroup[] = [
  { 
    label: "Dashboard", 
    icon: LayoutDashboard, 
    color: "from-[#10b981] to-[#059669]", 
    single: true,
    url: "/admin"
  },
  { 
    label: "USER MANAGEMENT", 
    icon: Users, 
    color: "from-[#06b6d4] to-[#0891b2]",
    items: [
      { title: "All Users", url: "/admin/users", icon: Users },
      { title: "Pending Users", url: "/admin/pending", icon: UserCheck },
      { title: "Admins", url: "/admin/admins", icon: UserCog },
    ]
  },
  { 
    label: "TRANSACTION", 
    icon: Receipt, 
    color: "from-[#f59e0b] to-[#d97706]",
    items: [
      { title: "Users", url: "/admin/transaction-users", icon: Users },
      { title: "Premium Manage", url: "/admin/premium-manage", icon: Crown, isNew: true, isPremium: true },
      { title: "Premium", url: "/admin/premium", icon: Star, isPremium: true },
      { title: "Transaction Details", url: "/admin/transactions", icon: TrendingUp },
      { title: "Withdraw List", url: "/admin/withdrawals", icon: BookOpen },
      { title: "Deposit Details", url: "/admin/deposits", icon: CreditCard },
      { title: "Commission", url: "/admin/commission", icon: DollarSign },
    ]
  },
  { 
    label: "ADS MANAGEMENT", 
    icon: Megaphone, 
    color: "from-[#3b82f6] to-[#2563eb]",
    items: [
      { title: "Manage Ads", url: "/admin/ads", icon: Calendar },
    ]
  },
  { 
    label: "SOCIAL MEDIA", 
    icon: Globe, 
    color: "from-[#ec4899] to-[#db2777]",
    isNew: true,
    items: [
      { 
        title: "Contact Us", 
        icon: Phone,
        items: [
          { title: "Phone", url: "/admin/contact/phone", icon: Phone },
          { title: "Email", url: "/admin/contact/email", icon: Mail },
          { title: "WhatsApp", url: "/admin/contact/whatsapp", icon: MessageCircle },
          { title: "Telegram", url: "/admin/contact/telegram", icon: MessageCircle },
        ]
      } as SubGroup,
      { 
        title: "Info", 
        icon: Info,
        items: [
          { title: "About Us", url: "/admin/info/about", icon: FileQuestion },
          { title: "Terms & Conditions", url: "/admin/info/terms", icon: FileText },
          { title: "Privacy Policy", url: "/admin/info/privacy", icon: Shield },
        ]
      } as SubGroup,
    ]
  },
  { 
    label: "SITE CONTENT", 
    icon: Globe, 
    color: "from-[#8b5cf6] to-[#7c3aed]",
    isNew: true,
    items: [
      { title: "Home Page", url: "/admin/content/home", icon: Home },
      { title: "Dashboard Page", url: "/admin/content/dashboard", icon: ShoppingBag },
      { title: "Slideshow Images", url: "/admin/content/slideshow", icon: Image },
      { title: "Text & Labels", url: "/admin/content/text", icon: Type },
    ]
  },
  { 
    label: "APPEARANCE", 
    icon: Settings, 
    color: "from-[#ef4444] to-[#dc2626]",
    isNew: true,
    items: [
      { title: "Theme Colors", url: "/admin/appearance/theme", icon: Palette },
      { title: "Logo & Branding", url: "/admin/appearance/logo", icon: Star },
    ]
  },
];

function isSubGroup(item: MenuItem | SubGroup): item is SubGroup {
  return 'items' in item && Array.isArray(item.items);
}

export function AdminSidebar() {
  const [location] = useLocation();
  const [expandedGroups, setExpandedGroups] = useState<string[]>(["USER MANAGEMENT", "TRANSACTION", "ADS MANAGEMENT"]);
  const [expandedSubGroups, setExpandedSubGroups] = useState<string[]>([]);

  const toggleGroup = (label: string) => {
    setExpandedGroups(prev => 
      prev.includes(label) ? prev.filter(g => g !== label) : [...prev, label]
    );
  };

  const toggleSubGroup = (title: string) => {
    setExpandedSubGroups(prev => 
      prev.includes(title) ? prev.filter(g => g !== title) : [...prev, title]
    );
  };

  const isActive = (url: string | undefined) => url && location === url;

  return (
    <Sidebar className="bg-gradient-to-b from-[#1a2332] to-[#141c27] border-r border-[#2a3a4d]">
      <SidebarHeader className="p-5 border-b border-[#2a3a4d]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#f59e0b] to-[#eab308] flex items-center justify-center shadow-lg">
            <Star className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="text-lg font-bold text-white block">RATING</span>
            <span className="text-[10px] text-[#6b7280] uppercase tracking-widest">Ads Admin</span>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="bg-transparent py-3 px-2 overflow-y-auto">
        {menuGroups.map((group) => (
          <div key={group.label} className="mb-1">
            {group.single ? (
              /* Dashboard - Single Item */
              <Link href={group.url || "/admin"}>
                <button
                  className={`w-full px-4 py-3 rounded-xl flex items-center gap-3 transition-all ${
                    isActive(group.url)
                      ? `bg-gradient-to-r ${group.color} text-white shadow-lg`
                      : "text-[#9ca3af] hover:bg-[#2a3a4d]/50 hover:text-white"
                  }`}
                >
                  <group.icon className="w-5 h-5" />
                  <span className="text-sm font-semibold">{group.label}</span>
                </button>
              </Link>
            ) : (
              /* Menu Groups with Items */
              <>
                <button
                  onClick={() => toggleGroup(group.label)}
                  className={`w-full px-4 py-3 rounded-xl flex items-center justify-between transition-all ${
                    expandedGroups.includes(group.label)
                      ? "text-[#10b981] border-l-2 border-[#10b981] bg-[#10b981]/5"
                      : "text-[#9ca3af] hover:bg-[#2a3a4d]/50 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <group.icon className="w-4 h-4" />
                    <span className="text-xs font-semibold uppercase tracking-wider">{group.label}</span>
                    {group.isNew && (
                      <span className="px-1.5 py-0.5 text-[8px] bg-[#ef4444] text-white rounded font-bold">NEW</span>
                    )}
                  </div>
                  {expandedGroups.includes(group.label) 
                    ? <ChevronDown className="w-4 h-4" /> 
                    : <ChevronRight className="w-4 h-4" />
                  }
                </button>

                {/* Expanded Items */}
                <div className={`overflow-hidden transition-all duration-300 ${
                  expandedGroups.includes(group.label) ? "max-h-[600px] mt-1" : "max-h-0"
                }`}>
                  <div className="ml-4 pl-3 border-l border-[#2a3a4d] space-y-0.5 py-1">
                    {group.items?.map((item) => (
                      isSubGroup(item) ? (
                        /* SubGroup (Contact Us, Info) */
                        <div key={item.title}>
                          <button
                            onClick={() => toggleSubGroup(item.title)}
                            className={`w-full px-3 py-2 rounded-lg flex items-center justify-between text-sm transition-all ${
                              expandedSubGroups.includes(item.title)
                                ? "bg-[#2a3a4d]/50 text-[#10b981]"
                                : "text-[#9ca3af] hover:text-white hover:bg-[#2a3a4d]/30"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <item.icon className="w-4 h-4" />
                              {item.title}
                            </div>
                            {expandedSubGroups.includes(item.title)
                              ? <ChevronDown className="w-3 h-3" />
                              : <ChevronRight className="w-3 h-3" />
                            }
                          </button>
                          
                          {/* SubGroup Items */}
                          <div className={`overflow-hidden transition-all duration-300 ${
                            expandedSubGroups.includes(item.title) ? "max-h-48" : "max-h-0"
                          }`}>
                            <div className="ml-4 pl-3 border-l border-[#2a3a4d] space-y-0.5 py-1">
                              {item.items.map((subItem) => (
                                <Link key={subItem.title} href={subItem.url || "#"}>
                                  <button
                                    className={`w-full px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs transition-all ${
                                      isActive(subItem.url)
                                        ? "bg-[#10b981]/20 text-[#10b981]"
                                        : "text-[#6b7280] hover:text-white hover:bg-[#2a3a4d]/30"
                                    }`}
                                  >
                                    <subItem.icon className="w-3 h-3" />
                                    {subItem.title}
                                  </button>
                                </Link>
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* Regular Menu Item */
                        <Link key={item.title} href={item.url || "#"}>
                          <button
                            className={`w-full px-3 py-2 rounded-lg flex items-center gap-2 text-sm transition-all ${
                              isActive(item.url)
                                ? "bg-[#10b981]/20 text-[#10b981] font-medium"
                                : "text-[#9ca3af] hover:text-white hover:bg-[#2a3a4d]/30"
                            }`}
                          >
                            <item.icon className={`w-4 h-4 ${item.isPremium ? "text-[#f59e0b]" : ""}`} />
                            <span className="flex-1 text-left">{item.title}</span>
                            {item.isPremium && !item.isNew && (
                              <Star className="w-3 h-3 text-[#f59e0b]" />
                            )}
                            {item.isNew && (
                              <span className="px-1.5 py-0.5 text-[8px] bg-[#ef4444] text-white rounded font-bold animate-pulse">
                                NEW
                              </span>
                            )}
                          </button>
                        </Link>
                      )
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
