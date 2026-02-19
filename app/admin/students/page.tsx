"use client";
import { useState, useEffect, useRef } from "react";
import * as faceapi from "face-api.js";
import { getStorage, setStorage } from "@/lib/dataStore";
import Header from "@/components/Header";
import { getModelBasePath } from "@/lib/faceModels";

export default function RegisterStudent() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [allBatches, setAllBatches] = useState<any[]>([]);
  const [filteredBatches, setFilteredBatches] = useState<any[]>([]);
  const [status, setStatus] = useState("Select course & batch, then open camera.");
  
  const [name, setName] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("");
  const [capturedDescriptor, setCapturedDescriptor] = useState<number[] | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  useEffect(() => {
    setCourses(getStorage("courses"));
    setAllBatches(getStorage("batches"));

    // only load models when camera is opened
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const loadModelsIfNeeded = async () => {
    if (modelsLoaded || isLoadingModels) return;
    try {
      setIsLoadingModels(true);
      setStatus("Loading face AI models...");
      const MODEL_URL = getModelBasePath();
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      ]);
      setModelsLoaded(true);
      setStatus("Models ready. Open camera.");
    } catch (error: any) {
      console.error(error);
      setStatus(`AI Error: ${error?.message || String(error)}`);
    } finally {
      setIsLoadingModels(false);
    }
  };

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

      setIsCameraOpen(true);
      setStatus("Align student face, then capture.");
    } catch (error: any) {
      let message = "Camera Error: Unable to access camera.";
      if (error?.name === "NotAllowedError" || error?.name === "PermissionDeniedError") {
        message = "Camera Error: Please allow permissions.";
      } else if (error?.name === "NotFoundError") {
        message = "Camera Error: No camera device found.";
      }
      setStatus(message);
      setIsCameraOpen(false);
    }
  };

  const handleCourseChange = (courseName: string) => {
    setSelectedCourse(courseName);
    const batches = allBatches.filter(b => b.courseName === courseName);
    setFilteredBatches(batches);
  };

  const registerStudent = async () => {
    if (!name || !selectedBatch || !capturedDescriptor) {
      alert("Please select course, batch, capture face and enter name.");
      return;
    }

    const students = getStorage("students");
    students.push({
      name,
      courseName: selectedCourse,
      batchName: selectedBatch,
      descriptor: capturedDescriptor,
      preview: capturedImage || undefined,
    });
    setStorage("students", students);
    alert("Student Registered Successfully!");
    setName("");
    setCapturedDescriptor(null);
    setCapturedImage(null);
  };

  return (
    <div className="app-page">
      <div className="app-container">
        <Header title="Enroll Student" />
        
        {/* Camera + capture */}
        <div className="app-card space-y-4 sm:space-y-5 mb-4">
          <p className="app-label mb-1">Student Face Capture</p>
          <div className="relative mb-3">
            {isCameraOpen ? (
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                controls={false}
                className="w-full h-56 sm:h-64 object-cover rounded-3xl border-2 border-orange-500/50 shadow-2xl bg-black"
              />
            ) : capturedImage ? (
              <img
                src={capturedImage}
                alt="Captured student"
                className="w-full h-56 sm:h-64 object-cover rounded-3xl border-2 border-orange-500/50 shadow-2xl bg-black"
              />
            ) : (
              <div className="w-full h-48 sm:h-52 rounded-3xl border-2 border-dashed border-orange-500/40 bg-slate-950/60 flex flex-col items-center justify-center gap-2 text-slate-400">
                <span className="text-4xl">🎓</span>
                <span className="text-xs sm:text-sm font-medium">
                  No face captured yet
                </span>
              </div>
            )}
            <div className="absolute bottom-3 left-3 bg-black/60 px-3 py-1 rounded-full text-[11px] sm:text-xs text-orange-300">
              {status}
            </div>
          </div>

          <div className="flex flex-wrap gap-3 sm:gap-4">
            <button
              type="button"
              onClick={async () => {
                if (!selectedCourse || !selectedBatch) {
                  alert("Select course and batch first.");
                  return;
                }
                await loadModelsIfNeeded();
                await startCamera();
              }}
              className="btn-warning neon-btn !w-auto px-4"
              disabled={isLoadingModels}
            >
              <span className="text-xl">📷</span>
              {isCameraOpen
                ? "CAMERA ON"
                : isLoadingModels
                ? "LOADING AI..."
                : "OPEN CAMERA"}
            </button>

            {isCameraOpen && (
              <button
                type="button"
                onClick={async () => {
                  if (!videoRef.current) return;
                  setStatus("Scanning face...");
                  try {
                    const detect = await faceapi
                      .detectSingleFace(
                        videoRef.current,
                        new faceapi.TinyFaceDetectorOptions()
                      )
                      .withFaceLandmarks()
                      .withFaceDescriptor();

                    if (!detect) {
                      setStatus("No face detected. Try again.");
                      return;
                    }

                    setCapturedDescriptor(Array.from(detect.descriptor));

                    // capture thumbnail
                    const canvas = document.createElement("canvas");
                    canvas.width = videoRef.current.videoWidth;
                    canvas.height = videoRef.current.videoHeight;
                    const ctx = canvas.getContext("2d");
                    if (ctx) {
                      ctx.drawImage(
                        videoRef.current,
                        0,
                        0,
                        canvas.width,
                        canvas.height
                      );
                      setCapturedImage(canvas.toDataURL("image/jpeg"));
                    }

                    // stop camera immediately
                    if (streamRef.current) {
                      streamRef.current
                        .getTracks()
                        .forEach((t) => t.stop());
                      streamRef.current = null;
                    }
                    if (videoRef.current) {
                      (videoRef.current as any).srcObject = null;
                    }
                    setIsCameraOpen(false);
                    setStatus("Face captured ✓");
                  } catch (e) {
                    console.error(e);
                    setStatus("Error capturing face. Try again.");
                  }
                }}
                className="btn-success !w-auto px-4"
              >
                <span className="text-xl">✅</span>
                CAPTURE FACE
              </button>
            )}
          </div>
        </div>

        {/* Details + selections */}
        <div className="app-card space-y-4 sm:space-y-5">
          <input 
            placeholder="Student full name" 
            className="app-input focus:ring-orange-500/50 focus:border-orange-500/50"
            value={name}
            onChange={(e) => setName(e.target.value)} 
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              className="app-select focus:ring-orange-500/50 focus:border-orange-500/50"
              onChange={(e) => handleCourseChange(e.target.value)}
              value={selectedCourse}
            >
              <option value="">Course</option>
              {courses
                .filter((c: any) => c.active !== false)
                .map((c: any) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
            </select>

            <select
              className="app-select focus:ring-orange-500/50 focus:border-orange-500/50 disabled:opacity-60"
              onChange={(e) => setSelectedBatch(e.target.value)}
              value={selectedBatch}
              disabled={!selectedCourse}
            >
              <option value="">Batch</option>
              {filteredBatches.map((b, i) => (
                <option key={i} value={b.name}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={registerStudent}
            className="btn-warning neon-btn mt-1 sm:mt-2"
          >
            <span className="text-xl">💾</span>
            SAVE STUDENT & FACE
          </button>
        </div>

        {/* Student list with filters */}
        <div className="mt-6">
          <h3 className="app-subtitle mb-3 sm:mb-4">Registered Students</h3>
          <StudentList />
        </div>
      </div>
    </div>
  );
}

function StudentList() {
  const [students, setStudents] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [filterCourse, setFilterCourse] = useState("");
  const [filterBatch, setFilterBatch] = useState("");

  useEffect(() => {
    setStudents(getStorage("students"));
    setCourses(getStorage("courses"));
    setBatches(getStorage("batches"));
  }, []);

  const filtered = students.filter((s) => {
    if (filterCourse && s.courseName !== filterCourse) return false;
    if (filterBatch && s.batchName !== filterBatch) return false;
    return true;
  });

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3 mb-3">
        <select
          className="app-select !w-auto min-w-[140px] text-sm"
          value={filterCourse}
          onChange={(e) => {
            setFilterCourse(e.target.value);
            setFilterBatch("");
          }}
        >
          <option value="">All Courses</option>
          {courses
            .filter((c: any) => c.active !== false)
            .map((c: any) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
        </select>

        <select
          className="app-select !w-auto min-w-[140px] text-sm"
          value={filterBatch}
          onChange={(e) => setFilterBatch(e.target.value)}
        >
          <option value="">All Batches</option>
          {batches
            .filter(
              (b: any) => !filterCourse || b.courseName === filterCourse
            )
            .map((b: any, i: number) => (
              <option key={i} value={b.name}>
                {b.name}
              </option>
            ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="text-slate-500 text-sm">No students found.</p>
      ) : (
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {filtered.map((s, i) => (
            <div
              key={i}
              className="glass-card p-4 sm:p-5 flex items-center gap-4"
            >
              {s.preview ? (
                <img
                  src={s.preview}
                  alt={s.name}
                  className="h-12 w-12 rounded-full object-cover border border-orange-500/60"
                />
              ) : (
                <div className="h-12 w-12 rounded-full bg-orange-500/20 border border-orange-500/40 grid place-items-center text-orange-300 text-lg">
                  🎓
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-black text-sm sm:text-base truncate">
                  {s.name}
                </p>
                <p className="text-[11px] sm:text-xs text-slate-400 truncate">
                  {s.courseName} • {s.batchName}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}