"use client";

import { FormEvent, useState } from "react";
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
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "@/i18n/navigation";
import { getErrorMessage } from "@/lib/format";
import { useAddCredentialMutation, useUpdateCredentialMutation } from "@/services/admin/credentials";
import { useLazyGetCredentialGroupsQuery } from "@/services/admin/credential-groups";
import type { CreateCredential, CredentialGroup, Service } from "@/types/admin";

/**
 * - `create`: any account; the backend puts the profile in a group with free slots or creates one.
 * - `add`: a profile on an existing group, whose service/email/password are locked.
 * - `edit`: only the profile name and PIN (email/password live on the group).
 */
export type ProfileDialogMode =
  | { kind: "create" }
  | { kind: "add"; group: CredentialGroup }
  | { kind: "edit"; profile: { id: string; profil: string; pin_code: string } };

const EMPTY_FORM: CreateCredential = { service_id: "", email: "", password: "", profil: "", pin_code: "" };

const PASSWORD_MISMATCH_PREFIX = "This account already exists with a different password";

function initialForm(mode: ProfileDialogMode): CreateCredential {
  switch (mode.kind) {
    case "create":
      return EMPTY_FORM;
    case "add":
      return { ...EMPTY_FORM, service_id: mode.group.service_id, email: mode.group.email, password: mode.group.password };
    case "edit":
      return { ...EMPTY_FORM, profil: mode.profile.profil, pin_code: mode.profile.pin_code };
  }
}

export function ProfileDialog({
  open,
  onOpenChange,
  mode,
  services,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: ProfileDialogMode;
  services: Service[];
}) {
  const router = useRouter();
  const [form, setForm] = useState<CreateCredential>(() => initialForm(mode));
  const [addCredential, { isLoading: isAdding }] = useAddCredentialMutation();
  const [updateCredential, { isLoading: isUpdating }] = useUpdateCredentialMutation();
  const [findGroups] = useLazyGetCredentialGroupsQuery();

  // Reset the form each time the dialog opens.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setForm(initialForm(mode));
  }

  function set<K extends keyof CreateCredential>(key: K, value: CreateCredential[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  // The backend refuses a known account with a different password: point the admin to that account.
  async function showPasswordMismatch(message: string) {
    let href = `/accounts?service_id=${form.service_id}`;
    try {
      const groups = await findGroups({ service_id: form.service_id, limit: 100 }).unwrap();
      const email = form.email.trim().toLowerCase();
      const match = groups.content.find((g) => g.email.toLowerCase() === email);
      if (match) href = `/accounts?group=${match.id}`;
    } catch {
      // Fall back to the service-filtered list.
    }
    toast.error(message, {
      duration: 10000,
      action: { label: "Open account", onClick: () => router.push(href) },
    });
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (mode.kind !== "edit" && !form.service_id) {
      toast.error("Select a service.");
      return;
    }
    try {
      if (mode.kind === "edit") {
        await updateCredential({
          id: mode.profile.id,
          body: { profil: form.profil, pin_code: form.pin_code },
        }).unwrap();
        toast.success("Profile updated.");
      } else {
        await addCredential(form).unwrap();
        toast.success("Profile created.");
      }
      onOpenChange(false);
    } catch (e) {
      const message = getErrorMessage(e);
      if (mode.kind === "create" && message.startsWith(PASSWORD_MISMATCH_PREFIX)) {
        await showPasswordMismatch(message);
      } else {
        toast.error(message);
      }
    }
  }

  const isSaving = isAdding || isUpdating;
  const locked = mode.kind === "add";
  const serviceName = services.find((s) => s.id === form.service_id)?.name ?? form.service_id;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <DialogHeader>
            <DialogTitle>
              {mode.kind === "edit" ? "Edit profile" : mode.kind === "add" ? "Add profile" : "New credential"}
            </DialogTitle>
            <DialogDescription>
              {mode.kind === "edit"
                ? "To change the email or password, edit the account on the Accounts page."
                : mode.kind === "add"
                  ? "The new profile shares this account's email and password."
                  : "The profile joins an account with the same email that has free slots, or a new one is created."}
            </DialogDescription>
          </DialogHeader>
          {mode.kind !== "edit" && (
            <>
              <div className="grid gap-2">
                <Label>Service</Label>
                {locked ? (
                  <Input value={serviceName} readOnly disabled />
                ) : (
                  <Select value={form.service_id} onValueChange={(v) => set("service_id", v)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a service" />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="cr-email">Email</Label>
                <Input
                  id="cr-email"
                  type="email"
                  required
                  readOnly={locked}
                  disabled={locked}
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="cr-password">Password</Label>
                <Input
                  id="cr-password"
                  required
                  readOnly={locked}
                  disabled={locked}
                  value={form.password}
                  onChange={(e) => set("password", e.target.value)}
                />
              </div>
            </>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="cr-profil">Profile</Label>
              <Input id="cr-profil" required value={form.profil} onChange={(e) => set("profil", e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cr-pin">PIN code</Label>
              <Input id="cr-pin" required value={form.pin_code} onChange={(e) => set("pin_code", e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving…" : mode.kind === "edit" ? "Save changes" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
