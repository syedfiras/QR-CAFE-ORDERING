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
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center animate-fade-in">
      <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center text-4xl mb-4 shadow-soft">
        {icon}
      </div>
      <h3 className="text-xl font-display font-bold text-neutral-800 mb-2 tracking-tight">{title}</h3>
      {description && (
        <p className="text-neutral-500 mb-6 max-w-sm text-sm leading-relaxed">{description}</p>
      )}
      {action && <div className="animate-scale-in">{action}</div>}
    </div>
  );
}
