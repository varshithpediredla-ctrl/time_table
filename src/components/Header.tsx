import React, { useState } from "react";
import { Bell, Sparkles, Search, Menu, LogOut, Check, Info, ShieldAlert, AlertCircle } from "lucide-react";

interface HeaderProps {
  onMobileMenuToggle?: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOptimizeClick: () => void;
  notifications: any[];
  onMarkNotifRead: (id: string) => void;
  onClearNotifications: () => void;
  role: "teacher" | "hod" | "admin";
  onLogout: () => void;
  userName: string;
}

export default function Header({ 
  onMobileMenuToggle, 
  searchQuery, 
  setSearchQuery, 
  onOptimizeClick,
  notifications,
  onMarkNotifRead,
  onClearNotifications,
  role,
  onLogout,
  userName
}: HeaderProps) {
  const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState(false);

  // Filter notifications for current user's profile context if teacher
  const filteredNotifications = notifications.filter(n => {
    if (role === "teacher") {
      return n.recipient === "Dr. Elena Kostic";
    } else if (role === "hod") {
      return n.recipient === "Prof. Charles Babbage" || n.recipient === "Dr. Elena Kostic"; // HOD sees general departmental covers
    }
    return true; // Admin/all sees everything
  });

  const unreadCount = filteredNotifications.filter(n => !n.read).length;

  // Profile metadata
  const getProfileMeta = () => {
    switch (role) {
      case "teacher":
        return {
          title: "Senior Professor, AI Dept.",
          avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuATwmU_yCo8a5TUBywRDrZWTU2IITffcK4C0o96oRIhyJR6XnMcKtJjsb_57cQkAx4iRZj80_YzomFaBatLRPyCLkptJydkzOB2HbTOkGj4gIDIBrLJGh8c4lRf5VULW8Q4QrHnyhU-BwTWWoWJ7ebg2jraODOTT0KCoVHauM36YewQjwFubtrrsTVsOcMjl-v6balS1DF5butBLK9MB9TjecVpFW7t-m6QDJ-HKU5-34lYHDC8ImW2B4dOrCWW98p9LruzfaZfHsE",
          badgeBg: "bg-blue-50 text-blue-700 border-blue-200"
        };
      case "hod":
        return {
          title: "Head of AI Department",
          avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Babbage",
          badgeBg: "bg-rose-50 text-rose-700 border-rose-200"
        };
      case "admin":
        return {
          title: "Dean Office Registrar",
          avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Admin",
          badgeBg: "bg-indigo-50 text-indigo-700 border-indigo-200"
        };
    }
  };

  const meta = getProfileMeta();

  return (
    <header className="flex justify-between items-center w-full px-4 md:px-8 h-16 sticky top-0 z-40 bg-surface-container-lowest border-b border-slate-border select-none">
      <div className="flex items-center gap-4">
        {onMobileMenuToggle && (
          <button 
            onClick={onMobileMenuToggle} 
            className="md:hidden p-1.5 rounded-lg hover:bg-surface-container-high text-primary cursor-pointer"
          >
            <Menu size={20} />
          </button>
        )}
        <div className="relative hidden sm:block">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-surface-container-low border-none rounded-full pl-10 pr-4 py-1.5 text-[13px] font-sans w-60 focus:ring-1 focus:ring-primary focus:outline-none transition-all"
            placeholder="Search faculty or schedules..."
            type="text"
          />
        </div>
      </div>

      {/* Role Indicator Badge */}
      <div className="flex items-center gap-2">
        <span className={`text-[11px] font-extrabold px-3 py-1 rounded-full border uppercase tracking-wider ${meta.badgeBg}`}>
          {role === "teacher" ? "Teacher Portal" : role === "hod" ? "HOD Control" : "System Administrator"}
        </span>
      </div>
      
      <div className="flex items-center gap-3">
        
        {/* Real-time Notification Bell & Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setIsNotifDropdownOpen(!isNotifDropdownOpen)}
            className="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-high transition-colors text-secondary cursor-pointer"
            title="Institutional Alerts"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-4 h-4 bg-rose-burnout text-white rounded-full text-[9px] font-extrabold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Dropdown Card */}
          {isNotifDropdownOpen && (
            <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-2 text-left animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
                <span className="text-[12.5px] font-bold text-slate-800">Department Notifications</span>
                {filteredNotifications.length > 0 && (
                  <button 
                    onClick={() => {
                      onClearNotifications();
                      setIsNotifDropdownOpen(false);
                    }} 
                    className="text-[11px] font-bold text-indigo-gamify hover:underline cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto py-1 space-y-1">
                {filteredNotifications.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 space-y-2">
                    <AlertCircle className="mx-auto text-slate-300" size={24} />
                    <p className="text-[11.5px] font-medium">No new alerts found for your profile.</p>
                  </div>
                ) : (
                  filteredNotifications.map((n) => (
                    <div 
                      key={n.id} 
                      onClick={() => onMarkNotifRead(n.id)}
                      className={`p-3 rounded-lg text-[11.5px] leading-relaxed transition-all cursor-pointer border ${
                        n.read ? "bg-white border-transparent" : "bg-slate-50 border-slate-100 font-semibold"
                      } hover:bg-slate-50 flex gap-2`}
                    >
                      <div className="mt-0.5">
                        {n.type === "success" ? (
                          <Check className="text-emerald-500" size={14} />
                        ) : (
                          <Info className="text-blue-500" size={14} />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-slate-700">{n.text}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-[9.5px] text-slate-400 font-medium">{n.date}</span>
                          {!n.read && (
                            <span className="text-[9px] font-bold text-indigo-gamify bg-indigo-50 px-1.5 py-0.5 rounded">
                              Mark read
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* AI Action Trigger Button */}
        <button 
          onClick={onOptimizeClick}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-high transition-colors text-secondary cursor-pointer"
          title="Instant AI Optimization"
        >
          <Sparkles size={18} className="text-indigo-gamify" />
        </button>

        {/* Secure Sign Out Button */}
        <button 
          onClick={onLogout}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-rose-50 hover:text-rose-600 transition-colors text-secondary cursor-pointer border border-transparent hover:border-rose-100"
          title="Sign Out of Portal"
        >
          <LogOut size={16} />
        </button>
        
        {/* User Card */}
        <div className="flex items-center gap-3 pl-4 border-l border-slate-border">
          <div className="text-right hidden sm:block">
            <p className="text-[12.5px] font-bold text-slate-800 leading-none">{userName}</p>
            <p className="text-[11px] font-medium text-slate-500 mt-1">{meta.title}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center overflow-hidden border border-slate-border shadow-sm">
            <img 
              className="w-full h-full object-cover" 
              src={meta.avatar} 
              alt={userName}
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
