"use client";
import { useState, useEffect, useRef } from "react";
import * as faceapi from "face-api.js";
import { getStorage, setStorage } from "@/lib/dataStore";

export default function AddFaculty() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [name, setName] = useState("");

  useEffect(() => {
    setCourses(getStorage("courses"));
    faceapi.nets.tinyFaceDetector.loadFromUri('/models');
    faceapi.nets.faceLandmark68Net.loadFromUri('/models');
    faceapi.nets.faceRecognitionNet.loadFromUri('/models');
    navigator.mediaDevices.getUserMedia({ video: {} }).then(s => { if(videoRef.current) videoRef.current.srcObject = s; });
  }, []);

  const saveFaculty = async () => {
    const detect = await faceapi.detectSingleFace(videoRef.current!, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptor();
    if (!detect) return alert("Face not detected!");

    const faculty = getStorage("faculty");
    faculty.push({
      name,
      assignedCourses: selectedCourses,
      descriptor: Array.from(detect.descriptor)
    });
    setStorage("faculty", faculty);
    alert("Faculty Registered Successfully!");
  };

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-4 text-purple-400">Assign Faculty</h1>
      <video ref={videoRef} autoPlay muted className="w-full h-48 object-cover rounded-2xl mb-4 border-2 border-purple-500" />
      <input onChange={(e) => setName(e.target.value)} placeholder="Faculty Name" className="w-full bg-slate-800 p-3 rounded mb-4" />
      
      <p className="text-sm text-slate-400 mb-2">Select Courses (Multiple):</p>
      <div className="flex flex-wrap gap-2 mb-6">
        {courses.map(c => (
          <button 
            key={c.id}
            onClick={() => setSelectedCourses(prev => prev.includes(c.name) ? prev.filter(x => x !== c.name) : [...prev, c.name])}
            className={`px-3 py-1 rounded-full text-xs ${selectedCourses.includes(c.name) ? 'bg-purple-600' : 'bg-slate-800'}`}
          >
            {c.name}
          </button>
        ))}
      </div>
      <button onClick={saveFaculty} className="w-full bg-purple-600 p-4 rounded-xl font-bold neon-btn">SAVE FACULTY & FACE</button>
    </div>
  );
}