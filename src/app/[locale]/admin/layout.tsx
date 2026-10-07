import { redirect } from "@/i18n/navigation";
import { getAdminSession } from "@/lib/admin-session";
import { Sidebar } from "@/components/shared/sidebar";
import { Topbar } from "@/components/shared/topbar";
import PageContainer from "@/components/shared/page-container";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { accessToken, refreshToken, role, email } = await getAdminSession();

  // Second gate behind proxy.ts's optimistic check — proxy only reads
  // cookies for a fast redirect, this is the real guard closer to the data.
  if ((!accessToken && !refreshToken) || !role || !email) {
    redirect({ href: "/login", locale });
  }

  // Non-null: the guard above redirects (never returns) whenever either is
  // missing, but next-intl's `redirect()` return type doesn't propagate
  // narrowing through the compound `||` condition here.
  return (
    <div className="flex min-h-svh">
      <Sidebar role={role!} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar email={email!} role={role!} />
        <main className="flex-1 overflow-y-auto bg-background">
          <PageContainer>{children}</PageContainer>
        </main>
      </div>
    </div>
  );
}
