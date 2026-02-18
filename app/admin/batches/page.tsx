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
    <div className="p-6 min-h-screen max-w-2xl mx-auto">
      <Header title="Batch Setup" />

      <div className="glass-card p-6 space-y-6">
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Batch Name</label>
          <input 
            placeholder="e.g. Morning_Python_A" 
            className="w-full bg-slate-900 border border-slate-700 p-4 rounded-xl text-lg focus:border-emerald-500 outline-none"
            value={batchName}
            onChange={(e) => setBatchName(e.target.value)}
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Select Course</label>
          <select 
            className="w-full bg-slate-900 border border-slate-700 p-4 rounded-xl text-lg focus:border-emerald-500 outline-none appearance-none"
            onChange={(e) => handleCourseChange(e.target.value)}
          >
            <option value="">-- Choose Course --</option>
            {courses.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Assign Faculty</label>
          <select 
            className="w-full bg-slate-900 border border-slate-700 p-4 rounded-xl text-lg focus:border-emerald-500 outline-none appearance-none"
            value={selectedFaculty}
            onChange={(e) => setSelectedFaculty(e.target.value)}
            disabled={!selectedCourse}
          >
            <option value="">{selectedCourse ? "-- Choose Faculty --" : "Select Course First"}</option>
            {filteredFaculty.map((f, i) => <option key={i} value={f.name}>{f.name}</option>)}
          </select>
        </div>

        <button onClick={saveBatch} className="w-full bg-emerald-600 p-5 rounded-xl font-bold text-lg neon-btn mt-4">
          CREATE BATCH
        </button>
      </div>
    </div>
  );
}