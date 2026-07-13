import React, { useState } from "react";
import { Shield, User, Key, ArrowRight, Check, School, UserPlus, LogIn, Sparkles } from "lucide-react";

interface LoginViewProps {
  onLogin: (role: "teacher" | "hod" | "admin", name: string) => void;
}

export default function LoginView({ onLogin }: LoginViewProps) {
  const [activeTab, setActiveTab] = useState<"signin" | "register">("signin");
  
  // Sign In Form States
  const [signInUsername, setSignInUsername] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  
  // Register Form States
  const [regName, setRegName] = useState("");
  const [regRole, setRegRole] = useState<"teacher" | "hod" | "admin">("teacher");
  const [regUsername, setRegUsername] = useState("");
  const [regPassword, setRegPassword] = useState("");
  
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    if (!signInUsername || !signInPassword) {
      setError("Please fill in both fields.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: signInUsername,
          password: signInPassword
        })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        onLogin(data.user.role, data.user.name);
      } else {
        setError(data.error || "Invalid username or password.");
      }
    } catch (err) {
      console.error(err);
      setError("Server connection failure. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    if (!regName || !regUsername || !regPassword || !regRole) {
      setError("All fields are required to register.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: regName,
          username: regUsername,
          password: regPassword,
          role: regRole
        })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setSuccessMsg(`Account registered successfully for ${regName}! You can now sign in.`);
        setSignInUsername(regUsername);
        setSignInPassword(regPassword);
        
        // Reset registration form
        setRegName("");
        setRegUsername("");
        setRegPassword("");
        setRegRole("teacher");
        
        // Auto-switch to login tab after brief delay or keep it so they can read success
        setTimeout(() => {
          setActiveTab("signin");
        }, 1500);
      } else {
        setError(data.error || "Failed to register account.");
      }
    } catch (err) {
      console.error(err);
      setError("Server connection failure. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans antialiased">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center p-3 bg-primary text-on-primary rounded-2xl shadow-md mb-4">
          <School size={28} className="text-amber-conflict" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          SmartDyn Academic Portal
        </h2>
        <p className="mt-2 text-sm text-slate-600 font-medium">
          Unified Timetable, Leave & Allotment Management System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl rounded-2xl sm:px-10 border border-slate-100">
          
          {/* Tab toggler */}
          <div className="flex border-b border-slate-200 mb-6">
            <button
              onClick={() => {
                setActiveTab("signin");
                setError("");
                setSuccessMsg("");
              }}
              className={`flex-1 pb-3 text-center text-[13px] font-bold border-b-2 transition-all ${
                activeTab === "signin"
                  ? "border-primary text-primary"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <LogIn size={15} />
                Sign In
              </span>
            </button>
            <button
              onClick={() => {
                setActiveTab("register");
                setError("");
                setSuccessMsg("");
              }}
              className={`flex-1 pb-3 text-center text-[13px] font-bold border-b-2 transition-all ${
                activeTab === "register"
                  ? "border-primary text-primary"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <UserPlus size={15} />
                Create Account
              </span>
            </button>
          </div>

          {/* Feedback messages */}
          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-100 rounded-xl text-[11px] text-rose-600 font-semibold leading-relaxed animate-in fade-in duration-200">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-[11px] text-emerald-700 font-semibold leading-relaxed animate-in fade-in duration-200">
              {successMsg}
            </div>
          )}

          {/* SIGN IN FORM */}
          {activeTab === "signin" && (
            <form onSubmit={handleSignInSubmit} className="space-y-4 text-[12.5px]">
              <div>
                <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                  Institutional Username
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <User size={14} />
                  </span>
                  <input
                    type="text"
                    required
                    value={signInUsername}
                    onChange={(e) => setSignInUsername(e.target.value)}
                    placeholder="Enter your registered username"
                    className="block w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                  Access Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <Key size={14} />
                  </span>
                  <input
                    type="password"
                    required
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-primary text-on-primary font-bold rounded-xl shadow-md hover:bg-opacity-95 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{isLoading ? "Authenticating..." : "Access Dashboard"}</span>
                <ArrowRight size={14} />
              </button>
            </form>
          )}

          {/* REGISTER / CREATE ACCOUNT FORM */}
          {activeTab === "register" && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4 text-[12.5px]">
              <div>
                <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <User size={14} />
                  </span>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Dr. Sarah Chen"
                    className="block w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                  Institutional Role
                </label>
                <select
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value as any)}
                  className="block w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white transition-all font-semibold"
                >
                  <option value="teacher">Teacher / Faculty</option>
                  <option value="hod">HOD (Head of Department)</option>
                  <option value="admin">System Administrator</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                  Choose Username
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <Shield size={14} />
                  </span>
                  <input
                    type="text"
                    required
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    placeholder="e.g. sarah_chen"
                    className="block w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                  Access Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <Key size={14} />
                  </span>
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Choose a strong password"
                    className="block w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-primary text-on-primary font-bold rounded-xl shadow-md hover:bg-opacity-95 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{isLoading ? "Creating Account..." : "Register Account"}</span>
                <ArrowRight size={14} />
              </button>
            </form>
          )}

          {/* Quick Info Box */}
          <div className="mt-6 p-4 bg-slate-50 border border-slate-100 rounded-xl">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Sparkles size={11} className="text-indigo-gamify" />
              Dynamic Institutional Roles
            </span>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
              New teachers are automatically added to the department substitute availability roster to receive automated cover match requests!
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
