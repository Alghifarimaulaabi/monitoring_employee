"use client";

import { useState } from "react";
import { Calendar, MapPin, Flower2, X, ExternalLink } from "lucide-react";
import LazyImage from "@/components/lazy-image";

interface BouquetHistoryCardProps {
  post: {
    id: string;
    imageUrl: string;
    installDate: Date | string;
    locationName: string;
    flowerCount: number;
    createdAt: Date | string;
  };
}

export default function BouquetHistoryCard({ post }: BouquetHistoryCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  const formattedDate = new Intl.DateTimeFormat("id-ID", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(post.installDate));

  return (
    <>
      <div
        onClick={() => setIsOpen(true)}
        className="bg-white rounded-2xl border border-gray-200/80 shadow-2xs overflow-hidden hover:shadow-md transition-all cursor-pointer group flex flex-col"
      >
        {/* Thumbnail Preview */}
        <div className="relative aspect-4/3 bg-gray-100 overflow-hidden">
          <LazyImage
            src={post.imageUrl}
            alt={post.locationName}
            className="group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-xs text-white text-[11px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1">
            <Flower2 className="w-3 h-3 text-pink-300" />
            <span>{post.flowerCount} pcs</span>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-3.5 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-rose-600 mb-1">
              <Calendar className="w-3 h-3" />
              <span>{formattedDate}</span>
            </div>
            <h3 className="text-xs font-semibold text-gray-900 line-clamp-2 leading-snug">
              {post.locationName}
            </h3>
          </div>

          <div className="mt-2.5 pt-2 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-400">
            <span>Bukti Terverifikasi</span>
            <span className="group-hover:text-rose-600 font-medium transition-colors">
              Lihat Foto →
            </span>
          </div>
        </div>
      </div>

      {/* Full Photo Modal */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-lg w-full bg-white rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-150"
          >
            {/* Modal Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-900">{post.locationName}</h3>
                <p className="text-xs text-gray-500">
                  {formattedDate} • {post.flowerCount} tangkai
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Image */}
            <div className="relative bg-black max-h-[70vh] flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.imageUrl}
                alt={post.locationName}
                className="max-h-[70vh] w-auto max-w-full object-contain"
              />
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                <span>{post.locationName}</span>
              </span>
              <a
                href={post.imageUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-medium text-rose-600 hover:text-rose-700 flex items-center gap-1"
              >
                <span>Buka Asli</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
