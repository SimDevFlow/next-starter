"use client";

import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { useGetGravesQuery } from "@/services/admin/cerdotola";
import type { GraveRead } from "@/types/admin";

export default function CerdotolaGravesPage() {
  const t = useTranslations("cerdotola");
  const { data, isLoading } = useGetGravesQuery();

  const columns: DataTableColumn<GraveRead>[] = [
    {
      key: "photo",
      header: "",
      cell: (row) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={row.photo_url} alt={row.nom_complet} className="size-8 rounded-full object-cover" />
      ),
      className: "w-12",
    },
    { key: "nom", header: t("gravesFields.nomComplet"), cell: (row) => row.nom_complet },
    { key: "pays", header: t("gravesFields.paysOrigine"), cell: (row) => row.pays_origine },
    {
      key: "certificat",
      header: t("gravesFields.identifiantCertificat"),
      cell: (row) => row.identifiant_certificat ?? "—",
    },
  ];

  return (
    <div>
      <PageHeader title={t("gravesTitle")} description={t("gravesSubtitle")} />
      <DataTable
        columns={columns}
        rows={data ?? []}
        rowKey={(row) => row.citoyen_id}
        isLoading={isLoading}
      />
    </div>
  );
}
