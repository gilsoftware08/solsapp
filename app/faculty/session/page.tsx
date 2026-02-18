"use client";
import { useState, useEffect, useRef } from "react";
import * as faceapi from "face-api.js";
import { useRouter } from "next/navigation";
import { getStorage, setStorage } from "@/lib/dataStore";

export default function FacultySession() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [mode, setMode] = useState<"user" | "environment">("user"); // Front/Back camera
  const [status, setStatus] = useState("Verify Identity to Start");
  const [timer, setTimer] = useState(0);
  const [attendanceDone, setAttendanceDone] = useState(false);
  const [presentCount, setPresentCount] = useState(0);
  const router = useRouter();

  // Load AI Models
  useEffect(() => {
    const load = async () => {
      await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
      await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
      await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
      startCamera();
    };
    load();
  }, [mode]);

  // Timer logic
  useEffect(() => {
    let interval: any;
    if (isVerified) {
      interval = setInterval(() => setTimer(prev => prev + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isVerified]);

  const startCamera = () => {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: mode } })
      .then(s => { if(videoRef.current) videoRef.current.srcObject = s; });
  };

  const verifyFaculty = async () => {
    const detect = await faceapi.detectSingleFace(videoRef.current!, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptor();
    if (!detect) return setStatus("Face not seen! ⚠️");

    const facultyName = localStorage.getItem("currentFaculty");
    const allFaculty = getStorage("faculty");
    const myData = allFaculty.find((f: any) => f.name === facultyName);

    const distance = faceapi.euclideanDistance(detect.descriptor, myData.descriptor);
    if (distance < 0.6) {
      setIsVerified(true);
      setStatus("Class Active");
    } else {
      setStatus("Verification Failed! ❌");
    }
  };

  const takeAttendance = () => {
    // Navigate to a dedicated scanning sub-page or open overlay
    router.push("/faculty/session/scan");
  };

  const endClass = () => {
    const activeBatch = JSON.parse(localStorage.getItem("activeBatch") || "{}");
    const history = getStorage("attendance_history");
    history.push({
      batch: activeBatch.name,
      duration: `${Math.floor(timer / 60)} mins`,
      date: new Date().toLocaleString(),
      studentsPresent: presentCount
    });
    setStorage("attendance_history", history);
    router.push("/faculty/dashboard");
  };

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="p-4 bg-black min-h-screen text-white">
      {/* Header Info */}
      <div className="flex justify-between items-center mb-4 px-2">
        <span className="text-blue-400 font-bold">● LIVE SESSION</span>
        <span className="font-mono text-xl">{formatTime(timer)}</span>
      </div>

      {/* Modern Camera View */}
      <div className="relative group">
        <video ref={videoRef} autoPlay muted className="w-full rounded-3xl border-2 border-slate-800 bg-slate-900" />
        <button 
          onClick={() => setMode(mode === "user" ? "environment" : "user")}
          className="absolute top-4 right-4 bg-white/10 backdrop-blur-md p-2 rounded-full border border-white/20"
        >
          🔄
        </button>
      </div>

      <p className="text-center my-4 text-slate-400">{status}</p>

      {!isVerified ? (
        <button onClick={verifyFaculty} className="w-full bg-blue-600 p-4 rounded-2xl font-bold neon-btn">
          VERIFY MY FACE TO START
        </button>
      ) : (
        <div className="space-y-4">
          {!attendanceDone ? (
            <button onClick={takeAttendance} className="w-full bg-emerald-600 p-4 rounded-2xl font-bold neon-btn flex items-center justify-center gap-2">
              📸 TAKE ATTENDANCE
            </button>
          ) : (
             <div className="bg-emerald-900/30 border border-emerald-500/30 p-4 rounded-2xl text-center">
                Attendance Captured: {presentCount} Students
             </div>
          )}
          
          <button onClick={endClass} className="w-full bg-red-600/20 border border-red-600 text-red-600 p-4 rounded-2xl font-bold">
            END CLASS
          </button>
        </div>
      )}
    </div>
  );
}