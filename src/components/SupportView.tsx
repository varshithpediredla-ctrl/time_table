import React, { useState } from "react";
import { HelpCircle, Mail, MessageSquare, BookOpen, AlertCircle, CheckCircle2 } from "lucide-react";

export default function SupportView() {
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formMessage, setFormMessage] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formEmail || !formMessage) return;
    setIsSubmitted(true);
    setFormName("");
    setFormEmail("");
    setFormMessage("");
    setTimeout(() => setIsSubmitted(false), 5000);
  };

  const faqs = [
    {
      q: "How does the role-based access control work?",
      a: "Teachers have access to their personal dashboard, can file leave requests, propose coverage to colleagues, and manage their own classes. HOD Control elevates permissions to allow roster management (adding/deleting professors), timetable planning, and approving leaves."
    },
    {
      q: "What does 'Syllabus Match Rate' mean?",
      a: "Our AI recommendation system evaluates substitute faculty based on their historical expertise, research mapping, and course alignment to suggest the best possible covering professor."
    },
    {
      q: "Can I undo schedule optimizations?",
      a: "Yes. If you apply an AI-optimized schedule and want to restore the original demonstrator conflicts for testing, go to the 'Settings' tab and click 'Reset Application Database'."
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in select-none font-sans">
      <div>
        <h2 className="text-3xl font-extrabold text-primary tracking-tight">Support & Help Center</h2>
        <p className="text-[14px] text-secondary font-sans mt-1">
          Explore documentation, frequently asked questions, or contact the administrative tech support team.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* FAQs */}
        <div className="lg:col-span-7 bg-surface-container-lowest border border-slate-border rounded-xl p-6 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-primary flex items-center gap-2">
            <BookOpen size={20} className="text-indigo-gamify" />
            Frequently Asked Questions
          </h3>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="p-4 bg-slate-50/60 rounded-xl border border-slate-100">
                <h4 className="text-[13.5px] font-bold text-slate-800 flex items-start gap-2">
                  <HelpCircle size={16} className="text-primary shrink-0 mt-0.5" />
                  <span>{faq.q}</span>
                </h4>
                <p className="text-[12.5px] text-slate-600 mt-2 leading-relaxed pl-6">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-5 bg-surface-container-lowest border border-slate-border rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-primary flex items-center gap-2">
              <MessageSquare size={18} className="text-primary" />
              Contact Administration
            </h3>
            <p className="text-[12px] text-secondary leading-relaxed">
              Have questions regarding timetable compliance or roster edits? Send a direct secure ticket to the system admin.
            </p>

            {isSubmitted ? (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center space-y-2 py-6">
                <CheckCircle2 className="mx-auto text-emerald-500" size={32} />
                <h4 className="text-[13px] font-bold text-emerald-800">Ticket Submitted Successfully</h4>
                <p className="text-[11px] text-emerald-600">Our administrative support team will review and reply within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3 text-[12.5px]">
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wide">Your Name</label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Dr. Elena Kostic"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wide">Institutional Email</label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="e.g. elena.kostic@university.edu"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wide">Message / Request</label>
                  <textarea
                    value={formMessage}
                    onChange={(e) => setFormMessage(e.target.value)}
                    placeholder="Describe your query or platform request..."
                    required
                    rows={3}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-primary text-on-primary font-bold rounded-lg hover:opacity-90 active:scale-[0.99] transition-all cursor-pointer text-center flex items-center justify-center gap-1.5"
                >
                  <Mail size={14} />
                  <span>Send Ticket</span>
                </button>
              </form>
            )}
          </div>

          <div className="mt-6 p-3 bg-indigo-gamify/5 border border-indigo-gamify/10 rounded-xl flex gap-2.5 text-[11px] leading-relaxed text-slate-600">
            <AlertCircle size={18} className="text-indigo-gamify shrink-0" />
            <p>
              SmartDyn Admin version 2.4.0. Operational support desk operates Monday to Friday, 09:00 - 18:00 UTC.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
