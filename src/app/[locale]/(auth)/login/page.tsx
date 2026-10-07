"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
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
import { Logo } from "@/components/shared/logo";
import { useLoginMutation } from "@/services/admin/auth";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query/react";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

function extractErrorMessage(error: unknown, fallback: string) {
  const fbqError = error as FetchBaseQueryError | undefined;
  if (fbqError && typeof fbqError === "object" && "data" in fbqError) {
    const data = fbqError.data as { detail?: string } | undefined;
    if (data?.detail) return data.detail;
  }
  return fallback;
}

export default function LoginPage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  const [login, { isLoading: isLoggingIn }] = useLoginMutation();

  const credentialsForm = useForm<z.infer<typeof credentialsSchema>>({
    resolver: zodResolver(credentialsSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onCredentialsSubmit(values: z.infer<typeof credentialsSchema>) {
    setFormError(null);
    try {
      await login(values).unwrap();
      router.push("/admin");
      router.refresh();
    } catch (error) {
      setFormError(extractErrorMessage(error, t("invalidCredentials")));
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="items-center text-center">
          <Logo size={96} className="mb-2 size-24" />
          <CardTitle>{t("loginTitle")}</CardTitle>
          <CardDescription>{t("loginSubtitle")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...credentialsForm}>
            <form
              onSubmit={credentialsForm.handleSubmit(onCredentialsSubmit)}
              className="flex flex-col gap-4"
            >
              <FormField
                control={credentialsForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("email")}</FormLabel>
                    <FormControl>
                      <Input type="email" autoComplete="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={credentialsForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("password")}</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        autoComplete="current-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {formError && (
                <p className="text-sm text-destructive">{formError}</p>
              )}
              <Button type="submit" disabled={isLoggingIn} className="mt-2">
                {t("loginSubmit")}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
