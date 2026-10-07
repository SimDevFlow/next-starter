"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useCreateCartothequeMutation, useListCartothequeQuery } from "@/services/admin/content";
import type { CartothequeRead } from "@/types/admin";

const schema = z.object({
  nom_village: z.string().min(1),
  signification_fr: z.string().min(1),
});

function AddVillageDialog() {
  const t = useTranslations("content");
  const tCommon = useTranslations("common");
  const [open, setOpen] = useState(false);
  const [createCartotheque, { isLoading }] = useCreateCartothequeMutation();

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { nom_village: "", signification_fr: "" },
  });

  async function onSubmit(values: z.infer<typeof schema>) {
    await createCartotheque(values).unwrap();
    setOpen(false);
    form.reset();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus /> {t("cartothequeAdd")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("cartothequeAdd")}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="nom_village"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("cartothequeFields.nomVillage")}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="signification_fr"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("cartothequeFields.significationFr")}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {tCommon("actions.create")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default function CartothequePage() {
  const t = useTranslations("content");
  const { data, isLoading } = useListCartothequeQuery();

  const columns: DataTableColumn<CartothequeRead>[] = [
    { key: "nom", header: t("cartothequeFields.nomVillage"), cell: (row) => row.nom_village },
    {
      key: "signification",
      header: t("cartothequeFields.significationFr"),
      cell: (row) => row.signification_fr,
    },
  ];

  return (
    <div>
      <PageHeader
        title={t("cartothequeTitle")}
        description={t("cartothequeSubtitle")}
        actions={<AddVillageDialog />}
      />
      <DataTable columns={columns} rows={data ?? []} rowKey={(row) => row.id} isLoading={isLoading} />
    </div>
  );
}
