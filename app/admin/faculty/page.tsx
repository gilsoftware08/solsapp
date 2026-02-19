"use client";
import { useState, useEffect, useRef } from "react";
import * as faceapi from "face-api.js";
import { getStorage, setStorage } from "@/lib/dataStore";
import Header from "@/components/Header";
import { getModelBasePath } from "@/lib/faceModels";

export default function AddFaculty() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [name, setName] = useState("");

  const [status, setStatus] = useState("Tap scan to capture face.");
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [capturedDescriptor, setCapturedDescriptor] = useState<number[] | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [facultyList, setFacultyList] = useState<any[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editSelectedCourses, setEditSelectedCourses] = useState<string[]>([]);
  const [editDescriptor, setEditDescriptor] = useState<number[] | null>(null);
  const [editPreview, setEditPreview] = useState<string | null>(null);

  useEffect(() => {
    setCourses(getStorage("courses"));
    setFacultyList(getStorage("faculty"));
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
      setStatus("Models ready. Opening camera...");
    } catch (error) {
      console.error("Face API model load error", error);
      setStatus("AI Error: Unable to load models. Ensure /public/models is bundled.");
      throw error;
    } finally {
      setIsLoadingModels(false);
    }
  };

  const startCamera = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setStatus("Camera not supported on this device.");
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

      setStatus("Align face in frame, then tap Capture.");
      setIsScanning(true);
    } catch (error: any) {
      let message = "Camera Error: Unable to access camera.";
      if (error?.name === "NotAllowedError" || error?.name === "PermissionDeniedError") {
        message = "Camera Error: Please allow permissions.";
      } else if (error?.name === "NotFoundError") {
        message = "Camera Error: No camera device found.";
      }
      setStatus(message);
      setIsScanning(false);
    }
  };

  const startScanFlow = async () => {
    try {
      await loadModelsIfNeeded();
      await startCamera();
    } catch {
      // Errors already handled in helpers
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  };

  const captureFace = async () => {
    if (!videoRef.current) return;
    setStatus("Scanning face...");

    try {
      const detection = await faceapi
        .detectSingleFace(
          videoRef.current,
          new faceapi.TinyFaceDetectorOptions()
        )
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        setStatus("No face detected. Try again.");
        return;
      }

      // Store descriptor for later save
      setCapturedDescriptor(Array.from(detection.descriptor));

      // Optional: capture preview frame
      if (canvasRef.current) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL("image/jpeg");
          setCapturedImage(dataUrl);
        }
      }

      stopCamera();
      setStatus("Face captured ✓");
    } catch (error) {
      console.error("Capture error", error);
      setStatus("Error capturing face. Try again.");
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
    if (!capturedDescriptor) {
      alert("Please scan & capture faculty face before saving.");
      return;
    }

    const faculty = getStorage("faculty");
    faculty.push({
      name,
      assignedCourses: selectedCourses,
      descriptor: capturedDescriptor,
      preview: capturedImage || undefined,
    });
    setStorage("faculty", faculty);
    alert("Faculty Registered!");
  };

  const openEdit = (index: number) => {
    const f = facultyList[index];
    setEditingIndex(index);
    setEditName(f.name);
    setEditSelectedCourses(f.assignedCourses || []);
    setEditDescriptor(f.descriptor || null);
    setEditPreview(f.preview || null);
    setCapturedDescriptor(null);
    setCapturedImage(null);
    setStatus("Tap scan to capture a new face, or keep existing.");
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditName("");
    setEditSelectedCourses([]);
    setEditDescriptor(null);
    setEditPreview(null);
    setCapturedDescriptor(null);
    setCapturedImage(null);
    setStatus("Tap scan to capture face.");
  };

  const toggleEditCourse = (cName: string) => {
    setEditSelectedCourses((prev) =>
      prev.includes(cName)
        ? prev.filter((x) => x !== cName)
        : [...prev, cName]
    );
  };

  const saveEdit = () => {
    if (editingIndex === null) return;
    if (!editName || editSelectedCourses.length === 0) {
      alert("Enter name and select at least one course.");
      return;
    }
    const nextDescriptor = capturedDescriptor || editDescriptor;
    if (!nextDescriptor) {
      alert("Faculty must have a captured face descriptor.");
      return;
    }
    const updated = facultyList.map((f, i) =>
      i === editingIndex
        ? {
            ...f,
            name: editName,
            assignedCourses: editSelectedCourses,
            descriptor: nextDescriptor,
            preview: capturedImage || editPreview || undefined,
          }
        : f
    );
    setFacultyList(updated);
    setStorage("faculty", updated);
    alert("Faculty updated.");
    cancelEdit();
  };

  return (
    <div className="app-page">
      <div className="app-container">
        <Header title="Assign Faculty" />
        
        <div className="app-card space-y-4 sm:space-y-5 mb-4">
          <p className="app-label mb-1">Faculty Face Scan</p>
          <div className="relative mb-3">
            {isScanning ? (
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                controls={false}
                className="w-full h-60 sm:h-64 object-cover rounded-3xl border-2 border-purple-500/40 shadow-2xl bg-black"
              />
            ) : capturedImage ? (
              <img
                src={capturedImage}
                alt="Captured faculty"
                className="w-full h-60 sm:h-64 object-cover rounded-3xl border-2 border-purple-500/40 shadow-2xl bg-black"
              />
            ) : (
              <div className="w-full h-52 sm:h-56 rounded-3xl border-2 border-dashed border-purple-500/40 bg-slate-950/60 flex flex-col items-center justify-center gap-2 text-slate-400">
                <span className="text-4xl">👤</span>
                <span className="text-xs sm:text-sm font-medium">
                  No face captured yet
                </span>
              </div>
            )}
            <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur px-3 py-1 rounded-full text-[11px] sm:text-xs text-purple-300">
              {status}
            </div>
          </div>

          <div className="grid grid-cols- capturedImage ? '2' : '1' gap-3 sm:gap-4">
            <button
              type="button"
              onClick={startScanFlow}
              className="btn neon-btn bg-purple-600 text-white"
              disabled={isLoadingModels}
            >
              <span className="text-xl">📷</span>
              {isScanning
                ? "SCANNING..."
                : isLoadingModels
                ? "LOADING AI..."
                : capturedImage
                ? "RESCAN FACE"
                : "SCAN FACULTY FACE"}
            </button>
            {isScanning && (
              <button
                type="button"
                onClick={captureFace}
                className="btn-success"
              >
                <span className="text-xl">✅</span>
                CAPTURE
              </button>
            )}
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
              {courses
                .filter((c: any) => c.active !== false)
                .map((c: any) => (
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

        {/* Faculty list + edit */}
        <div className="mt-6">
          <h3 className="app-subtitle mb-3 sm:mb-4">
            Registered Faculty ({facultyList.length})
          </h3>
          {facultyList.length === 0 ? (
            <p className="text-slate-500 text-sm">No faculty registered yet.</p>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {facultyList.map((f, index) => (
                <div
                  key={`${f.name}-${index}`}
                  className="glass-card p-4 sm:p-5 flex flex-col gap-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {f.preview ? (
                        <img
                          src={f.preview}
                          alt={f.name}
                          className="h-10 w-10 rounded-full object-cover border border-purple-500/60"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-purple-500/20 border border-purple-500/40 grid place-items-center text-purple-300 text-lg">
                          👨‍🏫
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-black text-sm sm:text-base truncate">
                          {f.name}
                        </p>
                        <p className="text-[11px] sm:text-xs text-slate-400 truncate">
                          {Array.isArray(f.assignedCourses)
                            ? f.assignedCourses.join(", ")
                            : ""}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => openEdit(index)}
                      className="btn-ghost !w-auto px-3 py-2 text-xs sm:text-sm"
                    >
                      Edit
                    </button>
                  </div>

                  {editingIndex === index && (
                    <div className="mt-3 space-y-3 border-t border-slate-700 pt-3">
                      <input
                        className="app-input text-sm"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Faculty full name"
                      />
                      <div>
                        <p className="app-label mb-2">Assigned Courses</p>
                        <div className="flex flex-wrap gap-2">
                          {courses
                            .filter((c: any) => c.active !== false)
                            .map((c: any) => (
                              <button
                                key={c.id}
                                type="button"
                                onClick={() => toggleEditCourse(c.name)}
                                className={`px-3 py-2 rounded-2xl text-xs sm:text-sm font-black border min-h-9 ${
                                  editSelectedCourses.includes(c.name)
                                    ? "bg-purple-600 border-purple-400 text-white"
                                    : "bg-slate-900 border-slate-700 text-slate-300"
                                }`}
                              >
                                {c.name}
                              </button>
                            ))}
                        </div>
                      </div>
                      <div className="flex justify-end gap-3">
                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="btn-ghost !w-auto px-3 py-2 text-xs sm:text-sm"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={saveEdit}
                          className="btn neon-btn bg-purple-600 text-white !w-auto px-4 py-2 text-xs sm:text-sm"
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}