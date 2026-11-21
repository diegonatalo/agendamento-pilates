import Link from "next/link";
import { SITE_NAME } from "@/lib/site";

/** Marca do Encaixe: quatro horários na grade, um deles encaixado em destaque. */
export const LogoMark = ({ className }: { className?: string }) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 40 40"
    className={className}
    fill="none"
  >
    <rect width="40" height="40" rx="12" fill="var(--primary)" />
    <rect x="9" y="11" width="9" height="9" rx="2.5" fill="var(--primary-fg)" />
    <rect x="22" y="11" width="9" height="9" rx="2.5" fill="var(--primary-fg)" opacity="0.55" />
    <rect x="9" y="24" width="9" height="9" rx="2.5" fill="var(--primary-fg)" opacity="0.55" />
    <rect x="22" y="24" width="9" height="9" rx="2.5" fill="var(--accent)" />
  </svg>
);

export const Logo = () => (
  <Link
    href="/"
    className="flex items-center gap-2.5 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
  >
    <LogoMark className="size-9" />
    <span className="whitespace-nowrap font-display text-lg font-semibold">
      {SITE_NAME}
    </span>
  </Link>
);
