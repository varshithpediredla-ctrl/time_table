import React, { useState } from "react";
import { Search, Calendar, Plus, PlusCircle, Trash, AlertTriangle, BookOpen } from "lucide-react";
import { ScheduleItem, Substitute } from "../types";

interface TimetableViewProps {
  schedule: ScheduleItem[];
  setSchedule: React.Dispatch<React.SetStateAction<ScheduleItem[]>>;
  substitutes: Substitute[];
  role: "teacher" | "hod";
}

export default function TimetableView({ schedule, setSchedule, substitutes, role }: TimetableViewProps) {
  const [selectedProf, setSelectedProf] = useState("Elena Kostic");
  const [searchTerm, setSearchTerm] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  // New Slot form fields
  const [newDay, setNewDay] = useState("Mon");
  const [newTime, setNewTime] = useState("09:00 - 10:30");
  const [newSubject, setNewSubject] = useState("");
  const [newRoom, setNewRoom] = useState("");
  const [newCredits, setNewCredits] = useState(3);
  const [newStatus, setNewStatus] = useState("optimized");

  // Dynamic Faculty list based on the dynamic substitutes pool + Elena
  const profs = ["Elena Kostic", ...substitutes.map(s => s.name)];
  
  // Safe professor selector validation
  const currentSelectedProf = profs.includes(selectedProf) ? selectedProf : "Elena Kostic";

  // Permission logic: HOD can edit anything; Teachers can only edit Elena Kostic
  const canEdit = role === "hod" || currentSelectedProf === "Elena Kostic";

  // Filter slots
  const filteredSchedule = schedule.filter((slot) => {
    const slotProf = slot.professor || "Elena Kostic";
    if (slotProf !== currentSelectedProf) {
      return false; 
    }
    const q = searchTerm.toLowerCase();
    return (
      slot.subject.toLowerCase().includes(q) ||
      slot.room.toLowerCase().includes(q) ||
      slot.day.toLowerCase().includes(q)
    );
  });

  const getDayLabel = (day: string) => {
    switch (day) {
      case "Mon": return "Monday";
      case "Tue": return "Tuesday";
      case "Wed": return "Wednesday";
      case "Thu": return "Thursday";
      case "Fri": return "Friday";
      case "Sat": return "Saturday";
      case "Sun": return "Sunday";
      default: return day;
    }
  };

  const handleDeleteSlot = (id: string) => {
    setSchedule(prev => prev.filter(s => s.id !== id));
  };

  const handleAddSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject || !newRoom) return;

    const newSlot: ScheduleItem = {
      id: `sch-${Date.now()}`,
      day: newDay,
      time: newTime,
      subject: newSubject,
      room: newRoom,
      status: newStatus,
      credits: Number(newCredits),
      conflictText: newStatus === "conflict" ? "Custom Warning: Slot collision detected" : "",
      professor: currentSelectedProf // Store slot association
    };

    setSchedule(prev => [...prev, newSlot]);
    setIsAdding(false);
    setNewSubject("");
    setNewRoom("");
  };

  // Helper to get status pill colors
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "conflict":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "burnout":
        return "bg-rose-100 text-rose-800 border-rose-200";
      case "optimized":
      default:
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
    }
  };

  return (
    <div className="space-y-8 animate-fade-in select-none">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-primary tracking-tight">Timetable Master Matrix</h2>
          <p className="text-[14px] text-secondary font-sans mt-1">
            Browse, manage, and audit educational schedules for the computer science departments.
          </p>
        </div>
        <button 
          onClick={() => {
            if (canEdit) setIsAdding(true);
          }}
          disabled={!canEdit}
          className={`px-5 py-2.5 rounded-lg text-[13px] font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-sm ${
            canEdit 
              ? "bg-primary text-on-primary hover:opacity-90 active:scale-[0.98]" 
              : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
          }`}
          title={canEdit ? "Add Schedule Slot" : "Elevate role to HOD to schedule classes for this professor"}
        >
          <Plus size={16} />
          Add Schedule Slot
        </button>
      </div>

      {/* Filter Matrix Controls */}
      <div className="bg-surface-container-lowest border border-slate-border rounded-xl p-5 shadow-sm flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-secondary font-bold uppercase">Target Professor</label>
            <select 
              value={selectedProf} 
              onChange={(e) => setSelectedProf(e.target.value)}
              className="bg-surface-container-low border border-slate-200 rounded-lg py-1.5 px-3 text-[13px] font-medium text-slate-800 focus:ring-1 focus:ring-primary focus:outline-none"
            >
              {profs.map(p => (
                <option key={p} value={p}>
                  {p === "Elena Kostic" ? "Dr. Elena Kostic (You)" : `Dr. ${p}`}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-secondary font-bold uppercase">Search Filter</label>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-secondary" size={14} />
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Subject or classroom..."
                className="bg-surface-container-low border border-slate-200 rounded-lg py-1.5 pl-8 pr-3 text-[13px] text-slate-800 focus:ring-1 focus:ring-primary focus:outline-none w-52"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] font-bold text-secondary bg-surface-container-low px-3 py-1.5 rounded-lg border border-slate-100 self-start md:self-center">
          <Calendar size={14} />
          <span>Active Terms: Spring / Fall 2026</span>
        </div>
      </div>

      {/* Add Slot Modal Overlay */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/40 backdrop-blur-sm">
          <div className="bg-surface-container-lowest w-full max-w-md rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-5 border-b border-slate-border flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-primary">Add Schedule Slot</h3>
                <p className="text-[11px] text-secondary mt-0.5">Publish a new class slot for Dr. {currentSelectedProf}.</p>
              </div>
              <button 
                onClick={() => setIsAdding(false)}
                className="p-1.5 hover:bg-surface-container rounded-full text-secondary cursor-pointer font-bold text-lg"
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleAddSlot} className="p-5 space-y-4 text-[13px]">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-secondary text-[11px] uppercase">Day</label>
                  <select 
                    value={newDay} 
                    onChange={(e) => setNewDay(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-primary"
                  >
                    <option value="Mon">Monday</option>
                    <option value="Tue">Tuesday</option>
                    <option value="Wed">Wednesday</option>
                    <option value="Thu">Thursday</option>
                    <option value="Fri">Friday</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-secondary text-[11px] uppercase">Time Duration</label>
                  <select 
                    value={newTime} 
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-primary"
                  >
                    <option value="09:00 - 10:30">09:00 - 10:30</option>
                    <option value="10:00 - 11:30">10:00 - 11:30</option>
                    <option value="11:45 - 13:15">11:45 - 13:15</option>
                    <option value="13:00 - 14:30">13:00 - 14:30</option>
                    <option value="14:00 - 15:30">14:00 - 15:30</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-secondary text-[11px] uppercase">Subject / Class Name</label>
                <input 
                  type="text" 
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="e.g. Advanced Compiler Design"
                  required
                  className="w-full border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-secondary text-[11px] uppercase">Room / Lab</label>
                  <input 
                    type="text" 
                    value={newRoom}
                    onChange={(e) => setNewRoom(e.target.value)}
                    placeholder="e.g. Lab B-1"
                    required
                    className="w-full border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-secondary text-[11px] uppercase">Syllabus Credits</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="6"
                    value={newCredits}
                    onChange={(e) => setNewCredits(Number(e.target.value))}
                    className="w-full border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-secondary text-[11px] uppercase">System Health Status</label>
                <select 
                  value={newStatus} 
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-primary"
                >
                  <option value="optimized">Optimized (No conflict)</option>
                  <option value="conflict">Active Room Overbooking Conflict</option>
                  <option value="burnout">Professor Workload Burnout Danger</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsAdding(false)}
                  className="flex-1 py-2 border border-slate-200 rounded-lg text-secondary font-semibold hover:bg-slate-50 cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-2 bg-primary text-on-primary rounded-lg font-semibold hover:opacity-90 cursor-pointer text-center"
                >
                  Confirm Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Warning/Info banner for read-only mode */}
      {!canEdit && (
        <div className="bg-slate-50 border border-slate-200 text-slate-600 text-[12px] px-4 py-3 rounded-xl flex items-center gap-2.5 shadow-sm animate-fade-in">
          <AlertTriangle size={15} className="text-amber-500 shrink-0" />
          <p>
            You are viewing <strong>Dr. {currentSelectedProf}</strong>'s schedule in <strong>Read-Only mode</strong>. Teachers can only edit their own profile. Switch to the <strong>HOD Control Mode</strong> in the header to gain full control and edit any schedule.
          </p>
        </div>
      )}

      {/* Main Timetable Matrix Display */}
      <div className="bg-surface-container-lowest border border-slate-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container border-b border-slate-border text-[11px] text-secondary font-bold uppercase tracking-wider select-none">
                <th className="py-3 px-6">Day</th>
                <th className="py-3 px-6">Time Slot</th>
                <th className="py-3 px-6">Subject</th>
                <th className="py-3 px-6">Location</th>
                <th className="py-3 px-6">Credits</th>
                <th className="py-3 px-6">AI Status</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[13px] font-sans">
              {filteredSchedule.length > 0 ? (
                filteredSchedule.map((slot) => (
                  <tr key={slot.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-6 font-semibold text-primary">{getDayLabel(slot.day)}</td>
                    <td className="py-4 px-6 text-slate-700">{slot.time}</td>
                    <td className="py-4 px-6 font-bold text-slate-800">
                      <div className="flex items-center gap-2">
                        <BookOpen size={14} className="text-secondary" />
                        <span>{slot.subject}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-600 font-semibold">{slot.room}</td>
                    <td className="py-4 px-6">
                      <span className="font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px]">
                        {slot.credits} credits
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-1">
                        <span className={`inline-flex items-center border px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${getStatusBadge(slot.status)}`}>
                          {slot.status}
                        </span>
                        {slot.conflictText && (
                          <span className="text-[10px] font-medium text-rose-500 max-w-xs leading-snug">
                            {slot.conflictText}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      {canEdit ? (
                        <button 
                          onClick={() => handleDeleteSlot(slot.id)}
                          className="text-rose-burnout hover:bg-rose-burnout/5 p-1.5 rounded cursor-pointer transition-colors"
                          title="Delete slot"
                        >
                          <Trash size={15} />
                        </button>
                      ) : (
                        <span className="text-slate-300 text-[11px] italic pr-2">Read-only</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-secondary font-medium">
                    No timetable slots scheduled for Dr. {currentSelectedProf} yet.
                    {canEdit && (
                      <p className="text-[11px] text-slate-400 mt-1 font-normal">
                        Click "Add Schedule Slot" above to configure classes for this professor.
                      </p>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
