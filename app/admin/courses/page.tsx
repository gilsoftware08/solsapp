"use client";
import { useState, useEffect } from "react";
import { getStorage, setStorage, Course } from "@/lib/dataStore";

export default function AddCourse() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [newName, setNewName] = useState("");

  useEffect(() => setCourses(getStorage("courses")), []);

  const addCourse = () => {
    if (!newName) return;
    const updated = [...courses, { name: newName, id: Date.now().toString() }];
    setStorage("courses", updated);
    setCourses(updated);
    setNewName("");
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-blue-400">Course Management</h1>
      <div className="glass-card p-4 mb-6">
        <input 
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Enter Course Name (e.g. Python)"
          className="w-full bg-transparent border-b border-slate-700 p-2 mb-4 focus:outline-none focus:border-blue-500"
        />
        <button onClick={addCourse} className="w-full bg-blue-600 p-3 rounded-lg font-bold neon-btn">
          + ADD COURSE
        </button>
      </div>

      <div className="space-y-3">
        {courses.map(c => (
          <div key={c.id} className="glass-card p-4 flex justify-between items-center">
            <span className="font-medium">{c.name}</span>
            <span className="text-xs text-slate-500">Active</span>
          </div>
        ))}
      </div>
    </div>
  );
}