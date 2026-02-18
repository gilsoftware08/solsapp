"use client";
import { useState, useEffect, useRef } from "react";
import * as faceapi from "face-api.js";
import { getStorage, setStorage } from "@/lib/dataStore";

export default function RegisterStudent() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [allBatches, setAllBatches] = useState<any[]>([]);
  const [filteredBatches, setFilteredBatches] = useState<any[]>([]);
  
  const [name, setName] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("");

  useEffect(() => {
    setCourses(getStorage("courses"));
    setAllBatches(getStorage("batches"));
    faceapi.nets.tinyFaceDetector.loadFromUri('/models');
    faceapi.nets.faceLandmark68Net.loadFromUri('/models');
    faceapi.nets.faceRecognitionNet.loadFromUri('/models');
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } }).then(s => { if(videoRef.current) videoRef.current.srcObject = s; });
  }, []);

  const handleCourseChange = (courseName: string) => {
    setSelectedCourse(courseName);
    const batches = allBatches.filter(b => b.courseName === courseName);
    setFilteredBatches(batches);
  };

  const registerStudent = async () => {
    if (!name || !selectedBatch) return alert("Missing info!");
    const detect = await faceapi.detectSingleFace(videoRef.current!, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptor();
    if (!detect) return alert("Face not detected!");

    const students = getStorage("students");
    students.push({
      name,
      courseName: selectedCourse,
      batchName: selectedBatch,
      descriptor: Array.from(detect.descriptor)
    });
    setStorage("students", students);
    alert("Student Registered Successfully!");
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-orange-400">Student Enrollment</h1>
      <video ref={videoRef} autoPlay muted className="w-full h-40 object-cover rounded-2xl mb-4 border-2 border-orange-500 shadow-lg shadow-orange-900/20" />
      
      <div className="space-y-3">
        <input placeholder="Student Full Name" className="w-full bg-slate-800 p-3 rounded-lg" onChange={(e) => setName(e.target.value)} />
        
        <select className="w-full bg-slate-800 p-3 rounded-lg" onChange={(e) => handleCourseChange(e.target.value)}>
          <option value="">Choose Course</option>
          {courses.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
        </select>

        <select className="w-full bg-slate-800 p-3 rounded-lg" onChange={(e) => setSelectedBatch(e.target.value)} disabled={!selectedCourse}>
          <option value="">Choose Batch</option>
          {filteredBatches.map((b, i) => <option key={i} value={b.name}>{b.name}</option>)}
        </select>

        <button onClick={registerStudent} className="w-full bg-orange-600 p-4 rounded-xl font-bold neon-btn text-lg">
          ENROLL STUDENT & SCAN FACE
        </button>
      </div>
    </div>
  );
}