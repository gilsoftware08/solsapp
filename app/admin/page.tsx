"use client";
import Link from "next/link";

export default function AdminDashboard() {
  return (
    <div className="p-6 bg-slate-900 min-h-screen text-white">
      <h1 className="text-2xl font-bold mb-6 border-b border-slate-700 pb-2">Admin Dashboard</h1>
      <div className="grid grid-cols-1 gap-4">
        <Link href="/admin/create-faculty" className="bg-slate-800 p-4 rounded-lg flex justify-between items-center">
          <span>Create Faculty Account</span>
          <span className="text-blue-400">→</span>
        </Link>
        <Link href="/admin/register" className="bg-slate-800 p-4 rounded-lg flex justify-between items-center">
          <span>Register Student Face</span>
          <span className="text-blue-400">→</span>
        </Link>
        <Link href="/login" className="mt-10 text-center text-red-400">Logout</Link>
      </div>
    </div>
  );
}