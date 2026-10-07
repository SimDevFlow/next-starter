import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { routing } from './routing';

// Statically imported (rather than a fully-dynamic
// `import(`@/messages/${locale}/${namespace}.json`)`) because Turbopack
// can't build a glob/context module when both path segments are variables
// through a path alias — it throws "Cannot find module" at runtime even
// though the files exist. See the messages/{locale}/*.json files below.
import enCommon from '@/messages/en/common.json';
import enAuth from '@/messages/en/auth.json';
import enSidebar from '@/messages/en/sidebar.json';
import enDashboard from '@/messages/en/dashboard.json';
import enCitizens from '@/messages/en/citizens.json';
import enAccounts from '@/messages/en/accounts.json';
import enJournal from '@/messages/en/journal.json';
import enContent from '@/messages/en/content.json';
import enConfiguration from '@/messages/en/configuration.json';
import enCerdotola from '@/messages/en/cerdotola.json';
import enAmbassadeur from '@/messages/en/ambassadeur.json';
import enBureau from '@/messages/en/bureau.json';
import enEnums from '@/messages/en/enums.json';

import frCommon from '@/messages/fr/common.json';
import frAuth from '@/messages/fr/auth.json';
import frSidebar from '@/messages/fr/sidebar.json';
import frDashboard from '@/messages/fr/dashboard.json';
import frCitizens from '@/messages/fr/citizens.json';
import frAccounts from '@/messages/fr/accounts.json';
import frJournal from '@/messages/fr/journal.json';
import frContent from '@/messages/fr/content.json';
import frConfiguration from '@/messages/fr/configuration.json';
import frCerdotola from '@/messages/fr/cerdotola.json';
import frAmbassadeur from '@/messages/fr/ambassadeur.json';
import frBureau from '@/messages/fr/bureau.json';
import frEnums from '@/messages/fr/enums.json';

const messagesByLocale = {
  en: {
    common: enCommon,
    auth: enAuth,
    sidebar: enSidebar,
    dashboard: enDashboard,
    citizens: enCitizens,
    accounts: enAccounts,
    journal: enJournal,
    content: enContent,
    configuration: enConfiguration,
    cerdotola: enCerdotola,
    ambassadeur: enAmbassadeur,
    bureau: enBureau,
    enums: enEnums,
  },
  fr: {
    common: frCommon,
    auth: frAuth,
    sidebar: frSidebar,
    dashboard: frDashboard,
    citizens: frCitizens,
    accounts: frAccounts,
    journal: frJournal,
    content: frContent,
    configuration: frConfiguration,
    cerdotola: frCerdotola,
    ambassadeur: frAmbassadeur,
    bureau: frBureau,
    enums: frEnums,
  },
} as const;

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;

  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: messagesByLocale[locale],
  };
});
