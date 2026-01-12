"use client";

import React, { useEffect, useState } from "react";
import Button from "./Button";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: (quantity?: number) => void;
  onCancel: () => void;
  variant?: "primary" | "secondary" | "destructive";
  maxQuantity?: number;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  variant = "primary",
  maxQuantity = 1,
}: ConfirmModalProps) {
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setQty(maxQuantity); // Default to full quantity for cancellation
    }
  }, [isOpen, maxQuantity]);

  const handleAnimationEnd = () => {
    if (!isOpen) setShouldRender(false);
  };

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed inset-0 z-[60] flex items-center justify-center p-4 transition-all duration-300 ${
        isOpen ? "opacity-100" : "opacity-0"
      }`}
      onTransitionEnd={handleAnimationEnd}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal Content */}
      <div
        className={`relative bg-white rounded-3xl shadow-soft-xl max-w-sm w-full p-8 transform transition-all duration-300 ${
          isOpen ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
        }`}
      >
        <div className="text-center">
          <h3 className="font-display text-2xl font-bold text-neutral-800 mb-2">
            {title}
          </h3>
          <p className="text-neutral-500 mb-6 leading-relaxed">
            {message}
          </p>

          {/* Quantity Selector for Partial Cancellation */}
          {maxQuantity > 1 && (
            <div className="bg-neutral-50 p-4 rounded-2xl mb-8 flex items-center justify-between">
              <span className="text-sm font-bold text-neutral-400 uppercase tracking-widest">Qty to cancel</span>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="w-8 h-8 rounded-full bg-white border border-neutral-200 flex items-center justify-center text-xl hover:bg-primary-50 active:scale-95 transition-all text-neutral-600"
                >
                  -
                </button>
                <span className="text-xl font-bold text-neutral-800 w-8">{qty}</span>
                <button 
                  onClick={() => setQty(Math.min(maxQuantity, qty + 1))}
                  className="w-8 h-8 rounded-full bg-white border border-neutral-200 flex items-center justify-center text-xl hover:bg-primary-50 active:scale-95 transition-all text-neutral-600"
                >
                  +
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <Button
              variant={variant}
              onClick={() => onConfirm(maxQuantity > 1 ? qty : undefined)}
              className="py-4 rounded-2xl text-lg font-bold w-full"
            >
              {confirmLabel}
            </Button>
            <button
              onClick={onCancel}
              className="py-3 text-neutral-400 font-semibold hover:text-neutral-600 transition-colors"
            >
              {cancelLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
