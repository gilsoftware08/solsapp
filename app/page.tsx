"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    router.push("/login");
  }, [router]);

  return (
    <div className="app-page">
      <div className="app-container flex items-center justify-center">
        <div className="glass-card p-6 sm:p-8 border border-slate-800 text-center">
          <div className="text-3xl sm:text-4xl">⏳</div>
          <p className="mt-3 app-subtitle">Loading</p>
        </div>
      </div>
    </div>
  );
}