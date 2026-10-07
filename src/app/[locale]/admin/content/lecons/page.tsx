"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useListLeconsQuery } from "@/services/admin/content";
import { formatDate } from "@/lib/format";
import { STREAMING_ENABLED } from "@/lib/config";
import type { LeconAdminRead } from "@/types/admin";

export default function LeconsPage() {
  const t = useTranslations("content");
  const locale = useLocale();
  const [semaine, setSemaine] = useState("");
  const { data, isLoading } = useListLeconsQuery(
    semaine ? { semaine: Number(semaine) } : undefined,
    { skip: !STREAMING_ENABLED }
  );

  const columns: DataTableColumn<LeconAdminRead>[] = [
    { key: "semaine", header: t("leconsFields.semaine"), cell: (row) => row.semaine },
    { key: "numero", header: t("leconsFields.numero"), cell: (row) => row.numero },
    {
      key: "videos",
      header: t("leconsFields.videoKeys"),
      cell: (row) => row.video_uids.length,
    },
    { key: "pdfs", header: t("leconsFields.pdfKeys"), cell: (row) => row.pdf_keys.length },
    {
      key: "createdAt",
      header: "",
      cell: (row) => formatDate(row.created_at, locale),
    },
  ];

  if (!STREAMING_ENABLED) {
    return (
      <div>
        <PageHeader title={t("leconsTitle")} description={t("leconsSubtitle")} />
        <Alert>
          <AlertDescription>{t("leconsComingSoon")}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title={t("leconsTitle")} description={t("leconsSubtitle")} />

      <Alert className="mb-4">
        <AlertDescription>{t("leconsUploadNotice")}</AlertDescription>
      </Alert>

      <div className="mb-4 max-w-xs">
        <Input
          type="number"
          placeholder={t("leconsFilterWeek")}
          value={semaine}
          onChange={(e) => setSemaine(e.target.value)}
        />
      </div>

      <DataTable columns={columns} rows={data ?? []} rowKey={(row) => row.id} isLoading={isLoading} />
    </div>
  );
}
