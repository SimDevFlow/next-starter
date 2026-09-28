"use client";

import { FormEvent, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
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
import { TableMessage, TableSkeleton } from "@/components/admin/table-states";
import { formatDate, getErrorMessage } from "@/lib/format";
import {
  useCreateServiceLinkMutation,
  useDeleteServiceLinkMutation,
  useGetServiceLinksQuery,
} from "@/services/admin/service-links";
import type { LinkType, ServiceLink } from "@/types/admin";

const LINK_TYPES: { value: LinkType; label: string }[] = [
  { value: "HOUSE_CHANGE", label: "House change" },
  { value: "TEMP_ACCESS", label: "Temporary access" },
];

export default function ServiceLinksPage() {
  const [page, setPage] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);
  const [type, setType] = useState<LinkType>("HOUSE_CHANGE");
  const [link, setLink] = useState("");
  const [serviceEmail, setServiceEmail] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<ServiceLink | null>(null);

  const { data, isLoading, isError, error } = useGetServiceLinksQuery({
    offset: page * PAGE_SIZE,
    limit: PAGE_SIZE,
  });
  const [createLink, { isLoading: isCreating }] = useCreateServiceLinkMutation();
  const [deleteLink] = useDeleteServiceLinkMutation();

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    try {
      await createLink({ type, link, service_email: serviceEmail }).unwrap();
      toast.success("Service link created.");
      setCreateOpen(false);
      setLink("");
      setServiceEmail("");
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    const target = deleteTarget;
    setDeleteTarget(null);
    try {
      await deleteLink(target.id).unwrap();
      toast.success("Service link deleted.");
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  }

  return (
    <>
      <PageHeader
        title="Service links"
        description="Reset and temporary-access links per service."
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus /> New service link
          </Button>
        }
      />
      <Card>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Link</TableHead>
                  <TableHead>Service email</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableSkeleton columns={5} />
                ) : isError ? (
                  <TableMessage columns={5}>{getErrorMessage(error, "Failed to load service links.")}</TableMessage>
                ) : data?.content.length === 0 ? (
                  <TableMessage columns={5}>No service links yet.</TableMessage>
                ) : (
                  data?.content.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Badge variant="secondary">
                          {LINK_TYPES.find((t) => t.value === item.type)?.label ?? item.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline-offset-4 hover:underline"
                        >
                          {item.link}
                        </a>
                      </TableCell>
                      <TableCell>{item.service_email}</TableCell>
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
              <DialogTitle>New service link</DialogTitle>
              <DialogDescription>Add a link users can fetch for a service.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-2">
              <Label>Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as LinkType)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LINK_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="sl-link">Link</Label>
              <Input
                id="sl-link"
                type="url"
                required
                value={link}
                onChange={(e) => setLink(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="sl-email">Service email</Label>
              <Input
                id="sl-email"
                type="email"
                required
                value={serviceEmail}
                onChange={(e) => setServiceEmail(e.target.value)}
              />
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
        title="Delete service link?"
        description="This permanently removes the link."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
      />
    </>
  );
}
