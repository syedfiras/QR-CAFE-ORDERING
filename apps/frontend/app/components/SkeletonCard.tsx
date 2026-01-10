import React from "react";

interface SkeletonCardProps {
  variant?: "menu" | "order" | "metric";
}

export default function SkeletonCard({ variant = "menu" }: SkeletonCardProps) {
  if (variant === "menu") {
    return (
      <div className="bg-white rounded-2xl shadow-soft p-4 animate-pulse">
        <div className="bg-neutral-200 h-48 rounded-xl mb-4" />
        <div className="bg-neutral-200 h-5 w-3/4 rounded mb-2" />
        <div className="bg-neutral-200 h-4 w-1/2 rounded" />
      </div>
    );
  }

  if (variant === "order") {
    return (
      <div className="bg-white rounded-2xl shadow-soft p-6 animate-pulse">
        <div className="bg-neutral-200 h-6 w-1/3 rounded mb-4" />
        <div className="space-y-3">
          <div className="bg-neutral-200 h-4 w-full rounded" />
          <div className="bg-neutral-200 h-4 w-5/6 rounded" />
          <div className="bg-neutral-200 h-4 w-4/6 rounded" />
        </div>
      </div>
    );
  }

  if (variant === "metric") {
    return (
      <div className="bg-white rounded-2xl shadow-soft p-6 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="bg-neutral-200 h-10 w-10 rounded-full" />
          <div className="bg-neutral-200 h-8 w-16 rounded" />
        </div>
        <div className="bg-neutral-200 h-4 w-2/3 rounded mt-4" />
      </div>
    );
  }

  return null;
}
