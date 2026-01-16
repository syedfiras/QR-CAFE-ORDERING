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
    "font-bold rounded-xl transition-all duration-200 active:scale-95 disabled:active:scale-100 flex items-center justify-center";

  const variants = {
    primary:
      "bg-primary-500 text-white shadow-soft hover:bg-primary-600 hover:shadow-soft-lg disabled:bg-neutral-200 disabled:text-neutral-400",
    secondary:
      "bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 shadow-sm",
    destructive:
      "bg-white text-red-600 border border-red-200 hover:bg-red-50 hover:border-red-300 shadow-sm",
    ghost: "text-neutral-600 hover:bg-neutral-100",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-5 py-2.5 text-base",
    lg: "px-6 py-3 text-lg",
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
