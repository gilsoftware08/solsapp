"use client";
import { useState, useEffect } from "react";
import { getStorage, setStorage } from "@/lib/dataStore";
import Header from "@/components/Header";

export default function CreateFacultyLogin() {
  const [facultyList, setFacultyList] = useState<any[]>([]);
  const [selectedFac, setSelectedFac] = useState("");
  const [id, setId] = useState("");
  const [pass, setPass] = useState("");
  const [logins, setLogins] = useState<any[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editId, setEditId] = useState("");
  const [editPass, setEditPass] = useState("");

  useEffect(() => {
    setFacultyList(getStorage("faculty"));
    setLogins(getStorage("faculty_logins"));
  }, []);

  const saveLogin = () => {
    if (!selectedFac || !id || !pass) return alert("All fields are required!");
    const next = [...logins, { facultyName: selectedFac, id, pass }];
    setLogins(next);
    setStorage("faculty_logins", next);
    alert(`Login credentials created for ${selectedFac}`);
    setId("");
    setPass("");
  };

  const startEdit = (index: number) => {
    const row = logins[index];
    setEditingIndex(index);
    setEditId(row.id);
    setEditPass(row.pass);
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditId("");
    setEditPass("");
  };

  const saveEdit = () => {
    if (editingIndex === null) return;
    if (!editId || !editPass) {
      alert("ID and Password cannot be empty.");
      return;
    }
    const updated = logins.map((row, i) =>
      i === editingIndex ? { ...row, id: editId, pass: editPass } : row
    );
    setLogins(updated);
    setStorage("faculty_logins", updated);
    cancelEdit();
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

        {/* Existing credentials table */}
        <div className="mt-6">
          <h3 className="app-subtitle mb-3 sm:mb-4">
            Existing Credentials ({logins.length})
          </h3>

          {logins.length === 0 ? (
            <p className="text-slate-500 text-sm">No credentials created yet.</p>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {logins.map((row, index) => {
                const isEditing = editingIndex === index;
                return (
                  <div
                    key={`${row.facultyName}-${row.id}-${index}`}
                    className="glass-card p-4 sm:p-5 flex flex-col gap-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-black text-sm sm:text-base">
                        {row.facultyName}
                      </p>
                      {!isEditing && (
                        <button
                          type="button"
                          onClick={() => startEdit(index)}
                          className="btn-ghost !w-auto px-3 py-1 text-xs sm:text-sm"
                        >
                          Edit
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="app-label">User ID</label>
                        {isEditing ? (
                          <input
                            className="app-input text-sm"
                            value={editId}
                            onChange={(e) => setEditId(e.target.value)}
                          />
                        ) : (
                          <p className="text-slate-200 text-sm break-all">
                            {row.id}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="app-label">Password</label>
                        {isEditing ? (
                          <input
                            className="app-input text-sm"
                            value={editPass}
                            type="text"
                            onChange={(e) => setEditPass(e.target.value)}
                          />
                        ) : (
                          <p className="text-slate-200 text-sm">
                            {"*".repeat(Math.max(4, row.pass.length))}
                          </p>
                        )}
                      </div>
                    </div>

                    {isEditing && (
                      <div className="flex gap-3 justify-end">
                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="btn-ghost !w-auto px-3 py-2 text-xs sm:text-sm"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={saveEdit}
                          className="btn neon-btn bg-pink-600 text-white !w-auto px-4 py-2 text-xs sm:text-sm"
                        >
                          Save
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}