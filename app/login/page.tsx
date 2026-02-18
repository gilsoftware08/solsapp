"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { getStorage } from "@/lib/dataStore";

export default function LoginPage() {
  const [id, setId] = useState("");
  const [pass, setPass] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = () => {
    setIsLoading(true);
    
    // 1. Check Admin (Static Credentials)
    if (id === "admin" && pass === "sols123") {
      localStorage.setItem("userRole", "admin");
      return router.push("/admin");
    }

    // 2. Check Faculty Credentials (From the new dataStore)
    const facultyLogins = getStorage("faculty_logins");
    const user = facultyLogins.find((f: any) => f.id === id && f.pass === pass);

    if (user) {
      localStorage.setItem("userRole", "faculty");
      localStorage.setItem("currentFaculty", user.facultyName); // Links to their registered name
      return router.push("/faculty/dashboard"); // Redirects to the new Pro dashboard
    }

    alert("Access Denied: Invalid Credentials");
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <div className="glass-card p-8 w-full max-w-sm border-t-2 border-blue-500/50 shadow-2xl shadow-blue-900/20">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black tracking-tighter text-white mb-2">
            SOLS<span className="text-blue-500">APP</span>
          </h1>
          <p className="text-slate-500 text-xs uppercase tracking-[0.2em]">Biometric Attendance System</p>
        </div>

        <div className="space-y-4">
          <div className="group">
            <input 
              type="text" 
              placeholder="System ID" 
              className="w-full bg-slate-900/50 border border-slate-800 p-4 rounded-xl text-white focus:border-blue-500 focus:outline-none transition-all"
              onChange={(e) => setId(e.target.value)} 
            />
          </div>
          
          <div className="group">
            <input 
              type="password" 
              placeholder="Access Key" 
              className="w-full bg-slate-900/50 border border-slate-800 p-4 rounded-xl text-white focus:border-blue-500 focus:outline-none transition-all"
              onChange={(e) => setPass(e.target.value)} 
            />
          </div>

          <button 
            onClick={handleLogin} 
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-500 p-4 rounded-xl font-black text-white neon-btn mt-6 flex items-center justify-center gap-2"
          >
            {isLoading ? "AUTHENTICATING..." : "AUTHORIZE ACCESS →"}
          </button>
        </div>
      </div>

      <p className="mt-8 text-slate-600 text-[10px] uppercase tracking-widest">
        Secure Terminal v2.0 // Ahmedabad Campus
      </p>
    </div>
  );
}