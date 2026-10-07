"use client";

import { useLocale, useTranslations } from "next-intl";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetCommissionsQuery } from "@/services/admin/ambassadeur";
import { formatAmount, formatDate } from "@/lib/format";
import type { CommissionRead } from "@/types/admin";

export default function AmbassadeurCommissionsPage() {
  const t = useTranslations("ambassadeur");
  const locale = useLocale();
  const { data, isLoading } = useGetCommissionsQuery();

  const columns: DataTableColumn<CommissionRead>[] = [
    { key: "montant", header: t("commissionsFields.montant"), cell: (row) => formatAmount(row.montant) },
    { key: "date", header: t("commissionsFields.date"), cell: (row) => formatDate(row.date, locale) },
  ];

  return (
    <div>
      <PageHeader title={t("commissionsTitle")} description={t("commissionsSubtitle")} />

      <Card className="mb-4 max-w-xs">
        <CardHeader>
          <CardDescription>{t("totalDu")}</CardDescription>
          <CardTitle className="text-2xl">
            {isLoading ? <Skeleton className="h-7 w-24" /> : data && formatAmount(data.total_du)}
          </CardTitle>
        </CardHeader>
      </Card>

      <DataTable
        columns={columns}
        rows={data?.historique ?? []}
        rowKey={(row) => row.id}
        isLoading={isLoading}
      />
    </div>
  );
}
