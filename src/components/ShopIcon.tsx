type Props = {
  size?: number;
  className?: string;
};

/** Vetrina: stessa marca in navbar e nella bolla galleggiante. */
export function ShopIcon({ size = 20, className = "" }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={`block shrink-0 overflow-visible ${className}`.trim()}
    >
      <path d="M3 9h18l-2.4-5H5.4L3 9Z" />
      <path d="M3 9v1.2c0 1.3 1.1 2.4 2.5 2.4S8 11.5 8 10.2c0 1.3 1.1 2.4 2.5 2.4s2.5-1.1 2.5-2.4c0 1.3 1.1 2.4 2.5 2.4s2.5-1.1 2.5-2.4c0 1.3 1.1 2.4 2.5 2.4S21 11.5 21 10.2V9" />
      <path d="M5 13v7h14v-7" />
      <path d="M10 20v-5h4v5" />
    </svg>
  );
}
