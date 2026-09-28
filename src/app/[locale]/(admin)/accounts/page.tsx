"use client";

import { FormEvent, Fragment, use, useState } from "react";
import { ChevronDown, ChevronRight, Pencil, Plus, Trash2, TriangleAlert, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/admin/page-header";
import { Pager, PAGE_SIZE } from "@/components/admin/pager";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { ProfileDialog, type ProfileDialogMode } from "@/components/admin/profile-dialog";
import { SecretCell } from "@/components/admin/secret-cell";
import { TableMessage, TableSkeleton } from "@/components/admin/table-states";
import { Link, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { formatDate, getErrorMessage } from "@/lib/format";
import {
  useDeleteCredentialGroupMutation,
  useGetCredentialGroupQuery,
  useGetCredentialGroupsQuery,
  useUpdateCredentialGroupMutation,
} from "@/services/admin/credential-groups";
import { useDeleteCredentialMutation } from "@/services/admin/credentials";
import { useGetServicesQuery } from "@/services/admin/services";
import type { CredentialGroup, CredentialProfile } from "@/types/admin";

const ALL_SERVICES = "all";
const COLUMNS = 7;

type SearchParams = Promise<{ service_id?: string; group?: string }>;

function OccupancyGauge({ used, max }: { used: number; max: number }) {
  const ratio = max > 0 ? Math.min(used / max, 1) : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-20 overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full", ratio >= 1 ? "bg-destructive" : "bg-primary")}
          style={{ width: `${ratio * 100}%` }}
        />
      </div>
      <span className="text-sm tabular-nums">
        {used}/{max}
      </span>
    </div>
  );
}

function EditAccountDialog({
  group,
  onOpenChange,
}: {
  group: CredentialGroup | null;
  onOpenChange: (open: boolean) => void;
}) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [updateGroup, { isLoading }] = useUpdateCredentialGroupMutation();

  // Prefill each time a new group is opened.
  const [prevGroup, setPrevGroup] = useState(group);
  if (group !== prevGroup) {
    setPrevGroup(group);
    if (group) setForm({ email: group.email, password: group.password });
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!group) return;
    const body: { email?: string; password?: string } = {};
    if (form.email !== group.email) body.email = form.email;
    if (form.password !== group.password) body.password = form.password;
    if (!body.email && !body.password) {
      onOpenChange(false);
      return;
    }
    try {
      await updateGroup({ id: group.id, body }).unwrap();
      toast.success("Account updated for all its profiles.");
      onOpenChange(false);
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  }

  return (
    <Dialog open={group !== null} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <DialogHeader>
            <DialogTitle>Edit account</DialogTitle>
            <DialogDescription>Login shared by every profile of this account.</DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-900 dark:text-amber-200">
            <TriangleAlert className="mt-0.5 size-4 shrink-0" />
            <p>
              The change applies to all profiles of this account. Profiles of expired subscribers will be
              moved back to stock.
            </p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="acc-email">Email</Label>
            <Input
              id="acc-email"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="acc-password">Password</Label>
            <Input
              id="acc-password"
              required
              value={form.password}
              onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving…" : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ProfilesPanel({
  group,
  onEdit,
  onDelete,
}: {
  group: CredentialGroup;
  onEdit: (profile: CredentialProfile) => void;
  onDelete: (profile: CredentialProfile) => void;
}) {
  return (
    <div className="grid gap-2 py-2 pl-8">
      {group.available_slots === 0 && (
        <p className="text-sm text-muted-foreground">
          This account is full. Adding a profile with the same email from the Credentials page will create a new
          account group.
        </p>
      )}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Profile</TableHead>
            <TableHead>PIN</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {group.profiles.length === 0 ? (
            <TableMessage columns={5}>No profiles.</TableMessage>
          ) : (
            group.profiles.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.profil}</TableCell>
                <TableCell>
                  <SecretCell value={p.pin_code} />
                </TableCell>
                <TableCell>
                  {p.user_id ? (
                    <Badge title={p.user_email ?? p.user_id}>{p.user_full_name ?? "Assigned"}</Badge>
                  ) : (
                    <Badge variant="secondary">Free</Badge>
                  )}
                </TableCell>
                <TableCell>{formatDate(p.created_at)}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => onEdit(p)}>
                    <Pencil />
                    <span className="sr-only">Edit profile</span>
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onDelete(p)}>
                    <Trash2 className="text-destructive" />
                    <span className="sr-only">Delete profile</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

export default function AccountsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = use(searchParams);
  const router = useRouter();
  const focusId = params.group;
  const serviceFilter = params.service_id ?? ALL_SERVICES;

  const [page, setPage] = useState(0);
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(focusId ? [focusId] : []));
  const [editTarget, setEditTarget] = useState<CredentialGroup | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CredentialGroup | null>(null);
  const [profileDeleteTarget, setProfileDeleteTarget] = useState<CredentialProfile | null>(null);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [profileDialogMode, setProfileDialogMode] = useState<ProfileDialogMode>({ kind: "create" });

  // Reset paging when the filter changes, and expand a newly focused account.
  const [prevParams, setPrevParams] = useState({ serviceFilter, focusId });
  if (prevParams.serviceFilter !== serviceFilter || prevParams.focusId !== focusId) {
    setPrevParams({ serviceFilter, focusId });
    setPage(0);
    if (focusId) setExpanded((prev) => new Set(prev).add(focusId));
  }

  const list = useGetCredentialGroupsQuery(
    {
      offset: page * PAGE_SIZE,
      limit: PAGE_SIZE,
      ...(serviceFilter !== ALL_SERVICES && { service_id: serviceFilter }),
    },
    { skip: Boolean(focusId) }
  );
  const focused = useGetCredentialGroupQuery(focusId ?? "", { skip: !focusId });
  const { data: services } = useGetServicesQuery({ limit: 100 });
  const [deleteGroup] = useDeleteCredentialGroupMutation();
  const [deleteCredential] = useDeleteCredentialMutation();

  const { isLoading, isError, error } = focusId ? focused : list;
  const groups = focusId ? (focused.data ? [focused.data] : []) : (list.data?.content ?? []);

  const serviceName = (id: string) => services?.content.find((s) => s.id === id)?.name ?? `${id.slice(0, 8)}…`;

  function changeService(value: string) {
    router.replace(value === ALL_SERVICES ? "/accounts" : `/accounts?service_id=${value}`);
  }

  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function openAddProfile(group: CredentialGroup) {
    setProfileDialogMode({ kind: "add", group });
    setProfileDialogOpen(true);
  }

  function openEditProfile(profile: CredentialProfile) {
    setProfileDialogMode({ kind: "edit", profile });
    setProfileDialogOpen(true);
  }

  async function confirmDeleteGroup() {
    if (!deleteTarget) return;
    const target = deleteTarget;
    setDeleteTarget(null);
    try {
      await deleteGroup(target.id).unwrap();
      toast.success("Account deleted.");
      if (target.id === focusId) router.replace("/accounts");
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  }

  async function confirmDeleteProfile() {
    if (!profileDeleteTarget) return;
    const target = profileDeleteTarget;
    setProfileDeleteTarget(null);
    try {
      await deleteCredential(target.id).unwrap();
      toast.success("Profile deleted.");
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  }

  function deleteGroupDescription(group: CredentialGroup) {
    const count = group.profiles.length;
    const assigned = group.profiles.filter((p) => p.user_id).length;
    let text = `This permanently deletes the account ${group.email} and its ${count} profile${count === 1 ? "" : "s"}.`;
    if (assigned > 0) {
      text += ` ${assigned} of them ${assigned === 1 ? "is" : "are"} assigned to subscribers, who will lose access.`;
    }
    return text;
  }

  return (
    <>
      <PageHeader
        title="Accounts"
        description="Streaming accounts shared by up to 6 profiles. Changing an account's login updates all its profiles."
        actions={
          <Button variant="outline" asChild>
            <Link href="/credentials">
              <Plus /> New credential
            </Link>
          </Button>
        }
      />
      <Card>
        <CardContent>
          {focusId ? (
            <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              Showing a single account.
              <Button variant="outline" size="sm" asChild>
                <Link href="/accounts">Show all accounts</Link>
              </Button>
            </div>
          ) : (
            <div className="mb-4 flex items-center gap-3">
              <Label htmlFor="service-filter">Service</Label>
              <Select value={serviceFilter} onValueChange={changeService}>
                <SelectTrigger id="service-filter" className="w-56">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_SERVICES}>All services</SelectItem>
                  {services?.content.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10" />
                  <TableHead>Service</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Password</TableHead>
                  <TableHead>Profiles</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableSkeleton columns={COLUMNS} />
                ) : isError ? (
                  <TableMessage columns={COLUMNS}>{getErrorMessage(error, "Failed to load accounts.")}</TableMessage>
                ) : groups.length === 0 ? (
                  <TableMessage columns={COLUMNS}>No accounts yet.</TableMessage>
                ) : (
                  groups.map((g) => {
                    const isOpen = expanded.has(g.id);
                    const full = g.available_slots === 0;
                    return (
                      <Fragment key={g.id}>
                        <TableRow>
                          <TableCell>
                            <Button variant="ghost" size="icon-sm" onClick={() => toggle(g.id)}>
                              {isOpen ? <ChevronDown /> : <ChevronRight />}
                              <span className="sr-only">{isOpen ? "Hide profiles" : "Show profiles"}</span>
                            </Button>
                          </TableCell>
                          <TableCell className="font-medium">{serviceName(g.service_id)}</TableCell>
                          <TableCell>{g.email}</TableCell>
                          <TableCell>
                            <SecretCell value={g.password} copyable />
                          </TableCell>
                          <TableCell>
                            <OccupancyGauge used={g.profiles.length} max={g.max_profiles} />
                          </TableCell>
                          <TableCell>{formatDate(g.created_at)}</TableCell>
                          <TableCell className="text-right whitespace-nowrap">
                            <span
                              title={
                                full
                                  ? "Account full. Adding this email from the Credentials page creates a new account group."
                                  : undefined
                              }
                            >
                              <Button
                                variant="ghost"
                                size="icon"
                                disabled={full}
                                onClick={() => openAddProfile(g)}
                              >
                                <UserPlus />
                                <span className="sr-only">Add profile</span>
                              </Button>
                            </span>
                            <Button variant="ghost" size="icon" onClick={() => setEditTarget(g)}>
                              <Pencil />
                              <span className="sr-only">Edit account</span>
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(g)}>
                              <Trash2 className="text-destructive" />
                              <span className="sr-only">Delete account</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                        {isOpen && (
                          <TableRow className="hover:bg-transparent">
                            <TableCell colSpan={COLUMNS} className="bg-muted/30">
                              <ProfilesPanel
                                group={g}
                                onEdit={openEditProfile}
                                onDelete={setProfileDeleteTarget}
                              />
                            </TableCell>
                          </TableRow>
                        )}
                      </Fragment>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
          {!focusId && <Pager page={page} total={list.data?.total ?? 0} onPageChange={setPage} />}
        </CardContent>
      </Card>

      <EditAccountDialog group={editTarget} onOpenChange={(open) => !open && setEditTarget(null)} />

      <ProfileDialog
        open={profileDialogOpen}
        onOpenChange={setProfileDialogOpen}
        mode={profileDialogMode}
        services={services?.content ?? []}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete account?"
        description={deleteTarget ? deleteGroupDescription(deleteTarget) : ""}
        confirmLabel="Delete"
        onConfirm={confirmDeleteGroup}
      />

      <ConfirmDialog
        open={profileDeleteTarget !== null}
        onOpenChange={(open) => !open && setProfileDeleteTarget(null)}
        title="Delete profile?"
        description="This permanently removes the profile. If it is the last profile of the account, the account is removed too."
        confirmLabel="Delete"
        onConfirm={confirmDeleteProfile}
      />
    </>
  );
}
