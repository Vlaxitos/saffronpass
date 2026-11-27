import React from "react";
import type { TraditionSymbolType } from "@/types/database";

interface TraditionSymbolProps {
  symbol: TraditionSymbolType;
  size?: number;
  className?: string;
}

/**
 * Clean, respectful inline SVG sacred & celebratory tradition emblems.
 */
export function TraditionSymbol({
  symbol,
  size = 56,
  className = "text-[#C88A2E]",
}: TraditionSymbolProps) {
  if (symbol === "none") {
    return null;
  }

  switch (symbol) {
    case "ganesh":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          role="img"
          aria-label="Shree Ganesh auspicious emblem"
        >
          {/* Decorative auspicious tilak & crown */}
          <path
            d="M32 7L35.2 14.5H28.8L32 7Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path
            d="M23 17.5C26 15.2 38 15.2 41 17.5"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
          {/* Stylized minimalist Ganesha ears */}
          <path
            d="M21 21C14 21.5 11 27.5 13 34C14.5 38.5 18.5 39.5 21.5 38"
            stroke="currentColor"
            strokeWidth="1.65"
            strokeLinecap="round"
          />
          <path
            d="M43 21C50 21.5 53 27.5 51 34C49.5 38.5 45.5 39.5 42.5 38"
            stroke="currentColor"
            strokeWidth="1.65"
            strokeLinecap="round"
          />
          {/* Forehead & graceful curving trunk */}
          <path
            d="M23.5 23.5C25.5 20.5 38.5 20.5 40.5 23.5C42 26 40 31.5 36.5 33.8C33.5 35.8 31.8 39 32.5 42.8C33.2 46.2 36.2 47.8 39 46.5C41.2 45.5 41.8 43 40.3 41.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Auspicious tilak dot */}
          <circle cx="32" cy="24.5" r="1.4" fill="currentColor" />
          {/* Gentle base lotus arc */}
          <path
            d="M20 52.5C24.5 55.2 39.5 55.2 44 52.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.85"
          />
          <circle cx="32" cy="56" r="1.3" fill="currentColor" opacity="0.85" />
        </svg>
      );

    case "bismillah":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          role="img"
          aria-label="Bismillah geometric crescent emblem"
        >
          {/* Eight-point Rub el Hizb subtle star halo */}
          <rect
            x="17"
            y="17"
            width="30"
            height="30"
            rx="2"
            stroke="currentColor"
            strokeWidth="1.15"
            opacity="0.55"
          />
          <rect
            x="17"
            y="17"
            width="30"
            height="30"
            rx="2"
            transform="rotate(45 32 32)"
            stroke="currentColor"
            strokeWidth="1.15"
            opacity="0.55"
          />
          {/* Graceful crescent moon */}
          <path
            d="M36.5 20.5C30.2 20.5 25 25.7 25 32C25 38.3 30.2 43.5 36.5 43.5C33.1 41.6 30.8 37.2 30.8 32C30.8 26.8 33.1 22.4 36.5 20.5Z"
            stroke="currentColor"
            strokeWidth="1.8"
            fill="currentColor"
            fillOpacity="0.16"
            strokeLinejoin="round"
          />
          {/* Guiding star */}
          <path
            d="M39.5 27.5L40.6 30.3L43.5 31.3L40.6 32.3L39.5 35.1L38.4 32.3L35.5 31.3L38.4 30.3L39.5 27.5Z"
            fill="currentColor"
          />
        </svg>
      );

    case "ek_onkar":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          role="img"
          aria-label="Ek Onkar sacred emblem"
        >
          {/* Subtle lotus medallion frame */}
          <circle
            cx="32"
            cy="32"
            r="24"
            stroke="currentColor"
            strokeWidth="1.2"
            opacity="0.55"
          />
          <circle
            cx="32"
            cy="32"
            r="20.5"
            stroke="currentColor"
            strokeWidth="0.8"
            strokeDasharray="2 2.5"
            opacity="0.65"
          />
          <text
            x="32"
            y="40"
            textAnchor="middle"
            fill="currentColor"
            fontSize="26"
            fontFamily="Georgia, serif"
            fontWeight="500"
          >
            ੴ
          </text>
        </svg>
      );

    case "cross":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          role="img"
          aria-label="Sacred wedding cross emblem"
        >
          {/* Botanical halo rays */}
          <circle
            cx="32"
            cy="25"
            r="12"
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="2 3"
            opacity="0.5"
          />
          {/* Vertical beam */}
          <path
            d="M32 10V54"
            stroke="currentColor"
            strokeWidth="2.1"
            strokeLinecap="round"
          />
          {/* Horizontal beam */}
          <path
            d="M19 24H45"
            stroke="currentColor"
            strokeWidth="2.1"
            strokeLinecap="round"
          />
          {/* Subtle flared finials */}
          <path
            d="M29.5 11.5L32 9L34.5 11.5M29.5 52.5L32 55L34.5 52.5M20.5 21.5L18 24L20.5 26.5M43.5 21.5L46 24L43.5 26.5"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="32" cy="24" r="2.2" fill="currentColor" />
        </svg>
      );

    case "floral":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          role="img"
          aria-label="Heritage lotus floral emblem"
        >
          {/* Central lotus petal */}
          <path
            d="M32 13C36.5 19.5 38.2 27 32 39C25.8 27 27.5 19.5 32 13Z"
            stroke="currentColor"
            strokeWidth="1.7"
            fill="currentColor"
            fillOpacity="0.12"
            strokeLinejoin="round"
          />
          {/* Inner side petals */}
          <path
            d="M32 39C23.5 35 19 28.5 19.5 20.5C25.5 22 29.5 28 32 39Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path
            d="M32 39C40.5 35 45 28.5 44.5 20.5C38.5 22 34.5 28 32 39Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          {/* Outer open petals */}
          <path
            d="M30 41.5C21 41.5 14 37.5 11.5 31C17.5 31.5 23.5 34.5 30 41.5Z"
            stroke="currentColor"
            strokeWidth="1.35"
            strokeLinejoin="round"
            opacity="0.85"
          />
          <path
            d="M34 41.5C43 41.5 50 37.5 52.5 31C46.5 31.5 40.5 34.5 34 41.5Z"
            stroke="currentColor"
            strokeWidth="1.35"
            strokeLinejoin="round"
            opacity="0.85"
          />
          {/* Filigree base flourish */}
          <path
            d="M21 47.5C25.5 49.8 38.5 49.8 43 47.5"
            stroke="currentColor"
            strokeWidth="1.35"
            strokeLinecap="round"
          />
          <circle cx="32" cy="52" r="1.4" fill="currentColor" />
        </svg>
      );
  }
}
