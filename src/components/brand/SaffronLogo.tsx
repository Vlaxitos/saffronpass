import React from "react";

interface SaffronLogoProps {
  variant?: "dark" | "light";
  compact?: boolean;
  className?: string;
}

export function SaffronLogo({
  variant = "dark",
  compact = false,
  className = "",
}: SaffronLogoProps) {
  const textColor = variant === "light" ? "text-[#FCF8F1]" : "text-[#4A101C]";
  const accentColor = variant === "light" ? "#E7C06B" : "#C88A2E";
  const ringBg = variant === "light" ? "rgba(231, 192, 107, 0.14)" : "rgba(91, 20, 34, 0.06)";

  return (
    <span className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <svg
        width="34"
        height="34"
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="shrink-0"
      >
        <circle cx="18" cy="18" r="16.5" fill={ringBg} stroke={accentColor} strokeWidth="1.2" />
        <circle
          cx="18"
          cy="18"
          r="13.2"
          stroke={accentColor}
          strokeWidth="0.7"
          strokeDasharray="2 2.2"
          opacity="0.75"
        />
        {/* Stylized lotus petal & royal monogram diamond */}
        <path
          d="M18 8.2C19.8 11.4 22.8 14.3 25.5 18C22.8 21.7 19.8 24.6 18 27.8C16.2 24.6 13.2 21.7 10.5 18C13.2 14.3 16.2 11.4 18 8.2Z"
          stroke={accentColor}
          strokeWidth="1.35"
          strokeLinejoin="round"
        />
        <path
          d="M18 12.2C19.2 14.6 20.6 16.2 22.2 18C20.6 19.8 19.2 21.4 18 23.8C16.8 21.4 15.4 19.8 13.8 18C15.4 16.2 16.8 14.6 18 12.2Z"
          fill={accentColor}
          fillOpacity="0.22"
          stroke={accentColor}
          strokeWidth="1"
        />
        <circle cx="18" cy="18" r="2.1" fill={accentColor} />
      </svg>

      {!compact && (
        <span
          className={`font-display text-[19px] font-semibold tracking-[0.08em] leading-none sm:text-[21px] ${textColor}`}
        >
          Saffron<span className="text-[#B88433]">Pass</span>
        </span>
      )}
    </span>
  );
}
