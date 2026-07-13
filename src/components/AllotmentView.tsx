import React, { useState } from "react";
import { 
  Users, 
  Calendar, 
  CheckCircle2, 
  UserCheck, 
  AlertCircle, 
  Sparkles,
  Layers,
  Clock,
  ArrowRight,
  Send,
  HelpCircle
} from "lucide-react";

interface AllotmentViewProps {
  schedule: any[];
  substitutes: any[];
  leaveRequests: any[];
  onAllotFaculty: (allotmentData: {
    year: string;
    substituteId: string;
    substituteName: string;
    onLeaveTeacherName: string;
    classId: string;
    className: string;
    day: string;
    time: string;
    room: string;
  }) => void;
  role: string;
}

export default function AllotmentView({ 
  schedule, 
  substitutes, 
  leaveRequests, 
  onAllotFaculty,
  role 
}: AllotmentViewProps) {
  // Years
  const academicYears = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
  const [selectedYear, setSelectedYear] = useState("3rd Year");
  
  // States
  const [selectedLeaveTeacher, setSelectedLeaveTeacher] = useState("Dr. Elena Kostic");
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedSubId, setSelectedSubId] = useState("");
  const [successInfo, setSuccessInfo] = useState<any>(null);

  // Pre-coded free faculty data grouped by Year
  const freeFacultyByYear: Record<string, Array<{ id: string; name: string; dept: string; freeSlots: string[]; avatar: string }>> = {
    "1st Year": [
      { id: "free-1", name: "Prof. David Miller", dept: "Foundation AI", freeSlots: ["Wed 10:00 - 11:30", "Mon 14:00 - 15:30"], avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Miller" },
      { id: "free-2", name: "Dr. Alan Turing", dept: "Automata Theory", freeSlots: ["Wed 10:00 - 11:30", "Fri 09:00 - 10:30"], avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Turing" }
    ],
    "2nd Year": [
      { id: "free-3", name: "Dr. Grace Hopper", dept: "Compiler Design", freeSlots: ["Thu 13:00 - 14:30", "Wed 10:00 - 11:30"], avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Hopper" },
      { id: "free-4", name: "Prof. Donald Knuth", dept: "Data Structures", freeSlots: ["Mon 09:00 - 10:30", "Wed 14:00 - 15:30"], avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Knuth" }
    ],
    "3rd Year": [
      { id: "free-5", name: "Dr. Sarah Chen", dept: "Deep Learning", freeSlots: ["Wed 10:00 - 11:30", "Fri 09:00 - 10:30"], avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Chen" },
      { id: "free-6", name: "Prof. Ada Lovelace", dept: "Analytical Engines", freeSlots: ["Thu 13:00 - 14:30", "Mon 14:00 - 15:30"], avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Ada" }
    ],
    "4th Year": [
      { id: "free-7", name: "Prof. Richard Feynman", dept: "Quantum Computing", freeSlots: ["Fri 09:00 - 10:30", "Wed 10:00 - 11:30"], avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Feynman" },
      { id: "free-8", name: "Dr. Claude Shannon", dept: "Information Theory", freeSlots: ["Mon 14:00 - 15:30", "Thu 13:00 - 14:30"], avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Shannon" }
    ]
  };

  // Find classes of the selected on-leave teacher
  // In our database, Elena Kostic has sch-1, sch-2, sch-3, sch-4, sch-5, sch-6
  const leaveTeacherClasses = schedule.filter(item => 
    !item.professor || item.professor === selectedLeaveTeacher || selectedLeaveTeacher === "Dr. Elena Kostic"
  );

  const handleAllot = () => {
    if (!selectedClassId) {
      alert("Please select a class slot requiring coverage.");
      return;
    }
    if (!selectedSubId) {
      alert("Please select an available substitute teacher.");
      return;
    }

    const targetClass = schedule.find(s => s.id === selectedClassId);
    const yearList = freeFacultyByYear[selectedYear] || [];
    const targetSub = yearList.find(f => f.id === selectedSubId);

    if (targetClass && targetSub) {
      onAllotFaculty({
        year: selectedYear,
        substituteId: targetSub.id,
        substituteName: targetSub.name,
        onLeaveTeacherName: selectedLeaveTeacher,
        classId: targetClass.id,
        className: targetClass.subject,
        day: targetClass.day,
        time: targetClass.time,
        room: targetClass.room
      });

      setSuccessInfo({
        sub: targetSub.name,
        leaveTeacher: selectedLeaveTeacher,
        className: targetClass.subject,
        time: `${targetClass.day} (${targetClass.time})`,
        room: targetClass.room,
        year: selectedYear,
        avatarSub: targetSub.avatar
      });

      // Reset states
      setSelectedClassId("");
      setSelectedSubId("");
      
      // Auto clear success info after 8 seconds
      setTimeout(() => {
        setSuccessInfo(null);
      }, 12000);
    }
  };

  const hasAccess = role === "hod" || role === "admin";

  return (
    <div className="space-y-8 animate-fade-in font-sans select-none pb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-primary tracking-tight">Academic Allotment Desk</h2>
          <p className="text-[14px] text-secondary font-sans mt-1">
            Search free respected faculty members by Academic Year to cover classrooms of teachers on leave.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-gamify/10 rounded-full border border-indigo-gamify/20">
          <Layers size={14} className="text-indigo-gamify" />
          <span className="text-[11.5px] font-extrabold text-indigo-gamify uppercase tracking-wider">
            {role.toUpperCase()} LEVEL ACCESS
          </span>
        </div>
      </div>

      {!hasAccess ? (
        <div className="p-8 bg-surface-container-lowest border border-slate-border rounded-xl text-center space-y-4 max-w-2xl mx-auto">
          <AlertCircle className="mx-auto text-amber-conflict" size={48} />
          <h3 className="text-lg font-bold text-primary">Allotment Access Restricted</h3>
          <p className="text-[13px] text-secondary leading-relaxed">
            Only <strong>Heads of Departments (HOD)</strong> and <strong>Administrators</strong> possess the credentials to allocate substitute coverages and publish live assignments to the institutional schedule.
          </p>
          <p className="text-[12px] text-slate-500 font-medium">
            Please log in with the <strong>HOD Control</strong> or <strong>Admin</strong> profile using the toggle at the top right of the screen.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Main Allotment Workspace */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Success Preview Alert */}
            {successInfo && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 shadow-sm space-y-4 animate-in slide-in-from-top-4 duration-300">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-emerald-500 text-white rounded-lg mt-0.5">
                    <CheckCircle2 size={20} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-[14.5px] font-bold text-emerald-800">Class Coverage Successfully Allotted!</h3>
                    <p className="text-[12.5px] text-emerald-600 mt-1 leading-relaxed">
                      The timetable has been modified. Two automated inbox alerts have been safely dispatched to both professors:
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="bg-white p-3.5 rounded-lg border border-emerald-100 flex gap-2.5 items-start">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                      <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuATwmU_yCo8a5TUBywRDrZWTU2IITffcK4C0o96oRIhyJR6XnMcKtJjsb_57cQkAx4iRZj80_YzomFaBatLRPyCLkptJydkzOB2HbTOkGj4gIDIBrLJGh8c4lRf5VULW8Q4QrHnyhU-BwTWWoWJ7ebg2jraODOTT0KCoVHauM36YewQjwFubtrrsTVsOcMjl-v6balS1DF5butBLK9MB9TjecVpFW7t-m6QDJ-HKU5-34lYHDC8ImW2B4dOrCWW98p9LruzfaZfHsE" className="w-full h-full rounded-full" />
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Recipient: {successInfo.leaveTeacher}</span>
                      <p className="text-[11.5px] font-bold text-slate-700 mt-1">"Your Wednesday class has been covered"</p>
                      <p className="text-[10.5px] text-slate-500 mt-1 leading-relaxed">
                        {successInfo.sub} ({successInfo.year}) is free and has been allotted to cover your class {successInfo.className} in {successInfo.room}.
                      </p>
                    </div>
                  </div>

                  <div className="bg-white p-3.5 rounded-lg border border-emerald-100 flex gap-2.5 items-start">
                    <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
                      <img src={successInfo.avatarSub} className="w-full h-full rounded-full" />
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Recipient: {successInfo.sub}</span>
                      <p className="text-[11.5px] font-bold text-slate-700 mt-1">"New Classroom Cover Assigned"</p>
                      <p className="text-[10.5px] text-slate-500 mt-1 leading-relaxed">
                        You are assigned to cover {successInfo.leaveTeacher}'s {successInfo.className} lecture at {successInfo.time} in {successInfo.room}.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-surface-container-lowest border border-slate-border rounded-xl p-6 shadow-sm space-y-6">
              
              {/* Step 1: Year Selector */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 bg-primary text-on-primary text-[11px] font-bold rounded-full">1</span>
                  <h3 className="text-[14px] font-bold text-primary uppercase tracking-wide">Filter Free Faculty by Study Year</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {academicYears.map((year) => {
                    const isSelected = selectedYear === year;
                    return (
                      <button
                        key={year}
                        onClick={() => {
                          setSelectedYear(year);
                          setSelectedSubId("");
                        }}
                        className={`py-3 px-4 rounded-xl border text-[13px] font-bold text-center transition-all cursor-pointer ${
                          isSelected
                            ? "bg-primary text-on-primary border-transparent shadow-sm scale-[0.98]"
                            : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100/60"
                        }`}
                      >
                        {year}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Choose Free Teacher */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 bg-primary text-on-primary text-[11px] font-bold rounded-full">2</span>
                    <h3 className="text-[14px] font-bold text-primary uppercase tracking-wide">Select Free Respected Teacher ({selectedYear})</h3>
                  </div>
                  <span className="text-[10.5px] font-bold text-indigo-gamify">
                    {(freeFacultyByYear[selectedYear] || []).length} Available
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(freeFacultyByYear[selectedYear] || []).map((fac) => {
                    const isSelected = selectedSubId === fac.id;
                    return (
                      <button
                        key={fac.id}
                        type="button"
                        onClick={() => setSelectedSubId(fac.id)}
                        className={`text-left p-4 rounded-xl border transition-all cursor-pointer relative flex gap-3 ${
                          isSelected
                            ? "bg-primary-container/20 border-primary ring-1 ring-primary"
                            : "bg-slate-50 border-slate-200 hover:bg-slate-100/50"
                        }`}
                      >
                        <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden border border-slate-200">
                          <img src={fac.avatar} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-[13px] font-bold text-slate-800">{fac.name}</h4>
                          <span className="text-[10.5px] text-slate-500 font-medium block mt-0.5">{fac.dept}</span>
                          
                          <div className="mt-3 flex flex-wrap gap-1">
                            {fac.freeSlots.map((s, idx) => (
                              <span key={idx} className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[9.5px] font-extrabold px-1.5 py-0.5 rounded-full flex items-center gap-1">
                                <Clock size={10} />
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 3: Choose Class Needing Coverage */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 bg-primary text-on-primary text-[11px] font-bold rounded-full">3</span>
                  <h3 className="text-[14px] font-bold text-primary uppercase tracking-wide">Select Slot Requiring Coverage</h3>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto border border-slate-200 rounded-xl p-2 bg-slate-50">
                  {leaveTeacherClasses.map((cl) => {
                    const isSelected = selectedClassId === cl.id;
                    const hasConflict = cl.status === "conflict" || cl.status === "burnout";
                    return (
                      <button
                        key={cl.id}
                        type="button"
                        onClick={() => setSelectedClassId(cl.id)}
                        className={`w-full text-left p-3 rounded-lg border transition-all flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? "bg-white border-primary shadow-sm ring-1 ring-primary"
                            : "bg-white border-slate-100 hover:bg-slate-100"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-1.5 rounded-lg ${hasConflict ? "bg-amber-100 text-amber-700" : "bg-indigo-50 text-indigo-700"}`}>
                            <Calendar size={15} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[12.5px] font-bold text-slate-800">{cl.subject}</span>
                              {hasConflict && (
                                <span className="bg-rose-100 text-rose-700 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full">
                                  Conflict Alert
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-500 mt-0.5 block">
                              {cl.day} • {cl.time} • Room {cl.room}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded">
                            {cl.credits} Credits
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 4: Allot Button */}
              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={handleAllot}
                  disabled={!selectedClassId || !selectedSubId}
                  className={`py-3 px-6 rounded-xl font-bold flex items-center gap-2 transition-all cursor-pointer ${
                    selectedClassId && selectedSubId
                      ? "bg-primary text-on-primary hover:shadow-lg active:scale-[0.99]"
                      : "bg-slate-200 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  <UserCheck size={16} />
                  <span>Allot & Dispatch Alerts</span>
                  <ArrowRight size={14} />
                </button>
              </div>

            </div>
          </div>

          {/* Guidelines and Logs Side */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Context Widget */}
            <div className="bg-surface-container-lowest border border-slate-border rounded-xl p-5 shadow-sm space-y-4">
              <h3 className="text-[14.5px] font-bold text-primary flex items-center gap-2">
                <Sparkles size={16} className="text-indigo-gamify" />
                Smart Allotment Rules
              </h3>

              <div className="space-y-3.5 text-[12px] text-slate-600 leading-relaxed">
                <div className="p-3 bg-indigo-gamify/5 border border-indigo-gamify/10 rounded-lg">
                  <span className="font-bold text-slate-800 block mb-1">Academic Year Sync</span>
                  Matching substitute professors to the respective year's core subject ensures curriculum consistency and syllabus alignment.
                </div>

                <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-lg">
                  <span className="font-bold text-slate-800 block mb-1">Conflict Detection</span>
                  Check that the substitute does not have other teaching assignments scheduled during the covered slot.
                </div>

                <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-lg">
                  <span className="font-bold text-slate-800 block mb-1">Automated Notifications</span>
                  Alloting immediately creates live push alerts in the institutional dashboards of both professors to guarantee real-time awareness.
                </div>
              </div>
            </div>

            {/* Simulated Active Leave Cases */}
            <div className="bg-surface-container-lowest border border-slate-border rounded-xl p-5 shadow-sm space-y-4">
              <h3 className="text-[14.5px] font-bold text-primary flex items-center gap-1.5">
                <Users size={16} className="text-indigo-gamify" />
                Active Leave Requests
              </h3>

              <div className="space-y-3">
                {leaveRequests.filter(l => l.status === "approved" || l.status === "pending").map((l, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex flex-col gap-1 text-[11.5px]">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-800">Dr. Elena Kostic</span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                        l.status === "approved" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                      }`}>
                        {l.status}
                      </span>
                    </div>
                    <span className="text-slate-500">Dates: {l.startDate} to {l.endDate}</span>
                    <span className="text-slate-500 font-medium">Reason: {l.reason}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}
    </div>
  );
}
