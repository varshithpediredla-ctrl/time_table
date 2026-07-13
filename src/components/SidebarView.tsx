import React from "react";
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Award, 
  GraduationCap, 
  BarChart3, 
  Settings, 
  HelpCircle,
  Sparkles,
  UserCheck
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOptimizeClick: () => void;
  pendingCount: number;
  role: "teacher" | "hod" | "admin";
}

export default function Sidebar({ activeTab, setActiveTab, onOptimizeClick, pendingCount, role }: SidebarProps) {
  const showAllotment = role === "hod" || role === "admin";

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "timetable", label: "Timetable", icon: Calendar },
    ...(showAllotment ? [{ id: "allotment", label: "Allotment Desk", icon: UserCheck }] : []),
    { id: "faculty", label: "Faculty Portal", icon: Users, badge: pendingCount > 0 ? pendingCount : undefined },
    { id: "rag", label: "Academic RAG Hub", icon: Sparkles },
    { id: "gamification", label: "Gamification", icon: Award },
    { id: "students", label: "Students", icon: GraduationCap },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
  ];

  return (
    <aside className="hidden md:flex flex-col h-screen w-60 bg-surface-container border-r border-slate-border py-4 px-3 gap-2 shrink-0 select-none font-sans">
      <div className="px-3 py-4">
        <h1 className="text-xl font-bold tracking-tight text-primary">SmartDyn Admin</h1>
        <p className="text-[11px] font-semibold text-secondary uppercase tracking-widest opacity-70 mt-1">
          Institutional Control
        </p>
      </div>
      
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-200 cursor-pointer ${
                isActive
                  ? "bg-primary-container text-on-primary-container font-semibold scale-[0.98] shadow-sm"
                  : "text-secondary hover:bg-surface-container-highest"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon size={18} className={isActive ? "text-primary-600" : "text-secondary-500"} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className="bg-rose-burnout text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-slate-border pt-4 space-y-1">
        <button
          onClick={() => setActiveTab("settings")}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-200 cursor-pointer ${
            activeTab === "settings"
              ? "bg-primary-container text-on-primary-container font-semibold"
              : "text-secondary hover:bg-surface-container-highest"
          }`}
        >
          <Settings size={18} />
          <span>Settings</span>
        </button>
        <button
          onClick={() => setActiveTab("support")}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-200 cursor-pointer ${
            activeTab === "support"
              ? "bg-primary-container text-on-primary-container font-semibold"
              : "text-secondary hover:bg-surface-container-highest"
          }`}
        >
          <HelpCircle size={18} />
          <span>Support</span>
        </button>
        
        <button
          onClick={onOptimizeClick}
          className="mt-4 w-full px-3 py-3 bg-primary text-on-primary rounded-lg flex items-center justify-between cursor-pointer hover:opacity-90 transition-opacity active:scale-[0.98] shadow-sm font-semibold"
        >
          <span className="text-[12px] uppercase tracking-wider">Run AI Optimizer</span>
          <Sparkles size={16} className="text-amber-conflict" />
        </button>
      </div>
    </aside>
  );
}
