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
  color = "text-neutral-800",
}: MetricCardProps) {
  // Map color names to actual Tailwind classes if needed, or pass full classes
  const colorClass = color.startsWith("text-") ? color : `text-${color}`;

  return (
    <div className="bg-white rounded-2xl p-5 shadow-soft border-2 border-neutral-200 hover:shadow-soft-lg transition-all">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-2xl">{icon}</span>
        <p className="text-neutral-500 text-sm font-semibold uppercase tracking-wide">{label}</p>
      </div>
      <p className={`text-3xl font-bold ${typeof color === 'string' && color.startsWith('#') ? '' : color}`} style={typeof color === 'string' && color.startsWith('#') ? {color} : {}}>
        {value}
      </p>
    </div>
  );
}
