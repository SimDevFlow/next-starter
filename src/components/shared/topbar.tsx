"use client";

import { LogOut } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import type { AdminRole } from "@/types/admin";

interface TopbarProps {
  email: string;
  role: AdminRole;
}

export function Topbar({ email, role }: TopbarProps) {
  const router = useRouter();
  const t = useTranslations("common");
  const initials = email.slice(0, 2).toUpperCase();

  async function handleLogout() {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  return (
    <header className="flex h-14 shrink-0 items-center justify-end gap-2 border-b border-border px-4">
      <LanguageSwitcher />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="gap-2 px-2">
            <Avatar className="size-7">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <span className="hidden text-sm font-medium sm:inline">{email}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel className="flex flex-col">
            <span className="text-sm font-medium">{email}</span>
            <span className="text-xs font-normal text-muted-foreground">
              {t(`roles.${role}`)}
            </span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} variant="destructive">
            <LogOut className="size-4" />
            {t("actions.logout")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
