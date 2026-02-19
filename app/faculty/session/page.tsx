"use client";
import { useState, useEffect, useRef } from "react";
import * as faceapi from "face-api.js";
import { useRouter } from "next/navigation";
import { getStorage, setStorage } from "@/lib/dataStore";
import Header from "@/components/Header";
import { getModelBasePath } from "@/lib/faceModels";

export default function FacultySession() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [status, setStatus] = useState("Tap to open camera and verify.");
  const [timer, setTimer] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [presentCount, setPresentCount] = useState(0);
  const [showEndModal, setShowEndModal] = useState(false);
  const router = useRouter();

  const FACE_MATCH_THRESHOLD = 0.45;
  const detectorOptions = new faceapi.TinyFaceDetectorOptions({
    inputSize: 224,
    scoreThreshold: 0.5,
  });

  // Initial mount: load models and restore session state
  useEffect(() => {
    const init = async () => {
      try {
        const MODEL_URL = getModelBasePath();
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);

        const isActive = localStorage.getItem("isSessionActive") === "true";
        const sessionStart = localStorage.getItem("sessionStartTime");
        const attendanceRaw = localStorage.getItem(
          "current_session_attendance"
        );
        if (attendanceRaw) {
          try {
            const parsed = JSON.parse(attendanceRaw);
            if (Array.isArray(parsed)) {
              setPresentCount(parsed.length);
            }
          } catch {
            setPresentCount(0);
          }
        } else {
          setPresentCount(0);
        }

        if (isActive && sessionStart) {
          setIsVerified(true);
          setStatus("Session already active. Camera off to save battery.");

          const startMs = parseInt(sessionStart, 10);
          const diffSec = Math.max(
            0,
            Math.floor((Date.now() - startMs) / 1000)
          );
          setTimer(diffSec);
        } else {
          setIsVerified(false);
          setStatus("Tap the video area to open camera.");
          setTimer(0);
        }
      } catch (error) {
        setStatus("Error loading AI models. Check /models folder.");
      } finally {
        setIsLoading(false);
      }
    };

    init();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Timer loop based on persisted start time
  useEffect(() => {
    const interval = setInterval(() => {
      const sessionStart = localStorage.getItem("sessionStartTime");
      const isActive = localStorage.getItem("isSessionActive") === "true";
      if (!isActive || !sessionStart) {
        setTimer(0);
        return;
      }
      const startMs = parseInt(sessionStart, 10);
      const diffSec = Math.max(
        0,
        Math.floor((Date.now() - startMs) / 1000)
      );
      setTimer(diffSec);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

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
        setStatus("Align face to verify, then press VERIFY.");
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
    const detect = await faceapi
      .detectSingleFace(videoRef.current, detectorOptions)
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (detect) {
      const currentFac = localStorage.getItem("currentFaculty");
      const allFaculty = getStorage("faculty");
      const myData = allFaculty.find((f: any) => f.name === currentFac);

      if (myData) {
        const distance = faceapi.euclideanDistance(
          detect.descriptor,
          myData.descriptor
        );
        if (distance < FACE_MATCH_THRESHOLD) {
          setIsVerified(true);
          const now = Date.now().toString();
          if (!localStorage.getItem("sessionStartTime")) {
            localStorage.setItem("sessionStartTime", now);
          }
          localStorage.setItem("isSessionActive", "true");
          setStatus("Verified! Camera will turn off to save battery.");
          // stop camera after verify
          if (streamRef.current) {
            streamRef.current.getTracks().forEach((t) => t.stop());
            streamRef.current = null;
          }
          if (videoRef.current) {
            (videoRef.current as any).srcObject = null;
          }
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

  const confirmEndClass = () => {
    setShowEndModal(true);
  };

  const endClass = () => {
    setShowEndModal(false);
    const activeBatch = JSON.parse(localStorage.getItem("activeBatch") || "{}");
    const allStudents = getStorage("students");
    const batchStudents = allStudents.filter(
      (s: any) => s.batchName === activeBatch.name
    );

    const presentNames: string[] = JSON.parse(
      localStorage.getItem("current_session_attendance") || "[]"
    );

    const startMs = parseInt(
      localStorage.getItem("sessionStartTime") || Date.now().toString(),
      10
    );
    const endMs = Date.now();
    const durationSec = Math.max(
      0,
      Math.floor((endMs - startMs) / 1000)
    );
    const durationLabel = `${Math.floor(durationSec / 60)}m ${
      durationSec % 60
    }s`;

    const start = new Date(startMs);
    const end = new Date(endMs);

    const report = {
      batchName: activeBatch.name,
      courseName: activeBatch.courseName,
      facultyName: activeBatch.facultyName,
      date: start.toLocaleDateString(),
      startTime: start.toLocaleTimeString(),
      endTime: end.toLocaleTimeString(),
      durationSeconds: durationSec,
      durationLabel,
      studentList: batchStudents.map((s: any) => ({
        name: s.name,
        status: presentNames.includes(s.name) ? "P" : "A",
      })),
    };

    const history = getStorage("attendance_history");
    history.push(report);
    setStorage("attendance_history", history);

    localStorage.removeItem("sessionStartTime");
    localStorage.removeItem("isSessionActive");
    localStorage.removeItem("current_session_attendance");
    router.push("/faculty/dashboard");
  };

  const cancelEndClass = () => {
    setShowEndModal(false);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec < 10 ? '0' : ''}${sec}`;
  };

  return (
    <div className="app-page">
      {isLoading ? (
        <div className="app-container flex items-center justify-center">
          <div className="glass-card px-6 py-4 text-sm text-slate-400">
            Restoring session...
          </div>
        </div>
      ) : (
      <div className="app-container flex flex-col">
        <div className="flex justify-between items-center mb-2 sm:mb-4">
          <Header title="Live Session" />
          <span className="glass-card px-4 py-2 rounded-2xl font-mono text-lg sm:text-2xl text-blue-200 border border-slate-700">
            {formatTime(timer)}
          </span>
        </div>

        <div className="flex-1 flex flex-col gap-4 sm:gap-6">
          <div className="relative overflow-hidden rounded-3xl border-2 border-slate-800 bg-black">
            {isVerified ? (
              <div className="w-full h-64 sm:h-80 flex items-center justify-center text-slate-500 text-sm sm:text-base">
                <span>Camera off during session to save battery.</span>
              </div>
            ) : (
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                controls={false}
                className="w-full h-64 sm:h-80 object-cover"
                onClick={startCamera}
              />
            )}
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

          {isVerified && (
            <p className="text-xs sm:text-sm text-slate-400">
              Students present so far:{" "}
              <span className="font-bold text-emerald-400">
                {presentCount}
              </span>
            </p>
          )}

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
                onClick={confirmEndClass}
                className="btn-danger"
              >
                <span className="text-xl">⏹</span>
                END SESSION
              </button>
            </div>
          )}
        </div>
      </div>
      )}

      {/* End Session confirmation modal */}
      {showEndModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={cancelEndClass}
        >
          <div
            className="glass-card p-6 sm:p-8 max-w-md w-full border border-slate-700 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-base sm:text-lg font-bold text-white mb-4">
              Are you sure you want to end this session? This will finalize the
              attendance report.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={cancelEndClass}
                className="btn-ghost flex-1"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={endClass}
                className="btn-danger flex-1"
              >
                Yes, End Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}