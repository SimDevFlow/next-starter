"use client";

import { use } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocale, useTranslations } from "next-intl";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { useGetCitoyenQuery, useUpdateCitoyenMutation } from "@/services/admin/citoyens";
import { formatDate } from "@/lib/format";
import type { LanguePreferee } from "@/types/admin";

const LANGUES: LanguePreferee[] = ["fr", "en", "zh", "de", "pt", "es"];

const editSchema = z.object({
  name: z.string().min(1),
  first_name: z.string().min(1),
  pays_residence: z.string().min(1),
  ville: z.string().min(1),
  pays_origine: z.string().min(1),
  village: z.string().optional(),
  lignage: z.string().optional(),
  langue_preferee: z.enum(["fr", "en", "zh", "de", "pt", "es"]),
  disabled: z.enum(["false", "true"]),
});

export default function CitoyenDetailPage({
  params,
}: Readonly<{
  params: Promise<{ id: string }>;
}>) {
  const { id } = use(params);
  const t = useTranslations("citizens");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const { data, isLoading } = useGetCitoyenQuery(id);
  const [updateCitoyen, { isLoading: isSaving }] = useUpdateCitoyenMutation();

  const form = useForm<z.infer<typeof editSchema>>({
    resolver: zodResolver(editSchema),
    values: data
      ? {
          name: data.name,
          first_name: data.first_name,
          pays_residence: data.pays_residence,
          ville: data.ville,
          pays_origine: data.pays_origine,
          village: data.village ?? "",
          lignage: data.lignage ?? "",
          langue_preferee: data.langue_preferee,
          disabled: data.disabled ? "true" : "false",
        }
      : undefined,
  });

  async function onSubmit(values: z.infer<typeof editSchema>) {
    await updateCitoyen({
      citoyenId: id,
      body: {
        ...values,
        disabled: values.disabled === "true",
      },
    }).unwrap();
  }

  if (isLoading || !data) {
    return (
      <div>
        <Skeleton className="h-8 w-64" />
        <Skeleton className="mt-4 h-96 w-full" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={t("detailTitle")}
        description={`${data.first_name} ${data.name} — ${data.email}`}
      />

      <div className="mb-4 flex flex-wrap gap-2">
        <StatusBadge namespace="statutAbonnement" value={data.statut_abonnement} />
        <StatusBadge namespace="statutGravure" value={data.statut_gravure} />
        <StatusBadge namespace="statutCartePvc" value={data.statut_carte_pvc} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("editTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("fields.firstName")}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("fields.name")}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="pays_residence"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("fields.paysResidence")}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ville"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("fields.ville")}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="pays_origine"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("fields.paysOrigine")}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="village"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("fields.village")}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lignage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("fields.lignage")}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="langue_preferee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("fields.languePreferee")}</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {LANGUES.map((l) => (
                          <SelectItem key={l} value={l}>
                            {l.toUpperCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="disabled"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("fields.disabled")}</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="false">{tCommon("actions.enable")}</SelectItem>
                        <SelectItem value="true">{tCommon("actions.disable")}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="sm:col-span-2">
                <Button type="submit" disabled={isSaving}>
                  {tCommon("actions.save")}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <p className="mt-4 text-sm text-muted-foreground">
        {t("fields.createdAt")}: {formatDate(data.created_at, locale)}
      </p>
    </div>
  );
}
