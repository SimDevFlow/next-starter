import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import Providers from '@/components/shared/provider';
import { Toaster } from "@/components/ui/sonner"

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function Layout({ children, params }: Readonly<Props>) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <Providers>
        {children}
        <Toaster />
      </Providers>
    </NextIntlClientProvider>
  );
}
