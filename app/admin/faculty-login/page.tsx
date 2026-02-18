"use client";
import { useState, useEffect } from "react";
import { getStorage, setStorage } from "@/lib/dataStore";
import Header from "@/components/Header";

export default function CreateFacultyLogin() {
  const [facultyList, setFacultyList] = useState<any[]>([]);
  const [selectedFac, setSelectedFac] = useState("");
  const [id, setId] = useState("");
  const [pass, setPass] = useState("");

  useEffect(() => setFacultyList(getStorage("faculty")), []);

  const saveLogin = () => {
    if (!selectedFac || !id || !pass) return alert("All fields are required!");
    const logins = getStorage("faculty_logins");
    logins.push({ facultyName: selectedFac, id, pass });
    setStorage("faculty_logins", logins);
    alert(`Login credentials created for ${selectedFac}`);
    setId("");
    setPass("");
  };

  return (
    <div className="p-6 min-h-screen max-w-2xl mx-auto">
      <Header title="Faculty Credentials" />
      
      <div className="glass-card p-6 space-y-6">
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Select Faculty</label>
          <select 
            className="w-full bg-slate-900 border border-slate-700 p-4 rounded-xl text-lg outline-none focus:border-pink-500"
            onChange={(e) => setSelectedFac(e.target.value)}
            value={selectedFac}
          >
            <option value="">-- Choose Name --</option>
            {facultyList.map((f, i) => <option key={i} value={f.name}>{f.name}</option>)}
          </select>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Assign User ID</label>
          <input 
            placeholder="e.g. rahul.prof" 
            className="w-full bg-slate-900 border border-slate-700 p-4 rounded-xl text-lg outline-none focus:border-pink-500"
            value={id}
            onChange={(e) => setId(e.target.value)} 
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Assign Password</label>
          <input 
            type="password" 
            placeholder="••••••" 
            className="w-full bg-slate-900 border border-slate-700 p-4 rounded-xl text-lg outline-none focus:border-pink-500"
            value={pass}
            onChange={(e) => setPass(e.target.value)} 
          />
        </div>

        <button onClick={saveLogin} className="w-full bg-pink-600 p-5 rounded-xl font-bold text-lg neon-btn mt-2">
          SAVE CREDENTIALS
        </button>
      </div>
    </div>
  );
}