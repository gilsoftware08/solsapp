"use client";
import { useState, useEffect, useRef } from "react";
import * as faceapi from "face-api.js";
import { useRouter } from "next/navigation";
import { getStorage } from "@/lib/dataStore";

export default function StudentScanner() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [presentList, setPresentList] = useState<string[]>([]);
  const [status, setStatus] = useState("Ready to Scan");
  const router = useRouter();

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
      .then(s => { if(videoRef.current) videoRef.current.srcObject = s; });
  }, []);

  const scanFace = async () => {
    const detect = await faceapi.detectSingleFace(videoRef.current!, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptor();
    if (!detect) return setStatus("No Student Detected! ⚠️");

    const activeBatch = JSON.parse(localStorage.getItem("activeBatch") || "{}");
    const allStudents = getStorage("students");
    
    // Filter students belonging to this specific batch
    const batchStudents = allStudents.filter((s: any) => s.batchName === activeBatch.name);

    let matchName = "";
    batchStudents.forEach((std: any) => {
      const distance = faceapi.euclideanDistance(detect.descriptor, std.descriptor);
      if (distance < 0.6) matchName = std.name;
    });

    if (matchName) {
      if (!presentList.includes(matchName)) {
        setPresentList(prev => [...prev, matchName]);
        setStatus(`Matched: ${matchName} ✅`);
      } else {
        setStatus(`${matchName} already marked!`);
      }
    } else {
      setStatus("Unknown Student! ❌");
    }
  };

  const handleDone = () => {
    // Pass count back or save to temp session
    router.back();
  };

  return (
    <div className="bg-black min-h-screen p-4 flex flex-col">
      <video ref={videoRef} autoPlay muted className="w-full rounded-3xl mb-4 border-2 border-emerald-500" />
      
      <div className="flex-1 overflow-y-auto bg-slate-900/50 rounded-2xl p-4 mb-4 border border-slate-800">
        <h3 className="text-slate-500 text-xs uppercase mb-3">Present List ({presentList.length})</h3>
        {presentList.map((name, i) => (
          <div key={i} className="py-2 border-b border-slate-800 text-emerald-400 text-sm">✓ {name}</div>
        ))}
      </div>

      <div className="flex gap-4">
        <button onClick={scanFace} className="flex-1 bg-white text-black p-4 rounded-2xl font-black neon-btn">SCAN STUDENT</button>
        <button onClick={handleDone} className="bg-emerald-600 px-8 rounded-2xl font-bold">DONE</button>
      </div>
    </div>
  );
}