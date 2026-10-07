"use client";

import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  ScrollText,
  Map,
  BookOpen,
  Landmark,
  Settings,
  ClipboardList,
  UserPlus,
  Gem,
  HandCoins,
  QrCode,
  UsersRound,
  Wallet,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { LogoIcon } from "@/components/shared/logo";
import { cn } from "@/lib/utils";
import { STREAMING_ENABLED } from "@/lib/config";
import type { AdminRole } from "@/types/admin";

interface NavItem {
  href: string;
  labelKey: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_BY_ROLE: Record<AdminRole, NavItem[]> = {
  super_admin: [
    { href: "/admin/dashboard", labelKey: "dashboard", icon: LayoutDashboard },
    { href: "/admin/citoyens", labelKey: "citizens", icon: Users },
    { href: "/admin/accounts", labelKey: "accounts", icon: ShieldCheck },
    { href: "/admin/journal", labelKey: "journal", icon: ScrollText },
    { href: "/admin/content/cartotheque", labelKey: "cartotheque", icon: Map },
    ...(STREAMING_ENABLED ? [{ href: "/admin/content/lecons", labelKey: "lecons", icon: BookOpen }] : []),
    { href: "/admin/content/fonds-cerdotola", labelKey: "fondsCerdotola", icon: Landmark },
    { href: "/admin/configuration", labelKey: "configuration", icon: Settings },
  ],
  bureau: [
    { href: "/admin/bureau", labelKey: "bureau", icon: ClipboardList },
    { href: "/admin/bureau/nouveau", labelKey: "bureauNew", icon: UserPlus },
    { href: "/admin/bureau/reversements", labelKey: "reversements", icon: HandCoins },
  ],
  cerdotola: [
    { href: "/admin/cerdotola", labelKey: "graves", icon: Gem },
    { href: "/admin/cerdotola/reversements", labelKey: "reversements", icon: HandCoins },
    { href: "/admin/cerdotola/verify", labelKey: "verifyQr", icon: QrCode },
  ],
  ambassadeur_diaspora: [
    { href: "/admin/ambassadeur", labelKey: "ambassadeur", icon: UsersRound },
    { href: "/admin/ambassadeur/commissions", labelKey: "commissions", icon: Wallet },
  ],
};

export function Sidebar({ role }: { role: AdminRole }) {
  const t = useTranslations("sidebar");
  const tCommon = useTranslations("common");
  const pathname = usePathname();
  const items = NAV_BY_ROLE[role];

  return (
    <aside className="hidden w-64 shrink-0 border-r border-border bg-sidebar text-sidebar-foreground md:flex md:flex-col">
      <div className="flex items-center gap-2 px-4 py-4">
        <LogoIcon size={36} />
        <span className="font-semibold">{tCommon("appName")}</span>
      </div>
      <nav className="flex flex-1 flex-col gap-1 px-2 py-2">
        {items.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon className="size-4 shrink-0" />
              {t(item.labelKey)}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
