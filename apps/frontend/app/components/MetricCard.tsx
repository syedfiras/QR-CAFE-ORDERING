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
  color = "",
}: MetricCardProps) {
  return (
    <div className="bg-white rounded-[2rem] shadow-sm p-6 border border-neutral-100/50 hover:shadow-soft-lg transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-center justify-between mb-4">
        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl`}
        >
          {icon}
        </div>
        <div className={`text-4xl font-display font-bold text-${color} tracking-tight`}>{value}</div>
      </div>
      <div>
        <p className="text-neutral-500 text-sm font-bold uppercase tracking-wider">{label}</p>
        {trend && (
          <p className="text-neutral-400 text-xs mt-1 font-medium">{trend}</p>
        )}
      </div>
    </div>
  );
}
