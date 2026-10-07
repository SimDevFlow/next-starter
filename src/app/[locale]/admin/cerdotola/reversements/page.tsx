"use client";

import { Download } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { useGetReversementsCerdotolaQuery } from "@/services/admin/cerdotola";
import { formatAmount, formatDate } from "@/lib/format";
import type { ReversementWithUrl } from "@/types/admin";

export default function CerdotolaReversementsPage() {
  const t = useTranslations("cerdotola");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const { data, isLoading } = useGetReversementsCerdotolaQuery();

  const columns: DataTableColumn<ReversementWithUrl>[] = [
    { key: "montant", header: t("reversementsFields.montant"), cell: (row) => formatAmount(row.montant) },
    { key: "date", header: t("reversementsFields.date"), cell: (row) => formatDate(row.date, locale) },
    {
      key: "recu",
      header: t("reversementsFields.recu"),
      cell: (row) => (
        <Button asChild size="sm" variant="ghost">
          <a href={row.recu_url} target="_blank" rel="noreferrer">
            <Download /> {tCommon("actions.download")}
          </a>
        </Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title={t("reversementsTitle")}
        description={t("reversementsSubtitle")}
        actions={
          <Button asChild variant="outline">
            {/* Not a page route — this streams a PDF from the BFF proxy,
                so a plain anchor is correct here, not next/link. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/api/admin/cerdotola/export-pdf">
              <Download /> {t("exportPdf")}
            </a>
          </Button>
        }
      />
      <DataTable columns={columns} rows={data ?? []} rowKey={(row) => row.id} isLoading={isLoading} />
    </div>
  );
}
