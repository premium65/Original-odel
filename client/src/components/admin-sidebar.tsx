import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard, Users, Clock, UserCog, Receipt, Crown, Gem,
  FileText, HandCoins, PiggyBank, Percent, Megaphone, Globe, Phone,
  Mail, MessageCircle, Send, Info, FileCheck, Shield, Puzzle, Home,
  Gauge, Images, Type, Palette, Image, LogOut, ChevronDown, Star, ShoppingCart
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuSections = [
  {
    title: "User Management",
    icon: Users,
    color: "#10b981",
    items: [
      { label: "All Users", icon: Users, path: "/admin/users" },
      { label: "Pending Users", icon: Clock, path: "/admin/pending" },
      { label: "Admins", icon: UserCog, path: "/admin/admins" },
    ]
  },
  {
    title: "Transaction",
    icon: Receipt,
    color: "#f59e0b",
    items: [
      { label: "Users", icon: Users, path: "/admin/transaction-users" },
      { label: "Premium Manage", icon: Crown, path: "/admin/premium-manage", star: true },
      { label: "Premium Settings", icon: Gem, path: "/admin/premium", star: true, badge: "NEW" },
      { label: "Purchases", icon: ShoppingCart, path: "/admin/premium/purchases" },
      { label: "Transaction Details", icon: FileText, path: "/admin/transactions" },
      { label: "Withdraw List", icon: HandCoins, path: "/admin/withdrawals" },
      { label: "Deposit Details", icon: PiggyBank, path: "/admin/deposits" },
      { label: "Commission", icon: Percent, path: "/admin/commission" },
    ]
  },
  {
    title: "Ads Management",
    icon: Megaphone,
    color: "#3b82f6",
    items: [
      { label: "Manage Ads", icon: Megaphone, path: "/admin/ads" },
    ]
  },
  {
    title: "Social Media",
    icon: Globe,
    color: "#ec4899",
    badge: "NEW",
    items: [
      {
        label: "Contact Us",
        icon: Phone,
        children: [
          { label: "Phone", icon: Phone, path: "/admin/contact/phone" },
          { label: "Email", icon: Mail, path: "/admin/contact/email" },
          { label: "WhatsApp", icon: MessageCircle, path: "/admin/contact/whatsapp" },
          { label: "Telegram", icon: Send, path: "/admin/contact/telegram" },
        ]
      },
      {
        label: "Info",
        icon: Info,
        children: [
          { label: "About Us", icon: Info, path: "/admin/info/about" },
          { label: "Terms & Conditions", icon: FileCheck, path: "/admin/info/terms" },
          { label: "Privacy Policy", icon: Shield, path: "/admin/info/privacy" },
        ]
      },
    ]
  },
  {
    title: "Site Content",
    icon: Puzzle,
    color: "#8b5cf6",
    badge: "NEW",
    items: [
      { label: "Home Page", icon: Home, path: "/admin/content/home" },
      { label: "Dashboard Page", icon: Gauge, path: "/admin/content/dashboard" },
      { label: "Slideshow Images", icon: Images, path: "/admin/slideshow" },
      { label: "Text & Labels", icon: Type, path: "/admin/content/text" },
    ]
  },
  {
    title: "Appearance",
    icon: Palette,
    color: "#06b6d4",
    badge: "NEW",
    items: [
      { label: "Theme Colors", icon: Palette, path: "/admin/theme" },
      { label: "Logo & Branding", icon: Image, path: "/admin/branding" },
    ]
  },
];

export default function AdminSidebar() {
  const [location] = useLocation();
  const [openSections, setOpenSections] = useState<string[]>(menuSections.map(s => s.title));
  const [openSubmenus, setOpenSubmenus] = useState<string[]>(["Contact Us", "Info"]);

  const toggleSection = (title: string) => {
    setOpenSections(prev =>
      prev.includes(title) ? prev.filter(t => t !== title) : [...prev, title]
    );
  };

  const toggleSubmenu = (label: string) => {
    setOpenSubmenus(prev =>
      prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]
    );
  };

  return (
    <aside className="w-[280px] bg-[#1a2332] h-screen fixed left-0 top-0 flex flex-col border-r border-[#2a3a4d] z-50">
      {/* Logo */}
      <div className="flex items-center gap-3 p-5 border-b border-[#2a3a4d]">
        <div className="w-11 h-11 bg-gradient-to-br from-[#f59e0b] to-[#eab308] rounded-xl flex items-center justify-center text-white font-bold text-lg">
          O
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">OdelADS</h2>
          <span className="text-[10px] text-[#6b7280] uppercase tracking-widest">Admin Panel</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {/* Dashboard - Always visible */}
        <Link href="/admin">
          <div className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer mb-4",
            location === "/admin"
              ? "bg-gradient-to-r from-[#10b981]/20 to-transparent border-l-[3px] border-[#10b981]"
              : "hover:bg-white/5"
          )}>
            <LayoutDashboard className={cn("h-5 w-5", location === "/admin" ? "text-[#10b981]" : "text-[#9ca3af]")} />
            <span className={cn("font-semibold", location === "/admin" ? "text-white" : "text-[#9ca3af]")}>
              Dashboard
            </span>
          </div>
        </Link>

        {/* Menu Sections */}
        {menuSections.map((section: any) => (
          <div key={section.title} className="mb-2">
            {/* Section Header */}
            <div
              className="flex items-center gap-3 px-3 py-2.5 cursor-pointer rounded-lg hover:bg-white/5"
              onClick={() => toggleSection(section.title)}
            >
              <section.icon className="h-4 w-4" style={{ color: section.color }} />
              <span className="flex-1 text-xs font-semibold uppercase tracking-wider" style={{ color: section.color }}>
                {section.title}
              </span>
              {section.badge && (
                <span className="px-1.5 py-0.5 bg-gradient-to-r from-[#ef4444] to-[#dc2626] text-white text-[8px] font-bold rounded">
                  {section.badge}
                </span>
              )}
              <ChevronDown className={cn(
                "h-3 w-3 text-[#6b7280] transition-transform",
                openSections.includes(section.title) && "rotate-180"
              )} />
            </div>

            {/* Section Items */}
            <div className={cn(
              "overflow-hidden transition-all ml-2 border-l border-[#2a3a4d]",
              openSections.includes(section.title) ? "max-h-[1000px]" : "max-h-0"
            )}>
              {section.items.map((item: any) => (
                <div key={item.label}>
                  {item.children ? (
                    /* Submenu with children */
                    <>
                      <div
                        className="flex items-center gap-2.5 px-4 py-2.5 text-[#9ca3af] cursor-pointer hover:bg-[#10b981]/10 text-sm"
                        onClick={() => toggleSubmenu(item.label)}
                      >
                        <item.icon className="h-3.5 w-3.5" />
                        <span className="flex-1">{item.label}</span>
                        <ChevronDown className={cn(
                          "h-3 w-3 transition-transform",
                          openSubmenus.includes(item.label) && "rotate-180"
                        )} />
                      </div>
                      <div className={cn(
                        "overflow-hidden transition-all bg-black/20",
                        openSubmenus.includes(item.label) ? "max-h-[500px]" : "max-h-0"
                      )}>
                        {item.children.map((child: any) => (
                          <Link key={child.path} href={child.path}>
                            <div className={cn(
                              "flex items-center gap-2 px-4 py-2 pl-10 text-xs cursor-pointer",
                              location === child.path
                                ? "text-[#10b981] bg-[#10b981]/10"
                                : "text-[#6b7280] hover:text-[#10b981]"
                            )}>
                              <child.icon className="h-3 w-3" />
                              <span>{child.label}</span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </>
                  ) : (
                    /* Regular menu item */
                    <Link href={item.path}>
                      <div className={cn(
                        "flex items-center gap-2.5 px-4 py-2.5 cursor-pointer text-sm",
                        location === item.path
                          ? "bg-gradient-to-r from-[#10b981]/20 to-transparent text-[#10b981] border-l-[3px] border-[#10b981]"
                          : "text-[#9ca3af] hover:bg-[#10b981]/10"
                      )}>
                        <item.icon className="h-3.5 w-3.5" />
                        <span className="flex-1">{item.label}</span>
                        {item.star && (
                          <div className="w-5 h-5 bg-gradient-to-br from-[#f59e0b] to-[#eab308] rounded flex items-center justify-center">
                            <Star className="h-2.5 w-2.5 text-white fill-white" />
                          </div>
                        )}
                        {item.badge && (
                          <span className="px-1.5 py-0.5 bg-gradient-to-r from-[#ef4444] to-[#dc2626] text-white text-[8px] font-bold rounded">
                            {item.badge}
                          </span>
                        )}
                      </div>
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-[#2a3a4d]">
        <Link href="/admin/login">
          <div className="flex items-center gap-3 px-4 py-3 text-[#9ca3af] cursor-pointer rounded-lg hover:text-[#ef4444] hover:bg-[#ef4444]/10">
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </div>
        </Link>
      </div>
    </aside>
  );
}
