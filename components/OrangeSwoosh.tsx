export function OrangeSwoosh({ className = 'swoosh' }: { className?: string }) {
  return (
    <svg 
      className={className}
      viewBox="0 0 140 14" 
      aria-hidden="true"
    >
      <path 
        d="M3 10c30-7 75-9 134-4" 
        fill="none" 
        stroke="#E2562B" 
        strokeWidth="4" 
        strokeLinecap="round"
      />
    </svg>
  );
}
