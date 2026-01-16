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
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-white/10 backdrop-blur-md animate-fade-in p-4 sm:p-6"
      onClick={onClose}
    >
      <div
        className="bg-white/80 backdrop-blur-xl w-full max-w-2xl rounded-3xl shadow-soft-xl max-h-[85vh] overflow-y-auto animate-slide-up border border-white/50"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image */}
        <div className="relative h-72 sm:h-96 w-full bg-neutral-50 overflow-hidden">
          {item.image_url ? (
            <Image
              src={item.image_url}
              alt={item.name}
              fill
              className="object-cover transition-transform duration-700 hover:scale-105"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-9xl animate-pulse">
              🍽️
            </div>
          )}

          {/* Close button - Floated */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2.5 shadow-soft hover:shadow-soft-lg transition-all hover:scale-110 active:scale-95 z-10 group"
          >
            <svg
              className="w-5 h-5 text-neutral-500 group-hover:text-neutral-800 transition-colors"
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

        {/* Content */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex justify-between items-start gap-4">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-neutral-800 leading-tight">
              {item.name}
            </h2>
            <div className="flex-shrink-0 bg-primary-50 px-4 py-1.5 rounded-full border border-primary-100">
              <p className="text-primary-600 font-bold text-xl">
                ₹{item.price}
              </p>
            </div>
          </div>

          {item.description && (
            <div className="bg-white/50 rounded-2xl p-4 border border-white/60">
              <p className="text-neutral-600 leading-relaxed text-lg">
                {item.description}
              </p>
            </div>
          )}

          {/* Quantity selector */}
          <div className="flex items-center justify-between bg-neutral-50 rounded-2xl p-4 border border-neutral-100">
            <span className="font-semibold text-neutral-700 text-lg">Quantity</span>
            <div className="flex items-center gap-6">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-12 h-12 rounded-full border-2 border-primary-200 text-primary-400 font-bold text-xl hover:bg-primary-50 hover:border-primary-300 active:scale-95 transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={quantity <= 1}
              >
                −
              </button>
              <span className="text-2xl font-bold text-neutral-800 w-8 text-center tabular-nums">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-12 h-12 rounded-full bg-primary-500 text-white font-bold text-xl hover:bg-primary-600 hover:shadow-lg hover:shadow-primary-500/30 active:scale-95 transition-all flex items-center justify-center transform"
              >
                +
              </button>
            </div>
          </div>

          {/* Add to order button */}
          <div className="pt-2">
            <Button size="lg" className="w-full text-lg py-4 shadow-xl shadow-primary-500/20 hover:shadow-primary-500/30" onClick={handleAdd}>
              <span className="mr-2">Add to Order</span>
              <span className="opacity-80">·</span>
              <span className="ml-2 font-bold">₹{item.price * quantity}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
