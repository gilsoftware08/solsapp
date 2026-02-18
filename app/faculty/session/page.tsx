"use client";
import { useState, useEffect, useRef } from "react";
import * as faceapi from "face-api.js";
import { useRouter } from "next/navigation";
import { getStorage, setStorage } from "@/lib/dataStore";
import Header from "@/components/Header";

export default function FacultySession() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [status, setStatus] = useState("Initializing...");
  const [timer, setTimer] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const loadAIAndCamera = async () => {
      try {
        const MODEL_URL = "/models";
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        await startCamera();
      } catch (error) {
        setStatus("Error loading AI models. Check /models folder.");
      }
    };

    loadAIAndCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Timer
  useEffect(() => {
    let interval: any;
    if (isVerified) interval = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, [isVerified]);

  const startCamera = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setStatus("Camera not supported in this environment.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current
            ?.play()
            .catch(() => setStatus("Tap to allow camera playback."));
        };
        setStatus("Align face to verify");
      }
    } catch (error: any) {
      let message = "Unable to access camera.";
      if (error?.name === "NotAllowedError" || error?.name === "PermissionDeniedError") {
        message = "Camera permission denied. Enable it in app settings.";
      } else if (error?.name === "NotFoundError") {
        message = "No camera device found.";
      }
      setStatus(message);
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
    <div className="app-page">
      <div className="app-container flex flex-col">
        <div className="flex justify-between items-center mb-2 sm:mb-4">
          <Header title="Live Session" />
          <span className="glass-card px-4 py-2 rounded-2xl font-mono text-lg sm:text-2xl text-blue-200 border border-slate-700">
            {formatTime(timer)}
          </span>
        </div>

        <div className="flex-1 flex flex-col gap-4 sm:gap-6">
          <div className="relative overflow-hidden rounded-3xl border-2 border-slate-800 bg-black">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              controls={false}
              className={`w-full h-64 sm:h-80 object-cover ${isVerified ? "opacity-50 grayscale" : ""}`}
              onClick={() => !isVerified && startCamera()}
            />
            <div className="absolute bottom-4 left-0 right-0 text-center px-2">
              <span
                className={`inline-block px-4 py-1 rounded-full text-[11px] sm:text-xs font-bold ${
                  isVerified
                    ? "bg-green-500/20 text-green-400"
                    : "bg-red-500/20 text-red-400"
                }`}
              >
                {status}
              </span>
            </div>
          </div>

          {!isVerified ? (
            <button
              onClick={verifyFaculty}
              className="btn-primary neon-btn"
            >
              <span className="text-xl">🧑‍🏫</span>
              VERIFY TO START
            </button>
          ) : (
            <div className="space-y-3">
              <button
                onClick={() => router.push("/faculty/session/scan")}
                className="btn-success neon-btn"
              >
                <span className="text-xl">📸</span>
                SCAN STUDENTS
              </button>
              <button
                onClick={endClass}
                className="btn-danger"
              >
                <span className="text-xl">⏹</span>
                END SESSION
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}