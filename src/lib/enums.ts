import type {
  AdminRole,
  CommentEntenduParler,
  EtapePaiement,
  LanguePreferee,
  MoyenPaiement,
  StatutAbonnement,
  StatutCartePvc,
  StatutGravure,
  StatutPaiement,
} from "@/types/admin";

export type Tone = "neutral" | "success" | "warning" | "danger" | "info";

export const TONE_CLASSES: Record<Tone, string> = {
  neutral: "bg-muted text-muted-foreground",
  success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  danger: "bg-destructive/10 text-destructive",
  info: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
};

// Each map's keys are the enum's namespace under the `enums` i18n
// namespace (src/messages/{locale}/enums.json), so <StatusBadge> can look
// up both the label and the tone from a single `namespace` prop.
export const enumTones = {
  adminRole: {
    super_admin: "info",
    bureau: "neutral",
    cerdotola: "neutral",
    ambassadeur_diaspora: "neutral",
  } satisfies Record<AdminRole, Tone>,

  statutAbonnement: {
    aucun: "neutral",
    reserve: "warning",
    partiel: "warning",
    solde: "success",
    annule: "danger",
  } satisfies Record<StatutAbonnement, Tone>,

  statutGravure: {
    non_fait: "warning",
    fait: "success",
  } satisfies Record<StatutGravure, Tone>,

  statutCartePvc: {
    non_demandee: "neutral",
    demandee: "info",
    en_attente_validation_cerdotola: "warning",
    validee: "info",
    imprimee: "info",
    expediee: "success",
  } satisfies Record<StatutCartePvc, Tone>,

  moyenPaiement: {
    mobile_money: "neutral",
    carte: "neutral",
  } satisfies Record<MoyenPaiement, Tone>,

  etapePaiement: {
    reservation: "neutral",
    j30: "neutral",
    j60: "neutral",
  } satisfies Record<EtapePaiement, Tone>,

  statutPaiement: {
    en_attente: "warning",
    confirme: "success",
    echoue: "danger",
  } satisfies Record<StatutPaiement, Tone>,

  commentEntenduParler: {
    instagram: "neutral",
    facebook: "neutral",
    tiktok: "neutral",
    youtube: "neutral",
  } satisfies Record<CommentEntenduParler, Tone>,

  languePreferee: {
    fr: "neutral",
    en: "neutral",
    zh: "neutral",
    de: "neutral",
    pt: "neutral",
    es: "neutral",
  } satisfies Record<LanguePreferee, Tone>,
} as const;

export type EnumNamespace = keyof typeof enumTones;
