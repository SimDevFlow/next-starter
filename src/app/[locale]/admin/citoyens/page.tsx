"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Eye, Trash2 } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { useDeleteCitoyenMutation, useListCitoyensQuery } from "@/services/admin/citoyens";
import { formatDate } from "@/lib/format";
import type { FullCitoyen } from "@/types/admin";

const PAGE_SIZE = 20;

export default function CitoyensPage() {
  const t = useTranslations("citizens");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const [page, setPage] = useState(1);
  const { data, isLoading } = useListCitoyensQuery({ page, pageSize: PAGE_SIZE });
  const [deleteCitoyen] = useDeleteCitoyenMutation();

  const columns: DataTableColumn<FullCitoyen>[] = [
    {
      key: "name",
      header: t("fields.name"),
      cell: (row) => `${row.first_name} ${row.name}`,
    },
    { key: "email", header: t("fields.email"), cell: (row) => row.email },
    { key: "telephone", header: t("fields.telephone"), cell: (row) => row.telephone },
    {
      key: "abonnement",
      header: t("fields.statutAbonnement"),
      cell: (row) => <StatusBadge namespace="statutAbonnement" value={row.statut_abonnement} />,
    },
    {
      key: "gravure",
      header: t("fields.statutGravure"),
      cell: (row) => <StatusBadge namespace="statutGravure" value={row.statut_gravure} />,
    },
    {
      key: "carte",
      header: t("fields.statutCartePvc"),
      cell: (row) => <StatusBadge namespace="statutCartePvc" value={row.statut_carte_pvc} />,
    },
    {
      key: "createdAt",
      header: t("fields.createdAt"),
      cell: (row) => formatDate(row.created_at, locale),
    },
    {
      key: "actions",
      header: "",
      cell: (row) => (
        <div className="flex items-center gap-1">
          <Button asChild size="icon-sm" variant="ghost">
            <Link href={`/admin/citoyens/${row.id}`}>
              <Eye />
            </Link>
          </Button>
          <ConfirmDialog
            trigger={
              <Button size="icon-sm" variant="ghost">
                <Trash2 className="text-destructive" />
              </Button>
            }
            title={t("confirmDeleteTitle")}
            description={t("confirmDeleteDescription")}
            onConfirm={() => deleteCitoyen(row.id)}
          />
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title={t("title")} description={t("subtitle")} />
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
      {!data && !isLoading && (
        <p className="mt-4 text-sm text-muted-foreground">{tCommon("status.error")}</p>
      )}
    </div>
  );
}
