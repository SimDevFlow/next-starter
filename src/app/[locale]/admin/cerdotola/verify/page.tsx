"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useLazyVerifyQrQuery } from "@/services/admin/cerdotola";

export default function CerdotolaVerifyPage() {
  const t = useTranslations("cerdotola");
  const [code, setCode] = useState("");
  const [trigger, { data, isFetching, isError }] = useLazyVerifyQrQuery();

  return (
    <div>
      <PageHeader title={t("verifyTitle")} description={t("verifySubtitle")} />

      <Card className="max-w-lg">
        <CardContent className="flex flex-col gap-3 pt-6">
          <Input
            placeholder={t("verifyCodeLabel")}
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <Button disabled={!code || isFetching} onClick={() => trigger(code)}>
            {t("verifySubmit")}
          </Button>
        </CardContent>
      </Card>

      {(data || isError) && (
        <Alert className="mt-4 max-w-lg" variant={data?.valide ? "default" : "destructive"}>
          <AlertTitle>{data?.valide ? t("verifyValid") : t("verifyInvalid")}</AlertTitle>
          {data?.valide && (
            <AlertDescription>
              <p>{data.nom_complet}</p>
              <p>{data.pays_origine}</p>
              <p className="mt-2 text-xs">{data.mention_legale}</p>
            </AlertDescription>
          )}
        </Alert>
      )}
    </div>
  );
}
