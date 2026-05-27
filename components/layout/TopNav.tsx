"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";
import { UserMenu } from "./UserMenu";
import { useMe } from "@/lib/queries/auth";

const NAV_ITEMS: Array<{
  label: string;
  href: string;
  permission?: string;
}> = [
  { label: "Karyawan", href: "/karyawan", permission: "users.manage" },
  { label: "Master Data", href: "/master-data", permission: "master_data.read" },
];

export function TopNav() {
  const pathname = usePathname();
  const me = useMe();
  const permissionSet = new Set(me.data?.permissions ?? []);

  const visibleNavItems = NAV_ITEMS.filter((item) => {
    if (!item.permission) return true;
    if (me.data?.role === "admin") return true;
    if (!me.data) return item.href === "/karyawan";
    return permissionSet.has(item.permission);
  });

  return (
    <header className="border-b bg-background sticky top-0 z-30">
      <div className="flex items-center justify-between px-6 py-3">
        <Link href="/karyawan" className="font-bold text-lg tracking-tight">
          HRIS Employee Hub
        </Link>
        <nav className="flex items-center gap-1">
          {visibleNavItems.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  active
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
