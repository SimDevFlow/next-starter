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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { errorStatus, GIFT_MAX_DAYS, translateSubscriptionError } from "@/lib/subscriptions";
import { useGetCredentialGroupsQuery } from "@/services/admin/credential-groups";
import { useGetCredentialsQuery } from "@/services/admin/credentials";
import { useGetServicesQuery } from "@/services/admin/services";
import { useGiftSubscriptionMutation } from "@/services/admin/users";
import type { Credential, FullUser } from "@/types/admin";

const MIN_DAYS = 1;
const MAX_DAYS = GIFT_MAX_DAYS;
const DEFAULT_DAYS = 7;
const DAY_SHORTCUTS = [1, 7, 15, 30];
const PROFILES_LIMIT = 50;
/** Select value for "let the backend pick" (Radix forbids an empty item value). */
const AUTO_ASSIGN = "auto";

/** Groups profiles by streaming account, keeping the API order. */
function groupByAccount(credentials: Credential[]): { groupId: string; email: string; profiles: Credential[] }[] {
  const groups = new Map<string, { groupId: string; email: string; profiles: Credential[] }>();
  for (const c of credentials) {
    const group = groups.get(c.group_id) ?? { groupId: c.group_id, email: c.email, profiles: [] };
    group.profiles.push(c);
    groups.set(c.group_id, group);
  }
  return [...groups.values()];
}

/** Returns the day count, or null when the input is not an integer in [MIN_DAYS, MAX_DAYS]. */
function parseDays(value: string): number | null {
  if (!/^\d+$/.test(value.trim())) return null;
  const days = Number(value);
  return days >= MIN_DAYS && days <= MAX_DAYS ? days : null;
}

function formatExpiry(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toLocaleDateString("fr-FR", { dateStyle: "long" });
}

function giftErrorMessage(error: unknown): string {
  const status = errorStatus(error);
  if (status === 404) return "Utilisateur introuvable";
  if (status === 422) return `Le nombre de jours doit être un entier entre ${MIN_DAYS} et ${MAX_DAYS}`;
  return translateSubscriptionError(error);
}

export function GiftSubscriptionDialog({
  user,
  onOpenChange,
}: {
  user: FullUser | null;
  onOpenChange: (open: boolean) => void;
}) {
  const open = user !== null;
  const [serviceId, setServiceId] = useState("");
  const [credentialId, setCredentialId] = useState(AUTO_ASSIGN);
  const [daysInput, setDaysInput] = useState(String(DEFAULT_DAYS));
  const [error, setError] = useState<string | null>(null);

  const { data: services, isLoading: isLoadingServices } = useGetServicesQuery({ limit: 100 }, { skip: !open });
  const {
    data: profilesPage,
    isFetching: isFetchingProfiles,
    isError: isProfilesError,
    refetch: refetchProfiles,
  } = useGetCredentialsQuery(
    { service_id: serviceId, available_only: true, offset: 0, limit: PROFILES_LIMIT },
    { skip: !open || !serviceId, refetchOnMountOrArgChange: true },
  );
  const [giftSubscription, { isLoading: isGifting }] = useGiftSubscriptionMutation();

  // Reset the form each time the dialog opens.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setServiceId("");
      setCredentialId(AUTO_ASSIGN);
      setDaysInput(String(DEFAULT_DAYS));
      setError(null);
    }
  }

  // Ignore a page cached for a previous service while the new one loads.
  const profiles = profilesPage?.content.filter((c) => c.service_id === serviceId) ?? [];
  const profilesLoaded = !!serviceId && !isFetchingProfiles && !isProfilesError;
  const noProfileAvailable = profilesLoaded && profiles.length === 0;
  const accounts = groupByAccount(profiles);
  // A profile taken meanwhile (e.g. by another admin) falls back to auto-assign.
  const selectedCredentialId = profiles.some((c) => c.id === credentialId) ? credentialId : AUTO_ASSIGN;

  // With no free profile, a gift only works if the user already holds one for this service.
  const { data: serviceGroups, isFetching: isCheckingHeldProfile } = useGetCredentialGroupsQuery(
    { service_id: serviceId, limit: 100 },
    { skip: !open || !noProfileAvailable },
  );
  const userHoldsProfile =
    !!user &&
    !!serviceGroups?.content.some((g) => g.service_id === serviceId && g.profiles.some((p) => p.user_id === user.id));
  const blockedByStock = noProfileAvailable && (isCheckingHeldProfile || !userHoldsProfile);

  const days = parseDays(daysInput);
  const isValid = serviceId !== "" && days !== null && !blockedByStock;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!user || !isValid || days === null || isGifting) return;
    setError(null);
    try {
      const result = await giftSubscription({
        userId: user.id,
        body: {
          service_id: serviceId,
          days,
          ...(selectedCredentialId !== AUTO_ASSIGN && { credential_id: selectedCredentialId }),
        },
      }).unwrap();
      toast.success(`Abonnement de ${result.days} jour${result.days > 1 ? "s" : ""} offert à ${user.email}`);
      if (!result.credential_assigned) {
        toast.warning("Aucun profil disponible n'a été attribué, ajoutez un compte pour ce service", {
          duration: 10000,
        });
      }
      onOpenChange(false);
    } catch (e) {
      setError(giftErrorMessage(e));
      // The chosen profile may have just been taken by someone else.
      if (errorStatus(e) === 400) refetchProfiles();
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <DialogHeader>
            <DialogTitle>Offrir un abonnement</DialogTitle>
            <DialogDescription>
              {user ? `${user.full_name} (${user.email})` : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            <Label htmlFor="gift-service">Service</Label>
            <Select
              value={serviceId}
              onValueChange={(v) => {
                setServiceId(v);
                setCredentialId(AUTO_ASSIGN);
                setError(null);
              }}
            >
              <SelectTrigger id="gift-service" className="w-full">
                <SelectValue placeholder={isLoadingServices ? "Chargement…" : "Choisir un service"} />
              </SelectTrigger>
              <SelectContent>
                {/* Out-of-stock services stay selectable: a user who still holds a profile can get it back. */}
                {services?.content.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                    <span className="text-muted-foreground">
                      {s.stock > 0 ? `${s.stock} en stock` : "rupture de stock"}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {serviceId && (
            <div className="grid gap-2">
              <Label htmlFor="gift-profile">Profil</Label>
              <Select
                value={selectedCredentialId}
                onValueChange={(v) => {
                  setCredentialId(v);
                  setError(null);
                }}
                disabled={isFetchingProfiles}
              >
                <SelectTrigger id="gift-profile" className="w-full">
                  <SelectValue placeholder="Chargement…" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={AUTO_ASSIGN}>Attribution automatique (n&apos;importe quel profil libre)</SelectItem>
                  {accounts.length > 0 && <SelectSeparator />}
                  {accounts.length > 1
                    ? accounts.map((account) => (
                        <SelectGroup key={account.groupId}>
                          <SelectLabel>{account.email}</SelectLabel>
                          {account.profiles.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.profil}
                              <span className="text-muted-foreground">{c.email}</span>
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      ))
                    : profiles.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.profil}
                          <span className="text-muted-foreground">{c.email}</span>
                        </SelectItem>
                      ))}
                </SelectContent>
              </Select>
              {isProfilesError && (
                <p className="text-sm text-destructive">
                  Impossible de charger les profils : l&apos;attribution automatique reste possible.
                </p>
              )}
              {noProfileAvailable && (
                <p className={cn("text-sm", blockedByStock ? "text-destructive" : "text-muted-foreground")}>
                  Aucun profil disponible pour ce service
                  {!isCheckingHeldProfile &&
                    (userHoldsProfile
                      ? " : l'utilisateur récupérera le profil qu'il détient déjà."
                      : ".")}
                </p>
              )}
              {profilesLoaded && profilesPage && profilesPage.total > profiles.length && (
                <p className="text-sm text-muted-foreground">
                  {profiles.length} profils affichés sur {profilesPage.total}.
                </p>
              )}
            </div>
          )}
          <div className="grid gap-2">
            <Label htmlFor="gift-days">Nombre de jours</Label>
            <div className="flex flex-wrap items-center gap-2">
              <Input
                id="gift-days"
                type="number"
                inputMode="numeric"
                min={MIN_DAYS}
                max={MAX_DAYS}
                step={1}
                required
                className="w-24"
                aria-invalid={days === null}
                value={daysInput}
                onChange={(e) => {
                  setDaysInput(e.target.value);
                  setError(null);
                }}
              />
              {DAY_SHORTCUTS.map((n) => (
                <Button
                  key={n}
                  type="button"
                  size="sm"
                  variant={days === n ? "secondary" : "outline"}
                  onClick={() => {
                    setDaysInput(String(n));
                    setError(null);
                  }}
                >
                  {n} j
                </Button>
              ))}
            </div>
            <p className={cn("text-sm", days === null ? "text-destructive" : "text-muted-foreground")}>
              {days === null
                ? `Entrez un nombre entier entre ${MIN_DAYS} et ${MAX_DAYS}.`
                : `Expire le ${formatExpiry(days)}`}
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
              Annuler
            </Button>
            <Button type="submit" disabled={!isValid || isGifting}>
              {isGifting ? "Envoi…" : "Offrir"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
