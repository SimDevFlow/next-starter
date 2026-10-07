"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocale, useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  useCreateAccountMutation,
  useDisableAccountMutation,
  useEnableAccountMutation,
  useListAccountsQuery,
} from "@/services/admin/accounts";
import { formatDate } from "@/lib/format";
import type { AdminRole, FullAdminAccount } from "@/types/admin";

const ROLES: AdminRole[] = ["super_admin", "bureau", "cerdotola", "ambassadeur_diaspora"];

const createAccountSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["super_admin", "bureau", "cerdotola", "ambassadeur_diaspora"]),
  ambassadeur_ville: z.string().optional(),
  ambassadeur_association: z.string().optional(),
});

function CreateAccountDialog() {
  const t = useTranslations("accounts");
  const tCommon = useTranslations("common");
  const [open, setOpen] = useState(false);
  const [createAccount, { isLoading }] = useCreateAccountMutation();

  const form = useForm<z.infer<typeof createAccountSchema>>({
    resolver: zodResolver(createAccountSchema),
    defaultValues: { email: "", password: "", role: "bureau" },
  });

  const role = useWatch({ control: form.control, name: "role" });

  async function onSubmit(values: z.infer<typeof createAccountSchema>) {
    await createAccount(values).unwrap();
    setOpen(false);
    form.reset();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus /> {t("createTitle")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("createTitle")}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("fields.email")}</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("fields.password")}</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("fields.role")}</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ROLES.map((r) => (
                        <SelectItem key={r} value={r}>
                          {tCommon(`roles.${r}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {role === "ambassadeur_diaspora" && (
              <>
                <FormField
                  control={form.control}
                  name="ambassadeur_ville"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("fields.ambassadeurVille")}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="ambassadeur_association"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("fields.ambassadeurAssociation")}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
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

export default function AccountsPage() {
  const t = useTranslations("accounts");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const [roleFilter, setRoleFilter] = useState<AdminRole | "all">("all");
  const { data, isLoading } = useListAccountsQuery(
    roleFilter === "all" ? undefined : { role: roleFilter }
  );
  const [enableAccount] = useEnableAccountMutation();
  const [disableAccount] = useDisableAccountMutation();

  const columns: DataTableColumn<FullAdminAccount>[] = [
    { key: "email", header: t("fields.email"), cell: (row) => row.email },
    {
      key: "role",
      header: t("fields.role"),
      cell: (row) => <StatusBadge namespace="adminRole" value={row.role} />,
    },
    {
      key: "disabled",
      header: t("fields.disabled"),
      cell: (row) => (
        <span className={row.disabled ? "text-destructive" : "text-emerald-600 dark:text-emerald-400"}>
          {row.disabled ? tCommon("actions.disable") : tCommon("actions.enable")}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: t("fields.createdAt"),
      cell: (row) => formatDate(row.created_at, locale),
    },
    {
      key: "actions",
      header: "",
      cell: (row) =>
        row.disabled ? (
          <ConfirmDialog
            trigger={<Button size="sm" variant="outline">{tCommon("actions.enable")}</Button>}
            title={t("confirmEnableTitle")}
            confirmVariant="default"
            onConfirm={() => enableAccount(row.id)}
          />
        ) : (
          <ConfirmDialog
            trigger={<Button size="sm" variant="outline">{tCommon("actions.disable")}</Button>}
            title={t("confirmDisableTitle")}
            onConfirm={() => disableAccount(row.id)}
          />
        ),
    },
  ];

  return (
    <div>
      <PageHeader title={t("title")} description={t("subtitle")} actions={<CreateAccountDialog />} />

      <div className="mb-4 w-56">
        <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as AdminRole | "all")}>
          <SelectTrigger>
            <SelectValue placeholder={t("filterByRole")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("allRoles")}</SelectItem>
            {ROLES.map((r) => (
              <SelectItem key={r} value={r}>
                {tCommon(`roles.${r}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        rows={data?.content ?? []}
        rowKey={(row) => row.id}
        isLoading={isLoading}
      />
    </div>
  );
}
