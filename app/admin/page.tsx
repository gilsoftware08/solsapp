"use client";
import Link from "next/link";

export default function AdminHub() {
  const menu = [
    { name: "1. Manage Courses", path: "/admin/courses", color: "from-blue-500 to-cyan-500" },
    { name: "2. Add Faculty & Face", path: "/admin/faculty", color: "from-purple-500 to-pink-500" },
    { name: "3. Create Batches", path: "/admin/batches", color: "from-emerald-500 to-teal-500" },
    { name: "4. Register Students", path: "/admin/students", color: "from-orange-500 to-amber-500" },
    { name: "5. Faculty Login Creds", path: "/admin/faculty-login", color: "from-red-500 to-rose-500" },
  ];

  return (
    <div className="p-6 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
          Admin Control
        </h1>
        <Link href="/login" className="text-red-400 text-sm font-bold">Logout</Link>
      </div>
      
      <div className="grid gap-4">
        {menu.map((item, i) => (
          <Link key={i} href={item.path}>
            <div className={`glass-card p-6 flex items-center bg-gradient-to-r ${item.color} hover:scale-105 transition-transform`}>
              <span className="text-xl font-bold text-white">{item.name}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}