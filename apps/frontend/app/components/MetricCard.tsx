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
    <div className="bg-white rounded-2xl shadow-sm p-4 border border-neutral-100 flex items-center gap-4 hover:shadow-md transition-all duration-200">
      <div className="w-10 h-10 rounded-xl bg-neutral-50 flex items-center justify-center text-xl shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-neutral-400 text-xs font-bold uppercase tracking-wider mb-0.5 whitespace-nowrap">
          {label}
        </p>
        <div className="flex items-end gap-2">
          <span className={`text-2xl font-display font-bold ${colorClass} leading-none`}>
            {value}
          </span>
          {trend && (
            <span className="text-neutral-400 text-[10px] font-medium mb-0.5">
              {trend}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
