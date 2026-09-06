"use client";

import React from "react";

/**
 * Traditional Indian Folk Art Top Border (Repeating triangles, diamonds, dots, lotus buds)
 */
export function TopDecorativeBorder() {
  return (
    <div className="w-full overflow-hidden bg-[#F7EFD9] select-none pointer-events-none border-b border-[#D8CABA]/70">
      <svg
        viewBox="0 0 1440 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-5 sm:h-6 text-[#245B35]"
        preserveAspectRatio="repeat-x"
      >
        <pattern id="desi-top-trim" width="120" height="24" patternUnits="userSpaceOnUse">
          {/* Top Line */}
          <line x1="0" y1="2" x2="120" y2="2" stroke="#3F2918" strokeWidth="1.5" />
          
          {/* Repeating Triangles & Diamonds */}
          <path d="M0 2 L10 14 L20 2 Z" fill="#B85C38" stroke="#3F2918" strokeWidth="1" />
          <circle cx="10" cy="7" r="1.5" fill="#FAF5E8" />

          <path d="M20 14 L30 2 L40 14 Z" fill="#245B35" stroke="#3F2918" strokeWidth="1" />
          <circle cx="30" cy="9" r="1.5" fill="#FAF5E8" />

          <path d="M40 2 L50 14 L60 2 Z" fill="#C99A3A" stroke="#3F2918" strokeWidth="1" />
          <circle cx="50" cy="7" r="1.5" fill="#FAF5E8" />

          {/* Center Lotus Motif */}
          <path d="M60 14 C65 6, 75 6, 80 14 C75 20, 65 20, 60 14 Z" fill="#B85C38" stroke="#3F2918" strokeWidth="1" />
          <circle cx="70" cy="14" r="2" fill="#FAF5E8" />
          
          <path d="M80 2 L90 14 L100 2 Z" fill="#245B35" stroke="#3F2918" strokeWidth="1" />
          <circle cx="90" cy="7" r="1.5" fill="#FAF5E8" />

          <path d="M100 14 L110 2 L120 14 Z" fill="#B85C38" stroke="#3F2918" strokeWidth="1" />
          <circle cx="110" cy="9" r="1.5" fill="#FAF5E8" />

          {/* Bottom Line & Dots */}
          <line x1="0" y1="20" x2="120" y2="20" stroke="#3F2918" strokeWidth="1.5" />
          <circle cx="15" cy="22" r="1" fill="#3F2918" />
          <circle cx="45" cy="22" r="1" fill="#3F2918" />
          <circle cx="75" cy="22" r="1" fill="#3F2918" />
          <circle cx="105" cy="22" r="1" fill="#3F2918" />
        </pattern>
        <rect width="100%" height="24" fill="url(#desi-top-trim)" />
      </svg>
    </div>
  );
}

/**
 * Folk Art Bottom Trim for Feature Cards
 */
export function CardBottomTrim({ color = "#245B35" }: { color?: string }) {
  return (
    <div className="w-full h-3.5 overflow-hidden select-none">
      <svg
        viewBox="0 0 200 14"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        preserveAspectRatio="none"
      >
        <line x1="0" y1="2" x2="200" y2="2" stroke="#3F2918" strokeWidth="1" strokeDasharray="3 3" />
        <path
          d="M0 12 L10 4 L20 12 L30 4 L40 12 L50 4 L60 12 L70 4 L80 12 L90 4 L100 12 L110 4 L120 12 L130 4 L140 12 L150 4 L160 12 L170 4 L180 12 L190 4 L200 12"
          stroke={color}
          strokeWidth="1.5"
          fill="none"
        />
        <circle cx="10" cy="8" r="1" fill={color} />
        <circle cx="30" cy="8" r="1" fill={color} />
        <circle cx="50" cy="8" r="1" fill={color} />
        <circle cx="70" cy="8" r="1" fill={color} />
        <circle cx="90" cy="8" r="1" fill={color} />
        <circle cx="110" cy="8" r="1" fill={color} />
        <circle cx="130" cy="8" r="1" fill={color} />
        <circle cx="150" cy="8" r="1" fill={color} />
        <circle cx="170" cy="8" r="1" fill={color} />
        <circle cx="190" cy="8" r="1" fill={color} />
      </svg>
    </div>
  );
}

/**
 * Traditional Indian Sun Motif (Radiating solar face)
 */
export function DesiSunMotif({ className = "w-24 h-24" }: { className?: string }) {
  return (
    <div className={`relative ${className} select-none pointer-events-none`}>
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Radiating Flames / Rays */}
        <g stroke="#9C4123" strokeWidth="1.5" fill="#C99A3A">
          {[...Array(16)].map((_, i) => (
            <path
              key={i}
              d="M50 10 C47 18, 53 18, 50 24 C46 18, 54 18, 50 10 Z"
              transform={`rotate(${i * 22.5} 50 50)`}
            />
          ))}
        </g>
        {/* Outer Ring */}
        <circle cx="50" cy="50" r="23" fill="#FAF5E8" stroke="#3F2918" strokeWidth="1.8" />
        <circle cx="50" cy="50" r="20" stroke="#9C4123" strokeWidth="1" strokeDasharray="2 2" />
        
        {/* Friendly Sun Face */}
        {/* Tilak / Bindi */}
        <path d="M50 33 L50 38" stroke="#9C4123" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="50" cy="40" r="1.3" fill="#9C4123" />
        {/* Eyes */}
        <ellipse cx="43" cy="47" rx="2.5" ry="1.5" fill="#3F2918" />
        <ellipse cx="57" cy="47" rx="2.5" ry="1.5" fill="#3F2918" />
        <path d="M40 44 Q43 42 46 44" stroke="#3F2918" strokeWidth="1" fill="none" />
        <path d="M54 44 Q57 42 60 44" stroke="#3F2918" strokeWidth="1" fill="none" />
        {/* Nose */}
        <path d="M50 47 L49 52 L51 52" stroke="#3F2918" strokeWidth="1.2" fill="none" />
        {/* Smile */}
        <path d="M43 56 Q50 62 57 56" stroke="#3F2918" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        {/* Cheeks */}
        <circle cx="41" cy="52" r="1.5" fill="#B85C38" opacity="0.6" />
        <circle cx="59" cy="52" r="1.5" fill="#B85C38" opacity="0.6" />
      </svg>
    </div>
  );
}

/**
 * Hand-drawn Tree & Peacock Folk Art Motif for Left Margin
 */
export function DesiFolkTree() {
  return (
    <div className="w-28 sm:w-36 h-auto select-none pointer-events-none opacity-90">
      <svg viewBox="0 0 120 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Trunk & Main Branches */}
        <path
          d="M60 170 Q60 120 55 90 Q40 60 20 40 M55 90 Q70 60 95 35 M55 90 Q58 50 60 25 M45 110 Q25 100 15 80 M65 115 Q85 105 100 85"
          stroke="#3F2918"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        {/* Stylized Leaves / Flowers */}
        <g fill="#245B35" stroke="#3F2918" strokeWidth="1">
          <ellipse cx="20" cy="38" rx="8" ry="4" transform="rotate(-30 20 38)" />
          <ellipse cx="60" cy="22" rx="8" ry="4" />
          <ellipse cx="95" cy="33" rx="8" ry="4" transform="rotate(30 95 33)" />
          <ellipse cx="15" cy="78" rx="8" ry="4" transform="rotate(-40 15 78)" />
          <ellipse cx="100" cy="83" rx="8" ry="4" transform="rotate(40 100 83)" />
          <ellipse cx="38" cy="65" rx="6" ry="3" transform="rotate(-20 38 65)" />
          <ellipse cx="75" cy="68" rx="6" ry="3" transform="rotate(20 75 68)" />
        </g>
        {/* Terracotta Buds */}
        <circle cx="20" cy="38" r="2.5" fill="#B85C38" />
        <circle cx="60" cy="22" r="2.5" fill="#B85C38" />
        <circle cx="95" cy="33" r="2.5" fill="#B85C38" />
        <circle cx="15" cy="78" r="2.5" fill="#B85C38" />
        <circle cx="100" cy="83" r="2.5" fill="#B85C38" />

        {/* Small Bird / Peacock perched on branch */}
        <path d="M75 100 C80 90 95 90 90 102 C85 106 78 106 75 100 Z" fill="#245B35" stroke="#3F2918" strokeWidth="1" />
        <circle cx="78" cy="94" r="3" fill="#245B35" stroke="#3F2918" strokeWidth="1" />
        <path d="M76 94 L72 95 L76 96" stroke="#C99A3A" strokeWidth="1" />
        <path d="M90 102 Q105 105 110 115" stroke="#245B35" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </div>
  );
}

/**
 * Vertical Madhubani Divider Motif (Used in Lower Language section)
 */
export function DesiVerticalDivider() {
  return (
    <div className="hidden lg:flex flex-col items-center justify-center h-full py-4 select-none pointer-events-none opacity-80">
      <svg width="24" height="120" viewBox="0 0 24 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <line x1="12" y1="0" x2="12" y2="120" stroke="#C7B99E" strokeWidth="1.5" strokeDasharray="3 3" />
        {/* Top Flower */}
        <circle cx="12" cy="20" r="6" fill="#FAF5E8" stroke="#B85C38" strokeWidth="1.5" />
        <circle cx="12" cy="20" r="2" fill="#245B35" />
        {/* Center Diamond */}
        <rect x="7" y="55" width="10" height="10" transform="rotate(45 12 60)" fill="#FAF5E8" stroke="#245B35" strokeWidth="1.5" />
        <circle cx="12" cy="60" r="1.5" fill="#B85C38" />
        {/* Bottom Flower */}
        <circle cx="12" cy="100" r="6" fill="#FAF5E8" stroke="#B85C38" strokeWidth="1.5" />
        <circle cx="12" cy="100" r="2" fill="#245B35" />
      </svg>
    </div>
  );
}

/**
 * Traditional Sprout Logo Icon (Hand-drawn style for navbar)
 */
export function DesiSproutLogo({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Central Sprout Stem */}
      <path d="M16 26 C16 19 16 12 16 7" stroke="#FAF5E8" strokeWidth="2.5" strokeLinecap="round" />
      {/* Left Leaf */}
      <path d="M16 16 C10 16 6 12 8 8 C12 8 16 12 16 16 Z" fill="#FAF5E8" stroke="#FAF5E8" strokeWidth="1" />
      {/* Right Leaf */}
      <path d="M16 12 C22 12 26 8 24 4 C20 4 16 8 16 12 Z" fill="#FAF5E8" stroke="#FAF5E8" strokeWidth="1" />
      {/* Soil Mound */}
      <path d="M10 26 Q16 23 22 26" stroke="#FAF5E8" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
