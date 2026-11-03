/**
 * Bryntum Scheduler version of the Timetable view
 * 
 * SETUP:
 * 1. npm install @bryntum/scheduler @bryntum/scheduler-react
 * 2. Get free 45-day trial license from https://bryntum.com
 * 3. Replace TimetableView with this component in App.tsx
 */

import React, { useRef, useEffect } from "react";
import { ScheduleItem } from "../types";

// Uncomment after installing the packages:
// import { BryntumScheduler } from '@bryntum/scheduler-react';
// import { Scheduler } from '@bryntum/scheduler';
// import '@bryntum/scheduler/scheduler.stockholm.css';

interface BryntumTimetableViewProps {
  schedule: ScheduleItem[];
  setSchedule: React.Dispatch<React.SetStateAction<ScheduleItem[]>>;
  role: "teacher" | "hod";
}

export default function BryntumTimetableView({ schedule, setSchedule, role }: BryntumTimetableViewProps) {
  const schedulerRef = useRef<any>(null);

  // Convert your schedule data into Bryntum event format
  const events = schedule.map((slot) => {
    const [start, end] = slot.time.split(" - ");
    const dayMap: Record<string, number> = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 0 };
    
    // Simple date calculation for current week (you can improve this)
    const today = new Date();
    const dayOfWeek = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    
    const eventDate = new Date(monday);
    eventDate.setDate(monday.getDate() + (dayMap[slot.day] || 1) - 1);

    const [startH, startM] = start.split(":").map(Number);
    const [endH, endM] = end.split(":").map(Number);

    const startDate = new Date(eventDate);
    startDate.setHours(startH, startM, 0);

    const endDate = new Date(eventDate);
    endDate.setHours(endH, endM, 0);

    return {
      id: slot.id,
      name: `${slot.subject} (${slot.room})`,
      startDate,
      endDate,
      resourceId: slot.professor || "Elena Kostic",
      eventColor: slot.status === "conflict" ? "orange" : slot.status === "burnout" ? "red" : "green",
      credits: slot.credits,
      status: slot.status,
      conflictText: slot.conflictText,
    };
  });

  const resources = [
    { id: "Elena Kostic", name: "Dr. Elena Kostic" },
    // Add more professors dynamically from your substitutes list
  ];

  // Placeholder UI until Bryntum packages are installed
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-extrabold text-primary tracking-tight">
            Timetable (Bryntum Scheduler)
          </h2>
          <p className="text-[14px] text-secondary mt-1">
            Professional drag-and-drop scheduler powered by Bryntum
          </p>
        </div>
        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs px-3 py-1.5 rounded-lg">
          Install @bryntum/scheduler to activate full view
        </div>
      </div>

      <div className="bg-surface-container-lowest border border-slate-border rounded-xl p-8 text-center">
        <div className="max-w-lg mx-auto space-y-4">
          <h3 className="text-lg font-bold text-primary">Bryntum Scheduler Ready</h3>
          <p className="text-sm text-secondary">
            Your schedule data has been prepared for Bryntum ({events.length} events).
          </p>
          <div className="bg-slate-50 rounded-lg p-4 text-left text-xs font-mono overflow-auto max-h-64">
            <pre>{JSON.stringify(events.slice(0, 3), null, 2)}</pre>
            {events.length > 3 && <p className="text-secondary mt-2">...and {events.length - 3} more</p>}
          </div>
          <div className="pt-4 text-left text-sm space-y-2">
            <p className="font-semibold">Next steps:</p>
            <ol className="list-decimal list-inside text-secondary space-y-1">
              <li>Run: <code className="bg-slate-100 px-1 rounded">npm install @bryntum/scheduler @bryntum/scheduler-react</code></li>
              <li>Get free trial license at <a href="https://bryntum.com" className="text-primary underline" target="_blank">bryntum.com</a></li>
              <li>Uncomment the Bryntum imports in this file</li>
              <li>Replace <code>TimetableView</code> with <code>BryntumTimetableView</code> in App.tsx</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
