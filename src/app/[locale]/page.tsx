import { redirect } from "@/i18n/navigation";
import { getAccessToken } from "@/lib/session";

export default async function LocaleIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const accessToken = await getAccessToken();
  redirect({ href: accessToken ? "/dashboard" : "/login", locale });
}
