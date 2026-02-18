"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminHub() {
  const router = useRouter();
  const menu = [
    { name: "Manage Courses", path: "/admin/courses", color: "from-blue-600 to-blue-400", icon: "📚" },
    { name: "Add Faculty & Face", path: "/admin/faculty", color: "from-purple-600 to-purple-400", icon: "👨‍🏫" },
    { name: "Create Batches", path: "/admin/batches", color: "from-emerald-600 to-emerald-400", icon: "👥" },
    { name: "Register Students", path: "/admin/students", color: "from-orange-600 to-orange-400", icon: "🎓" },
    { name: "Faculty Logins", path: "/admin/faculty-login", color: "from-pink-600 to-pink-400", icon: "🔑" },
  ];

  return (
    <div className="p-6 min-h-screen max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-8 pt-4">
        <div>
          <h1 className="text-3xl font-black text-white">Admin<span className="text-blue-500">Panel</span></h1>
          <p className="text-slate-500 text-xs uppercase tracking-widest">Control Center</p>
        </div>
        <button onClick={() => router.push("/login")} className="bg-slate-800 p-3 rounded-full text-red-400 hover:bg-red-900/20 transition-colors">
          🛑
        </button>
      </div>
      
      <div className="grid gap-4">
        {menu.map((item, i) => (
          <Link key={i} href={item.path}>
            <div className={`p-6 rounded-2xl flex items-center justify-between bg-gradient-to-r ${item.color} shadow-lg hover:scale-[1.02] transition-transform active:scale-95`}>
              <div className="flex items-center gap-4">
                <span className="text-2xl bg-white/20 p-2 rounded-lg">{item.icon}</span>
                <span className="text-xl font-bold text-white">{item.name}</span>
              </div>
              <span className="text-white/50 font-bold">→</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}