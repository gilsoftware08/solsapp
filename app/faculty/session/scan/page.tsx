"use client";
import { useState, useEffect, useRef } from "react";
import * as faceapi from "face-api.js";
import { useRouter } from "next/navigation";
import { getStorage } from "@/lib/dataStore";
import Header from "@/components/Header";
import { getModelBasePath } from "@/lib/faceModels";

export default function StudentScanner() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [presentList, setPresentList] = useState<string[]>([]);
  const [status, setStatus] = useState("Initializing...");
  const router = useRouter();

  const FACE_MATCH_THRESHOLD = 0.45;
  const detectorOptions = new faceapi.TinyFaceDetectorOptions({
    inputSize: 224,
    scoreThreshold: 0.5,
  });

  useEffect(() => {
    const loadAI = async () => {
      try {
        const MODEL_URL = getModelBasePath();
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        setStatus("Tap camera to start scanning.");
      } catch (error) {
        setStatus("Error loading AI models. Check /models folder.");
      }
    };

    // restore existing attendance for this session
    const stored = localStorage.getItem("current_session_attendance");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setPresentList(parsed);
        }
      } catch {
        setPresentList([]);
      }
    }

    loadAI();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setStatus("Camera not supported in this environment.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current
            ?.play()
            .catch(() => setStatus("Tap the video to start camera."));
        };
      }

      setStatus("Ready to scan...");
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

  const scanFace = async () => {
    if (!videoRef.current) return;
    setStatus("Scanning...");

    try {
      const detect = await faceapi
        .detectSingleFace(videoRef.current, detectorOptions)
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (detect) {
        const activeBatch = JSON.parse(
          localStorage.getItem("activeBatch") || "{}"
        );
        const allStudents = getStorage("students");
        const batchStudents = allStudents.filter(
          (s: any) => s.batchName === activeBatch.name
        );

        if (batchStudents.length === 0) {
          setStatus("No students in this batch.");
          return;
        }

        const labeledDescriptors = batchStudents.map(
          (s: any) =>
            new faceapi.LabeledFaceDescriptors(s.name, [
              new Float32Array(s.descriptor),
            ])
        );
        const matcher = new faceapi.FaceMatcher(
          labeledDescriptors,
          FACE_MATCH_THRESHOLD
        );
        const match = matcher.findBestMatch(detect.descriptor);

        if (match.distance < FACE_MATCH_THRESHOLD) {
          const matchName = match.label;
          if (!presentList.includes(matchName)) {
            setPresentList((prev) => {
              const next = [...prev, matchName];
              localStorage.setItem(
                "current_session_attendance",
                JSON.stringify(next)
              );
              return next;
            });
            setStatus(`Marked: ${matchName} ✅`);
          } else {
            setStatus(`${matchName} is already here!`);
          }
        } else {
          setStatus("Unknown Face");
        }
      } else {
        setStatus("No Face Detected ⚠️");
      }
    } catch (e) {
      setStatus("AI Error. Try Again.");
    }
  };

  return (
    <div className="app-page">
      <div className="app-container flex flex-col">
        <Header title="Attendance Scanner" />
        
        <div className="relative mb-4 sm:mb-6 mt-1">
          <video 
            ref={videoRef} 
            autoPlay 
            muted 
            playsInline
            controls={false}
            className="w-full h-64 sm:h-72 object-cover rounded-3xl border-2 border-emerald-500/50 shadow-2xl bg-black" 
            onClick={startCamera}
          />
          <div className="absolute bottom-4 left-0 right-0 text-center px-2">
            <span className="bg-black/70 text-emerald-300 px-3 sm:px-4 py-1 rounded-full text-[11px] sm:text-xs font-bold">
              {status}
            </span>
          </div>
        </div>

        <div className="glass-card p-4 sm:p-5 mb-4 border border-slate-800 overflow-y-auto max-h-60">
          <div className="flex justify-between mb-2">
            <span className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wide">Present Students</span>
            <span className="text-[11px] sm:text-xs font-bold text-emerald-400">{presentList.length}</span>
          </div>
          {presentList.map((name, i) => (
            <div key={i} className="py-2 border-b border-slate-800 flex items-center gap-2">
              <span className="text-emerald-500">✓</span>
              <span className="text-white font-medium text-sm sm:text-base">{name}</span>
            </div>
          ))}
          {presentList.length === 0 && (
            <p className="text-slate-600 text-sm text-center mt-4">
              No students scanned yet.
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <button
            onClick={scanFace}
            className="btn bg-white text-black"
          >
            <span className="text-xl">🔍</span>
            SCAN
          </button>
          <button
            onClick={() => router.back()}
            className="btn-success"
          >
            <span className="text-xl">✅</span>
            DONE
          </button>
        </div>
      </div>
    </div>
  );
}