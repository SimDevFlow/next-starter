"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Settings2 } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useListCitoyensQuery } from "@/services/admin/citoyens";
import type { FullCitoyen } from "@/types/admin";

const PAGE_SIZE = 20;

export default function BureauCitoyensPage() {
  const t = useTranslations("bureau");
  const tCitizens = useTranslations("citizens");
  const [page, setPage] = useState(1);
  const { data, isLoading } = useListCitoyensQuery({ page, pageSize: PAGE_SIZE });

  const columns: DataTableColumn<FullCitoyen>[] = [
    {
      key: "name",
      header: tCitizens("fields.name"),
      cell: (row) => `${row.first_name} ${row.name}`,
    },
    { key: "telephone", header: tCitizens("fields.telephone"), cell: (row) => row.telephone },
    {
      key: "abonnement",
      header: tCitizens("fields.statutAbonnement"),
      cell: (row) => <StatusBadge namespace="statutAbonnement" value={row.statut_abonnement} />,
    },
    {
      key: "gravure",
      header: tCitizens("fields.statutGravure"),
      cell: (row) => <StatusBadge namespace="statutGravure" value={row.statut_gravure} />,
    },
    {
      key: "carte",
      header: tCitizens("fields.statutCartePvc"),
      cell: (row) => <StatusBadge namespace="statutCartePvc" value={row.statut_carte_pvc} />,
    },
    {
      key: "actions",
      header: t("actionsTitle"),
      cell: (row) => (
        <Button asChild size="sm" variant="outline">
          <Link href={`/admin/bureau/citoyens/${row.id}`}>
            <Settings2 /> {t("actionsTitle")}
          </Link>
        </Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title={t("listTitle")} description={t("listSubtitle")} />

      <Alert className="mb-4">
        <AlertDescription>{t("citoyensEndpointNotice")}</AlertDescription>
      </Alert>

      <DataTable
        columns={columns}
        rows={data?.content ?? []}
        rowKey={(row) => row.id}
        isLoading={isLoading}
        pagination={
          data
            ? { page, pageSize: PAGE_SIZE, total: data.total, onPageChange: setPage }
            : undefined
        }
      />
    </div>
  );
}
