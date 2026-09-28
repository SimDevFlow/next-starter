"use client";

import { FormEvent, useState } from "react";
import { CircleAlert } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { formatDate, getErrorMessage } from "@/lib/format";
import {
  addDays,
  errorStatus,
  GIFT_MAX_DAYS,
  parseDateTimeLocal,
  toApiDateTime,
  toDateTimeLocal,
  translateSubscriptionError,
} from "@/lib/subscriptions";
import { useUpdateSubscriptionMutation } from "@/services/admin/subscriptions";
import type { UserSubscription } from "@/types/admin";

const SHORTCUT_DAYS = [1, 7, 30];

/** Latest allowed end date: gifts can't last more than GIFT_MAX_DAYS after they started. */
function maxEndDate(subscription: UserSubscription): Date | null {
  if (subscription.subscription_type !== "gift") return null;
  return addDays(new Date(subscription.subscribed_at), GIFT_MAX_DAYS);
}

function validate(date: Date | null, max: Date | null): string | null {
  if (!date) return "Choisissez une date et une heure.";
  if (date.getTime() <= Date.now()) return "La date doit être dans le futur.";
  if (max && date.getTime() > max.getTime()) {
    return `Un abonnement offert ne peut pas dépasser ${GIFT_MAX_DAYS} jours (au plus tard le ${formatDate(max.toISOString())}).`;
  }
  return null;
}

/** Extends from the chosen date, or from now if it is already past. */
function extend(date: Date | null, days: number): Date {
  const base = date && date.getTime() > Date.now() ? date : new Date();
  return addDays(base, days);
}

export function SubscriptionEndDialog({
  subscription,
  onOpenChange,
}: {
  subscription: UserSubscription | null;
  onOpenChange: (open: boolean) => void;
}) {
  const open = subscription !== null;
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [updateSubscription, { isLoading }] = useUpdateSubscriptionMutation();

  // Reset the form each time the dialog opens.
  const [openedFor, setOpenedFor] = useState<string | null>(null);
  if ((subscription?.id ?? null) !== openedFor) {
    setOpenedFor(subscription?.id ?? null);
    if (subscription) {
      setValue(toDateTimeLocal(new Date(subscription.expired_at)));
      setError(null);
    }
  }

  const date = parseDateTimeLocal(value);
  const max = subscription ? maxEndDate(subscription) : null;
  const validationError = validate(date, max);
  const reactivate = subscription !== null && !subscription.is_active;

  function applyShortcut(days: number) {
    setValue(toDateTimeLocal(extend(date, days)));
    setError(null);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!subscription || validationError) return;
    setError(null);
    try {
      const result = await updateSubscription({ id: subscription.id, expired_at: toApiDateTime(value) }).unwrap();
      toast.success(
        reactivate
          ? `Abonnement ${subscription.service_name} réactivé jusqu'au ${formatDate(result.expired_at)}`
          : `Fin de l'abonnement ${subscription.service_name} fixée au ${formatDate(result.expired_at)}`,
      );
      if (!result.credential_assigned) {
        toast.warning("Aucun profil disponible : ajoutez un compte pour ce service", { duration: 10000 });
      }
      onOpenChange(false);
    } catch (e) {
      if (errorStatus(e) === 400) {
        setError(translateSubscriptionError(e));
        return;
      }
      toast.error(errorStatus(e) === 404 ? "Abonnement introuvable" : getErrorMessage(e, "Une erreur est survenue"));
      onOpenChange(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <DialogHeader>
            <DialogTitle>{reactivate ? "Réactiver l'abonnement" : "Modifier la fin"}</DialogTitle>
            <DialogDescription>
              {subscription
                ? `${subscription.service_name} · se termine actuellement le ${formatDate(subscription.expired_at)}`
                : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            <Label htmlFor="sub-end">Nouvelle date de fin</Label>
            <div className="flex flex-wrap items-center gap-2">
              <Input
                id="sub-end"
                type="datetime-local"
                required
                className="w-auto"
                min={toDateTimeLocal(new Date())}
                max={max ? toDateTimeLocal(max) : undefined}
                aria-invalid={validationError !== null}
                value={value}
                onChange={(e) => {
                  setValue(e.target.value);
                  setError(null);
                }}
              />
              {SHORTCUT_DAYS.map((n) => (
                <Button key={n} type="button" size="sm" variant="outline" onClick={() => applyShortcut(n)}>
                  +{n} j
                </Button>
              ))}
            </div>
            <p className={cn("text-sm", validationError ? "text-destructive" : "text-muted-foreground")}>
              {validationError ??
                (max
                  ? `Abonnement offert : au plus tard le ${formatDate(max.toISOString())}.`
                  : "L'accès prendra fin à cette date.")}
            </p>
          </div>
          {error && (
            <div
              role="alert"
              className="flex gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive"
            >
              <CircleAlert className="mt-0.5 size-4 shrink-0" />
              <p>{error}</p>
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Fermer
            </Button>
            <Button type="submit" disabled={validationError !== null || isLoading}>
              {isLoading ? "Envoi…" : reactivate ? "Réactiver" : "Enregistrer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
