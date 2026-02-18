"use client";
import { useRouter } from "next/navigation";

export default function Header({ title }: { title: string }) {
  const router = useRouter();
  return (
    <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
      <button
        type="button"
        aria-label="Go back"
        onClick={() => router.back()}
        className="glass-card rounded-2xl px-4 py-3 min-h-12 min-w-12 text-blue-200 active:scale-[0.99] transition-transform"
      >
        <span className="text-xl sm:text-2xl leading-none">←</span>
      </button>
      <div className="min-w-0">
        <h1 className="text-xl sm:text-2xl font-black tracking-tight truncate">
          {title}
        </h1>
      </div>
    </div>
  );
}