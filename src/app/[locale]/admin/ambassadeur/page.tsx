"use client";

import { useLocale, useTranslations } from "next-intl";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { useGetFilleulsQuery } from "@/services/admin/ambassadeur";
import { formatDate } from "@/lib/format";
import type { FilleulRead } from "@/types/admin";

export default function AmbassadeurFilleulsPage() {
  const t = useTranslations("ambassadeur");
  const locale = useLocale();
  const { data, isLoading } = useGetFilleulsQuery();

  const columns: DataTableColumn<FilleulRead>[] = [
    { key: "nom", header: t("filleulsFields.nomComplet"), cell: (row) => row.nom_complet },
    {
      key: "abonnement",
      header: t("filleulsFields.statutAbonnement"),
      cell: (row) => <StatusBadge namespace="statutAbonnement" value={row.statut_abonnement} />,
    },
    {
      key: "createdAt",
      header: t("filleulsFields.createdAt"),
      cell: (row) => formatDate(row.created_at, locale),
    },
  ];

  return (
    <div>
      <PageHeader title={t("filleulsTitle")} description={t("filleulsSubtitle")} />
      <DataTable
        columns={columns}
        rows={data ?? []}
        rowKey={(row) => row.citoyen_id}
        isLoading={isLoading}
      />
    </div>
  );
}
