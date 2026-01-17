import React from "react";
import Image from "next/image";
import { menuImages } from "../utils/menuImages";

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
  const imageUrl = item.image_url || menuImages[item.name];

  return (
    <button
      onClick={onClick}
      disabled={!item.is_available}
      className="group relative rounded-3xl shadow-soft active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed text-left w-full border-2 border-neutral-200 overflow-hidden"
      style={{background: '#FFFBF7'}}
    >
      {/* Image Container */}
      <div className="relative h-52 w-full bg-gradient-to-br from-neutral-100 to-primary-50 overflow-hidden">
        {imageUrl ? (
          <>
            <Image
              src={imageUrl}
              alt={item.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-700"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-7xl opacity-30 group-hover:scale-110 transition-transform duration-500">
              🍽️
            </div>
          </div>
        )}
        
        {/* Unavailable Overlay */}
        {!item.is_available && (
          <div className="absolute inset-0 bg-neutral-900/70 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-white px-5 py-2.5 rounded-full shadow-soft">
              <span className="text-neutral-900 font-bold text-sm">Currently Unavailable</span>
            </div>
          </div>
        )}

        {/* Decorative Corner Element */}
        <div className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-soft opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:scale-110">
          <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-2">
        <h3 className="font-bold text-neutral-900 text-lg leading-tight line-clamp-2 group-hover:text-primary-600 transition-colors">
          {item.name}
        </h3>
        
        {/* Price with accent background */}
        <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-primary-50 to-primary-100 px-3 py-1.5 rounded-full border border-primary-200">
          <span className="text-primary-700 font-bold text-xl">₹{item.price}</span>
        </div>

        {item.description && (
          <p className="text-neutral-500 text-sm leading-relaxed line-clamp-2 pt-1">
            {item.description}
          </p>
        )}
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
    </button>
  );
}