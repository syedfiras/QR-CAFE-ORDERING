import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "destructive" | "ghost";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
  loading?: boolean;
}

export default function Button({
  variant = "primary",
  size = "md",
  children,
  loading = false,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    "font-medium rounded-2xl transition-all duration-200 active:scale-95 disabled:active:scale-100";

  const variants = {
    primary:
      "bg-primary-300 text-white shadow-soft hover:bg-primary-400 hover:shadow-soft-lg disabled:bg-neutral-200",
    secondary:
      "bg-white text-primary-300 border-2 border-primary-300 hover:bg-primary-50",
    destructive:
      "bg-status-cancelled text-white shadow-soft hover:bg-red-500",
    ghost: "text-primary-300 hover:bg-primary-50",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <div className="flex items-center justify-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          <span>Loading...</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
}
