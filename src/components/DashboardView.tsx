import React from "react";
import { 
  Users, 
  Calendar, 
  AlertCircle, 
  GraduationCap, 
  Activity, 
  CheckCircle, 
  ArrowUpRight 
} from "lucide-react";

interface DashboardViewProps {
  onTabChange: (tab: string) => void;
  conflictCount: number;
  pendingApprovalsCount: number;
}

export default function DashboardView({ onTabChange, conflictCount, pendingApprovalsCount }: DashboardViewProps) {
  const stats = [
    { 
      label: "Total Faculty", 
      value: "142", 
      change: "+3 this semester", 
      icon: Users, 
      color: "text-blue-500 bg-blue-500/5" 
    },
    { 
      label: "Classes Today", 
      value: "48 / 52", 
      change: "92% completion rate", 
      icon: Calendar, 
      color: "text-emerald-optimized bg-emerald-optimized/5" 
    },
    { 
      label: "Active Conflicts", 
      value: conflictCount.toString(), 
      change: conflictCount > 0 ? "Requires AI Optimizer" : "None detected", 
      icon: AlertCircle, 
      color: conflictCount > 0 ? "text-amber-conflict bg-amber-conflict/5" : "text-emerald-500 bg-emerald-500/5" 
    },
    { 
      label: "Pending Actions", 
      value: pendingApprovalsCount.toString(), 
      change: pendingApprovalsCount > 0 ? "Awaiting your validation" : "All clean", 
      icon: GraduationCap, 
      color: pendingApprovalsCount > 0 ? "text-indigo-gamify bg-indigo-gamify/5" : "text-slate-500 bg-slate-500/5" 
    }
  ];

  const activities = [
    { text: "System detected room double-booking in Seminar Room for 'Ethics in AI'", time: "10m ago", type: "warning" },
    { text: "Dr. Elena Kostic submitted casual leave request for November 10th", time: "1h ago", type: "info" },
    { text: "Dr. Sarah Chen accepted substitute coverage request for Friday 09:00", time: "2h ago", type: "success" },
    { text: "Curriculum Review assigned by Department Head to Elena Kostic", time: "2h ago", type: "action" },
    { text: "Final Grade validation auto-flagged for course CS402 due tomorrow", time: "4h ago", type: "warning" }
  ];

  const departmentHealth = [
    { name: "Artificial Intelligence & Data Science", health: "82%", status: "Needs Review", color: "bg-amber-conflict text-white" },
    { name: "Computer Science & Engineering", health: "98%", status: "Stable", color: "bg-emerald-optimized text-white" },
    { name: "Information Technology", health: "96%", status: "Stable", color: "bg-emerald-optimized text-white" },
    { name: "Mechanical Engineering", health: "94%", status: "Stable", color: "bg-emerald-optimized text-white" }
  ];

  return (
    <div className="space-y-8 animate-fade-in select-none">
      <div>
        <h2 className="text-3xl font-extrabold text-primary tracking-tight">Institutional Dashboard</h2>
        <p className="text-[14px] text-secondary font-sans mt-1">
          High-level operational metrics and system logs for SmartDyn Administration.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-surface-container-lowest border border-slate-border rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-semibold text-secondary uppercase tracking-wider">{stat.label}</span>
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <Icon size={18} />
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-2xl font-extrabold text-primary">{stat.value}</h3>
                <p className="text-[11px] text-secondary mt-1 font-medium">{stat.change}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Department Health Index */}
        <div className="lg:col-span-7 bg-surface-container-lowest border border-slate-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-primary">Department Timetable Health</h3>
              <p className="text-[11px] text-secondary mt-1">Tracking timetable optimization percentage across faculties</p>
            </div>
            <button 
              onClick={() => onTabChange("analytics")}
              className="text-[11px] font-semibold text-indigo-gamify flex items-center gap-1 hover:underline cursor-pointer"
            >
              <span>Detailed Analytics</span>
              <ArrowUpRight size={14} />
            </button>
          </div>

          <div className="space-y-4">
            {departmentHealth.map((dept, i) => (
              <div key={i} className="flex items-center justify-between p-3.5 bg-surface-container-low rounded-lg">
                <div className="flex-1 pr-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[13px] font-bold text-primary">{dept.name}</span>
                    <span className="text-[12px] font-mono font-bold text-primary">{dept.health}</span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${parseFloat(dept.health) > 90 ? "bg-emerald-optimized" : "bg-amber-conflict"}`}
                      style={{ width: dept.health }}
                    />
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${dept.color} shrink-0`}>
                  {dept.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Live System Activity Feed */}
        <div className="lg:col-span-5 bg-surface-container-lowest border border-slate-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-primary flex items-center gap-2">
              <Activity size={18} className="text-indigo-gamify" />
              Live System Logs
            </h3>
            <span className="text-[10px] font-bold bg-indigo-gamify/10 text-indigo-gamify px-2 py-0.5 rounded-full uppercase">
              Streaming
            </span>
          </div>

          <div className="space-y-4">
            {activities.map((act, i) => (
              <div key={i} className="flex gap-3 text-[12px] leading-relaxed">
                <div className="mt-1 flex flex-col items-center">
                  <div className={`w-2 h-2 rounded-full ${
                    act.type === "warning" ? "bg-amber-conflict" : 
                    act.type === "success" ? "bg-emerald-optimized" :
                    act.type === "info" ? "bg-blue-500" : "bg-indigo-gamify"
                  }`} />
                  {i < activities.length - 1 && <div className="w-px flex-1 bg-slate-200 my-1" />}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-700">{act.text}</p>
                  <span className="text-[10px] text-secondary font-medium mt-0.5 block">{act.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Short quick actions banner */}
      <div className="bg-primary text-on-primary rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div>
          <h3 className="text-lg font-bold">Unresolved timetable conflict detected.</h3>
          <p className="text-[13px] opacity-80 mt-1">Let SmartDyn AI Optimizer evaluate Room overbooking & workload distributions.</p>
        </div>
        <button 
          onClick={() => onTabChange("faculty")}
          className="bg-white text-primary font-semibold text-[13px] px-5 py-2.5 rounded-lg shadow hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
        >
          Resolve Conflicts
        </button>
      </div>
    </div>
  );
}
