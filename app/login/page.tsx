"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [id, setId] = useState("");
  const [pass, setPass] = useState("");
  const router = useRouter();

  const handleLogin = () => {
    // 1. Check Admin (Static)
    if (id === "admin" && pass === "sols123") {
      localStorage.setItem("userRole", "admin");
      return router.push("/admin");
    }

    // 2. Check Faculty (From Local Storage)
    const facultyList = JSON.parse(localStorage.getItem("faculty_accounts") || "[]");
    const user = facultyList.find((f: any) => f.id === id && f.pass === pass);

    if (user) {
      localStorage.setItem("userRole", "faculty");
      localStorage.setItem("currentFaculty", user.name);
      return router.push("/faculty");
    }

    alert("Invalid ID or Password!");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 p-6 text-white">
      <h1 className="text-3xl font-bold mb-8 text-blue-400">SolsApp Login</h1>
      <input type="text" placeholder="User ID" className="w-full p-3 mb-4 rounded bg-slate-800 text-white" onChange={(e) => setId(e.target.value)} />
      <input type="password" placeholder="Password" className="w-full p-3 mb-6 rounded bg-slate-800 text-white" onChange={(e) => setPass(e.target.value)} />
      <button onClick={handleLogin} className="w-full bg-blue-600 p-3 rounded font-bold hover:bg-blue-500">LOGIN</button>
    </div>
  );
}