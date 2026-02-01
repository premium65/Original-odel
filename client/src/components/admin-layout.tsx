import { ReactNode } from "react";
import AdminSidebar from "./admin-sidebar";
import { Bell, Search, Settings } from "lucide-react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0f1419]">
      <AdminSidebar />
      <div className="ml-[280px]">
        <header className="sticky top-0 z-40 flex items-center justify-between px-8 py-4 bg-[#1a2332] border-b border-[#2a3a4d]">
          <div className="flex items-center gap-3 bg-[#0f1419] border border-[#2a3a4d] rounded-lg px-4 py-2.5 w-80">
            <Search className="h-4 w-4 text-[#6b7280]" />
            <input type="text" placeholder="Search..." className="bg-transparent border-none outline-none text-white text-sm w-full placeholder:text-[#6b7280]" />
          </div>
          <div className="flex items-center gap-4">
            <button className="w-10 h-10 rounded-lg bg-[#0f1419] border border-[#2a3a4d] flex items-center justify-center text-[#9ca3af] hover:text-[#10b981] hover:border-[#10b981]"><Settings className="h-5 w-5" /></button>
            <button className="w-10 h-10 rounded-lg bg-[#0f1419] border border-[#2a3a4d] flex items-center justify-center text-[#9ca3af] hover:text-[#10b981] hover:border-[#10b981] relative"><Bell className="h-5 w-5" /></button>
            <div className="flex items-center gap-3 px-4 py-2 bg-[#0f1419] border border-[#2a3a4d] rounded-lg cursor-pointer">
              <div className="w-9 h-9 bg-gradient-to-br from-[#f59e0b] to-[#eab308] rounded-full flex items-center justify-center text-white font-semibold">A</div>
              <div><p className="text-sm font-semibold text-white">admin</p><p className="text-xs text-[#6b7280]">Administrator</p></div>
            </div>
          </div>
        </header>
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
