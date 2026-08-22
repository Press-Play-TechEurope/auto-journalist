export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <rect width="18" height="16" x="3" y="4" rx="2" />
      <path d="M6.5 8.5h11" />
      <polygon
        points="10,11.75 15.4,14.5 10,17.25"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth={1}
      />
    </svg>
  );
}
