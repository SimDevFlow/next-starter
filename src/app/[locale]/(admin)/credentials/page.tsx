"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/admin/page-header";
import { Pager, PAGE_SIZE } from "@/components/admin/pager";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { ProfileDialog, type ProfileDialogMode } from "@/components/admin/profile-dialog";
import { SecretCell } from "@/components/admin/secret-cell";
import { TableMessage, TableSkeleton } from "@/components/admin/table-states";
import { Link } from "@/i18n/navigation";
import { formatDate, getErrorMessage } from "@/lib/format";
import { useDeleteCredentialMutation, useGetCredentialsQuery } from "@/services/admin/credentials";
import { useGetServicesQuery } from "@/services/admin/services";
import type { Credential } from "@/types/admin";

export default function CredentialsPage() {
  const [page, setPage] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<ProfileDialogMode>({ kind: "create" });
  const [deleteTarget, setDeleteTarget] = useState<Credential | null>(null);

  const { data, isLoading, isError, error } = useGetCredentialsQuery({
    offset: page * PAGE_SIZE,
    limit: PAGE_SIZE,
  });
  const { data: services } = useGetServicesQuery({ limit: 100 });
  const [deleteCredential] = useDeleteCredentialMutation();

  const serviceName = (id: string) => services?.content.find((s) => s.id === id)?.name ?? `${id.slice(0, 8)}…`;

  function openCreate() {
    setDialogMode({ kind: "create" });
    setDialogOpen(true);
  }

  function openEdit(credential: Credential) {
    setDialogMode({ kind: "edit", profile: credential });
    setDialogOpen(true);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    const target = deleteTarget;
    setDeleteTarget(null);
    try {
      await deleteCredential(target.id).unwrap();
      toast.success("Credential deleted.");
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  }

  return (
    <>
      <PageHeader
        title="Credentials"
        description="Individual profiles handed out to subscribers. Email and password are managed per account."
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/accounts">
                <Users /> Accounts
              </Link>
            </Button>
            <Button onClick={openCreate}>
              <Plus /> New credential
            </Button>
          </>
        }
      />
      <Card>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Password</TableHead>
                  <TableHead>Profile</TableHead>
                  <TableHead>PIN</TableHead>
                  <TableHead>Assigned</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableSkeleton columns={8} />
                ) : isError ? (
                  <TableMessage columns={8}>{getErrorMessage(error, "Failed to load credentials.")}</TableMessage>
                ) : data?.content.length === 0 ? (
                  <TableMessage columns={8}>No credentials yet.</TableMessage>
                ) : (
                  data?.content.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{serviceName(c.service_id)}</TableCell>
                      <TableCell>
                        <Link href={`/accounts?group=${c.group_id}`} className="hover:underline">
                          {c.email}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <SecretCell value={c.password} />
                      </TableCell>
                      <TableCell>{c.profil}</TableCell>
                      <TableCell>
                        <SecretCell value={c.pin_code} />
                      </TableCell>
                      <TableCell>
                        {c.user_id ? (
                          <span title={c.user_email ?? c.user_id}>
                            {c.user_full_name ?? <span className="font-mono text-xs">{c.user_id.slice(0, 8)}…</span>}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">Unassigned</span>
                        )}
                      </TableCell>
                      <TableCell>{formatDate(c.created_at)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(c)}>
                          <Pencil />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(c)}>
                          <Trash2 className="text-destructive" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <Pager page={page} total={data?.total ?? 0} onPageChange={setPage} />
        </CardContent>
      </Card>

      <ProfileDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialogMode}
        services={services?.content ?? []}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete credential?"
        description="This permanently removes the credential. If it is the last profile of its account, the account is removed too."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
      />
    </>
  );
}
