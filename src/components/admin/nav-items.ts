import {
  LayoutDashboard,
  Users,
  KeyRound,
  Lock,
  UserRoundCog,
  Package,
  Link2,
  CreditCard,
  Mail,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/users", label: "Users", icon: Users },
  { href: "/access-codes", label: "Access Codes", icon: KeyRound },
  { href: "/accounts", label: "Accounts", icon: UserRoundCog },
  { href: "/credentials", label: "Credentials", icon: Lock },
  { href: "/services", label: "Services", icon: Package },
  { href: "/service-links", label: "Service Links", icon: Link2 },
  { href: "/payments", label: "Payments", icon: CreditCard },
  { href: "/mails", label: "Mails", icon: Mail },
  { href: "/settings", label: "Settings", icon: Settings },
];
