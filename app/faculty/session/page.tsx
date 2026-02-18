"use client";
import { useState, useEffect, useRef } from "react";
import * as faceapi from "face-api.js";
import { useRouter } from "next/navigation";
import { getStorage, setStorage } from "@/lib/dataStore";
import Header from "@/components/Header";

export default function FacultySession() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [status, setStatus] = useState("Initializing...");
  const [timer, setTimer] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const loadAI = async () => {
      await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
      await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
      await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
      startCamera();
    };
    loadAI();
  }, []);

  // Timer
  useEffect(() => {
    let interval: any;
    if (isVerified) interval = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, [isVerified]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setStatus("Align face to verify");
      }
    } catch (e) {
      setStatus("Camera Access Denied");
    }
  };

  const verifyFaculty = async () => {
    if (!videoRef.current) return;
    const detect = await faceapi.detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptor();
    
    if (detect) {
      const currentFac = localStorage.getItem("currentFaculty");
      const allFaculty = getStorage("faculty");
      const myData = allFaculty.find((f: any) => f.name === currentFac);

      if (myData) {
        const distance = faceapi.euclideanDistance(detect.descriptor, myData.descriptor);
        if (distance < 0.6) {
          setIsVerified(true);
          setStatus("Verified! Session Active.");
        } else {
          setStatus("Face Mismatch! ❌");
        }
      } else {
        setStatus("Faculty Data Not Found!");
      }
    } else {
      setStatus("No Face Detected! ⚠️");
    }
  };

  const endClass = () => {
    const activeBatch = JSON.parse(localStorage.getItem("activeBatch") || "{}");
    const history = getStorage("attendance_history");
    history.push({
      batch: activeBatch.name,
      duration: `${Math.floor(timer / 60)}m ${timer % 60}s`,
      date: new Date().toLocaleString(),
      studentsPresent: "See Details" 
    });
    setStorage("attendance_history", history);
    router.push("/faculty/dashboard");
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec < 10 ? '0' : ''}${sec}`;
  };

  return (
    <div className="p-6 min-h-screen max-w-2xl mx-auto flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <Header title="Live Session" />
        <span className="bg-slate-800 px-4 py-2 rounded-lg font-mono text-xl text-blue-400 border border-slate-700">
          {formatTime(timer)}
        </span>
      </div>

      <div className="flex-1 flex flex-col gap-6">
        <div className="relative overflow-hidden rounded-3xl border-2 border-slate-700 bg-black">
          <video 
            ref={videoRef} 
            autoPlay 
            muted 
            playsInline // CRITICAL for Mobile
            className={`w-full h-80 object-cover ${isVerified ? 'opacity-50 grayscale' : ''}`} 
          />
          <div className="absolute bottom-4 left-0 right-0 text-center">
            <span className={`px-4 py-1 rounded-full text-xs font-bold ${isVerified ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
              {status}
            </span>
          </div>
        </div>

        {!isVerified ? (
          <button onClick={verifyFaculty} className="w-full bg-blue-600 p-5 rounded-xl font-bold text-lg neon-btn">
            VERIFY IDENTITY TO START
          </button>
        ) : (
          <div className="space-y-3">
            <button 
              onClick={() => router.push("/faculty/session/scan")} 
              className="w-full bg-emerald-600 p-5 rounded-xl font-bold text-lg neon-btn flex items-center justify-center gap-2"
            >
              📸 SCAN STUDENTS
            </button>
            <button onClick={endClass} className="w-full bg-red-900/30 text-red-400 border border-red-900 p-5 rounded-xl font-bold text-lg">
              END SESSION
            </button>
          </div>
        )}
      </div>
    </div>
  );
}