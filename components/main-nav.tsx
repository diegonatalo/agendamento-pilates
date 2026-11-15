"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

const ITEMS = [
  { href: "/", label: "Agenda", icon: "M8 2v3M16 2v3M3 9h18M5 4h14a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" },
  { href: "/alunos", label: "Alunos", icon: "M16 20v-1a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v1M10 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM20 20v-1a4 4 0 0 0-3-3.9M15 4.2a3.5 3.5 0 0 1 0 6.6" },
  { href: "/planos", label: "Planos", icon: "M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8ZM7.5 7.5h.01" },
  { href: "/horarios", label: "Horários", icon: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 7v5l3 2" },
  { href: "/backup", label: "Backup", icon: "M12 3v12M7 10l5 5 5-5M5 21h14" },
] as const;

/** Barra flutuante embaixo no celular; abas no cabeçalho a partir de `md`. */
export const MainNav = () => {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Principal"
      className="fixed inset-x-3 bottom-3 z-20 rounded-2xl border border-line bg-surface/90 p-1.5 shadow-card backdrop-blur-md md:static md:mr-auto md:inset-auto md:rounded-full md:border-0 md:bg-transparent md:p-0 md:shadow-none md:backdrop-blur-none"
    >
      <ul className="flex gap-1 md:gap-1">
        {ITEMS.map((item) => {
          const active =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <li key={item.href} className="flex-1 md:flex-none">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-xl px-1 text-xs font-medium focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary md:min-h-11 md:flex-row md:gap-2 md:rounded-lg md:px-3 md:text-sm",
                  active
                    ? "bg-surface-2 text-fg md:bg-surface md:shadow-xs md:ring-1 md:ring-line"
                    : "text-muted hover:bg-surface-2 hover:text-fg",
                )}
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="size-6 md:size-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d={item.icon} />
                </svg>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
