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
    <div className="app-page">
      <div className="app-container">
        <Header title="Faculty Credentials" />
        
        <div className="app-card space-y-4 sm:space-y-6">
          <div>
            <label className="app-label">Select Faculty</label>
            <select 
              className="app-select focus:ring-pink-500/50 focus:border-pink-500/50"
              onChange={(e) => setSelectedFac(e.target.value)}
              value={selectedFac}
            >
              <option value="">-- Choose Name --</option>
              {facultyList.map((f, i) => (
                <option key={i} value={f.name}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="app-label">Assign User ID</label>
            <input 
              placeholder="e.g. rahul.prof" 
              className="app-input focus:ring-pink-500/50 focus:border-pink-500/50"
              value={id}
              onChange={(e) => setId(e.target.value)} 
            />
          </div>

          <div>
            <label className="app-label">Assign Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              className="app-input focus:ring-pink-500/50 focus:border-pink-500/50"
              value={pass}
              onChange={(e) => setPass(e.target.value)} 
            />
          </div>

          <button onClick={saveLogin} className="btn neon-btn bg-pink-600 text-white mt-1">
            <span className="text-xl">💾</span>
            SAVE CREDENTIALS
          </button>
        </div>
      </div>
    </div>
  );
}