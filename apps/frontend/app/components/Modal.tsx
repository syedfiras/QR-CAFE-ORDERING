"use client";

import React, { useEffect, useState } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "max-w-4xl",
}: ModalProps) {
  const [shouldRender, setShouldRender] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleAnimationEnd = () => {
    if (!isOpen) setShouldRender(false);
  };

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 transition-all duration-300 ${
        isOpen ? "opacity-100" : "opacity-0"
      }`}
      onTransitionEnd={handleAnimationEnd}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-neutral-900/60 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div
        className={`relative bg-neutral-50 rounded-[2.5rem] shadow-soft-2xl w-full ${maxWidth} max-h-[90vh] flex flex-col overflow-hidden transform transition-all duration-500 delay-75 ${
          isOpen ? "scale-100 translate-y-0" : "scale-95 translate-y-12"
        }`}
      >
        {/* Header */}
        <div className="px-8 py-6 border-b border-neutral-200 bg-white flex items-center justify-between sticky top-0 z-10">
          <h3 className="font-display text-2xl font-bold text-neutral-800">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-neutral-100 text-neutral-500 hover:bg-primary-50 hover:text-primary-400 transition-all active:scale-95"
          >
            <span className="text-xl">✕</span>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
}
