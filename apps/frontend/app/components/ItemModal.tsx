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
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black bg-opacity-50 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-2xl rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-y-auto animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image */}
        <div className="relative h-64 sm:h-80 w-full bg-neutral-100">
          {item.image_url ? (
            <Image
              src={item.image_url}
              alt={item.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-8xl">
              🍽️
            </div>
          )}

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-soft hover:shadow-soft-lg"
          >
            <svg
              className="w-6 h-6 text-neutral-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <h2 className="font-display text-3xl font-bold text-neutral-800 mb-2">
            {item.name}
          </h2>
          <p className="text-primary-400 font-bold text-2xl mb-4">
            ₹{item.price}
          </p>

          {item.description && (
            <div className="mb-6">
              <h3 className="font-semibold text-neutral-700 mb-2">
                Description
              </h3>
              <p className="text-neutral-600 leading-relaxed">
                {item.description}
              </p>
            </div>
          )}

          {/* Quantity selector */}
          <div className="mb-6">
            <h3 className="font-semibold text-neutral-700 mb-3">Quantity</h3>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-12 h-12 rounded-full border-2 border-primary-300 text-primary-300 font-bold text-xl hover:bg-primary-50 active:scale-95 transition-all"
                disabled={quantity <= 1}
              >
                −
              </button>
              <span className="text-2xl font-bold text-neutral-800 w-12 text-center">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-12 h-12 rounded-full border-2 border-primary-300 text-primary-300 font-bold text-xl hover:bg-primary-50 active:scale-95 transition-all"
              >
                +
              </button>
            </div>
          </div>

          {/* Add to order button */}
          <div className="sticky bottom-0 bg-white pt-4 pb-2 -mx-6 px-6">
            <Button size="lg" className="w-full" onClick={handleAdd}>
              Add to Order · ₹{item.price * quantity}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
