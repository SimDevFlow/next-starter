"use client";

import { FormEvent, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/admin/page-header";
import { Pager, PAGE_SIZE } from "@/components/admin/pager";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { TableMessage, TableSkeleton } from "@/components/admin/table-states";
import { formatAmount, getErrorMessage } from "@/lib/format";
import {
  useAddServiceMutation,
  useDeleteServiceMutation,
  useGetServicesQuery,
  useUpdateServiceMutation,
} from "@/services/admin/services";
import type { CreateService, Service } from "@/types/admin";

interface FormState {
  name: string;
  email: string;
  price: string;
  image_url: string;
  description_fr: string;
  description_en: string;
}

const EMPTY_FORM: FormState = {
  name: "",
  email: "",
  price: "",
  image_url: "",
  description_fr: "",
  description_en: "",
};

function fromService(service: Service): FormState {
  return {
    name: service.name,
    email: service.email,
    price: String(service.price),
    image_url: service.image_url,
    description_fr: service.description.fr,
    description_en: service.description.en,
  };
}

function toPayload(form: FormState): CreateService {
  return {
    name: form.name.trim(),
    email: form.email.trim(),
    price: Number(form.price),
    image_url: form.image_url.trim(),
    description: { fr: form.description_fr, en: form.description_en },
  };
}

export default function ServicesPage() {
  const [page, setPage] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState<Service | null>(null);

  const { data, isLoading, isError, error } = useGetServicesQuery({
    offset: page * PAGE_SIZE,
    limit: PAGE_SIZE,
  });
  const [addService, { isLoading: isAdding }] = useAddServiceMutation();
  const [updateService, { isLoading: isUpdating }] = useUpdateServiceMutation();
  const [deleteService] = useDeleteServiceMutation();

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  }

  function openEdit(service: Service) {
    setEditing(service);
    setForm(fromService(service));
    setDialogOpen(true);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const payload = toPayload(form);
    try {
      if (editing) {
        await updateService({ id: editing.id, body: payload }).unwrap();
        toast.success("Service updated.");
      } else {
        await addService(payload).unwrap();
        toast.success("Service created.");
      }
      setDialogOpen(false);
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    const target = deleteTarget;
    setDeleteTarget(null);
    try {
      await deleteService(target.id).unwrap();
      toast.success("Service deleted.");
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  }

  const isSaving = isAdding || isUpdating;

  return (
    <>
      <PageHeader
        title="Services"
        description="Streaming and subscription services offered to users."
        actions={
          <Button onClick={openCreate}>
            <Plus /> New service
          </Button>
        }
      />
      <Card>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Price (30 days)</TableHead>
                  <TableHead>Price (24h)</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableSkeleton columns={6} />
                ) : isError ? (
                  <TableMessage columns={6}>{getErrorMessage(error, "Failed to load services.")}</TableMessage>
                ) : data?.content.length === 0 ? (
                  <TableMessage columns={6}>No services yet.</TableMessage>
                ) : (
                  data?.content.map((service) => (
                    <TableRow key={service.id}>
                      <TableCell className="font-medium">{service.name}</TableCell>
                      <TableCell>{service.email}</TableCell>
                      <TableCell>{formatAmount(service.price)}</TableCell>
                      <TableCell>{formatAmount(service.daily_price)}</TableCell>
                      <TableCell>{service.stock}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(service)}>
                          <Pencil />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(service)}>
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-xl">
          <form onSubmit={handleSubmit} className="grid gap-4">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit service" : "New service"}</DialogTitle>
              <DialogDescription>Classic price must be between 250 and 3000. The 24h price is fixed by the server.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="svc-name">Name</Label>
                <Input
                  id="svc-name"
                  required
                  maxLength={100}
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="svc-email">Email</Label>
                <Input
                  id="svc-email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="svc-price">Prix classique (30 jours)</Label>
                <Input
                  id="svc-price"
                  type="number"
                  required
                  min={250}
                  max={3000}
                  value={form.price}
                  onChange={(e) => set("price", e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="svc-image">Image URL</Label>
                <Input
                  id="svc-image"
                  required
                  value={form.image_url}
                  onChange={(e) => set("image_url", e.target.value)}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="svc-desc-fr">Description (FR)</Label>
              <Textarea
                id="svc-desc-fr"
                required
                value={form.description_fr}
                onChange={(e) => set("description_fr", e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="svc-desc-en">Description (EN)</Label>
              <Textarea
                id="svc-desc-en"
                required
                value={form.description_en}
                onChange={(e) => set("description_en", e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Saving…" : editing ? "Save changes" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete service?"
        description={deleteTarget ? `“${deleteTarget.name}” will be permanently removed.` : ""}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
      />
    </>
  );
}
