import React from "react";

interface MetricCardProps {
  icon: string;
  label: string;
  value: string | number;
  trend?: string;
  color?: string;
}

export default function MetricCard({
  icon,
  label,
  value,
  trend,
  color = "primary-300",
}: MetricCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-soft p-6 hover:shadow-soft-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div
          className={`w-12 h-12 rounded-full bg-${color} bg-opacity-10 flex items-center justify-center text-2xl`}
        >
          {icon}
        </div>
        <div className={`text-3xl font-bold text-${color}`}>{value}</div>
      </div>
      <div className="text-neutral-600 text-sm font-medium">{label}</div>
      {trend && (
        <div className="text-neutral-400 text-xs mt-1">{trend}</div>
      )}
    </div>
  );
}
