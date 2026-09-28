import { redirect } from "@/i18n/navigation";
import { getRefreshToken, getSessionUser } from "@/lib/session";
import { AdminShell } from "@/components/admin/admin-shell";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const [refreshToken, user] = await Promise.all([getRefreshToken(), getSessionUser()]);

  if (!refreshToken || !user) {
    redirect({ href: "/login", locale });
    return null;
  }

  return <AdminShell user={user}>{children}</AdminShell>;
}
