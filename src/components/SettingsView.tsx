import React, { useState } from "react";
import { Sliders, ToggleLeft, ToggleRight, RotateCcw, ShieldCheck, Mail, Bot, RefreshCw } from "lucide-react";

interface SettingsViewProps {
  onReset: () => void;
  isResetting: boolean;
}

export default function SettingsView({ onReset, isResetting }: SettingsViewProps) {
  const [maxCredits, setMaxCredits] = useState(24);
  const [autoOptimize, setAutoOptimize] = useState(false);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [notifySubstitutes, setNotifySubstitutes] = useState(true);

  return (
    <div className="space-y-8 animate-fade-in select-none">
      <div>
        <h2 className="text-3xl font-extrabold text-primary tracking-tight">System Settings</h2>
        <p className="text-[14px] text-secondary font-sans mt-1">
          Adjust administrative boundaries, threshold metrics, and AI optimization parameters for SmartDyn Admin.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Configuration sliders and selectors */}
        <div className="lg:col-span-8 bg-surface-container-lowest border border-slate-border rounded-xl p-6 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-primary flex items-center gap-2">
            <Sliders size={20} className="text-indigo-gamify" />
            Operational Parameters
          </h3>

          <div className="space-y-6">
            {/* Max credits per faculty */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[12px] font-bold text-slate-700 uppercase">Maximum Faculty Term Credits</label>
                <span className="text-[13px] font-mono font-bold bg-slate-100 px-2 py-0.5 rounded text-primary">{maxCredits} Credits</span>
              </div>
              <input 
                type="range" 
                min="12" 
                max="32" 
                value={maxCredits} 
                onChange={(e) => setMaxCredits(Number(e.target.value))}
                className="w-full accent-primary bg-slate-100 rounded-lg h-1.5 cursor-pointer"
              />
              <p className="text-[11px] text-secondary">
                Limits consecutive lectures and core credit boundaries to restrict burnout risks. Default: 24 credits.
              </p>
            </div>

            <div className="w-full h-px bg-slate-100" />

            {/* Auto Optimization toggle */}
            <div className="flex items-center justify-between">
              <div className="space-y-1 pr-6">
                <span className="text-[12px] font-bold text-slate-700 uppercase block">Automatic Real-time AI Re-optimization</span>
                <span className="text-[11px] text-secondary block">
                  Automatically correct minor schedule clashes (room allocation) as they arise using server background triggers.
                </span>
              </div>
              <button 
                onClick={() => setAutoOptimize(!autoOptimize)}
                className="text-primary hover:opacity-80 transition-opacity shrink-0 cursor-pointer"
              >
                {autoOptimize ? (
                  <ToggleRight className="text-emerald-optimized" size={40} />
                ) : (
                  <ToggleLeft className="text-slate-300" size={40} />
                )}
              </button>
            </div>

            <div className="w-full h-px bg-slate-100" />

            {/* Email alerts toggle */}
            <div className="flex items-center justify-between">
              <div className="space-y-1 pr-6">
                <span className="text-[12px] font-bold text-slate-700 uppercase block">Instant Notification Sync</span>
                <span className="text-[11px] text-secondary block">
                  Email and SMS alert recommended colleagues automatically upon submitting leave requests.
                </span>
              </div>
              <button 
                onClick={() => setEmailAlerts(!emailAlerts)}
                className="text-primary hover:opacity-80 transition-opacity shrink-0 cursor-pointer"
              >
                {emailAlerts ? (
                  <ToggleRight className="text-emerald-optimized" size={40} />
                ) : (
                  <ToggleLeft className="text-slate-300" size={40} />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Danger Zone / System maintenance */}
        <div className="lg:col-span-4 bg-surface-container-lowest border border-slate-border rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-rose-burnout flex items-center gap-2">
              <RotateCcw size={18} />
              Maintenance & Demo
            </h3>

            <div className="p-4 bg-rose-burnout/5 border border-rose-burnout/10 rounded-xl space-y-4">
              <p className="text-[11.5px] leading-relaxed text-slate-700">
                To evaluate the AI Schedule Optimizer again or restore initial demonstrator conflicts (Ethics Room Collision, Friday Elena fatigue):
              </p>
              
              <button 
                onClick={onReset}
                disabled={isResetting}
                className="w-full py-2.5 bg-rose-burnout text-white font-semibold text-[12px] rounded-lg shadow-sm hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isResetting ? (
                  <RefreshCw size={15} className="animate-spin" />
                ) : (
                  <RotateCcw size={15} />
                )}
                <span>Reset Application Database</span>
              </button>
            </div>
          </div>

          <div className="mt-8 p-4 bg-primary-container/10 border border-primary-container/20 rounded-xl flex gap-3 text-[11px] leading-relaxed text-on-primary-container">
            <ShieldCheck size={20} className="text-primary shrink-0" />
            <p>
              Security and API integrity protocols validated under institutional compliance term AI-CO-2026. The API connection is established server-side with zero browser exposure.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
