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
    <div className="app-page">
      <div className="app-container">
      <Header title="Manage Courses" />

      <div className="app-card mb-6 sm:mb-8">
        <label className="app-label">New Course Name</label>
        <div className="flex flex-col gap-3 sm:gap-4">
          <input 
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="e.g. Python Programming"
            className="app-input"
          />
          <button onClick={addCourse} className="btn-primary neon-btn">
            <span className="text-xl">＋</span>
            ADD COURSE
          </button>
        </div>
      </div>

      <h3 className="app-subtitle mb-3 sm:mb-4">
        Active Courses ({courses.length})
      </h3>
      <div className="grid gap-3">
        {courses.map(c => (
          <div
            key={c.id}
            className="glass-card p-5 sm:p-6 flex justify-between items-center border-l-4 border-blue-500"
          >
            <span className="font-black text-base sm:text-lg">{c.name}</span>
            <span className="bg-blue-500/20 text-blue-200 text-[11px] sm:text-xs px-3 py-1 rounded-full font-black">
              Active
            </span>
          </div>
        ))}
      </div>
      </div>
    </div>
  );
}