import React from "react";

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export default function EmptyState({
  icon = "🍽️",
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center animate-fade-in">
      <div className="w-24 h-24 bg-neutral-100 rounded-full flex items-center justify-center text-5xl mb-6 shadow-soft">
        {icon}
      </div>
      <h3 className="text-2xl font-display font-bold text-neutral-800 mb-3 tracking-tight">{title}</h3>
      {description && (
        <p className="text-neutral-500 mb-8 max-w-sm text-lg leading-relaxed">{description}</p>
      )}
      {action && <div className="animate-scale-in">{action}</div>}
    </div>
  );
}
