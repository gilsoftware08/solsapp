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
    <div className="app-page flex items-center">
      <div className="app-container w-full">
        <div className="mx-auto w-full max-w-md">
          <div className="glass-card p-6 sm:p-8 border border-slate-800 shadow-2xl shadow-blue-900/20">
            <div className="text-center mb-8 sm:mb-10">
              <div className="inline-flex items-center justify-center mb-4">
                <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-3xl bg-blue-500/15 border border-blue-500/25 grid place-items-center">
                  <span className="text-2xl sm:text-3xl">🔒</span>
                </div>
              </div>
              <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white mb-2">
                SOLS<span className="text-blue-400">APP</span>
              </h1>
              <p className="app-subtitle">Biometric Attendance System</p>
            </div>

            <div className="space-y-4 sm:space-y-5">
              <div>
                <label className="app-label">System ID</label>
                <input
                  type="text"
                  placeholder="e.g. admin / rahul.prof"
                  className="app-input"
                  onChange={(e) => setId(e.target.value)}
                  value={id}
                  inputMode="text"
                />
              </div>
              
              <div>
                <label className="app-label">Access Key</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="app-input"
                  onChange={(e) => setPass(e.target.value)}
                  value={pass}
                />
              </div>

              <button
                onClick={handleLogin}
                disabled={isLoading}
                className="btn-primary neon-btn mt-2 disabled:opacity-70"
              >
                <span className="text-xl">→</span>
                {isLoading ? "AUTHENTICATING..." : "SIGN IN"}
              </button>
            </div>
          </div>

          <p className="mt-6 sm:mt-8 text-slate-500 text-[11px] sm:text-xs uppercase tracking-[0.22em] text-center">
            Secure Terminal // Offline Mode
          </p>
        </div>
      </div>
    </div>
  );
}