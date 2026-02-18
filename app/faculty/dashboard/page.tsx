"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getStorage } from "@/lib/dataStore";

export default function FacultyDashboard() {
  const [myBatches, setMyBatches] = useState<any[]>([]);
  const [facultyName, setFacultyName] = useState("");
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem("currentFaculty");
    if (!user) return router.push("/login");
    
    setFacultyName(user);
    const allBatches = getStorage("batches");
    // Filter batches where this faculty is assigned
    const filtered = allBatches.filter((b: any) => b.facultyName === user);
    setMyBatches(filtered);
  }, [router]);

  const startBatch = (batch: any) => {
    localStorage.setItem("activeBatch", JSON.stringify(batch));
    router.push("/faculty/session");
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-blue-400">My Batches</h1>
        <button onClick={() => router.push("/login")} className="text-red-400 text-sm">Logout</button>
      </div>

      <div className="grid gap-4">
        {myBatches.length > 0 ? myBatches.map((batch, i) => (
          <div key={i} className="glass-card p-6 flex justify-between items-center border-l-4 border-blue-500">
            <div>
              <h3 className="text-lg font-bold">{batch.name}</h3>
              <p className="text-slate-400 text-sm">{batch.courseName}</p>
            </div>
            <button 
              onClick={() => startBatch(batch)}
              className="bg-blue-600 px-4 py-2 rounded-lg font-bold text-sm neon-btn"
            >
              OPEN
            </button>
          </div>
        )) : (
          <p className="text-slate-500 text-center mt-10">No batches assigned to you.</p>
        )}
      </div>
    </div>
  );
}