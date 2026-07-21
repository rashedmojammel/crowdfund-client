// lucide-react dropped brand/logo icons (reasonable for a generic UI set,
// but we still need recognizable social marks) — minimal monochrome SVGs
// using currentColor so they inherit our hover/focus color treatment.

type IconProps = { className?: string };

export function FacebookIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M14 13.5h2.5l1-4H14v-2c0-1.03 0-2 2-2h1.5V2.14C17.17 2.1 15.95 2 14.66 2 11.97 2 10 3.66 10 6.7v2.8H7v4h3V22h4v-8.5Z" />
    </svg>
  );
}

export function LinkedinIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M6.94 8.5H3.56V20h3.38V8.5ZM5.25 3a1.96 1.96 0 1 0 0 3.92 1.96 1.96 0 0 0 0-3.92ZM20.44 20h-3.37v-5.9c0-1.4-.03-3.21-1.96-3.21-1.96 0-2.26 1.53-2.26 3.11V20H9.48V8.5h3.24v1.57h.05c.45-.86 1.56-1.77 3.2-1.77 3.43 0 4.06 2.26 4.06 5.19V20Z" />
    </svg>
  );
}

export function TelegramIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M21.5 3.5 2.75 10.86c-1.16.47-1.15 1.12-.21 1.4l4.8 1.5 1.85 5.66c.22.6.38.85.77.85.3 0 .43-.14.6-.31l2.15-2.09 4.47 3.3c.82.46 1.42.22 1.63-.76l2.95-13.9c.3-1.2-.46-1.75-1.26-1.4ZM8.9 14.24l9.2-5.85c.44-.27.84-.12.51.18l-7.85 7.1-.31 3.26-1.55-4.69Z" />
    </svg>
  );
}
