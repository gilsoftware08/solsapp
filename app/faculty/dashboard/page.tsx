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
    <div className="p-6 min-h-screen max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <Header title="My Batches" />
        <button onClick={() => router.push("/login")} className="text-red-400 font-bold text-sm bg-red-900/20 px-4 py-2 rounded-full border border-red-900/50">
          LOGOUT
        </button>
      </div>

      <div className="space-y-4">
        {myBatches.length > 0 ? myBatches.map((batch, i) => (
          <div key={i} className="glass-card p-6 flex justify-between items-center border-l-4 border-blue-500 hover:bg-slate-800/50 transition-colors">
            <div>
              <h3 className="text-xl font-black text-white">{batch.name}</h3>
              <p className="text-blue-400 text-sm font-bold uppercase tracking-wider">{batch.courseName}</p>
            </div>
            <button 
              onClick={() => startBatch(batch)}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold text-sm neon-btn shadow-lg shadow-blue-900/50"
            >
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
  );
}