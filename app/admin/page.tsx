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
    <div className="app-page">
      <div className="app-container">
      <div className="flex justify-between items-center mb-6 sm:mb-8">
        <div>
          <h1 className="app-title">
            Admin<span className="text-blue-400">Panel</span>
          </h1>
          <p className="app-subtitle mt-1">Control Center</p>
        </div>
        <button
          type="button"
          onClick={() => router.push("/login")}
          className="btn-ghost !w-auto px-4"
          aria-label="Logout"
        >
          <span className="text-xl">🛑</span>
          <span className="hidden sm:inline font-black">LOGOUT</span>
        </button>
      </div>
      
      <div className="grid gap-3 sm:gap-4">
        {menu.map((item, i) => (
          <Link key={i} href={item.path}>
            <div
              className={`p-5 sm:p-6 rounded-3xl flex items-center justify-between bg-gradient-to-r ${item.color} shadow-lg hover:scale-[1.01] transition-transform active:scale-[0.99]`}
            >
              <div className="flex items-center gap-4 min-w-0">
                <span className="text-3xl sm:text-4xl bg-white/20 px-3 py-2 rounded-2xl shrink-0">
                  {item.icon}
                </span>
                <span className="text-lg sm:text-xl font-black text-white truncate">
                  {item.name}
                </span>
              </div>
              <span className="text-white/60 font-black text-2xl">→</span>
            </div>
          </Link>
        ))}
      </div>
      </div>
    </div>
  );
}