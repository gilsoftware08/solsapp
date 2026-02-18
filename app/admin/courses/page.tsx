"use client";
import { useState, useEffect } from "react";
import { getStorage, setStorage, Course } from "@/lib/dataStore";
import Header from "@/components/Header";

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
    <div className="p-6 min-h-screen max-w-2xl mx-auto">
      <Header title="Manage Courses" />

      <div className="glass-card p-6 mb-8">
        <label className="text-sm text-slate-400 uppercase font-bold tracking-wider mb-2 block">New Course Name</label>
        <div className="flex flex-col gap-4">
          <input 
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="e.g. Python Programming"
            className="w-full bg-slate-900 border border-slate-700 p-4 rounded-xl text-lg focus:border-blue-500 focus:outline-none transition-colors"
          />
          <button onClick={addCourse} className="w-full bg-blue-600 p-4 rounded-xl font-bold text-lg neon-btn tracking-wide">
            + ADD COURSE
          </button>
        </div>
      </div>

      <h3 className="text-slate-500 font-bold mb-4 uppercase text-sm">Active Courses ({courses.length})</h3>
      <div className="grid gap-3">
        {courses.map(c => (
          <div key={c.id} className="glass-card p-5 flex justify-between items-center border-l-4 border-blue-500">
            <span className="font-bold text-lg">{c.name}</span>
            <span className="bg-blue-500/20 text-blue-300 text-xs px-3 py-1 rounded-full">Active</span>
          </div>
        ))}
      </div>
    </div>
  );
}