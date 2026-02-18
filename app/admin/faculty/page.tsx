"use client";
import { useState, useEffect, useRef } from "react";
import * as faceapi from "face-api.js";
import { getStorage, setStorage } from "@/lib/dataStore";
import Header from "@/components/Header";

export default function AddFaculty() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [status, setStatus] = useState("Camera Initializing...");

  useEffect(() => {
    setCourses(getStorage("courses"));
    const loadModels = async () => {
      await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
      await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
      await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
      startCamera();
    };
    loadModels();
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setStatus("Ready to scan");
      }
    } catch (err) {
      setStatus("Permission Denied! Check Settings.");
    }
  };

  const toggleCourse = (cName: string) => {
    setSelectedCourses(prev => prev.includes(cName) ? prev.filter(x => x !== cName) : [...prev, cName]);
  };

  const saveFaculty = async () => {
    if (!name || selectedCourses.length === 0) return alert("Enter name and select at least one course");
    const detect = await faceapi.detectSingleFace(videoRef.current!, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptor();
    if (!detect) return alert("Face not detected!");

    const faculty = getStorage("faculty");
    faculty.push({ name, assignedCourses: selectedCourses, descriptor: Array.from(detect.descriptor) });
    setStorage("faculty", faculty);
    alert("Faculty Registered!");
  };

  return (
    <div className="p-6 max-w-2xl mx-auto min-h-screen text-white">
      <Header title="Assign Faculty" />
      
      <div className="relative mb-6">
        <video 
          ref={videoRef} 
          autoPlay 
          muted 
          playsInline // CRITICAL: Fixes the 'Play' button issue on mobile
          className="w-full h-64 md:h-96 object-cover rounded-3xl border-2 border-purple-500/30 shadow-2xl shadow-purple-500/10" 
        />
        <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur px-3 py-1 rounded-full text-xs text-purple-300">
          {status}
        </div>
      </div>

      <div className="glass-card p-6 space-y-6">
        <input onChange={(e) => setName(e.target.value)} placeholder="Full Name" className="w-full bg-slate-900 border border-slate-800 p-4 rounded-xl text-lg focus:border-purple-500 outline-none" />
        
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Assign Courses</p>
          <div className="flex flex-wrap gap-2">
            {courses.map(c => (
              <button 
                key={c.id} 
                onClick={() => toggleCourse(c.name)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${selectedCourses.includes(c.name) ? 'bg-purple-600 border-purple-400 shadow-lg' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
              >
                {c.name} {selectedCourses.includes(c.name) && "✓"}
              </button>
            ))}
          </div>
        </div>

        <button onClick={saveFaculty} className="w-full bg-purple-600 p-5 rounded-2xl font-black text-lg neon-btn tracking-wide">
          AUTHORIZE & SAVE BIOMETRICS
        </button>
      </div>
    </div>
  );
}