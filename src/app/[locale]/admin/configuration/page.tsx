"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/shared/page-header";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useUpdateConfigurationMutation } from "@/services/admin/configuration";
import type { ConfigurationContenu } from "@/types/admin";

// Kept as digit strings rather than z.coerce.number(): zod v4's coercion
// gives the resolver mismatched input/output generics against
// react-hook-form's Resolver type. Converted to numbers at submit time.
const digitString = z.string().regex(/^\d+$/, "");
const schema = z.object({
  lecons_semaine_solde: digitString,
  lecons_semaine_partiel: digitString,
  pdf_semaine: digitString,
  videos_par_lecon: digitString,
  blocage_fonds_cerdotola_jours: digitString,
});

export default function ConfigurationPage() {
  const t = useTranslations("configuration");
  const tCommon = useTranslations("common");
  const [updateConfiguration, { isLoading }] = useUpdateConfigurationMutation();
  const [saved, setSaved] = useState<ConfigurationContenu | null>(null);

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      lecons_semaine_solde: "10",
      lecons_semaine_partiel: "2",
      pdf_semaine: "4",
      videos_par_lecon: "4",
      blocage_fonds_cerdotola_jours: "7",
    },
  });

  async function onSubmit(values: z.infer<typeof schema>) {
    const result = await updateConfiguration({
      lecons_semaine_solde: Number(values.lecons_semaine_solde),
      lecons_semaine_partiel: Number(values.lecons_semaine_partiel),
      pdf_semaine: Number(values.pdf_semaine),
      videos_par_lecon: Number(values.videos_par_lecon),
      blocage_fonds_cerdotola_jours: Number(values.blocage_fonds_cerdotola_jours),
    }).unwrap();
    setSaved(result);
  }

  return (
    <div>
      <PageHeader title={t("title")} description={t("subtitle")} />

      <Alert className="mb-4">
        <AlertDescription>{t("noGetNotice")}</AlertDescription>
      </Alert>

      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="lecons_semaine_solde"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("fields.leconsSemaineSolde")}</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lecons_semaine_partiel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("fields.leconsSemainePartiel")}</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="pdf_semaine"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("fields.pdfSemaine")}</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="videos_par_lecon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("fields.videosParLecon")}</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="blocage_fonds_cerdotola_jours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("fields.blocageFondsCerdotolaJours")}</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="sm:col-span-2">
                <Button type="submit" disabled={isLoading}>
                  {tCommon("actions.save")}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {saved && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-base">{t("currentValues")}</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
            <div>{t("fields.leconsSemaineSolde")}: {saved.lecons_semaine_solde}</div>
            <div>{t("fields.leconsSemainePartiel")}: {saved.lecons_semaine_partiel}</div>
            <div>{t("fields.pdfSemaine")}: {saved.pdf_semaine}</div>
            <div>{t("fields.videosParLecon")}: {saved.videos_par_lecon}</div>
            <div>{t("fields.blocageFondsCerdotolaJours")}: {saved.blocage_fonds_cerdotola_jours}</div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
