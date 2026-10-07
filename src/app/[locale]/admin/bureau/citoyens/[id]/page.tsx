"use client";

import { use, useState } from "react";
import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useGetCitoyenQuery,
  useMarkGravureMutation,
  useRecordPaymentMutation,
  useUpdateCartePvcMutation,
} from "@/services/admin/citoyens";
import { formatAmount } from "@/lib/format";
import type {
  InitiatePaymentResponse,
  MoyenPaiement,
  StatutCartePvc,
} from "@/types/admin";

const MOYENS: MoyenPaiement[] = ["mobile_money", "carte"];
const CARTE_STATUSES: StatutCartePvc[] = [
  "non_demandee",
  "demandee",
  "en_attente_validation_cerdotola",
  "validee",
  "imprimee",
  "expediee",
];

export default function BureauCitoyenActionsPage({
  params,
}: Readonly<{
  params: Promise<{ id: string }>;
}>) {
  const { id } = use(params);
  const t = useTranslations("bureau");
  const tCitizens = useTranslations("citizens");
  const tEnums = useTranslations("enums");
  const tCommon = useTranslations("common");

  const { data: citoyen, isLoading } = useGetCitoyenQuery(id);
  const [recordPayment, { isLoading: isRecordingPayment }] = useRecordPaymentMutation();
  const [markGravure, { isLoading: isMarkingGravure }] = useMarkGravureMutation();
  const [updateCartePvc, { isLoading: isUpdatingCarte }] = useUpdateCartePvcMutation();

  const [moyen, setMoyen] = useState<MoyenPaiement>("mobile_money");
  const [paymentResult, setPaymentResult] = useState<InitiatePaymentResponse | null>(null);
  const [carteStatus, setCarteStatus] = useState<StatutCartePvc>("demandee");
  const [trackingDhl, setTrackingDhl] = useState("");

  if (isLoading || !citoyen) {
    return <Skeleton className="h-96 w-full" />;
  }

  return (
    <div>
      <PageHeader
        title={`${citoyen.first_name} ${citoyen.name}`}
        description={citoyen.email}
      />

      <div className="mb-4 flex flex-wrap gap-2">
        <StatusBadge namespace="statutAbonnement" value={citoyen.statut_abonnement} />
        <StatusBadge namespace="statutGravure" value={citoyen.statut_gravure} />
        <StatusBadge namespace="statutCartePvc" value={citoyen.statut_carte_pvc} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("recordPaymentTitle")}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Select value={moyen} onValueChange={(v) => setMoyen(v as MoyenPaiement)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MOYENS.map((m) => (
                  <SelectItem key={m} value={m}>
                    {tEnums(`moyenPaiement.${m}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              disabled={isRecordingPayment}
              onClick={async () => {
                const result = await recordPayment({ citoyenId: id, body: { moyen } }).unwrap();
                setPaymentResult(result);
              }}
            >
              {tCommon("actions.confirm")}
            </Button>
            {paymentResult && (
              <p className="text-sm text-muted-foreground">
                {formatAmount(paymentResult.montant)} — {tEnums(`statutPaiement.${paymentResult.statut}`)}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("markGravureTitle")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ConfirmDialog
              trigger={
                <Button disabled={citoyen.statut_gravure === "fait"}>
                  {tCitizens("fields.statutGravure")}
                </Button>
              }
              title={t("markGravureTitle")}
              description={t("markGravureConfirm")}
              confirmVariant="default"
              isLoading={isMarkingGravure}
              onConfirm={() => markGravure(id)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("updateCardTitle")}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Select value={carteStatus} onValueChange={(v) => setCarteStatus(v as StatutCartePvc)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CARTE_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {tEnums(`statutCartePvc.${s}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder={t("trackingDhl")}
              value={trackingDhl}
              onChange={(e) => setTrackingDhl(e.target.value)}
            />
            <Button
              disabled={isUpdatingCarte}
              onClick={() =>
                updateCartePvc({
                  citoyenId: id,
                  body: {
                    statut_carte_pvc: carteStatus,
                    tracking_dhl: trackingDhl || null,
                  },
                })
              }
            >
              {tCommon("actions.save")}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
