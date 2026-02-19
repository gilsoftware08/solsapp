"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getStorage } from "@/lib/dataStore";
import Header from "@/components/Header";

export default function FacultyDashboard() {
  const [myBatches, setMyBatches] = useState<any[]>([]);
  const [facultyName, setFacultyName] = useState("");
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem("currentFaculty");
    if (!user) return router.push("/login");
    
    setFacultyName(user);
    const allBatches = getStorage("batches");
    const filtered = allBatches.filter((b: any) => b.facultyName === user);
    setMyBatches(filtered);
  }, [router]);

  const startBatch = (batch: any) => {
    localStorage.setItem("activeBatch", JSON.stringify(batch));
    router.push("/faculty/session");
  };

  return (
    <div className="app-page">
      <div className="app-container">
      <div className="flex justify-between items-center mb-2 sm:mb-4">
        <Header title="My Batches" />
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => router.push("/faculty/history")}
            className="btn-ghost !w-auto px-3 sm:px-4 border-slate-700 text-slate-200"
          >
            <span className="text-xl">📋</span>
            <span className="hidden sm:inline font-black">HISTORY</span>
          </button>
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="btn-ghost !w-auto px-3 sm:px-4 border-red-900/50 text-red-200"
          >
            <span className="text-xl">⎋</span>
            <span className="hidden sm:inline font-black">LOGOUT</span>
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {myBatches.length > 0 ? myBatches.map((batch, i) => (
          <div key={i} className="glass-card p-5 sm:p-6 flex justify-between items-center border-l-4 border-blue-500 hover:bg-slate-800/40 transition-colors">
            <div>
              <h3 className="text-lg sm:text-xl font-black text-white">{batch.name}</h3>
              <p className="text-blue-300 text-xs sm:text-sm font-black uppercase tracking-wider mt-1">{batch.courseName}</p>
            </div>
            <button 
              onClick={() => startBatch(batch)}
              className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-5 sm:px-6 py-3 sm:py-4 rounded-2xl font-black text-sm sm:text-base neon-btn shadow-lg shadow-blue-900/40 min-h-12 active:scale-[0.99] transition-transform"
            >
              <span className="text-xl">▶</span>
              START
            </button>
          </div>
        )) : (
          <div className="text-center mt-20 opacity-50">
            <p className="text-xl font-bold">No Batches Found</p>
            <p className="text-sm">Contact Admin to assign batches.</p>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}