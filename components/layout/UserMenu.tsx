"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLogout, useMe } from "@/lib/queries/auth";
import { LogOut } from "lucide-react";
import { getInitials } from "@/lib/initials";
import { cn } from "@/lib/utils";

function InitialsAvatar({
  name,
  email,
  className,
}: {
  name?: string | null;
  email?: string | null;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold select-none",
        "h-7 w-7 ring-1 ring-primary/15",
        className,
      )}
    >
      {getInitials(name, email)}
    </span>
  );
}

export function UserMenu() {
  const me = useMe();
  const logout = useLogout();
  if (!me.data) return null;
  const perms = me.data.permissions ?? [];
  const permsSummary =
    perms.length === 0
      ? "No explicit permissions"
      : perms.length <= 2
        ? perms.join(", ")
        : `${perms.slice(0, 2).join(", ")} +${perms.length - 2} more`;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 pl-1 pr-3 py-1 text-sm font-medium rounded-full hover:bg-accent transition-colors">
        <InitialsAvatar name={me.data.nama} email={me.data.email} />
        <span className="hidden sm:inline">{me.data.nama}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            <div className="flex items-center gap-2.5">
              <InitialsAvatar
                name={me.data.nama}
                email={me.data.email}
                className="h-9 w-9 text-sm"
              />
              <div className="min-w-0">
                <div className="font-medium truncate">{me.data.nama}</div>
                <div className="text-xs text-muted-foreground truncate">
                  {me.data.email}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  Role: {me.data.primary_role ?? me.data.role}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {permsSummary}
                </div>
              </div>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => logout.mutate()}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout dari dashboard
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
