"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
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
import { useCreateCitoyenBureauMutation } from "@/services/admin/citoyens";
import type { CommentEntenduParler, LanguePreferee } from "@/types/admin";

const COMMENT_OPTIONS: CommentEntenduParler[] = [
  "instagram",
  "facebook",
  "tiktok",
  "youtube",
];
const LANGUES: LanguePreferee[] = ["fr", "en", "zh", "de", "pt", "es"];

const schema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  first_name: z.string().min(1),
  telephone: z.string().min(1),
  pays_residence: z.string().min(1),
  ville: z.string().min(1),
  pays_origine: z.string().min(1),
  village: z.string().optional(),
  lignage: z.string().optional(),
  comment_avez_vous_entendu_parler: z.enum([
    "instagram",
    "facebook",
    "tiktok",
    "youtube",
  ]),
  langue_preferee: z.enum(["fr", "en", "zh", "de", "pt", "es"]),
  code_parrainage: z.string().optional(),
});

export default function BureauNouveauPage() {
  const t = useTranslations("bureau");
  const tCitizens = useTranslations("citizens");
  const tCommon = useTranslations("common");
  const tEnums = useTranslations("enums");
  const router = useRouter();
  const [createCitoyen, { isLoading }] = useCreateCitoyenBureauMutation();

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      name: "",
      first_name: "",
      telephone: "",
      pays_residence: "",
      ville: "",
      pays_origine: "",
      village: "",
      lignage: "",
      comment_avez_vous_entendu_parler: "facebook",
      langue_preferee: "fr",
      code_parrainage: "",
    },
  });

  async function onSubmit(values: z.infer<typeof schema>) {
    const citoyen = await createCitoyen(values).unwrap();
    router.push(`/admin/bureau/citoyens/${citoyen.id}`);
  }

  return (
    <div>
      <PageHeader title={t("newTitle")} description={t("newSubtitle")} />
      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{tCitizens("fields.firstName")}</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{tCitizens("fields.name")}</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{tCitizens("fields.email")}</FormLabel>
                    <FormControl><Input type="email" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="telephone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{tCitizens("fields.telephone")}</FormLabel>
                    <FormControl><Input placeholder="+237691234567" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="pays_residence"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{tCitizens("fields.paysResidence")}</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ville"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{tCitizens("fields.ville")}</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="pays_origine"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{tCitizens("fields.paysOrigine")}</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="village"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{tCitizens("fields.village")}</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lignage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{tCitizens("fields.lignage")}</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="comment_avez_vous_entendu_parler"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{tCitizens("fields.commentEntenduParler")}</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {COMMENT_OPTIONS.map((c) => (
                          <SelectItem key={c} value={c}>{tEnums(`commentEntenduParler.${c}`)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="langue_preferee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{tCitizens("fields.languePreferee")}</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {LANGUES.map((l) => (
                          <SelectItem key={l} value={l}>{tEnums(`languePreferee.${l}`)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="code_parrainage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("fields.codeParrainage")}</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="sm:col-span-2">
                <Button type="submit" disabled={isLoading}>
                  {tCommon("actions.create")}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
