"use client";
import { useState, useEffect } from "react";
import { getStorage, setStorage } from "@/lib/dataStore";
import Header from "@/components/Header";

export default function CreateBatch() {
  const [courses, setCourses] = useState<any[]>([]);
  const [allFaculty, setAllFaculty] = useState<any[]>([]);
  const [filteredFaculty, setFilteredFaculty] = useState<any[]>([]);
  
  const [batchName, setBatchName] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedFaculty, setSelectedFaculty] = useState("");

  useEffect(() => {
    setCourses(getStorage("courses"));
    setAllFaculty(getStorage("faculty"));
  }, []);

  const handleCourseChange = (courseName: string) => {
    setSelectedCourse(courseName);
    const assigned = allFaculty.filter(f => f.assignedCourses.includes(courseName));
    setFilteredFaculty(assigned);
    setSelectedFaculty(""); 
  };

  const saveBatch = () => {
    if (!batchName || !selectedCourse || !selectedFaculty) return alert("Fill all fields!");
    const batches = getStorage("batches");
    batches.push({ name: batchName, courseName: selectedCourse, facultyName: selectedFaculty });
    setStorage("batches", batches);
    alert("Batch Created!");
    setBatchName("");
  };

  return (
    <div className="app-page">
      <div className="app-container">
        <Header title="Batch Setup" />

        <div className="app-card space-y-4 sm:space-y-6">
          <div>
            <label className="app-label">Batch Name</label>
            <input 
              placeholder="e.g. Morning_Python_A" 
              className="app-input focus:ring-emerald-500/50 focus:border-emerald-500/50"
              value={batchName}
              onChange={(e) => setBatchName(e.target.value)}
            />
          </div>

          <div>
            <label className="app-label">Select Course</label>
            <select 
              className="app-select focus:ring-emerald-500/50 focus:border-emerald-500/50"
              onChange={(e) => handleCourseChange(e.target.value)}
              value={selectedCourse}
            >
              <option value="">-- Choose Course --</option>
              {courses.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="app-label">Assign Faculty</label>
            <select 
              className="app-select focus:ring-emerald-500/50 focus:border-emerald-500/50 disabled:opacity-60"
              value={selectedFaculty}
              onChange={(e) => setSelectedFaculty(e.target.value)}
              disabled={!selectedCourse}
            >
              <option value="">
                {selectedCourse ? "-- Choose Faculty --" : "Select Course First"}
              </option>
              {filteredFaculty.map((f, i) => (
                <option key={i} value={f.name}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>

          <button onClick={saveBatch} className="btn-success neon-btn mt-1">
            <span className="text-xl">＋</span>
            CREATE BATCH
          </button>
        </div>
      </div>
    </div>
  );
}