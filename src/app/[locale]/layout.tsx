import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { hasLocale } from 'next-intl';
import Providers from '@/components/shared/provider';
import { Toaster } from "@/components/ui/sonner"

type Props = {
  children: React.ReactNode;
  params: { locale: string };
};

export default async function Layout({ children, params }: Props) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return (
    <Providers>
      {children}
      <Toaster />
    </Providers>
  );
}
