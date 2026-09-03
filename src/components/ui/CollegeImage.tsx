"use client";

import Image from "next/image";
import { useState, type CSSProperties } from "react";
import styles from "./CollegeImage.module.css";

export type CollegeImageVariant = "thumb" | "cover";

const FALLBACK_IMAGE = "/images/hero_campus.jpg";

interface CollegeImageProps {
  src: string | null | undefined;
  alt: string;
  variant?: CollegeImageVariant;
  priority?: boolean;
  sizes?: string;
  className?: string;
  style?: CSSProperties;
}

/**
 * Reusable college image that renders a Next.js Image with a consistent
 * fallback chain:
 *   1. the provided source
 *   2. the shared campus fallback if the source fails/missing
 *   3. a styled monogram placeholder if every image fails
 *
 * Fixed aspect ratio boxes prevent layout shift. All images are served from
 * /public/images, so no remote patterns are required.
 */
export default function CollegeImage({
  src,
  alt,
  variant = "thumb",
  priority,
  sizes,
  className,
  style,
}: CollegeImageProps) {
  const [source, setSource] = useState<string | null>(src ?? null);
  const [failed, setFailed] = useState(false);

  const imageSrc = source || FALLBACK_IMAGE;

  const handleError = () => {
    if (source !== FALLBACK_IMAGE) {
      setSource(FALLBACK_IMAGE);
    } else {
      setFailed(true);
    }
  };

  const boxClass = variant === "cover" ? styles.cover : styles.thumb;

  if (failed) {
    // Monogram placeholder — a graceful, branded fallback when no image loads.
    const initial = alt.trim().charAt(0).toUpperCase() || "C";
    return (
      <div
        className={`${boxClass} ${styles.placeholder} ${className ?? ""}`}
        style={style}
        role="img"
        aria-label={alt}
      >
        <span>{initial}</span>
      </div>
    );
  }

  return (
    <div className={`${boxClass} ${className ?? ""}`} style={style}>
      <Image
        src={imageSrc}
        alt={alt}
        fill
        style={{ objectFit: "cover" }}
        priority={priority}
        sizes={sizes ?? "(max-width: 768px) 72px, 80px"}
        onError={handleError}
      />
    </div>
  );
}
