import React, { useState } from "react";
import { 
  CalendarOff, 
  ChevronLeft, 
  ChevronRight, 
  FileText, 
  Star, 
  CheckCircle, 
  XCircle, 
  Info, 
  Send, 
  CheckCircle2,
  ChevronDown,
  AlertTriangle,
  History,
  Trash2,
  UserPlus,
  Users,
  Check,
  X
} from "lucide-react";
import { ScheduleItem, ApprovalItem, LeaveRequest, Substitute } from "../types";

interface FacultyViewProps {
  schedule: ScheduleItem[];
  setSchedule: React.Dispatch<React.SetStateAction<ScheduleItem[]>>;
  approvals: ApprovalItem[];
  handleApprovalAction: (id: string, action: "approved" | "rejected") => void;
  leaveRequests: LeaveRequest[];
  onSubmitLeave: (startDate: string, endDate: string, leaveType: string, reason: string) => void;
  substitutes: Substitute[];
  onRequestLeaveClick: () => void;
  onSendSubstituteRequest: (substituteName: string, subject: string) => void;
  searchQuery: string;
  role: "teacher" | "hod";
  onDeleteFaculty: (id: string) => void;
  onAddFaculty: (name: string, statusText: string, matchRate: string) => void;
  onLeaveApprovalAction: (id: string, action: "approved" | "declined") => void;
}

export default function FacultyView({
  schedule,
  setSchedule,
  approvals,
  handleApprovalAction,
  leaveRequests,
  onSubmitLeave,
  substitutes,
  onRequestLeaveClick,
  onSendSubstituteRequest,
  searchQuery,
  role,
  onDeleteFaculty,
  onAddFaculty,
  onLeaveApprovalAction
}: FacultyViewProps) {
  // Calendar navigation state
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);
  const weeks = ["Oct 23 - Oct 29", "Oct 30 - Nov 05", "Nov 06 - Nov 12"];

  // Toggle state
  const [showAllColleagues, setShowAllColleagues] = useState(false);

  // Selected class for substitute coverage finder
  const [selectedClassForCover, setSelectedClassForCover] = useState<ScheduleItem | null>(null);

  // Form states for Add Faculty
  const [newFacultyName, setNewFacultyName] = useState("");
  const [newFacultyStatus, setNewFacultyStatus] = useState("Free Mon");
  const [newFacultyMatch, setNewFacultyMatch] = useState("95%");

  // Active approvals count
  const activeApprovals = approvals.filter(a => a.status === "pending");

  // Filter schedule based on search query
  const filteredSchedule = schedule.filter(item => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.subject.toLowerCase().includes(q) ||
      item.room.toLowerCase().includes(q) ||
      item.day.toLowerCase().includes(q)
    );
  });

  // Helper to render card colors based on status
  const getBorderColor = (status: string) => {
    switch (status) {
      case "conflict":
        return "border-l-[4px] border-amber-conflict";
      case "burnout":
        return "border-l-[4px] border-rose-burnout";
      case "optimized":
      default:
        return "border-l-[4px] border-emerald-optimized";
    }
  };

  // Helper to get text background color
  const getBgColor = (status: string) => {
    switch (status) {
      case "conflict":
        return "bg-amber-conflict/5";
      case "burnout":
        return "bg-rose-burnout/5";
      case "optimized":
      default:
        return "bg-surface-container-low";
    }
  };

  const handleAddFacultySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFacultyName.trim()) return;
    onAddFaculty(newFacultyName.trim(), newFacultyStatus, newFacultyMatch);
    setNewFacultyName("");
  };

  // Render weekly grid
  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="space-y-8 animate-fade-in select-none">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-primary tracking-tight">
            {role === "teacher" ? "Faculty Portal" : "HOD Administrative Roster"}
          </h2>
          <p className="text-[14px] text-secondary font-sans mt-1">
            {role === "teacher" 
              ? "Manage your academic load, leave requests, and substitute planning."
              : "Complete control over department faculty members, timetables, and leave approvals."}
          </p>
        </div>
        {role === "teacher" && (
          <button 
            onClick={onRequestLeaveClick}
            className="bg-primary text-on-primary px-6 py-3 rounded-lg text-[13px] font-semibold flex items-center gap-2 hover:opacity-90 transition-all shadow-sm cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
          >
            <CalendarOff size={16} />
            Request Leave
          </button>
        )}
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (8 cols): Schedule, Approvals OR HOD Control Panel */}
        <div className="lg:col-span-8 space-y-6">
          
          {role === "hod" ? (
            /* ==================== HOD ADMIN PANEL ==================== */
            <div className="space-y-6 animate-fade-in">
              {/* Department Leave Request Approvals */}
              <section className="bg-surface-container-lowest border border-slate-border rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                    <CalendarOff size={18} className="text-red-500" />
                    Faculty Leave Approvals
                  </h3>
                  <span className="text-[11px] font-bold uppercase bg-red-100 text-red-800 px-2.5 py-0.5 rounded-full">
                    HOD Review
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[12px]">
                    <thead>
                      <tr className="border-b border-slate-200 text-secondary font-semibold">
                        <th className="py-2.5">Professor</th>
                        <th className="py-2.5">Leave Type</th>
                        <th className="py-2.5">Duration</th>
                        <th className="py-2.5">Reason</th>
                        <th className="py-2.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-sans">
                      {leaveRequests.length > 0 ? (
                        leaveRequests.map((leave) => (
                          <tr key={leave.id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-3 font-semibold text-primary">Dr. Elena Kostic</td>
                            <td className="py-3 text-secondary font-medium">{leave.leaveType}</td>
                            <td className="py-3 text-secondary">{leave.startDate} to {leave.endDate}</td>
                            <td className="py-3 text-secondary max-w-[150px] truncate" title={leave.reason}>
                              {leave.reason}
                            </td>
                            <td className="py-3 text-right">
                              {leave.status === "pending" ? (
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => onLeaveApprovalAction(leave.id, "approved")}
                                    className="bg-emerald-500/10 hover:bg-emerald-500 text-emerald-600 hover:text-white p-1 rounded-full transition-all cursor-pointer"
                                    title="Approve Leave"
                                  >
                                    <Check size={14} className="stroke-[3px]" />
                                  </button>
                                  <button
                                    onClick={() => onLeaveApprovalAction(leave.id, "declined")}
                                    className="bg-red-500/10 hover:bg-red-500 text-red-600 hover:text-white p-1 rounded-full transition-all cursor-pointer"
                                    title="Decline Leave"
                                  >
                                    <X size={14} className="stroke-[3px]" />
                                  </button>
                                </div>
                              ) : (
                                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                  leave.status === "approved" 
                                    ? "bg-emerald-100 text-emerald-800" 
                                    : "bg-red-100 text-red-800"
                                }`}>
                                  {leave.status}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="text-center py-6 text-secondary italic">
                            No active leave requests submitted.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Dynamic Faculty CRUD Manager */}
              <section className="bg-surface-container-lowest border border-slate-border rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                    <Users size={18} className="text-primary" />
                    Manage Department Faculty Database
                  </h3>
                  <span className="text-[11px] text-secondary font-semibold">
                    {substitutes.length} Faculty Members
                  </span>
                </div>

                {/* Faculty List Table */}
                <div className="border border-slate-100 rounded-xl overflow-hidden mb-6 bg-slate-50/50">
                  <table className="w-full text-left text-[12px]">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-200 text-secondary font-bold uppercase tracking-wider text-[10px] select-none">
                        <th className="py-2.5 px-4">Faculty Member</th>
                        <th className="py-2.5 px-4">Availability</th>
                        <th className="py-2.5 px-4">Syllabus Match</th>
                        <th className="py-2.5 px-4 text-right">Roster Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {substitutes.length > 0 ? (
                        substitutes.map((sub) => (
                          <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3 px-4 flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full overflow-hidden bg-white border border-slate-200">
                                <img src={sub.avatar} className="w-full h-full object-cover" alt={sub.name} referrerPolicy="no-referrer" />
                              </div>
                              <span className="font-bold text-slate-800">Dr. {sub.name}</span>
                            </td>
                            <td className="py-3 px-4 text-slate-600 font-medium">{sub.statusText}</td>
                            <td className="py-3 px-4 font-bold text-emerald-optimized">{sub.matchRate} Match</td>
                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={() => onDeleteFaculty(sub.id)}
                                className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors cursor-pointer"
                                title={`Delete Dr. ${sub.name} from faculty list`}
                              >
                                <Trash2 size={15} />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="text-center py-8 text-secondary font-medium">
                            <div className="text-slate-400 mb-1">Department faculty roster is empty.</div>
                            <div className="text-[11px] text-slate-400">Use the form below to register faculty members!</div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Add Faculty Form */}
                <div className="bg-slate-50 border border-slate-150 rounded-xl p-5">
                  <h4 className="text-[13px] font-bold text-slate-800 mb-3 flex items-center gap-1.5">
                    <UserPlus size={15} className="text-indigo-gamify" />
                    Register New Faculty Member
                  </h4>
                  <form onSubmit={handleAddFacultySubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-[12.5px]">
                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wide">Full Name</label>
                      <input
                        type="text"
                        value={newFacultyName}
                        onChange={(e) => setNewFacultyName(e.target.value)}
                        placeholder="e.g. David Miller"
                        required
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-[12.5px] focus:ring-1 focus:ring-primary focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wide">Weekly Availability</label>
                      <select
                        value={newFacultyStatus}
                        onChange={(e) => setNewFacultyStatus(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-[12.5px] focus:ring-1 focus:ring-primary focus:outline-none"
                      >
                        <option value="Free Mon">Free Monday</option>
                        <option value="Free Tue">Free Tuesday</option>
                        <option value="Free Wed">Free Wednesday</option>
                        <option value="Free Thu">Free Thursday</option>
                        <option value="Free Fri">Free Friday</option>
                        <option value="Available">Always Available</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wide">AI Match Rate (%)</label>
                      <input
                        type="text"
                        value={newFacultyMatch}
                        onChange={(e) => setNewFacultyMatch(e.target.value)}
                        placeholder="e.g. 95%"
                        required
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-[12.5px] focus:ring-1 focus:ring-primary focus:outline-none font-semibold"
                      />
                    </div>
                    <div className="sm:col-span-3 pt-2">
                      <button
                        type="submit"
                        className="w-full sm:w-auto bg-primary text-on-primary px-5 py-2.5 rounded-lg text-[12px] font-bold shadow-md hover:opacity-95 transition-opacity cursor-pointer flex items-center justify-center gap-1"
                      >
                        <UserPlus size={14} />
                        Confirm Faculty Registration
                      </button>
                    </div>
                  </form>
                </div>
              </section>
            </div>
          ) : (
            /* ==================== TEACHER MODE PORTAL ==================== */
            <div className="space-y-6 animate-fade-in">
              {/* My Weekly Schedule */}
              <section className="bg-surface-container-lowest border border-slate-border rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-primary">My Weekly Schedule</h3>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setCurrentWeekIndex((prev) => (prev > 0 ? prev - 1 : prev))}
                      className="p-1.5 rounded hover:bg-surface-container text-secondary transition-colors cursor-pointer"
                      disabled={currentWeekIndex === 0}
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <span className="text-[12px] font-semibold py-1 px-2.5 bg-surface-container rounded-md">
                      {weeks[currentWeekIndex]}
                    </span>
                    <button 
                      onClick={() => setCurrentWeekIndex((prev) => (prev < weeks.length - 1 ? prev + 1 : prev))}
                      className="p-1.5 rounded hover:bg-surface-container text-secondary transition-colors cursor-pointer"
                      disabled={currentWeekIndex === weeks.length - 1}
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-2 overflow-x-auto pb-4 scrollbar-thin">
                  {daysOfWeek.map((day) => {
                    const dayClasses = filteredSchedule.filter(c => c.day === day && (c.professor || "Elena Kostic") === "Elena Kostic");
                    const isWeekend = day === "Sat" || day === "Sun";
                    return (
                      <div key={day} className={`min-w-[100px] flex flex-col gap-2 ${isWeekend ? "opacity-40" : ""}`}>
                        <p className="text-center text-[11px] font-semibold text-secondary uppercase py-1 bg-surface-container-low rounded-md">
                          {day}
                        </p>
                        
                        {dayClasses.length > 0 ? (
                          dayClasses.map((item) => {
                            const isSelected = selectedClassForCover?.id === item.id;
                            return (
                              <div 
                                key={item.id} 
                                onClick={() => setSelectedClassForCover(isSelected ? null : item)}
                                className={`min-h-[70px] rounded p-2 transition-all hover:shadow-sm flex flex-col justify-between ${getBgColor(item.status)} ${getBorderColor(item.status)} border-r border-t border-b border-slate-200/50 relative group cursor-pointer ${
                                  isSelected 
                                    ? "ring-2 ring-indigo-gamify ring-offset-1 scale-[0.98] bg-indigo-50/10" 
                                    : "hover:scale-[1.01]"
                                }`}
                                title="Click to find free substitutes for this time"
                              >
                                <div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-[9px] font-semibold text-secondary leading-tight">
                                      {item.time}
                                    </span>
                                    {item.status === "conflict" && (
                                      <AlertTriangle size={10} className="text-amber-conflict animate-pulse" />
                                    )}
                                    {item.status === "burnout" && (
                                      <AlertTriangle size={10} className="text-rose-burnout animate-pulse" />
                                    )}
                                  </div>
                                  <h4 className="text-[12px] font-bold text-slate-800 truncate mt-1" title={item.subject}>
                                    {item.subject}
                                  </h4>
                                </div>
                                
                                <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-200/20">
                                  <span className="text-[10px] font-mono text-secondary truncate">
                                    {item.room}
                                  </span>
                                  <span className="text-[9px] font-bold bg-slate-200/40 text-slate-700 px-1 rounded">
                                    {item.credits} Cr
                                  </span>
                                </div>

                                {/* Hover explanation tooltip */}
                                {item.conflictText && (
                                  <div className="absolute z-50 bottom-full left-0 mb-1 w-48 bg-inverse-surface text-inverse-on-surface text-[10px] p-2 rounded shadow-lg hidden group-hover:block animate-fade-in">
                                    <p className="font-semibold text-amber-300">Conflict Warning:</p>
                                    <p className="text-slate-300">{item.conflictText}</p>
                                  </div>
                                )}
                              </div>
                            );
                          })
                        ) : (
                          <div className="h-32 flex flex-col items-center justify-center border border-dashed border-outline-variant rounded opacity-40">
                            <p className="text-[11px] font-medium text-secondary">Free</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Who is Free Substitute Finder Panel */}
                {selectedClassForCover && (
                  <div className="mt-4 p-4 bg-slate-50 border border-indigo-100 rounded-xl animate-in fade-in slide-in-from-top-2 duration-200 shadow-inner">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3 pb-3 border-b border-slate-200/60">
                      <div>
                        <h4 className="text-[13px] font-bold text-slate-800 flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 bg-indigo-gamify rounded-full animate-pulse" />
                          Faculty Substitute Cover Finder
                        </h4>
                        <p className="text-[11.5px] text-slate-500 font-medium mt-0.5">
                          Finding coverage for <strong className="text-slate-700">{selectedClassForCover.subject}</strong> on <strong className="text-slate-700">{selectedClassForCover.day}s ({selectedClassForCover.time})</strong>
                        </p>
                      </div>
                      <button 
                        onClick={() => setSelectedClassForCover(null)}
                        className="text-[11px] font-bold text-slate-500 hover:text-slate-700 border border-slate-200 bg-white px-2.5 py-1 rounded-md transition-colors cursor-pointer shadow-sm"
                      >
                        Dismiss
                      </button>
                    </div>

                    <div>
                      <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2.5">
                        Colleagues Available on {selectedClassForCover.day}s:
                      </p>

                      {(() => {
                        const dayLower = selectedClassForCover.day.toLowerCase();
                        const freeTeachers = substitutes.filter(sub => {
                          const statusLower = (sub.statusText || "").toLowerCase();
                          return statusLower.includes("available") || statusLower.includes("always") || statusLower.includes(dayLower);
                        });

                        if (freeTeachers.length === 0) {
                          return (
                            <div className="p-4 text-center bg-white border border-slate-150 rounded-lg text-slate-500">
                              <p className="text-[12px] font-semibold text-slate-600">No faculty members are explicitly listed as free on {selectedClassForCover.day}s.</p>
                              <p className="text-[11px] text-slate-400 mt-1">You can invite other department members directly from the side panel recommendation roster.</p>
                            </div>
                          );
                        }

                        return (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {freeTeachers.map((teacher) => (
                              <div key={teacher.id} className="flex items-center justify-between p-3 bg-white border border-slate-150 rounded-lg shadow-sm hover:border-indigo-150 transition-all hover:shadow">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-100 border border-slate-200">
                                    <img src={teacher.avatar} className="w-full h-full object-cover" alt={teacher.name} referrerPolicy="no-referrer" />
                                  </div>
                                  <div>
                                    <p className="text-[12px] font-bold text-slate-800">Dr. {teacher.name}</p>
                                    <p className="text-[10px] font-bold text-emerald-optimized mt-0.5">{teacher.matchRate} Course Match</p>
                                  </div>
                                </div>
                                <button
                                  onClick={() => onSendSubstituteRequest(teacher.name, selectedClassForCover.subject)}
                                  className="bg-indigo-gamify text-white hover:bg-indigo-700 font-bold text-[11px] px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all shadow-sm cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
                                >
                                  <Send size={11} />
                                  Ask to Cover
                                </button>
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                )}
              </section>

              {/* Pending Approvals */}
              <section className="bg-surface-container-lowest border border-slate-border rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                    Pending Approvals
                  </h3>
                  <span className="bg-error-container text-on-error-container px-2.5 py-0.5 rounded-full text-[11px] font-bold">
                    {activeApprovals.length} Actions
                  </span>
                </div>

                <div className="space-y-3">
                  {activeApprovals.length > 0 ? (
                    activeApprovals.map((item) => (
                      <div 
                        key={item.id} 
                        className="flex items-center justify-between p-4 bg-surface-container-low rounded-lg group hover:bg-surface-container transition-colors duration-200"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded flex items-center justify-center ${
                            item.type === "warning" ? "bg-amber-conflict/10 text-amber-conflict" : "bg-indigo-gamify/10 text-indigo-gamify"
                          }`}>
                            {item.icon === "grade" ? <Star size={18} /> : <FileText size={18} />}
                          </div>
                          <div>
                            <p className="text-[13px] font-bold text-primary">{item.title}</p>
                            <p className="text-[11px] text-secondary mt-0.5">{item.subtitle}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <button 
                            onClick={() => handleApprovalAction(item.id, "approved")}
                            className="text-emerald-optimized hover:bg-emerald-optimized/10 p-1.5 rounded transition-colors cursor-pointer animate-fade-in"
                            title="Approve / Validate"
                          >
                            <CheckCircle size={18} />
                          </button>
                          <button 
                            onClick={() => handleApprovalAction(item.id, "rejected")}
                            className="text-rose-burnout hover:bg-rose-burnout/10 p-1.5 rounded transition-colors cursor-pointer animate-fade-in"
                            title="Decline / Reject"
                          >
                            <XCircle size={18} />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 bg-surface-container-low rounded-lg border border-dashed border-slate-200">
                      <CheckCircle2 className="mx-auto text-emerald-optimized mb-2" size={32} />
                      <p className="text-[13px] font-semibold text-primary">All pending validations completed</p>
                      <p className="text-[11px] text-secondary mt-1">Excellent administrative compliance!</p>
                    </div>
                  )}
                </div>
              </section>

              {/* Leave Submission History */}
              {leaveRequests.length > 0 && (
                <section className="bg-surface-container-lowest border border-slate-border rounded-xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                      <History size={18} className="text-secondary" />
                      Leave Request History
                    </h3>
                    <span className="text-[11px] text-secondary font-medium">Tracking submissions</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[12px]">
                      <thead>
                        <tr className="border-b border-slate-100 text-secondary font-semibold">
                          <th className="py-2">Leave Type</th>
                          <th className="py-2">Duration</th>
                          <th className="py-2">Reason</th>
                          <th className="py-2 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {leaveRequests.map((leave) => (
                          <tr key={leave.id} className="hover:bg-slate-50">
                            <td className="py-3 font-semibold text-primary">{leave.leaveType}</td>
                            <td className="py-3 text-secondary">{leave.startDate} to {leave.endDate}</td>
                            <td className="py-3 text-secondary max-w-xs truncate" title={leave.reason}>{leave.reason}</td>
                            <td className="py-3 text-right">
                              <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold ${
                                leave.status === "approved" 
                                  ? "bg-emerald-optimized/10 text-emerald-optimized" 
                                  : leave.status === "pending"
                                  ? "bg-amber-conflict/10 text-amber-conflict"
                                  : "bg-red-100 text-red-600"
                              }`}>
                                {leave.status.toUpperCase()}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}
            </div>
          )}
        </div>

        {/* Right Column (4 cols): Workload & Substitute Widgets */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Workload Balance Indicator */}
          <section className="bg-surface-container-lowest border border-slate-border rounded-xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-primary mb-6">Departmental Load</h3>
              
              <div className="relative w-48 h-24 mx-auto overflow-hidden">
                {/* SVG circular track background */}
                <svg className="w-full h-full transform translate-y-2" viewBox="0 0 100 50">
                  <path 
                    d="M 10 50 A 40 40 0 0 1 90 50" 
                    fill="none" 
                    stroke="var(--color-surface-container)" 
                    strokeWidth="10" 
                    strokeLinecap="round" 
                  />
                  {/* Active arc representing 18 out of 24 credits (75%) */}
                  <path 
                    d="M 10 50 A 40 40 0 0 1 90 50" 
                    fill="none" 
                    stroke="var(--color-emerald-optimized)" 
                    strokeWidth="10" 
                    strokeLinecap="round" 
                    strokeDasharray="125.6" 
                    strokeDashoffset={125.6 * (1 - 18 / 24)} 
                  />
                </svg>
                
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center pb-2 select-none">
                  <p className="text-3xl font-extrabold text-primary leading-none">18</p>
                  <p className="text-[10px] font-bold text-secondary uppercase mt-1">Credits / 24 Max</p>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between px-4">
              <div className="text-center">
                <p className="text-[13px] font-bold text-emerald-optimized">Healthy</p>
                <p className="text-[10px] text-secondary uppercase mt-0.5">Status</p>
              </div>
              <div className="w-px h-8 bg-slate-border" />
              <div className="text-center">
                <p className="text-[13px] font-bold text-primary">6 hrs</p>
                <p className="text-[10px] text-secondary uppercase mt-0.5">Remaining</p>
              </div>
            </div>
          </section>

          {/* Substitute Recommendations */}
          <section className="bg-surface-container-lowest border border-slate-border rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-primary">Department Faculty</h3>
              <div className="relative group cursor-help">
                <Info size={16} className="text-secondary" />
                <div className="absolute right-0 bottom-full mb-1 w-48 bg-inverse-surface text-inverse-on-surface text-[10px] p-2 rounded shadow-lg hidden group-hover:block transition-all duration-200">
                  Faculty members and registered substitute cover coordinators for the departmental courses.
                </div>
              </div>
            </div>

            {substitutes.length > 0 ? (
              <div className="space-y-3">
                {substitutes.map((sub) => (
                  <div 
                    key={sub.id} 
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-container-low border border-transparent hover:border-slate-border transition-all duration-200 group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center overflow-hidden border border-slate-100">
                      <img 
                        className="w-full h-full object-cover" 
                        src={sub.avatar} 
                        alt={sub.name}
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-bold text-primary truncate">Dr. {sub.name}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] font-semibold text-emerald-optimized">
                          {sub.matchRate} Match
                        </span>
                        <span className="w-1 h-1 bg-slate-300 rounded-full" />
                        <span className="text-[10px] text-secondary">{sub.statusText}</span>
                      </div>
                    </div>
                    
                    {role === "teacher" && (
                      <button 
                        onClick={() => onSendSubstituteRequest(sub.name, schedule.find(s => s.status === 'conflict')?.subject || "Ethics in AI")}
                        className="text-primary hover:bg-primary/5 p-1.5 rounded cursor-pointer transition-colors"
                        title={`Request substitute cover from ${sub.name}`}
                      >
                        <Send size={14} className="group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                <Users className="mx-auto text-slate-300 mb-2" size={32} />
                <p className="text-[11px] font-semibold text-slate-600">No other faculty registered</p>
                {role === "hod" ? (
                  <p className="text-[10px] text-slate-400 mt-0.5">Add faculty members using the register form.</p>
                ) : (
                  <p className="text-[10px] text-slate-400 mt-0.5">Ask HOD to add colleagues to the department.</p>
                )}
              </div>
            )}
          </section>

        </div>
      </div>
    </div>
  );
}
