"use client";
import { useState, useEffect, useRef } from "react";
import * as faceapi from "face-api.js";
import { getStorage, setStorage } from "@/lib/dataStore";
import Header from "@/components/Header";

export default function RegisterStudent() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [allBatches, setAllBatches] = useState<any[]>([]);
  const [filteredBatches, setFilteredBatches] = useState<any[]>([]);
  const [status, setStatus] = useState("Initializing Camera...");
  
  const [name, setName] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("");

  useEffect(() => {
    setCourses(getStorage("courses"));
    setAllBatches(getStorage("batches"));

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

      setStatus("Ready to Scan");
    } catch (error: any) {
      let message = "Unable to access camera.";
      if (error?.name === "NotAllowedError" || error?.name === "PermissionDeniedError") {
        message = "Camera denied. Enable permissions in app settings.";
      } else if (error?.name === "NotFoundError") {
        message = "No camera device found.";
      }
      setStatus(message);
    }
  };

  const handleCourseChange = (courseName: string) => {
    setSelectedCourse(courseName);
    const batches = allBatches.filter(b => b.courseName === courseName);
    setFilteredBatches(batches);
  };

  const registerStudent = async () => {
    if (!name || !selectedBatch) {
      alert("Please fill name, course and batch.");
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
      alert("Face not detected! Please ask student to look at camera.");
      return;
    }

    const students = getStorage("students");
    students.push({
      name,
      courseName: selectedCourse,
      batchName: selectedBatch,
      descriptor: Array.from(detect.descriptor)
    });
    setStorage("students", students);
    alert("Student Registered Successfully!");
    setName("");
  };

  return (
    <div className="app-page">
      <div className="app-container">
        <Header title="Enroll Student" />
        
        <div className="relative mb-5 sm:mb-6">
          <video 
            ref={videoRef} 
            autoPlay 
            muted 
            playsInline
            controls={false}
            className="w-full h-60 sm:h-72 md:h-80 object-cover rounded-3xl border-2 border-orange-500/50 shadow-2xl shadow-orange-500/20 bg-black" 
            onClick={startCamera}
          />
          <div className="absolute bottom-4 left-0 right-0 text-center">
              <span className="bg-black/60 text-orange-300 px-3 sm:px-4 py-1 rounded-full text-[11px] sm:text-xs">
                {status}
              </span>
          </div>
        </div>
        
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
              {courses.map((c) => (
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
      </div>
    </div>
  );
}