"use client";
import { useState, useEffect, useRef } from "react";
import * as faceapi from "face-api.js";
import { useRouter } from "next/navigation";
import { getStorage } from "@/lib/dataStore";
import Header from "@/components/Header";

export default function StudentScanner() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [presentList, setPresentList] = useState<string[]>([]);
  const [status, setStatus] = useState("Ready...");
  const router = useRouter();

  useEffect(() => {
    const startCam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (e) {
        setStatus("Camera Error");
      }
    };
    startCam();
  }, []);

  const scanFace = async () => {
    if (!videoRef.current) return;
    setStatus("Scanning...");
    
    try {
      const detect = await faceapi.detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptor();
      
      if (detect) {
        const activeBatch = JSON.parse(localStorage.getItem("activeBatch") || "{}");
        const allStudents = getStorage("students");
        // Filter students only for this batch
        const batchStudents = allStudents.filter((s: any) => s.batchName === activeBatch.name);

        let matchName = "";
        batchStudents.forEach((std: any) => {
          const dist = faceapi.euclideanDistance(detect.descriptor, std.descriptor);
          if (dist < 0.6) matchName = std.name;
        });

        if (matchName) {
          if (!presentList.includes(matchName)) {
            setPresentList(p => [...p, matchName]);
            setStatus(`Marked: ${matchName} ✅`);
          } else {
            setStatus(`${matchName} is already here!`);
          }
        } else {
          setStatus("Student Not Found in Batch ❌");
        }
      } else {
        setStatus("No Face Detected ⚠️");
      }
    } catch (e) {
      setStatus("AI Error. Try Again.");
    }
  };

  return (
    <div className="p-4 min-h-screen max-w-2xl mx-auto flex flex-col">
      <Header title="Attendance Scanner" />
      
      <div className="relative mb-4">
        <video 
          ref={videoRef} 
          autoPlay 
          muted 
          playsInline // CRITICAL
          className="w-full h-72 object-cover rounded-3xl border-2 border-emerald-500/50 shadow-2xl" 
        />
        <div className="absolute bottom-4 left-0 right-0 text-center">
          <span className="bg-black/70 text-emerald-300 px-4 py-1 rounded-full text-xs font-bold">{status}</span>
        </div>
      </div>

      <div className="flex-1 bg-slate-900/50 rounded-2xl p-4 mb-4 border border-slate-800 overflow-y-auto max-h-60">
        <div className="flex justify-between mb-2">
          <span className="text-xs font-bold text-slate-500 uppercase">Present Students</span>
          <span className="text-xs font-bold text-emerald-400">{presentList.length}</span>
        </div>
        {presentList.map((name, i) => (
          <div key={i} className="py-2 border-b border-slate-800 flex items-center gap-2">
            <span className="text-emerald-500">✓</span>
            <span className="text-white font-medium">{name}</span>
          </div>
        ))}
        {presentList.length === 0 && <p className="text-slate-600 text-sm text-center mt-4">No students scanned yet.</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button onClick={scanFace} className="bg-white text-black p-4 rounded-xl font-black text-lg active:scale-95 transition-transform">
          SCAN
        </button>
        <button onClick={() => router.back()} className="bg-emerald-600 text-white p-4 rounded-xl font-bold text-lg active:scale-95 transition-transform">
          DONE
        </button>
      </div>
    </div>
  );
}