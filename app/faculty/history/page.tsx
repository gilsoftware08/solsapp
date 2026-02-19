"use client";
import { useState, useEffect } from "react";
import { getStorage } from "@/lib/dataStore";
import Header from "@/components/Header";

export default function FacultyHistory() {
  const [reports, setReports] = useState<any[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  useEffect(() => {
    const stored = getStorage("attendance_history");
    if (!Array.isArray(stored)) {
      setReports([]);
      return;
    }
    setReports([...stored].reverse()); // newest first, non-mutating
  }, []);

  const toggleExpand = (index: number) => {
    setExpandedIndex((prev) => (prev === index ? null : index));
  };

  return (
    <div className="app-page">
      <div className="app-container">
        <Header title="Session History" />

        {reports.length === 0 ? (
          <p className="text-slate-500 text-sm">
            No attendance reports generated yet.
          </p>
        ) : (
          <div className="space-y-3">
            {reports.map((r, index) => {
              const batchName = r.batchName ?? "Unknown Batch";
              const courseName = r.courseName ?? "";
              const date = r.date ?? new Date().toLocaleDateString();
              const startTime = r.startTime ?? "--";
              const endTime = r.endTime ?? "--";
              const durationLabel = r.durationLabel ?? "";
              const studentList = Array.isArray(r.studentList) ? r.studentList : [];

              return (
              <div
                key={index}
                className="glass-card p-4 sm:p-5 space-y-3 border border-slate-800"
              >
                <button
                  type="button"
                  onClick={() => toggleExpand(index)}
                  className="w-full flex items-center justify-between text-left"
                >
                  <div className="min-w-0">
                    <p className="font-black text-sm sm:text-base truncate">
                      {batchName}
                    </p>
                    <p className="text-[11px] sm:text-xs text-slate-400 truncate">
                      {courseName} • {date} • {startTime} - {endTime}
                    </p>
                  </div>
                  <span className="text-xs sm:text-sm text-slate-300 font-mono ml-3 shrink-0">
                    {durationLabel}
                  </span>
                </button>

                {expandedIndex === index && studentList.length > 0 && (
                  <div className="mt-3 border-t border-slate-700 pt-3">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-[11px] sm:text-xs text-slate-400 uppercase tracking-wide">
                        Students
                      </p>
                      <p className="text-[11px] sm:text-xs text-slate-300">
                        P:{" "}
                        {studentList.filter((s: any) => s.status === "P").length}{" "}
                        / {studentList.length}
                      </p>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      <table className="w-full text-xs sm:text-sm">
                        <thead>
                          <tr className="text-slate-400 border-b border-slate-700">
                            <th className="text-left py-1 pr-2">Name</th>
                            <th className="text-left py-1 pl-2">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {studentList.map(
                            (s: any, i: number) => (
                              <tr
                                key={i}
                                className="border-b border-slate-800/60"
                              >
                                <td className="py-1 pr-2">
                                  {s.name}
                                </td>
                                <td className="py-1 pl-2">
                                  {s.status === "P" ? (
                                    <span className="text-emerald-400 font-bold">
                                      P
                                    </span>
                                  ) : (
                                    <span className="text-red-400 font-bold">
                                      A
                                    </span>
                                  )}
                                </td>
                              </tr>
                            )
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

