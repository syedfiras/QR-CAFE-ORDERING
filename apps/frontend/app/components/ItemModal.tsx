import React, { useState } from "react";
import Image from "next/image";
import Button from "./Button";

interface MenuItem {
  id: string;
  name: string;
  price: number;
  image_url: string;
  description?: string;
  is_available: boolean;
}

interface ItemModalProps {
  item: MenuItem;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (item: MenuItem, quantity: number) => void;
}

export default function ItemModal({
  item,
  isOpen,
  onClose,
  onAddToCart,
}: ItemModalProps) {
  const [quantity, setQuantity] = useState(1);

  if (!isOpen) return null;

  const handleAdd = () => {
    onAddToCart(item, quantity);
    setQuantity(1);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-neutral-900/40 backdrop-blur-md animate-fade-in p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-2xl rounded-[2rem] shadow-elegant max-h-[90vh] overflow-y-auto animate-slide-up border-2 border-primary-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image Section */}
        <div className="relative h-80 w-full bg-gradient-to-br from-neutral-100 to-primary-50 overflow-hidden">
          {item.image_url ? (
            <Image
              src={item.image_url}
              alt={item.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <span className="text-9xl opacity-20">🍽️</span>
            </div>
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-12 h-12 bg-white/95 backdrop-blur-sm rounded-2xl shadow-elegant hover:shadow-glow transition-all hover:scale-110 active:scale-95 flex items-center justify-center group"
          >
            <svg
              className="w-6 h-6 text-neutral-600 group-hover:text-neutral-900 transition-colors"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content Section */}
        <div className="p-8 space-y-6">
          {/* Header */}
          <div className="flex justify-between items-start gap-6">
            <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 leading-tight flex-1">
              {item.name}
            </h2>
            <div className="bg-gradient-to-br from-primary-500 to-primary-600 text-white px-5 py-2.5 rounded-2xl shadow-elegant shrink-0">
              <p className="font-bold text-2xl">₹{item.price}</p>
            </div>
          </div>

          {/* Description */}
          {item.description && (
            <div className="bg-gradient-to-br from-cream-50 to-primary-50 rounded-2xl p-5 border-2 border-primary-100">
              <p className="text-neutral-700 leading-relaxed text-base">
                {item.description}
              </p>
            </div>
          )}

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-primary-200 to-transparent" />

          {/* Quantity Selector */}
          <div className="bg-gradient-to-br from-white to-neutral-50 rounded-2xl p-6 border-2 border-neutral-100 shadow-soft">
            <div className="flex items-center justify-between">
              <span className="font-bold text-neutral-800 text-lg">Quantity</span>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-12 h-12 rounded-2xl border-2 border-primary-300 text-primary-500 font-bold text-2xl hover:bg-primary-50 hover:border-primary-400 active:scale-95 transition-all flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed shadow-soft shrink-0"
                  disabled={quantity <= 1}
                >
                  −
                </button>
                <span className="text-3xl font-bold text-neutral-900 min-w-[3rem] text-center tabular-nums">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-12 h-12 rounded-2xl text-white font-bold text-2xl hover:shadow-glow active:scale-95 transition-all flex items-center justify-center shadow-elegant shrink-0"
                  style={{background: '#8B4367'}}
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAdd}
            className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-2xl py-5 font-bold text-lg shadow-elegant hover:shadow-glow hover:from-primary-600 hover:to-primary-700 active:scale-[0.98] transition-all flex items-center justify-center gap-3 group"
          >
            <span>Add to Cart</span>
            <span className="opacity-60">•</span>
            <span className="text-xl font-bold">₹{item.price * quantity}</span>
            <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}