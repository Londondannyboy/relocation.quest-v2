"use client";

import { useState, useEffect } from "react";

interface HeroSectionProps {
  destination: string;
  countryName: string;
  flag: string;
  tagline?: string;
  imageUrl?: string;
  className?: string;
}

/**
 * HeroSection - Full-bleed hero image with destination info
 *
 * Features:
 * - Dynamic Unsplash image based on destination
 * - Gradient overlay for text readability
 * - Animated text entrance
 * - Parallax-ready structure
 */
export function HeroSection({
  destination,
  countryName,
  flag,
  tagline = "Your next chapter awaits",
  imageUrl,
  className = ""
}: HeroSectionProps) {
  const [heroImage, setHeroImage] = useState<string | null>(imageUrl || null);
  const [isLoading, setIsLoading] = useState(!imageUrl);

  // Fetch Unsplash image if not provided
  useEffect(() => {
    if (!imageUrl) {
      async function fetchHeroImage() {
        try {
          const res = await fetch(
            `/api/unsplash?query=${encodeURIComponent(countryName + " landscape city")}&type=hero`
          );
          if (res.ok) {
            const data = await res.json();
            if (data.url) {
              setHeroImage(data.url);
            }
          }
        } catch (e) {
          console.error("[HeroSection] Failed to fetch image:", e);
        } finally {
          setIsLoading(false);
        }
      }
      fetchHeroImage();
    }
  }, [countryName, imageUrl]);

  return (
    <section
      className={`
        relative
        w-full
        h-[60vh] min-h-[400px] max-h-[600px]
        overflow-hidden
        ${className}
      `}
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        {isLoading ? (
          <div className="w-full h-full bg-gradient-to-br from-stone-700 via-stone-800 to-stone-900 animate-pulse" />
        ) : heroImage ? (
          <img
            src={heroImage}
            alt={`${countryName} landscape`}
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-amber-600 via-stone-700 to-stone-900" />
        )}

        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
      </div>

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-12 lg:p-16">
        <div className="max-w-4xl">
          {/* Flag & Country */}
          <div className="flex items-center gap-4 mb-4 animate-fade-in-up">
            <span className="text-6xl md:text-7xl drop-shadow-2xl">{flag}</span>
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white drop-shadow-lg">
                {countryName}
              </h1>
              <p className="text-lg md:text-xl text-white/80 mt-2 font-light">
                {tagline}
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap gap-3 mt-6 animate-fade-in-up animation-delay-200">
            <button className="px-5 py-2.5 bg-white/20 backdrop-blur-sm text-white rounded-full border border-white/30 hover:bg-white/30 transition-all text-sm font-medium">
              Explore Visas
            </button>
            <button className="px-5 py-2.5 bg-white/20 backdrop-blur-sm text-white rounded-full border border-white/30 hover:bg-white/30 transition-all text-sm font-medium">
              Cost of Living
            </button>
            <button className="px-5 py-2.5 bg-white/20 backdrop-blur-sm text-white rounded-full border border-white/30 hover:bg-white/30 transition-all text-sm font-medium">
              Compare
            </button>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 animate-bounce">
        <svg
          className="w-6 h-6 text-white/60"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </div>
    </section>
  );
}

/**
 * HomeHeroSection - Special hero for the home page
 * Features rotating destinations and search prompt
 */
export function HomeHeroSection({
  className = ""
}: {
  className?: string;
}) {
  const [currentImage, setCurrentImage] = useState(0);
  const [images, setImages] = useState<string[]>([]);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Fetch hero images on mount
  useEffect(() => {
    async function fetchImages() {
      try {
        const res = await fetch("/api/unsplash?type=hero");
        if (res.ok) {
          const data = await res.json();
          if (data.images) {
            setImages(data.images);
          }
        }
      } catch (e) {
        console.error("[HomeHero] Failed to fetch images:", e);
      }
    }
    fetchImages();
  }, []);

  // Rotate images
  useEffect(() => {
    if (images.length === 0) return;

    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentImage((prev) => (prev + 1) % images.length);
        setIsTransitioning(false);
      }, 500);
    }, 8000);

    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <section
      className={`
        relative
        w-full
        h-[70vh] min-h-[500px]
        overflow-hidden
        ${className}
      `}
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        {images.length > 0 ? (
          <img
            src={images[currentImage]}
            alt="Relocation destination"
            className={`
              w-full h-full object-cover
              transition-opacity duration-500
              ${isTransitioning ? "opacity-0" : "opacity-100"}
            `}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-amber-600 via-stone-700 to-stone-900" />
        )}

        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-center items-start p-8 md:p-12 lg:p-16">
        <div className="max-w-2xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
            Find Your Perfect
            <br />
            <span className="text-amber-400">New Home</span>
          </h1>
          <p className="text-lg md:text-xl text-white/80 mt-4 max-w-lg">
            AI-powered relocation guidance for digital nomads, remote workers, and global citizens.
            Visa requirements, cost of living, and everything you need to know.
          </p>

          {/* Search/CTA */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Where do you want to live?"
                className="w-full px-6 py-4 rounded-full bg-white/95 text-stone-900 placeholder-stone-500 shadow-xl focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-amber-500 rounded-full text-white hover:bg-amber-600 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Popular Destinations */}
          <div className="mt-6 flex flex-wrap gap-2">
            <span className="text-white/60 text-sm">Popular:</span>
            {["Portugal", "Spain", "Cyprus", "Dubai", "Thailand"].map((dest) => (
              <a
                key={dest}
                href={`/destinations/${dest.toLowerCase()}`}
                className="px-3 py-1 text-sm text-white/90 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
              >
                {dest}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/40 backdrop-blur-sm border-t border-white/10">
        <div className="max-w-6xl mx-auto px-8 py-4 flex justify-between items-center text-white/80 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-white">17</span>
            <span>Destinations</span>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-2xl font-bold text-white">210+</span>
            <span>Guides</span>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <span className="text-2xl font-bold text-white">AI</span>
            <span>Powered Advice</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-white">24/7</span>
            <span>Voice Support</span>
          </div>
        </div>
      </div>
    </section>
  );
}
