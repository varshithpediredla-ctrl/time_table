/**
 * AG Grid powered Faculty table
 * 
 * SETUP:
 * npm install ag-grid-react ag-grid-community
 */

import React, { useMemo } from "react";
import { Substitute } from "../types";

// Uncomment after installing:
// import { AgGridReact } from 'ag-grid-react';
// import { ColDef } from 'ag-grid-community';
// import 'ag-grid-community/styles/ag-grid.css';
// import 'ag-grid-community/styles/ag-theme-quartz.css';

interface AgGridFacultyTableProps {
  substitutes: Substitute[];
  onDeleteFaculty: (id: string) => void;
  role: "teacher" | "hod";
}

export default function AgGridFacultyTable({ substitutes, onDeleteFaculty, role }: AgGridFacultyTableProps) {
  const columnDefs = useMemo(() => [
    {
      field: "name",
      headerName: "Faculty Member",
      flex: 1,
      cellRenderer: (params: any) => `Dr. ${params.value}`,
    },
    {
      field: "statusText",
      headerName: "Availability",
      flex: 1,
    },
    {
      field: "matchRate",
      headerName: "AI Match Rate",
      width: 140,
      cellStyle: { fontWeight: "bold", color: "#059669" },
    },
    {
      headerName: "Actions",
      width: 120,
      cellRenderer: (params: any) => {
        if (role !== "hod") return null;
        return (
          <button
            onClick={() => onDeleteFaculty(params.data.id)}
            className="text-red-500 hover:bg-red-50 px-2 py-1 rounded text-xs"
          >
            Delete
          </button>
        );
      },
    },
  ], [role, onDeleteFaculty]);

  // Placeholder until packages are installed
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-primary">Faculty Roster (AG Grid)</h3>
        <div className="bg-blue-50 border border-blue-200 text-blue-800 text-xs px-3 py-1.5 rounded-lg">
          Install ag-grid-react to activate
        </div>
      </div>

      <div className="bg-surface-container-lowest border border-slate-border rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="py-3 px-4 font-semibold text-secondary">Faculty Member</th>
              <th className="py-3 px-4 font-semibold text-secondary">Availability</th>
              <th className="py-3 px-4 font-semibold text-secondary">AI Match</th>
              {role === "hod" && <th className="py-3 px-4 font-semibold text-secondary text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y">
            {substitutes.map((sub) => (
              <tr key={sub.id} className="hover:bg-slate-50">
                <td className="py-3 px-4 font-medium">Dr. {sub.name}</td>
                <td className="py-3 px-4 text-secondary">{sub.statusText}</td>
                <td className="py-3 px-4 font-bold text-emerald-600">{sub.matchRate}</td>
                {role === "hod" && (
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => onDeleteFaculty(sub.id)}
                      className="text-red-500 hover:bg-red-50 px-2 py-1 rounded text-xs"
                    >
                      Delete
                    </button>
                  </td>
                )}
              </tr>
            ))}
            {substitutes.length === 0 && (
              <tr>
                <td colSpan={4} className="py-8 text-center text-secondary">
                  No faculty members yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="text-xs text-secondary bg-slate-50 p-3 rounded-lg">
        <strong>To activate full AG Grid features</strong> (sorting, filtering, pagination, export):
        <br />
        Run <code className="bg-white px-1 rounded border">npm install ag-grid-react ag-grid-community</code>
        then uncomment the AG Grid imports in this file.
      </div>
    </div>
  );
}
