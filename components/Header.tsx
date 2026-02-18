"use client";
import { useRouter } from "next/navigation";

export default function Header({ title }: { title: string }) {
  const router = useRouter();
  return (
    <div className="flex items-center gap-4 mb-8 pt-2">
      <button onClick={() => router.back()} className="p-3 glass-card rounded-full text-blue-400 active:scale-90 transition-all">
        ←
      </button>
      <h1 className="text-2xl font-black tracking-tight">{title}</h1>
    </div>
  );
}