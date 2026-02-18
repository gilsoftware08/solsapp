"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateFaculty() {
  const [name, setName] = useState("");
  const [id, setId] = useState("");
  const [pass, setPass] = useState("");
  const router = useRouter();

  const handleSave = () => {
    if (!name || !id || !pass) return alert("Fill all fields!");
    
    const existing = JSON.parse(localStorage.getItem("faculty_accounts") || "[]");
    existing.push({ name, id, pass });
    localStorage.setItem("faculty_accounts", JSON.stringify(existing));
    
    alert("Faculty Account Created!");
    router.push("/admin");
  };

  return (
    <div className="p-6 bg-slate-900 min-h-screen text-white">
      <h1 className="text-2xl font-bold mb-6 text-blue-400">New Faculty Account</h1>
      <input type="text" placeholder="Faculty Full Name" className="w-full p-3 mb-4 rounded bg-slate-800" onChange={(e) => setName(e.target.value)} />
      <input type="text" placeholder="Set User ID" className="w-full p-3 mb-4 rounded bg-slate-800" onChange={(e) => setId(e.target.value)} />
      <input type="text" placeholder="Set Password" className="w-full p-3 mb-6 rounded bg-slate-800" onChange={(e) => setPass(e.target.value)} />
      <button onClick={handleSave} className="w-full bg-green-600 p-3 rounded font-bold">SAVE ACCOUNT</button>
      <button onClick={() => router.back()} className="w-full mt-4 text-slate-400">Cancel</button>
    </div>
  );
}