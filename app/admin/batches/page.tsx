"use client";
import { useState, useEffect } from "react";
import { getStorage, setStorage } from "@/lib/dataStore";

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
    // Only show faculty assigned to this specific course
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
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-emerald-400">Batch Setup</h1>
      <div className="glass-card p-6 space-y-4">
        <input 
          placeholder="Batch Name (e.g. Morning_Py_1)" 
          className="w-full bg-slate-800 p-3 rounded-lg"
          value={batchName}
          onChange={(e) => setBatchName(e.target.value)}
        />

        <select 
          className="w-full bg-slate-800 p-3 rounded-lg"
          onChange={(e) => handleCourseChange(e.target.value)}
        >
          <option value="">Select Course</option>
          {courses.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
        </select>

        <select 
          className="w-full bg-slate-800 p-3 rounded-lg"
          value={selectedFaculty}
          onChange={(e) => setSelectedFaculty(e.target.value)}
          disabled={!selectedCourse}
        >
          <option value="">Select Faculty</option>
          {filteredFaculty.map((f, i) => <option key={i} value={f.name}>{f.name}</option>)}
        </select>

        <button onClick={saveBatch} className="w-full bg-emerald-600 p-4 rounded-xl font-bold neon-btn mt-4">
          CREATE BATCH
        </button>
      </div>
    </div>
  );
}