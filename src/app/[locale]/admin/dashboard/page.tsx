"use client";

import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetDashboardQuery } from "@/services/admin/dashboard";
import { formatAmount } from "@/lib/format";
import type { FinancialDashboardResponse, StatutAbonnement } from "@/types/admin";

function StatCard({ label, value, isLoading }: { label: string; value?: string; isLoading: boolean }) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl">
          {isLoading ? <Skeleton className="h-7 w-24" /> : value}
        </CardTitle>
      </CardHeader>
    </Card>
  );
}

function ReseauBreakdown({ data }: { data: FinancialDashboardResponse["citoyens_par_reseau"] }) {
  const t = useTranslations("dashboard");
  const tEnums = useTranslations("enums");
  const entries = Object.entries(data).sort(([, a], [, b]) => b - a);
  const total = entries.reduce((sum, [, count]) => sum + count, 0);

  return (
    <ul className="space-y-3">
      {entries.map(([reseau, count]) => {
        const percent = total ? Math.round((count / total) * 100) : 0;
        return (
          <li key={reseau}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span>
                {reseau === "non_renseigne"
                  ? t("reseauNonRenseigne")
                  : tEnums(`commentEntenduParler.${reseau}`)}
              </span>
              <span className="font-medium tabular-nums">
                {count} <span className="text-muted-foreground">({percent}%)</span>
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary" style={{ width: `${percent}%` }} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export default function DashboardPage() {
  const t = useTranslations("dashboard");
  const { data, isLoading } = useGetDashboardQuery();

  return (
    <div>
      <PageHeader title={t("title")} description={t("subtitle")} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label={t("totalEncaisse")} value={data && formatAmount(data.total_encaisse)} isLoading={isLoading} />
        <StatCard label={t("totalResteAPayer")} value={data && formatAmount(data.total_reste_a_payer)} isLoading={isLoading} />
        <StatCard label={t("nombreCitoyensSoldes")} value={data && String(data.nombre_citoyens_soldes)} isLoading={isLoading} />
        <StatCard label={t("montantDuCerdotola")} value={data && formatAmount(data.montant_du_cerdotola)} isLoading={isLoading} />
        <StatCard label={t("dejaReverseCerdotola")} value={data && formatAmount(data.deja_reverse_cerdotola)} isLoading={isLoading} />
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-base">{t("citoyensParStatut")}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-20 w-full" />
          ) : (
            <div className="flex flex-wrap gap-2">
              {data &&
                Object.entries(data.citoyens_par_statut).map(([statut, count]) => (
                  <div key={statut} className="flex items-center gap-2 rounded-lg border border-border px-3 py-2">
                    <StatusBadge namespace="statutAbonnement" value={statut as StatutAbonnement} />
                    <span className="text-sm font-medium">{count}</span>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-base">{t("citoyensParReseau")}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : (
            data?.citoyens_par_reseau && <ReseauBreakdown data={data.citoyens_par_reseau} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
