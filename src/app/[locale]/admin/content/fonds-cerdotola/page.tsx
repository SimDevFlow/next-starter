"use client";

import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/shared/page-header";
import { Alert, AlertDescription } from "@/components/ui/alert";

// No GET /api/admin/super/content/fonds-cerdotola exists in the backend
// spec — only POST, with an unspecified (near-certainly multipart) body.
// This screen intentionally stops at the notice rather than guessing a
// form shape; see the plan's Phase 7(b) for the verification step needed
// before wiring an upload form here.
export default function FondsCerdotolaPage() {
  const t = useTranslations("content");

  return (
    <div>
      <PageHeader title={t("fondsTitle")} description={t("fondsSubtitle")} />
      <Alert>
        <AlertDescription>{t("fondsUploadNotice")}</AlertDescription>
      </Alert>
    </div>
  );
}
