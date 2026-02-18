"use client";
import { useState, useEffect, useRef } from "react";
import * as faceapi from "face-api.js";
import { getStorage, setStorage } from "@/lib/dataStore";
import Header from "@/components/Header";

export default function RegisterStudent() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [allBatches, setAllBatches] = useState<any[]>([]);
  const [filteredBatches, setFilteredBatches] = useState<any[]>([]);
  const [status, setStatus] = useState("Initializing Camera...");
  
  const [name, setName] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("");

  useEffect(() => {
    setCourses(getStorage("courses"));
    setAllBatches(getStorage("batches"));
    const loadAI = async () => {
      await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
      await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
      await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
      startCamera();
    };
    loadAI();
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setStatus("Ready to Scan");
      }
    } catch (e) {
      setStatus("Camera Denied. Check Permissions.");
    }
  };

  const handleCourseChange = (courseName: string) => {
    setSelectedCourse(courseName);
    const batches = allBatches.filter(b => b.courseName === courseName);
    setFilteredBatches(batches);
  };

  const registerStudent = async () => {
    if (!name || !selectedBatch) return alert("Missing info!");
    const detect = await faceapi.detectSingleFace(videoRef.current!, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptor();
    if (!detect) return alert("Face not detected! Please ask student to look at camera.");

    const students = getStorage("students");
    students.push({
      name,
      courseName: selectedCourse,
      batchName: selectedBatch,
      descriptor: Array.from(detect.descriptor)
    });
    setStorage("students", students);
    alert("Student Registered Successfully!");
    setName("");
  };

  return (
    <div className="p-6 min-h-screen max-w-2xl mx-auto">
      <Header title="Enroll Student" />
      
      <div className="relative mb-6">
        <video 
          ref={videoRef} 
          autoPlay 
          muted 
          playsInline // CRITICAL: Fixes 'Play' button on mobile
          className="w-full h-64 md:h-80 object-cover rounded-3xl border-2 border-orange-500/50 shadow-2xl shadow-orange-500/20" 
        />
        <div className="absolute bottom-4 left-0 right-0 text-center">
            <span className="bg-black/60 text-orange-300 px-4 py-1 rounded-full text-xs">{status}</span>
        </div>
      </div>
      
      <div className="glass-card p-6 space-y-4">
        <input 
          placeholder="Student Full Name" 
          className="w-full bg-slate-900 border border-slate-700 p-4 rounded-xl text-lg focus:border-orange-500 outline-none" 
          value={name}
          onChange={(e) => setName(e.target.value)} 
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select className="w-full bg-slate-900 border border-slate-700 p-4 rounded-xl text-lg outline-none" onChange={(e) => handleCourseChange(e.target.value)}>
            <option value="">Course</option>
            {courses.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>

          <select className="w-full bg-slate-900 border border-slate-700 p-4 rounded-xl text-lg outline-none" onChange={(e) => setSelectedBatch(e.target.value)} disabled={!selectedCourse}>
            <option value="">Batch</option>
            {filteredBatches.map((b, i) => <option key={i} value={b.name}>{b.name}</option>)}
          </select>
        </div>

        <button onClick={registerStudent} className="w-full bg-orange-600 p-5 rounded-xl font-bold text-lg neon-btn mt-2">
          SAVE STUDENT & FACE
        </button>
      </div>
    </div>
  );
}