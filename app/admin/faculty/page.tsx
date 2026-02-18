"use client";
import { useState, useEffect, useRef } from "react";
import * as faceapi from "face-api.js";
import { getStorage, setStorage } from "@/lib/dataStore";
import Header from "@/components/Header";

export default function AddFaculty() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [status, setStatus] = useState("Camera Initializing...");

  useEffect(() => {
    setCourses(getStorage("courses"));

    const loadModelsAndCamera = async () => {
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

    loadModelsAndCamera();

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
        video: { facingMode: "user" },
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

      setStatus("Ready to scan");
    } catch (error: any) {
      let message = "Unable to access camera.";
      if (error?.name === "NotAllowedError" || error?.name === "PermissionDeniedError") {
        message = "Permission denied. Enable camera in app settings.";
      } else if (error?.name === "NotFoundError") {
        message = "No camera device found.";
      }
      setStatus(message);
    }
  };

  const toggleCourse = (cName: string) => {
    setSelectedCourses(prev => prev.includes(cName) ? prev.filter(x => x !== cName) : [...prev, cName]);
  };

  const saveFaculty = async () => {
    if (!name || selectedCourses.length === 0) {
      alert("Enter name and select at least one course");
      return;
    }

    const detect = await faceapi
      .detectSingleFace(
        videoRef.current!,
        new faceapi.TinyFaceDetectorOptions()
      )
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detect) {
      alert("Face not detected! Ask faculty to face the camera.");
      return;
    }

    const faculty = getStorage("faculty");
    faculty.push({ name, assignedCourses: selectedCourses, descriptor: Array.from(detect.descriptor) });
    setStorage("faculty", faculty);
    alert("Faculty Registered!");
  };

  return (
    <div className="app-page">
      <div className="app-container">
        <Header title="Assign Faculty" />
        
        <div className="relative mb-5 sm:mb-6">
          <video 
            ref={videoRef} 
            autoPlay 
            muted 
            playsInline
            controls={false}
            className="w-full h-60 sm:h-72 md:h-96 object-cover rounded-3xl border-2 border-purple-500/30 shadow-2xl shadow-purple-500/10 bg-black" 
            onClick={startCamera}
          />
          <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur px-3 py-1 rounded-full text-[11px] sm:text-xs text-purple-300">
            {status}
          </div>
        </div>

        <div className="app-card space-y-5 sm:space-y-6">
          <input
            onChange={(e) => setName(e.target.value)}
            value={name}
            placeholder="Faculty full name"
            className="app-input focus:ring-purple-500/50 focus:border-purple-500/50"
          />
          
          <div>
            <p className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
              Assign Courses
            </p>
            <div className="flex flex-wrap gap-2">
              {courses.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => toggleCourse(c.name)}
                  className={`px-4 py-3 rounded-2xl text-sm sm:text-base font-black transition-all border min-h-11 ${
                    selectedCourses.includes(c.name)
                      ? "bg-purple-600 border-purple-400 shadow-lg"
                      : "bg-slate-800 border-slate-700 text-slate-300"
                  }`}
                >
                  {c.name} {selectedCourses.includes(c.name) && "✓"}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={saveFaculty}
            className="btn neon-btn bg-purple-600 text-white"
          >
            <span className="text-xl">💾</span>
            SAVE FACULTY & FACE
          </button>
        </div>
      </div>
    </div>
  );
}