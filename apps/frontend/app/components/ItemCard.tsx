import React from "react";
import Image from "next/image";

interface MenuItem {
  id: string;
  name: string;
  price: number;
  image_url: string;
  description?: string;
  is_available: boolean;
}

interface ItemCardProps {
  item: MenuItem;
  onClick: () => void;
}

export default function ItemCard({ item, onClick }: ItemCardProps) {
  return (
    <button
      onClick={onClick}
      disabled={!item.is_available}
      className="group bg-white rounded-2xl shadow-soft overflow-hidden hover:shadow-soft-lg transition-all duration-300 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed text-left w-full"
    >
      {/* Image */}
      <div className="relative h-48 w-full bg-neutral-100 overflow-hidden">
        {item.image_url ? (
          <Image
            src={item.image_url}
            alt={item.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-6xl">
            🍽️
          </div>
        )}
        {!item.is_available && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="bg-white text-neutral-800 px-4 py-2 rounded-full font-semibold text-sm">
              Unavailable
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-neutral-800 text-lg mb-1 line-clamp-1">
          {item.name}
        </h3>
        <p className="text-primary-400 font-bold text-xl">₹{item.price}</p>
        {item.description && (
          <p className="text-neutral-500 text-sm mt-2 line-clamp-2">
            {item.description}
          </p>
        )}
      </div>
    </button>
  );
}
