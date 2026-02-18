"use client";
import { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import { useRouter } from 'next/navigation';

export default function AttendanceSession() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState("Loading AI...");
  const [presentStudents, setPresentStudents] = useState<string[]>([]);
  const [isSessionActive, setIsSessionActive] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadModels = async () => {
      await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
      await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
      await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
      setStatus("System Ready. Scan faces!");
      startVideo();
    };
    loadModels();
  }, []);

  const startVideo = () => {
    navigator.mediaDevices.getUserMedia({ video: {} })
      .then((stream) => { if (videoRef.current) videoRef.current.srcObject = stream; });
  };

  const handleScan = async () => {
    if (!videoRef.current || !isSessionActive) return;
    setStatus("Recognizing...");

    const detection = await faceapi.detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks().withFaceDescriptor();

    if (detection) {
      const savedUsers = JSON.parse(localStorage.getItem('registered_users') || '[]');
      let match: string | null = null;

      savedUsers.forEach((user: { name: string; descriptor: number[] }) => {
        // Use face-api to calculate if the faces are similar
        const distance = faceapi.euclideanDistance(detection.descriptor, user.descriptor);
        if (distance < 0.6) match = user.name;
      });

      if (match) {
        const studentName = match as string;
        if (!presentStudents.includes(studentName)) {
          setPresentStudents((prev) => [...prev, studentName]);
          setStatus(`Attendance Marked: ${studentName}! ✅`);
        } else {
          setStatus(`${studentName} is already marked!`);
        }
      } else {
        // This now correctly runs if 'match' is null
        setStatus("Unknown Face! ❌");
      }
    } else {
      setStatus("No face detected! ⚠️");
    }
  };

  const endSession = () => {
    setIsSessionActive(false);
    // Save the final list of this session to history
    const history = JSON.parse(localStorage.getItem('attendance_history') || '[]');
    history.push({
      date: new Date().toLocaleString(),
      faculty: localStorage.getItem('currentFaculty'),
      students: presentStudents
    });
    localStorage.setItem('attendance_history', JSON.stringify(history));
    alert("Session ended and saved!");
    router.push("/faculty");
  };

  return (
    <div className="flex flex-col items-center p-4 bg-slate-900 min-h-screen text-white">
      <h1 className="text-xl font-bold mb-4">Live Attendance</h1>
      <video ref={videoRef} autoPlay muted className="w-full rounded-xl border-4 border-blue-500 mb-4" />

      <p className="bg-slate-800 p-3 rounded-lg w-full text-center mb-4">{status}</p>

      <div className="grid grid-cols-2 gap-4 w-full mb-6">
        <button onClick={handleScan} className="bg-green-600 p-4 rounded-xl font-bold">SCAN FACE</button>
        <button onClick={endSession} className="bg-red-600 p-4 rounded-xl font-bold">END SESSION</button>
      </div>

      <div className="w-full">
        <h3 className="text-slate-400 mb-2">Present Today ({presentStudents.length}):</h3>
        <div className="bg-slate-800 p-4 rounded-lg min-h-[100px]">
          {presentStudents.map((s, i) => <div key={i} className="py-1 border-b border-slate-700">{s}</div>)}
        </div>
      </div>
    </div>
  );
}