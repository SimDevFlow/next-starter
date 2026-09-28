"use client";

import { useState } from "react";
import { CalendarClock, Gift, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Pager, PAGE_SIZE } from "@/components/admin/pager";
import { SubscriptionEndDialog } from "@/components/admin/subscription-end-dialog";
import { TableMessage, TableSkeleton } from "@/components/admin/table-states";
import { formatDate, getErrorMessage } from "@/lib/format";
import { errorStatus, translateSubscriptionError } from "@/lib/subscriptions";
import { useCancelSubscriptionMutation, useGetUserSubscriptionsQuery } from "@/services/admin/subscriptions";
import type { FullUser, UserSubscription } from "@/types/admin";

const TYPE_LABELS: Record<UserSubscription["subscription_type"], string> = {
  daily: "24h",
  monthly: "Mensuel",
  gift: "Offert",
};

function StatusBadge({ subscription }: { subscription: UserSubscription }) {
  if (subscription.is_active) {
    return (
      <Badge className="bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">Actif</Badge>
    );
  }
  if (subscription.cancelled_at) return <Badge variant="destructive">Annulé</Badge>;
  return <Badge variant="secondary">Expiré</Badge>;
}

/** Newest first; the backend order is kept across pages, this only guarantees it within one. */
function byNewest(a: UserSubscription, b: UserSubscription): number {
  return new Date(b.subscribed_at).getTime() - new Date(a.subscribed_at).getTime();
}

export function UserSubscriptionsSheet({
  user,
  open,
  onOpenChange,
  onGift,
}: {
  user: FullUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGift: (user: FullUser) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full data-[side=right]:sm:max-w-3xl">
        <SheetHeader className="pr-12">
          <SheetTitle>Abonnements</SheetTitle>
          <SheetDescription>{user ? `${user.full_name} (${user.email})` : ""}</SheetDescription>
        </SheetHeader>
        {/* Mounted only while open, so the page and filter reset for each user. */}
        {user && <SubscriptionsList user={user} onGift={onGift} />}
      </SheetContent>
    </Sheet>
  );
}

function SubscriptionsList({ user, onGift }: { user: FullUser; onGift: (user: FullUser) => void }) {
  const [page, setPage] = useState(0);
  const [activeOnly, setActiveOnly] = useState(false);
  const [editTarget, setEditTarget] = useState<UserSubscription | null>(null);
  const [cancelTarget, setCancelTarget] = useState<UserSubscription | null>(null);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const { data, isLoading, isFetching, isError, error } = useGetUserSubscriptionsQuery({
    userId: user.id,
    offset: page * PAGE_SIZE,
    limit: PAGE_SIZE,
    active_only: activeOnly,
  });
  const [cancelSubscription, { isLoading: isCancelling }] = useCancelSubscriptionMutation();

  function closeCancel() {
    setCancelTarget(null);
    setCancelError(null);
  }

  async function confirmCancel() {
    if (!cancelTarget) return;
    setCancelError(null);
    try {
      await cancelSubscription(cancelTarget.id).unwrap();
      toast.success(`Abonnement ${cancelTarget.service_name} de ${user.email} annulé`);
      closeCancel();
    } catch (e) {
      if (errorStatus(e) === 400) {
        setCancelError(translateSubscriptionError(e));
        return;
      }
      toast.error(errorStatus(e) === 404 ? "Abonnement introuvable" : getErrorMessage(e, "Une erreur est survenue"));
      closeCancel();
    }
  }

  const subscriptions = data ? [...data.content].sort(byNewest) : [];

  return (
    <div className="flex min-h-0 flex-1 flex-col px-4 pb-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Switch
            id="subs-active-only"
            checked={activeOnly}
            onCheckedChange={(checked) => {
              setActiveOnly(checked);
              setPage(0);
            }}
          />
          <Label htmlFor="subs-active-only">Actifs seulement</Label>
        </div>
        <Button size="sm" onClick={() => onGift(user)}>
          <Gift /> Offrir un abonnement
        </Button>
      </div>

      <div className="min-h-0 flex-1 overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Début</TableHead>
              <TableHead>Fin</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableSkeleton columns={6} />
            ) : isError ? (
              <TableMessage columns={6}>
                {errorStatus(error) === 404
                  ? "Utilisateur introuvable"
                  : getErrorMessage(error, "Impossible de charger les abonnements.")}
              </TableMessage>
            ) : subscriptions.length === 0 ? (
              <TableMessage columns={6}>
                {activeOnly ? "Aucun abonnement actif." : "Aucun abonnement."}
              </TableMessage>
            ) : (
              subscriptions.map((sub) => (
                <TableRow key={sub.id}>
                  <TableCell className="font-medium">{sub.service_name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {sub.subscription_type === "gift" && <Gift />}
                      {TYPE_LABELS[sub.subscription_type] ?? sub.subscription_type}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(sub.subscribed_at)}</TableCell>
                  <TableCell>{formatDate(sub.expired_at)}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      <StatusBadge subscription={sub} />
                      {sub.payement_id !== null && <Badge variant="outline">Payé</Badge>}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" title="Modifier la fin" onClick={() => setEditTarget(sub)}>
                        <CalendarClock />
                        <span className="sr-only">Modifier la fin</span>
                      </Button>
                      {sub.is_active && (
                        <Button variant="ghost" size="icon" title="Annuler" onClick={() => setCancelTarget(sub)}>
                          <XCircle className="text-destructive" />
                          <span className="sr-only">Annuler</span>
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <Pager page={page} total={data?.total ?? 0} onPageChange={setPage} />
      {isFetching && !isLoading && <p className="pt-2 text-xs text-muted-foreground">Actualisation…</p>}

      <SubscriptionEndDialog subscription={editTarget} onOpenChange={(open) => !open && setEditTarget(null)} />

      <ConfirmDialog
        open={cancelTarget !== null}
        onOpenChange={(open) => !open && !isCancelling && closeCancel()}
        title={cancelTarget ? `Annuler l'abonnement ${cancelTarget.service_name} de ${user.email} ?` : ""}
        description={
          <div className="grid gap-2">
            <p>L&apos;accès prend fin immédiatement.</p>
            <p>
              Vous recevrez un email pour changer le mot de passe ou le PIN du profil qui était attribué à cet
              utilisateur.
            </p>
          </div>
        }
        confirmLabel={isCancelling ? "Annulation…" : "Annuler l'abonnement"}
        cancelLabel="Retour"
        onConfirm={confirmCancel}
        closeOnConfirm={false}
        pending={isCancelling}
        error={cancelError}
      />
    </div>
  );
}
