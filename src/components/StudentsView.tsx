import React from "react";
import { Award, Trophy, Sparkles, CheckCircle2, Zap, ShieldAlert } from "lucide-react";

export default function GamificationView() {
  const achievements = [
    { name: "Conflict Resolver", desc: "Successfully resolved 5 scheduling clashes", points: "150 Pts", status: "Unlocked", tier: "Gold", date: "Jul 2026" },
    { name: "Super Substitute", desc: "Volunteered to cover 3 lectures for colleagues", points: "100 Pts", status: "Unlocked", tier: "Silver", date: "Jun 2026" },
    { name: "Term Planner", desc: "Submitted error-free timetable on first try", points: "50 Pts", status: "Unlocked", tier: "Bronze", date: "May 2026" },
    { name: "AI Sync master", desc: "Executed 10 schedule auto-optimizations", points: "200 Pts", status: "Locked", tier: "Platinum", date: "In Progress" }
  ];

  const leaderboard = [
    { rank: 1, name: "Prof. David Miller", points: "490 Pts", badge: "Gold Leader" },
    { rank: 2, name: "Dr. Elena Kostic (You)", points: "450 Pts", badge: "Virtuoso" },
    { rank: 3, name: "Dr. Sarah Chen", points: "410 Pts", badge: "Pro" },
    { rank: 4, name: "Dr. Julian Ross", points: "380 Pts", badge: "Rising Coordinator" }
  ];

  return (
    <div className="space-y-8 animate-fade-in select-none">
      <div>
        <h2 className="text-3xl font-extrabold text-primary tracking-tight">Gamified Administrative Control</h2>
        <p className="text-[14px] text-secondary font-sans mt-1">
          SmartDyn applies positive reinforcement design to reward schedule compliance and peer substitute assistance.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Stats & Badge Grid */}
        <div className="lg:col-span-8 space-y-6">
          {/* Main points summary card */}
          <div className="bg-primary text-on-primary rounded-xl p-6 shadow-sm relative overflow-hidden">
            <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-10">
              <Trophy size={200} />
            </div>
            
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 rounded-xl">
                <Trophy size={32} className="text-amber-conflict" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider opacity-85">Academic Rank</span>
                <h3 className="text-xl font-bold">Level 4 Timetable Virtuoso</h3>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-white/10">
              <div>
                <p className="text-2xl font-extrabold text-amber-conflict">450</p>
                <p className="text-[11px] opacity-80 mt-0.5">Total Points</p>
              </div>
              <div>
                <p className="text-2xl font-extrabold">12 Days</p>
                <p className="text-[11px] opacity-80 mt-0.5">Optimal Streak</p>
              </div>
              <div>
                <p className="text-2xl font-extrabold">3 Awards</p>
                <p className="text-[11px] opacity-80 mt-0.5">Unlocked Badges</p>
              </div>
            </div>

            {/* Progress to Level 5 */}
            <div className="mt-6">
              <div className="flex justify-between text-[11px] font-semibold mb-1.5 opacity-90">
                <span>Progress to Level 5 ("Master Allocator")</span>
                <span>450 / 500 Pts</span>
              </div>
              <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-amber-conflict" style={{ width: "90%" }} />
              </div>
            </div>
          </div>

          {/* Unlocked & Locked Achievements list */}
          <div className="bg-surface-container-lowest border border-slate-border rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-primary mb-6 flex items-center gap-2">
              <Award size={20} className="text-indigo-gamify" />
              Academic Merit Badges
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {achievements.map((ach, i) => (
                <div key={i} className="p-4 bg-surface-container-low rounded-xl border border-slate-100 flex items-start gap-3">
                  <div className={`p-2.5 rounded-lg shrink-0 ${
                    ach.status === "Locked" ? "bg-slate-300/30 text-slate-400" :
                    ach.tier === "Gold" ? "bg-amber-100 text-amber-600" :
                    ach.tier === "Silver" ? "bg-slate-100 text-slate-600" : "bg-orange-100 text-orange-600"
                  }`}>
                    <Zap size={18} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-[13px] font-bold text-primary truncate">{ach.name}</h4>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        ach.status === "Locked" ? "bg-slate-200 text-slate-500" : "bg-indigo-gamify/10 text-indigo-gamify"
                      }`}>
                        {ach.points}
                      </span>
                    </div>
                    <p className="text-[11px] text-secondary mt-1 leading-snug">{ach.desc}</p>
                    <div className="flex items-center justify-between text-[10px] font-medium text-secondary mt-2.5">
                      <span>Tier: {ach.tier}</span>
                      <span className={ach.status === "Locked" ? "text-amber-conflict" : "text-emerald-optimized font-semibold"}>
                        {ach.status} • {ach.date}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Mini Leaderboard */}
        <div className="lg:col-span-4 bg-surface-container-lowest border border-slate-border rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-primary">Department Rankings</h3>
              <Sparkles size={16} className="text-indigo-gamify" />
            </div>

            <div className="space-y-4">
              {leaderboard.map((user) => (
                <div 
                  key={user.rank} 
                  className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                    user.rank === 2 
                      ? "bg-primary-container border-primary-container text-on-primary-container" 
                      : "bg-surface-container-low border-transparent hover:border-slate-border"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[12px] ${
                      user.rank === 1 ? "bg-amber-100 text-amber-700" :
                      user.rank === 2 ? "bg-white text-primary" : "bg-slate-200 text-slate-700"
                    }`}>
                      {user.rank}
                    </span>
                    <div>
                      <p className="text-[12px] font-bold">{user.name}</p>
                      <p className={`text-[10px] mt-0.5 font-medium ${user.rank === 2 ? "text-slate-300" : "text-secondary"}`}>
                        {user.badge}
                      </p>
                    </div>
                  </div>
                  <span className="text-[12px] font-mono font-bold">{user.points}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 p-4 bg-indigo-gamify/5 border border-indigo-gamify/15 rounded-xl flex gap-3 text-[11.5px] leading-relaxed text-slate-700">
            <ShieldAlert size={20} className="text-indigo-gamify shrink-0" />
            <p>
              Points are generated automatically based on scheduled slots handled, prompt validations, and low leave count without notice. High points increase priority during class schedule selection terms!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
