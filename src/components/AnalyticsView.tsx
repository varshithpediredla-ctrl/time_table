import React from "react";
import { BarChart, TrendingUp, HelpCircle, Activity, LayoutGrid } from "lucide-react";

export default function AnalyticsView() {
  const workloads = [
    { name: "Elena K.", credits: 18, max: 24, fill: "var(--color-emerald-optimized)" },
    { name: "David M.", credits: 20, max: 24, fill: "var(--color-emerald-optimized)" },
    { name: "Sarah C.", credits: 16, max: 24, fill: "var(--color-emerald-optimized)" },
    { name: "Julian R.", credits: 15, max: 24, fill: "var(--color-emerald-optimized)" }
  ];

  return (
    <div className="space-y-8 animate-fade-in select-none">
      <div>
        <h2 className="text-3xl font-extrabold text-primary tracking-tight">Institutional Analytics</h2>
        <p className="text-[14px] text-secondary font-sans mt-1">
          Perform high-density schedule auditing and cognitive workload evaluations using real-time institutional metrics.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Workload Distribution Bar Chart (SVG) */}
        <div className="lg:col-span-8 bg-surface-container-lowest border border-slate-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-primary flex items-center gap-1.5">
                <BarChart size={18} className="text-indigo-gamify" />
                Faculty Workload Allocation (Credits)
              </h3>
              <p className="text-[11px] text-secondary mt-0.5">Assigned credits vs maximum allowable credit ceiling (24 Max)</p>
            </div>
            <span className="text-[10px] font-bold bg-emerald-optimized/10 text-emerald-optimized px-2 py-0.5 rounded-full uppercase">
              Optimal Limits
            </span>
          </div>

          {/* SVG Custom Bar Chart */}
          <div className="relative w-full h-64 border-b border-l border-slate-200 pl-4 pb-4 select-none">
            {/* Grid line guidelines */}
            <div className="absolute left-0 right-0 top-1/4 border-t border-dashed border-slate-100 flex justify-between pr-4">
              <span className="text-[9px] text-secondary font-bold -translate-x-4 -translate-y-2">18 Cr</span>
              <span className="text-[9px] text-slate-300 font-bold">Optimal Boundary</span>
            </div>
            <div className="absolute left-0 right-0 top-1/2 border-t border-dashed border-slate-100 flex justify-between pr-4">
              <span className="text-[9px] text-secondary font-bold -translate-x-4 -translate-y-2">12 Cr</span>
            </div>
            <div className="absolute left-0 right-0 top-3/4 border-t border-dashed border-slate-100 flex justify-between pr-4">
              <span className="text-[9px] text-secondary font-bold -translate-x-4 -translate-y-2">6 Cr</span>
            </div>

            {/* Draw Columns */}
            <div className="w-full h-full flex justify-around items-end pt-6 relative z-10">
              {workloads.map((item, i) => {
                const heightPercentage = `${(item.credits / item.max) * 100}%`;
                const maxLine = `${(item.max / item.max) * 100}%`;
                return (
                  <div key={i} className="flex flex-col items-center gap-2 group cursor-pointer w-20">
                    <div className="relative w-full flex items-end justify-center h-48 bg-slate-50 border border-slate-100 rounded-t-md overflow-hidden">
                      {/* Ceiling limit backdrop */}
                      <div className="absolute bottom-0 left-0 right-0 bg-primary/5 h-full z-0" />
                      {/* Active bar */}
                      <div 
                        className="w-8 bg-emerald-optimized rounded-t z-10 transition-all duration-500 hover:brightness-95 flex items-center justify-center text-white font-mono text-[10px] font-extrabold pb-1 shadow-sm"
                        style={{ height: heightPercentage }}
                      >
                        {item.credits}
                      </div>
                    </div>
                    <span className="text-[12px] font-bold text-slate-700">{item.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Key Diagnostic Indicators */}
        <div className="lg:col-span-4 bg-surface-container-lowest border border-slate-border rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-primary flex items-center gap-1.5">
              <TrendingUp size={18} className="text-indigo-gamify" />
              Efficiency Indicators
            </h3>

            <div className="space-y-4">
              <div className="p-4 bg-surface-container-low rounded-xl border border-slate-100">
                <div className="flex justify-between items-center text-[12px] font-bold text-slate-700 mb-2">
                  <span>Room Allocation Efficiency</span>
                  <span className="text-emerald-optimized">94.8%</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-optimized h-full w-[94.8%]" />
                </div>
              </div>

              <div className="p-4 bg-surface-container-low rounded-xl border border-slate-100">
                <div className="flex justify-between items-center text-[12px] font-bold text-slate-700 mb-2">
                  <span>Conflict Resolution Speed</span>
                  <span className="text-indigo-gamify">88% (AI Optimal)</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-indigo-gamify h-full w-[88%]" />
                </div>
              </div>

              <div className="p-4 bg-surface-container-low rounded-xl border border-slate-100">
                <div className="flex justify-between items-center text-[12px] font-bold text-slate-700 mb-2">
                  <span>Faculty Fatigue Index</span>
                  <span className="text-amber-conflict">12% (Critical Friday)</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-amber-conflict h-full w-[12%]" />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 p-4 bg-emerald-optimized/5 border border-emerald-optimized/15 rounded-xl flex gap-3 text-[11px] leading-relaxed text-slate-700">
            <Activity size={20} className="text-emerald-optimized shrink-0" />
            <p>
              Current diagnostic health across SmartDyn Admin: **92% System Optimality**. The scheduled Friday Research Sync represents the lone localized fatigue exception. Submit substitute coverages to restore perfect index levels.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
