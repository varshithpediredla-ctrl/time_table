import React, { useState, useEffect } from "react";
// import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import FacultyView from "./components/FacultyView";
import DashboardView from "./components/DashboardView";
import TimetableView from "./components/TimetableView";
import GamificationView from "./components/GamificationView";
import StudentsView from "./components/StudentsView";
import AnalyticsView from "./components/AnalyticsView";
import SettingsView from "./components/SettingsView";
import SupportView from "./components/SupportView";
import LoginView from "./components/LoginView";
import AllotmentView from "./components/AllotmentView";
import RagHubView from "./components/RagHubView";
import { ScheduleItem, ApprovalItem, LeaveRequest, Substitute, OptimizationResult } from "./types";
import { 
  Sparkles, 
  RefreshCw, 
  CheckCircle2, 
  X, 
  AlertTriangle, 
  CalendarOff, 
  Info, 
  UserCheck, 
  Clock, 
  BellRing,
  Send
} from "lucide-react";

export default function App() {
  // Navigation & search
  const [activeTab, setActiveTab] = useState("faculty");
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Core database states
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [approvals, setApprovals] = useState<ApprovalItem[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [substitutes, setSubstitutes] = useState<Substitute[]>([]);

  // Modal triggers
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isOptimizeModalOpen, setIsOptimizeModalOpen] = useState(false);
  const [isConfirmSubModalOpen, setIsConfirmSubModalOpen] = useState(false);

  // AI Optimizer States
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizeStep, setOptimizeStep] = useState(0);
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);

  // Leave Form Fields
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [leaveType, setLeaveType] = useState("Casual Leave");
  const [reason, setReason] = useState("");

  // Substitute confirmation states
  const [selectedSubName, setSelectedSubName] = useState("");
  const [selectedSubSubject, setSelectedSubSubject] = useState("");

  // System alert notifications (toasts)
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "info" | "warning" } | null>(null);

  // Authenticated Portal States
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem("smartdyn_logged_in") === "true");
  const [userRole, setUserRole] = useState<"teacher" | "hod" | "admin">(() => (localStorage.getItem("smartdyn_role") as any) || "teacher");
  const [userName, setUserName] = useState(() => localStorage.getItem("smartdyn_user_name") || "Dr. Elena Kostic");
  const [notifications, setNotifications] = useState<any[]>([]);

  // Reset flag
  const [isResetting, setIsResetting] = useState(false);

  // Fetch initial database states
  const fetchInitialData = async () => {
    try {
      const [resSchedule, resApprovals, resLeaves, resSubs, resNotifs] = await Promise.all([
        fetch("/api/schedule").then(res => res.json()),
        fetch("/api/approvals").then(res => res.json()),
        fetch("/api/leave-requests").then(res => res.json()),
        fetch("/api/substitutes").then(res => res.json()),
        fetch("/api/notifications").then(res => res.json()).catch(() => [])
      ]);

      setSchedule(resSchedule);
      setApprovals(resApprovals);
      setLeaveRequests(resLeaves);
      setSubstitutes(resSubs);
      setNotifications(resNotifs || []);
    } catch (error) {
      console.error("Failed to load initial institutional data:", error);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  // Notifications Handlers
  const handleMarkNotifRead = async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}/read`, { method: "POST" });
      const data = await response.json();
      if (data.success) {
        setNotifications(data.notifications);
      }
    } catch (error) {
      console.error("Failed to mark notification read:", error);
    }
  };

  const handleClearNotifications = async () => {
    try {
      const response = await fetch("/api/notifications/clear", { method: "POST" });
      const data = await response.json();
      if (data.success) {
        setNotifications(data.notifications);
        triggerToast("Inbox notification logs cleared.", "info");
      }
    } catch (error) {
      console.error("Failed to clear notifications:", error);
    }
  };

  // Auth Handlers
  const handleLogin = (role: "teacher" | "hod" | "admin", name: string) => {
    setIsLoggedIn(true);
    setUserRole(role);
    setUserName(name);
    localStorage.setItem("smartdyn_logged_in", "true");
    localStorage.setItem("smartdyn_role", role);
    localStorage.setItem("smartdyn_user_name", name);
    triggerToast(`Welcome back, ${name}! Logged in successfully.`, "success");
    if (role === "teacher") {
      setActiveTab("timetable");
    } else {
      setActiveTab("dashboard");
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("smartdyn_logged_in");
    localStorage.removeItem("smartdyn_role");
    localStorage.removeItem("smartdyn_user_name");
    triggerToast("Signed out of administrative portal.", "info");
  };

  // Allotment Handler
  const handleAllotFaculty = async (allotmentData: any) => {
    try {
      const response = await fetch("/api/allot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(allotmentData)
      });
      const data = await response.json();
      if (data.success) {
        setSchedule(data.schedule);
        setNotifications(data.notifications);
        triggerToast(`Allotment complete: ${allotmentData.substituteName} assigned.`, "success");
      }
    } catch (error) {
      console.error("Failed to allot faculty:", error);
      triggerToast("Error dispatching allotment requests.", "warning");
    }
  };

  // Show dynamic notification toasts
  const triggerToast = (text: string, type: "success" | "info" | "warning" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 5000);
  };

  // Delete faculty member
  const handleDeleteFaculty = async (id: string) => {
    try {
      const response = await fetch(`/api/substitutes/${id}`, {
        method: "DELETE"
      });
      const data = await response.json();
      if (data.success) {
        setSubstitutes(prev => prev.filter(sub => sub.id !== id));
        triggerToast("Faculty member successfully removed from department database.", "success");
      }
    } catch (error) {
      console.error("Failed to delete faculty member:", error);
      triggerToast("Error removing faculty member.", "warning");
    }
  };

  // Add faculty member
  const handleAddFaculty = async (name: string, statusText: string, matchRate: string) => {
    try {
      const response = await fetch("/api/substitutes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, statusText, matchRate })
      });
      const data = await response.json();
      if (data.success) {
        setSubstitutes(prev => [...prev, data.substitute]);
        triggerToast(`Successfully registered Dr. ${name} to the departmental roster.`, "success");
      }
    } catch (error) {
      console.error("Failed to add faculty member:", error);
      triggerToast("Error registering new faculty member.", "warning");
    }
  };

  // Leave approval action
  const handleLeaveApprovalAction = async (id: string, action: "approved" | "declined") => {
    try {
      const response = await fetch(`/api/leave-requests/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: action })
      });
      const data = await response.json();
      if (data.success) {
        setLeaveRequests(prev => prev.map(leave => leave.id === id ? { ...leave, status: action } : leave));
        triggerToast(`Absence request marked as ${action} successfully.`, "success");
      }
    } catch (error) {
      console.error("Failed to update leave request status:", error);
      triggerToast("Error updating leave request status.", "warning");
    }
  };

  // Pending Approvals Accept/Reject Actions
  const handleApprovalAction = async (id: string, action: "approved" | "rejected") => {
    try {
      const response = await fetch(`/api/approvals/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: action })
      });
      const data = await response.json();
      if (data.success) {
        // Update local state
        setApprovals(prev => prev.filter(p => p.id !== id));
        triggerToast(
          `Action Successfully Completed: "${data.item.title}" was marked as ${action}.`,
          action === "approved" ? "success" : "warning"
        );
      }
    } catch (error) {
      console.error("Failed to post approval action:", error);
    }
  };

  // Leave Form Submission
  const handleLeaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate || !reason) {
      triggerToast("Please complete all leave parameters.", "warning");
      return;
    }

    try {
      // Formulate automated substitutes to notify
      const notifiedSubs = ["Prof. David Miller", "Dr. Sarah Chen"];

      const response = await fetch("/api/leave-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startDate,
          endDate,
          leaveType,
          reason,
          notifiedSubstitutes: notifiedSubs
        })
      });
      const data = await response.json();
      if (data.success) {
        // Update local leaves
        setLeaveRequests(prev => [data.leaveRequest, ...prev]);
        setIsLeaveModalOpen(false);
        triggerToast(`Leave Request Filed. Substituted coverage alert sent to David Miller & Sarah Chen.`, "success");
        // Reset form
        setStartDate("");
        setEndDate("");
        setReason("");
      }
    } catch (error) {
      console.error("Failed to submit leave request:", error);
    }
  };

  // Run AI Schedule Optimization (Gemini-powered)
  const handleRunOptimizer = async () => {
    setIsOptimizeModalOpen(true);
    setIsOptimizing(true);
    setOptimizationResult(null);
    setOptimizeStep(0);

    // Dynamic loading sequence for immersive visual experience
    const steps = [
      "Auditing current weekly scheduling density...",
      "Scanning seminar room allocations for overbooking...",
      "Evaluating Elena Kostic's consecutive hour limits...",
      "Invoking Gemini models to map substitute availability...",
      "Engineering conflict-resolution vectors..."
    ];

    for (let i = 0; i < steps.length; i++) {
      setOptimizeStep(i);
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    try {
      const response = await fetch("/api/optimize", { method: "POST" });
      const data = await response.json();
      setOptimizationResult(data);
    } catch (error) {
      console.error("Failed to execute AI optimization:", error);
      triggerToast("AI optimization failed. Please verify connection credentials.", "warning");
    } finally {
      setIsOptimizing(false);
    }
  };

  // Apply AI optimization results to live timetable
  const handleApplyOptimization = async () => {
    if (!optimizationResult) return;

    try {
      const response = await fetch("/api/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(optimizationResult.optimizedSchedule)
      });
      const data = await response.json();
      if (data.success) {
        setSchedule(data.schedule);
        setIsOptimizeModalOpen(false);
        triggerToast("AI optimization matrix successfully applied to live institutional schedules!", "success");
      }
    } catch (error) {
      console.error("Failed to apply schedule optimization:", error);
    }
  };

  // Send substitute coverage request click
  const handleSendSubstituteRequest = (subName: string, subject: string) => {
    setSelectedSubName(subName);
    setSelectedSubSubject(subject);
    setIsConfirmSubModalOpen(true);
  };

  // Confirm substitute request
  const confirmSubstituteAssignment = async () => {
    setIsConfirmSubModalOpen(false);
    try {
      const response = await fetch("/api/substitute-propose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          substituteName: selectedSubName,
          subject: selectedSubSubject,
          onLeaveTeacherName: userName || "Elena Kostic"
        })
      });
      const data = await response.json();
      if (data.success) {
        setNotifications(data.notifications);
        triggerToast(
          `Substitute offer sent successfully! Dr. ${userName || "Elena"}'s lecture "${selectedSubSubject}" is pending cover confirmation from ${selectedSubName}.`,
          "success"
        );
      }
    } catch (error) {
      console.error("Failed to propose substitute cover:", error);
      triggerToast("Error sending substitute proposal.", "warning");
    }
  };

  // Reset State to restore demo conflicts
  const handleResetSystemState = async () => {
    setIsResetting(true);
    try {
      const response = await fetch("/api/reset", { method: "POST" });
      const data = await response.json();
      if (data.success) {
        setSchedule(data.schedule);
        setApprovals(data.pendingApprovals);
        setLeaveRequests(data.leaveRequests);
        triggerToast("System State Reset. Initial demonstrator conflicts successfully restored.", "info");
      }
    } catch (error) {
      console.error("Reset failed:", error);
    } finally {
      setIsResetting(false);
    }
  };

  // Render correct panel view
  const renderViewContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <DashboardView 
            onTabChange={setActiveTab} 
            conflictCount={schedule.filter(s => s.status !== "optimized").length}
            pendingApprovalsCount={approvals.filter(a => a.status === "pending").length}
          />
        );
      case "timetable":
        return <TimetableView schedule={schedule} setSchedule={setSchedule} substitutes={substitutes} role={userRole} />;
      case "allotment":
        return (
          <AllotmentView 
            schedule={schedule}
            substitutes={substitutes}
            leaveRequests={leaveRequests}
            onAllotFaculty={handleAllotFaculty}
            role={userRole}
          />
        );
      case "gamification":
        return <GamificationView />;
      case "rag":
        return <RagHubView />;
      case "students":
        return <StudentsView />;
      case "analytics":
        return <AnalyticsView />;
      case "settings":
        return <SettingsView onReset={handleResetSystemState} isResetting={isResetting} />;
      case "support":
        return <SupportView />;
      case "faculty":
      default:
        return (
          <FacultyView 
            schedule={schedule}
            setSchedule={setSchedule}
            approvals={approvals}
            handleApprovalAction={handleApprovalAction}
            leaveRequests={leaveRequests}
            onSubmitLeave={(start, end, type, r) => {
              setStartDate(start);
              setEndDate(end);
              setLeaveType(type);
              setReason(r);
            }}
            substitutes={substitutes}
            onRequestLeaveClick={() => setIsLeaveModalOpen(true)}
            onSendSubstituteRequest={handleSendSubstituteRequest}
            searchQuery={searchQuery}
            role={userRole}
            onDeleteFaculty={handleDeleteFaculty}
            onAddFaculty={handleAddFaculty}
            onLeaveApprovalAction={handleLeaveApprovalAction}
          />
        );
    }
  };

  const stepsList = [
    "Auditing current weekly scheduling density...",
    "Scanning seminar room allocations for overbooking...",
    "Evaluating Elena Kostic's consecutive hour limits...",
    "Invoking Gemini models to map substitute availability...",
    "Engineering conflict-resolution vectors..."
  ];

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-50 relative">
        <LoginView onLogin={handleLogin} />
        {toastMessage && (
          <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-lg shadow-xl border animate-in fade-in slide-in-from-bottom-5 duration-300 max-w-md ${
            toastMessage.type === "success" 
              ? "bg-emerald-optimized text-white border-emerald-600" 
              : toastMessage.type === "warning" 
              ? "bg-amber-conflict text-slate-900 border-amber-600 font-medium" 
              : "bg-primary text-white border-slate-700"
          }`}>
            <CheckCircle2 size={18} />
            <span className="text-[12.5px] tracking-wide leading-relaxed">{toastMessage.text}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background font-sans">
      {/* Sidebar Navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onOptimizeClick={handleRunOptimizer}
        pendingCount={approvals.filter(a => a.status === "pending").length}
        role={userRole}
      />

      {/* Main Content Pane */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <Header 
          onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onOptimizeClick={handleRunOptimizer}
          notifications={notifications}
          onMarkNotifRead={handleMarkNotifRead}
          onClearNotifications={handleClearNotifications}
          role={userRole}
          onLogout={handleLogout}
          userName={userName}
        />

        {/* View container */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-background relative pb-20">
          <div className="max-w-7xl mx-auto">
            {renderViewContent()}
          </div>
        </div>

        {/* Notification Toast Message */}
        {toastMessage && (
          <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-lg shadow-xl border animate-in fade-in slide-in-from-bottom-5 duration-300 max-w-md ${
            toastMessage.type === "success" 
              ? "bg-emerald-optimized text-white border-emerald-600" 
              : toastMessage.type === "warning" 
              ? "bg-amber-conflict text-slate-900 border-amber-600 font-medium" 
              : "bg-primary text-white border-slate-700"
          }`}>
            {toastMessage.type === "success" ? <CheckCircle2 size={18} /> : <Info size={18} />}
            <span className="text-[12.5px] tracking-wide leading-relaxed">{toastMessage.text}</span>
          </div>
        )}
      </main>

      {/* MOBILE SIDEBAR OVERLAY DRAWER */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden bg-primary/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface-container w-64 h-full p-4 flex flex-col justify-between shadow-2xl animate-in slide-in-from-left-5">
            <div>
              <div className="flex items-center justify-between border-b border-slate-border pb-4 mb-4 select-none">
                <div>
                  <h1 className="text-lg font-bold text-primary">SmartDyn Admin</h1>
                  <span className="text-[10px] text-secondary tracking-widest font-bold block uppercase">Control</span>
                </div>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1 text-slate-600 hover:bg-slate-200 rounded-full cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <nav className="space-y-1 text-[13px] font-semibold select-none">
                {[
                  { id: "dashboard", label: "Dashboard" },
                  { id: "timetable", label: "Timetable" },
                  { id: "faculty", label: "Faculty Portal" },
                  { id: "gamification", label: "Gamification" },
                  { id: "students", label: "Students" },
                  { id: "analytics", label: "Analytics" },
                  { id: "settings", label: "Settings" },
                  { id: "support", label: "Support" }
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      setActiveTab(m.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2.5 rounded-lg cursor-pointer ${
                      activeTab === m.id ? "bg-primary text-on-primary font-bold shadow-sm" : "text-secondary hover:bg-slate-200"
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </nav>
            </div>

            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                handleRunOptimizer();
              }}
              className="w-full py-3 bg-primary text-on-primary rounded-lg font-semibold text-[12px] uppercase flex items-center justify-between px-3 cursor-pointer shadow-md"
            >
              <span>Run AI Optimizer</span>
              <Sparkles size={14} className="text-amber-conflict" />
            </button>
          </div>
        </div>
      )}

      {/* REQUEST LEAVE MODAL OVERLAY */}
      {isLeaveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/40 backdrop-blur-sm">
          <div className="bg-surface-container-lowest w-full max-w-lg rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 border border-slate-100">
            <div className="p-6 border-b border-slate-border flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-primary">Request Absence</h3>
                <p className="text-[11.5px] text-secondary mt-0.5">Submit leave request for departmental review.</p>
              </div>
              <button 
                onClick={() => setIsLeaveModalOpen(false)}
                className="p-1.5 hover:bg-surface-container rounded-full text-secondary transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleLeaveSubmit} className="p-6 space-y-4 text-[13px] font-sans">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-secondary text-[11px] uppercase">Start Date</label>
                  <input 
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2.5 bg-surface-container-low text-slate-800 focus:ring-1 focus:ring-primary focus:outline-none" 
                    type="date"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-secondary text-[11px] uppercase">End Date</label>
                  <input 
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2.5 bg-surface-container-low text-slate-800 focus:ring-1 focus:ring-primary focus:outline-none" 
                    type="date"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-secondary text-[11px] uppercase">Leave Type</label>
                <select 
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2.5 bg-surface-container-low text-slate-800 focus:ring-1 focus:ring-primary focus:outline-none font-medium"
                >
                  <option>Casual Leave</option>
                  <option>Research/Duty Leave</option>
                  <option>Medical Leave</option>
                  <option>Sabbatical Sync</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-secondary text-[11px] uppercase">Reason / Notes</label>
                <textarea 
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2.5 bg-surface-container-low text-slate-800 focus:ring-1 focus:ring-primary focus:outline-none" 
                  placeholder="Explain the context of your absence..." 
                  rows={3}
                  required
                />
              </div>

              {startDate && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2 text-sans text-[12px]">
                  <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    Faculty Free on {(() => {
                      const d = new Date(startDate);
                      if (isNaN(d.getTime())) return "Selected Day";
                      const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                      return days[d.getDay()] + "s";
                    })()}:
                  </p>
                  {(() => {
                    const d = new Date(startDate);
                    if (isNaN(d.getTime())) return null;
                    const daysShort = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
                    const dayShort = daysShort[d.getDay()];
                    
                    const freeTeachers = substitutes.filter(sub => {
                      const statusLower = (sub.statusText || "").toLowerCase();
                      return statusLower.includes("available") || statusLower.includes("always") || statusLower.includes(dayShort);
                    });

                    if (freeTeachers.length === 0) {
                      return <p className="text-[11px] text-slate-400 italic">No faculty members are explicitly listed as free on this day.</p>;
                    }

                    return (
                      <div className="space-y-1.5 max-h-32 overflow-y-auto">
                        {freeTeachers.map(teacher => (
                          <div key={teacher.id} className="flex items-center justify-between text-[11px] bg-white p-2 rounded border border-slate-150 shadow-sm">
                            <div className="flex items-center gap-1.5">
                              <div className="w-5 h-5 rounded-full overflow-hidden border border-slate-100 bg-slate-50 shrink-0">
                                <img src={teacher.avatar} className="w-full h-full object-cover" alt={teacher.name} referrerPolicy="no-referrer" />
                              </div>
                              <span className="font-bold text-slate-700">Dr. {teacher.name}</span>
                              <span className="text-[9px] text-emerald-optimized font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">{teacher.statusText}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                handleSendSubstituteRequest(teacher.name, "My Class");
                              }}
                              className="text-[10px] font-extrabold text-indigo-gamify hover:underline flex items-center gap-0.5 cursor-pointer bg-transparent border-0"
                            >
                              <Send size={9} />
                              Ask to Cover
                            </button>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              )}

              <div className="p-4 bg-primary-container/10 border border-primary-container/20 rounded-lg flex gap-3 text-[11.5px] leading-relaxed text-on-primary-container font-medium select-none">
                <Info size={16} className="text-primary shrink-0" />
                <p>Submitting this request will automatically alert Dr. Miller and Dr. Chen as recommended substitutes based on AI expertise mapping.</p>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsLeaveModalOpen(false)}
                  className="flex-1 py-2.5 border border-slate-border rounded-lg font-bold text-secondary hover:bg-surface-container-high transition-colors cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-2.5 bg-primary text-on-primary rounded-lg font-bold hover:opacity-90 transition-all shadow-md cursor-pointer text-center"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM SUBSTITUTE MODAL OVERLAY */}
      {isConfirmSubModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/40 backdrop-blur-sm">
          <div className="bg-surface-container-lowest w-full max-w-sm rounded-xl shadow-2xl p-6 border border-slate-100 text-center space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="w-12 h-12 bg-indigo-gamify/10 text-indigo-gamify rounded-full flex items-center justify-center mx-auto">
              <UserCheck size={24} />
            </div>
            
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-primary">Confirm Cover Request</h3>
              <p className="text-[12.5px] text-secondary leading-relaxed">
                Are you sure you want to propose substitute lecture coverage to **{selectedSubName}** for your upcoming **"{selectedSubSubject}"** class?
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button 
                onClick={() => setIsConfirmSubModalOpen(false)}
                className="flex-1 py-2 border border-slate-200 rounded-lg text-secondary font-bold text-[12px] hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={confirmSubstituteAssignment}
                className="flex-1 py-2 bg-primary text-on-primary rounded-lg font-bold text-[12px] hover:opacity-90 cursor-pointer"
              >
                Send Proposal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI OPTIMIZATION CENTER MODAL OVERLAY */}
      {isOptimizeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/40 backdrop-blur-sm">
          <div className="bg-surface-container-lowest w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] border border-slate-100 animate-in fade-in zoom-in duration-300">
            
            {/* Header */}
            <div className="p-6 border-b border-slate-border flex items-center justify-between bg-surface-container-low select-none">
              <div className="flex items-center gap-2">
                <Sparkles className="text-indigo-gamify animate-pulse" size={20} />
                <h3 className="text-lg font-bold text-primary">SmartDyn AI Optimization Center</h3>
              </div>
              {!isOptimizing && (
                <button 
                  onClick={() => setIsOptimizeModalOpen(false)}
                  className="p-1 hover:bg-slate-200 rounded-full text-secondary cursor-pointer"
                >
                  <X size={18} />
                </button>
              )}
            </div>

            {/* Content area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {isOptimizing ? (
                /* LOADING LOADER ANIMATION VIEW */
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-4 select-none">
                  <RefreshCw className="text-indigo-gamify animate-spin" size={48} />
                  <div className="space-y-1.5 pt-2">
                    <h4 className="text-[14px] font-bold text-primary">Running AI Optimization Engine</h4>
                    <p className="text-[12px] text-secondary italic font-medium max-w-sm">
                      {stepsList[optimizeStep]}
                    </p>
                  </div>
                  {/* Miniature progress bar */}
                  <div className="w-48 h-1 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-gamify transition-all duration-300"
                      style={{ width: `${((optimizeStep + 1) / stepsList.length) * 100}%` }}
                    />
                  </div>
                </div>
              ) : optimizationResult ? (
                /* RESULTS RESPONSE VIEW */
                <div className="space-y-6 text-[13px] font-sans">
                  
                  {/* Analysis notice */}
                  <div className="p-4 bg-primary-container/10 border border-primary border-opacity-10 rounded-xl space-y-2">
                    <h4 className="font-bold text-slate-800 flex items-center gap-1.5 uppercase text-[11px] tracking-wider">
                      <Clock size={14} className="text-indigo-gamify" />
                      Timetable Diagnostics Analysis
                    </h4>
                    <p className="text-slate-700 leading-relaxed font-medium">
                      {optimizationResult.analysis}
                    </p>
                    {!optimizationResult.aiGenerated && (
                      <span className="inline-block text-[10px] font-bold text-amber-conflict bg-amber-conflict/5 px-2 py-0.5 rounded border border-amber-200 mt-2">
                        Demonstrator Heuristic Fallback • Set GEMINI_API_KEY in Secrets for live AI
                      </span>
                    )}
                  </div>

                  {/* Recommendations Stack */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-slate-700 uppercase text-[11px] tracking-wider select-none">
                      Proposed Course of Actions
                    </h4>
                    
                    <div className="space-y-3">
                      {optimizationResult.recommendations.map((rec) => (
                        <div key={rec.id} className="p-4 bg-surface-container-low border border-slate-100 rounded-xl flex gap-3">
                          <div className="w-6 h-6 rounded-full bg-emerald-optimized/15 text-emerald-optimized flex items-center justify-center shrink-0 mt-0.5">
                            <CheckCircle2 size={14} />
                          </div>
                          <div>
                            <h5 className="font-bold text-primary">{rec.title}</h5>
                            <p className="text-secondary leading-relaxed mt-1">{rec.description}</p>
                            <div className="flex gap-4 text-[11px] font-semibold text-secondary mt-2">
                              <span>Conflict Solved: <span className="text-indigo-gamify">{rec.conflictResolved}</span></span>
                              <span className="w-px bg-slate-300" />
                              <span>Impact: <span className="text-emerald-optimized">{rec.impact}</span></span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Visual optimized timetable change block */}
                  <div className="space-y-3 select-none">
                    <h4 className="font-bold text-slate-700 uppercase text-[11px] tracking-wider">
                      Optimized Timetable Matrix
                    </h4>
                    
                    <div className="bg-white border border-slate-100 rounded-xl overflow-hidden">
                      <table className="w-full text-left text-[11.5px] border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-100 font-bold text-secondary">
                            <th className="py-2.5 px-4">Day</th>
                            <th className="py-2.5 px-4">Time Slot</th>
                            <th className="py-2.5 px-4">Subject</th>
                            <th className="py-2.5 px-4">Room / Instructor</th>
                            <th className="py-2.5 px-4 text-right">Adjustment</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-600 font-medium">
                          {optimizationResult.optimizedSchedule.map((slot) => (
                            <tr key={slot.id} className="hover:bg-slate-50">
                              <td className="py-2.5 px-4 font-bold text-primary">{slot.day}</td>
                              <td className="py-2.5 px-4">{slot.time}</td>
                              <td className="py-2.5 px-4 font-bold text-slate-800">{slot.subject}</td>
                              <td className="py-2.5 px-4">{slot.room}</td>
                              <td className="py-2.5 px-4 text-right">
                                {slot.notes ? (
                                  <span className="text-indigo-gamify text-[10.5px] font-bold leading-tight" title={slot.notes}>
                                    Rescheduled / Substituted
                                  </span>
                                ) : (
                                  <span className="text-emerald-optimized font-bold text-[10.5px]">Unchanged</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>
              ) : null}
            </div>

            {/* Actions Footer */}
            {!isOptimizing && optimizationResult && (
              <div className="p-5 border-t border-slate-border bg-slate-50 flex gap-3">
                <button 
                  onClick={() => setIsOptimizeModalOpen(false)}
                  className="flex-1 py-2.5 border border-slate-200 bg-white rounded-lg font-bold text-secondary text-[12.5px] hover:bg-slate-50 cursor-pointer text-center"
                >
                  Decline Optimization
                </button>
                <button 
                  onClick={handleApplyOptimization}
                  className="flex-1 py-2.5 bg-primary text-on-primary rounded-lg font-bold text-[12.5px] hover:opacity-90 shadow-md cursor-pointer text-center"
                >
                  Apply AI Optimization
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}

