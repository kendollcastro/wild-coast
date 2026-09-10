export function WaveDivider({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden className={`overflow-hidden leading-none ${className}`}>
      <svg
        viewBox="0 0 1440 64"
        preserveAspectRatio="none"
        className="block h-6 w-full sm:h-10"
      >
        <path
          d="M0 32C160 8 320 52 480 40s320-36 480-28 320 36 480 20v40H0Z"
          fill="currentColor"
        />
      </svg>
    </div>
  );
}