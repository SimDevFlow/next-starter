"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/admin/page-header";
import { Link } from "@/i18n/navigation";
import { useGetUsersQuery } from "@/services/admin/users";
import { useGetAccessCodesQuery } from "@/services/admin/access-codes";
import { useGetCredentialsQuery } from "@/services/admin/credentials";
import { useGetServicesQuery } from "@/services/admin/services";
import { useGetServiceLinksQuery } from "@/services/admin/service-links";
import { useGetPaymentsQuery } from "@/services/admin/payments";

const one = { limit: 1 };

function Stat({
  title,
  href,
  total,
  loading,
  error,
}: {
  title: string;
  href: string;
  total?: number;
  loading: boolean;
  error: boolean;
}) {
  return (
    <Link href={href}>
      <Card className="transition-colors hover:bg-muted/50">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-8 w-16" />
          ) : error ? (
            <span className="text-sm text-destructive">Unavailable</span>
          ) : (
            <span className="text-3xl font-semibold">{total}</span>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

export default function DashboardPage() {
  const users = useGetUsersQuery(one);
  const activeUsers = useGetUsersQuery({ ...one, with_active_subscription: true });
  const codes = useGetAccessCodesQuery(one);
  const credentials = useGetCredentialsQuery(one);
  const services = useGetServicesQuery(one);
  const links = useGetServiceLinksQuery(one);
  const payments = useGetPaymentsQuery(one);

  const stats = [
    { title: "Users", href: "/users", q: users },
    { title: "Users with active subscription", href: "/users", q: activeUsers },
    { title: "Services", href: "/services", q: services },
    { title: "Credentials", href: "/credentials", q: credentials },
    { title: "Access codes", href: "/access-codes", q: codes },
    { title: "Service links", href: "/service-links", q: links },
    { title: "Payments", href: "/payments", q: payments },
  ];

  return (
    <>
      <PageHeader title="Dashboard" description="Overview of your platform." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ title, href, q }) => (
          <Stat
            key={title}
            title={title}
            href={href}
            total={q.data?.total}
            loading={q.isLoading}
            error={q.isError}
          />
        ))}
      </div>
    </>
  );
}
