"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { Input } from "@/components/ui/input";
import { useGetJournalQuery } from "@/services/admin/journal";
import { formatDateTime } from "@/lib/format";
import type { JournalAccesRead } from "@/types/admin";

const PAGE_SIZE = 25;

export default function JournalPage() {
  const t = useTranslations("journal");
  const locale = useLocale();
  const [page, setPage] = useState(1);
  const [citoyenId, setCitoyenId] = useState("");
  const { data, isLoading } = useGetJournalQuery({
    page,
    pageSize: PAGE_SIZE,
    citoyenId: citoyenId || undefined,
  });

  const columns: DataTableColumn<JournalAccesRead>[] = [
    { key: "citoyen", header: t("fields.citoyenId"), cell: (row) => row.citoyen_id },
    { key: "type", header: t("fields.typeContenu"), cell: (row) => row.type_contenu },
    { key: "contenu", header: t("fields.contenuId"), cell: (row) => row.contenu_id },
    {
      key: "date",
      header: t("fields.dateHeure"),
      cell: (row) => formatDateTime(row.date_heure, locale),
    },
    { key: "ip", header: t("fields.ipAddress"), cell: (row) => row.ip_address ?? "—" },
  ];

  return (
    <div>
      <PageHeader title={t("title")} description={t("subtitle")} />

      <div className="mb-4 max-w-sm">
        <Input
          placeholder={t("filterByCitizen")}
          value={citoyenId}
          onChange={(e) => {
            setPage(1);
            setCitoyenId(e.target.value);
          }}
        />
      </div>

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
