import Link from "next/link";
import { SITE_NAME } from "@/lib/site";

/** Marca: arco de equilíbrio sobre um ponto, em verde com um toque de argila. */
export const LogoMark = ({ className }: { className?: string }) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 40 40"
    className={className}
    fill="none"
  >
    <rect width="40" height="40" rx="12" fill="var(--primary)" />
    <path
      d="M9 24c3-9 9-13 11-13s8 4 11 13"
      stroke="var(--primary-fg)"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <circle cx="20" cy="29" r="3" fill="var(--accent)" />
  </svg>
);

export const Logo = () => (
  <Link
    href="/"
    className="flex items-center gap-2.5 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
  >
    <LogoMark className="size-9" />
    <span className="font-display text-xl font-semibold tracking-tight">
      {SITE_NAME}
    </span>
  </Link>
);
