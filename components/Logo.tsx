export default function Logo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      fill="none"
      className={className}
    >
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#16DB93" />
          <stop offset="100%" stopColor="#598392" />
        </linearGradient>
      </defs>

      {/* Background */}
      <rect width="64" height="64" rx="12" fill="url(#logoGradient)" />

      {/* Database/Data layers */}
      <ellipse cx="32" cy="20" rx="16" ry="5" fill="white" opacity="0.3" />
      <ellipse cx="32" cy="24" rx="16" ry="5" fill="white" opacity="0.5" />
      <ellipse cx="32" cy="28" rx="16" ry="5" fill="white" opacity="0.7" />

      {/* Download/Scrape arrow */}
      <path
        d="M32 30 L32 42 M26 37 L32 43 L38 37"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Price tag indicator */}
      <g transform="translate(40, 38)">
        <path
          d="M0 0 L6 0 L9 3 L6 6 L0 6 Z"
          fill="#DB2B39"
          opacity="0.95"
        />
        <circle cx="3" cy="3" r="1" fill="white" />
      </g>

      {/* Data dots (representing scraped prices) */}
      <circle cx="14" cy="48" r="2" fill="white" opacity="0.8" />
      <circle cx="22" cy="50" r="2" fill="white" opacity="0.9" />
      <circle cx="32" cy="52" r="2" fill="white" />
      <circle cx="42" cy="50" r="2" fill="white" opacity="0.9" />
      <circle cx="50" cy="48" r="2" fill="white" opacity="0.8" />
    </svg>
  );
}
