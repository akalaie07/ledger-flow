"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { signOut } from "@/lib/actions/auth";
import { Wordmark } from "@/components/brand";

type NavItem = { href: string; label: string; icon: React.ReactNode };

const items: NavItem[] = [
  {
    href: "/dashboard",
    label: "Übersicht",
    icon: (
      <path d="M3 12 12 4l9 8M5 10v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-9" />
    ),
  },
  {
    href: "/deals",
    label: "Deals",
    icon: (
      <>
        <rect x="4" y="3" width="16" height="18" rx="2" />
        <path d="M8 8h8M8 12h8M8 16h5" />
      </>
    ),
  },
  {
    href: "/products",
    label: "Produkte",
    icon: <path d="M3.5 7 12 3l8.5 4-8.5 4-8.5-4ZM3.5 7v10l8.5 4 8.5-4V7M12 11v10" />,
  },
  {
    href: "/settings",
    label: "Einstellungen",
    icon: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7.6 1.6 1.6 0 0 0-1 1.5V22a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H2a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H8a1.6 1.6 0 0 0 1-1.5V2a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V8a1.6 1.6 0 0 0 1.5 1H22a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1Z" />
      </>
    ),
  },
];

function Icon({ children, active }: { children: React.ReactNode; active: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("size-[18px] shrink-0", active ? "stroke-primary" : "stroke-current")}
    >
      {children}
    </svg>
  );
}

export function SidebarNav({ orgName, userLabel }: { orgName: string; userLabel: string }) {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-border bg-surface px-4 py-5 lg:flex">
        <div className="px-2">
          <Wordmark sub={orgName} />
        </div>

        <nav className="mt-8 flex flex-1 flex-col gap-1">
          {items.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150",
                  active
                    ? "bg-primary-soft text-primary"
                    : "text-muted-foreground hover:bg-surface-2 hover:text-foreground",
                )}
              >
                {active && <span className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-primary" />}
                <Icon active={active}>{item.icon}</Icon>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-border pt-4">
          <div className="flex items-center gap-3 px-2">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-surface-2 text-sm font-medium text-muted-foreground">
              {userLabel.charAt(0).toUpperCase()}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-foreground">{userLabel}</span>
              <span className="block truncate text-xs text-faint">{orgName}</span>
            </span>
          </div>
          <form action={signOut} className="mt-3">
            <button
              type="submit"
              className="w-full rounded-lg px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
            >
              Abmelden
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-surface/90 px-4 py-3 backdrop-blur lg:hidden">
        <Wordmark />
        <form action={signOut}>
          <button type="submit" className="text-sm text-muted-foreground underline-offset-4 hover:underline">
            Abmelden
          </button>
        </form>
      </header>
      <nav className="sticky top-[57px] z-10 flex gap-1 overflow-x-auto border-b border-border bg-surface/90 px-3 py-2 backdrop-blur lg:hidden">
        {items.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium",
                active ? "bg-primary-soft text-primary" : "text-muted-foreground",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
