"use client";
import { useState, useEffect } from "react";
import { getStorage, setStorage } from "@/lib/dataStore";

export default function CreateFacultyLogin() {
  const [facultyList, setFacultyList] = useState<any[]>([]);
  const [selectedFac, setSelectedFac] = useState("");
  const [id, setId] = useState("");
  const [pass, setPass] = useState("");

  useEffect(() => setFacultyList(getStorage("faculty")), []);

  const saveLogin = () => {
    const logins = getStorage("faculty_logins");
    logins.push({ facultyName: selectedFac, id, pass });
    setStorage("faculty_logins", logins);
    alert(`Login credentials created for ${selectedFac}`);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-pink-400">Faculty Credentials</h1>
      <div className="glass-card p-6 space-y-4">
        <select className="w-full bg-slate-800 p-3 rounded-lg" onChange={(e) => setSelectedFac(e.target.value)}>
          <option value="">Select Faculty Name</option>
          {facultyList.map((f, i) => <option key={i} value={f.name}>{f.name}</option>)}
        </select>
        <input placeholder="Create User ID" className="w-full bg-slate-800 p-3 rounded-lg" onChange={(e) => setId(e.target.value)} />
        <input type="password" placeholder="Create Password" className="w-full bg-slate-800 p-3 rounded-lg" onChange={(e) => setPass(e.target.value)} />
        <button onClick={saveLogin} className="w-full bg-pink-600 p-4 rounded-xl font-bold neon-btn">
          SUBMIT CREDENTIALS
        </button>
      </div>
    </div>
  );
}