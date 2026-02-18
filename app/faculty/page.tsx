"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function FacultyDashboard() {
  const [facultyName, setFacultyName] = useState("");
  const router = useRouter();

  useEffect(() => {
    setFacultyName(localStorage.getItem("currentFaculty") || "Faculty");
  }, []);

  return (
    <div className="p-6 bg-slate-900 min-h-screen text-white">
      <div className="flex justify-between items-center mb-8 border-b border-slate-700 pb-4">
        <h1 className="text-xl font-bold">Welcome, {facultyName}</h1>
        <button onClick={() => router.push("/login")} className="text-red-400 text-sm">Logout</button>
      </div>

      <div className="bg-blue-600 p-8 rounded-2xl text-center shadow-lg mb-6">
        <h2 className="text-lg mb-4">Ready for today's lecture?</h2>
        <Link href="/faculty/session" className="bg-white text-blue-600 px-8 py-3 rounded-full font-bold text-lg inline-block">
          START NEW SESSION
        </Link>
      </div>

      <div className="bg-slate-800 p-4 rounded-lg">
        <h3 className="text-slate-400 text-sm mb-2">Previous Sessions</h3>
        <p className="text-slate-500 text-center py-4">No recent history</p>
      </div>
    </div>
  );
}