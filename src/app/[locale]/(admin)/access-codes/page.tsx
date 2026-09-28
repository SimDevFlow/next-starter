"use client";

import { FormEvent, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/admin/page-header";
import { Pager, PAGE_SIZE } from "@/components/admin/pager";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { TableMessage, TableSkeleton } from "@/components/admin/table-states";
import { formatDate, getErrorMessage } from "@/lib/format";
import {
  useCreateAccessCodeMutation,
  useDeleteAccessCodeMutation,
  useGetAccessCodesQuery,
} from "@/services/admin/access-codes";
import type { AccessCode } from "@/types/admin";

export default function AccessCodesPage() {
  const [page, setPage] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);
  const [serviceEmail, setServiceEmail] = useState("");
  const [code, setCode] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<AccessCode | null>(null);

  const { data, isLoading, isError, error } = useGetAccessCodesQuery({
    offset: page * PAGE_SIZE,
    limit: PAGE_SIZE,
  });
  const [createCode, { isLoading: isCreating }] = useCreateAccessCodeMutation();
  const [deleteCode] = useDeleteAccessCodeMutation();

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    try {
      await createCode({ service_email: serviceEmail, code }).unwrap();
      toast.success("Access code created.");
      setCreateOpen(false);
      setServiceEmail("");
      setCode("");
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    const target = deleteTarget;
    setDeleteTarget(null);
    try {
      await deleteCode(target.id).unwrap();
      toast.success("Access code deleted.");
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  }

  return (
    <>
      <PageHeader
        title="Access codes"
        description="Codes users receive to access a service account."
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus /> New access code
          </Button>
        }
      />
      <Card>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service email</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableSkeleton columns={4} />
                ) : isError ? (
                  <TableMessage columns={4}>{getErrorMessage(error, "Failed to load access codes.")}</TableMessage>
                ) : data?.content.length === 0 ? (
                  <TableMessage columns={4}>No access codes yet.</TableMessage>
                ) : (
                  data?.content.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.service_email}</TableCell>
                      <TableCell className="font-mono">{item.code}</TableCell>
                      <TableCell>{formatDate(item.created_at)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(item)}>
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

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <form onSubmit={handleCreate} className="grid gap-4">
            <DialogHeader>
              <DialogTitle>New access code</DialogTitle>
              <DialogDescription>Attach a code to a service email.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-2">
              <Label htmlFor="ac-email">Service email</Label>
              <Input
                id="ac-email"
                type="email"
                required
                value={serviceEmail}
                onChange={(e) => setServiceEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ac-code">Code</Label>
              <Input id="ac-code" required value={code} onChange={(e) => setCode(e.target.value)} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating}>
                {isCreating ? "Creating…" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete access code?"
        description="This permanently removes the access code."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
      />
    </>
  );
}
