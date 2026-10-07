"use client";

import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/shared/page-header";
import { Alert, AlertDescription } from "@/components/ui/alert";

// No GET list endpoint exists for bureau reversements, and the POST body
// is unspecified (near-certainly a multipart receipt upload) — see the
// plan's Phase 7(b). This screen intentionally stops at the notice.
export default function BureauReversementsPage() {
  const t = useTranslations("bureau");

  return (
    <div>
      <PageHeader title={t("reversementsTitle")} />
      <Alert>
        <AlertDescription>{t("reversementsUploadNotice")}</AlertDescription>
      </Alert>
    </div>
  );
}
