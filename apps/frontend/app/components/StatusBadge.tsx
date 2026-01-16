import React from "react";

interface StatusBadgeProps {
  status: "PENDING" | "PREPARING" | "COMPLETED" | "CANCELLED";
  size?: "sm" | "md";
}

export default function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const statusConfig = {
    PENDING: {
      label: "Pending",
      color: "bg-status-pending text-white", // Amber/Yellow
    },
    PREPARING: {
      label: "Preparing",
      color: "bg-status-preparing text-white", // Blue
    },
    COMPLETED: {
      label: "Completed",
      color: "bg-status-completed text-white", // Green
    },
    CANCELLED: {
      label: "Cancelled",
      color: "bg-status-cancelled text-white", // Red
    },
  };

  const sizeStyles = {
    sm: "px-3 py-1 text-xs",
    md: "px-4 py-2 text-sm",
  };

  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center justify-center font-semibold rounded-full ${config.color} ${sizeStyles[size]}`}
    >
      {config.label}
    </span>
  );
}
