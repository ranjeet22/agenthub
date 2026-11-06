"use client";

import React from "react";
import Image from "next/image";

export interface AvatarProps {
  src?: string;
  alt: string;
  size?: 28 | 40 | 64 | 96 | 112 | 128 | 164 | 200;
  float?: boolean;
  className?: string;
  fallbackLetter?: string;
  tintColor?: string;
  accentColor?: string;
  onClick?: () => void;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  size = 40,
  float = false,
  className = "",
  fallbackLetter,
  tintColor,
  accentColor,
  onClick,
}) => {
  const sizeClasses: Record<number, string> = {
    28: "w-7 h-7 text-xs",
    40: "w-10 h-10 text-sm",
    64: "w-16 h-16 text-xl",
    96: "w-24 h-24 text-2xl",
    112: "w-28 h-28 text-3xl",
    128: "w-32 h-32 text-4xl",
    164: "w-[164px] h-[164px] text-4xl",
    200: "w-[200px] h-[200px] text-5xl",
  };

  const roundedSquircle = "rounded-[22%]";

  return (
    <div
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onClick();
        }
      }}
      className={`relative inline-flex items-center justify-center shrink-0 select-none transition-transform duration-200 ${
        float ? "animate-float" : ""
      } ${
        onClick
          ? "cursor-pointer hover:scale-105 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
          : ""
      } ${sizeClasses[size] || "w-10 h-10"} ${roundedSquircle} ${className}`}
      style={{
        boxShadow: "0 4px 14px rgba(0, 0, 0, 0.08)",
      }}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          width={size}
          height={size}
          className={`w-full h-full object-contain ${roundedSquircle}`}
          priority={size >= 96}
        />
      ) : (
        <div
          className={`w-full h-full flex items-center justify-center font-semibold uppercase ${roundedSquircle}`}
          style={{
            backgroundColor: tintColor || "var(--bg-subtle)",
            color: accentColor || "var(--text)",
          }}
        >
          {fallbackLetter || alt.charAt(0)}
        </div>
      )}
    </div>
  );
};
