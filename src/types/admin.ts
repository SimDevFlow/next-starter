// Mirrors the FastAPI backend's OpenAPI schema for everything under
// /api/admin/**. Keep in sync with http://localhost:8000/openapi.json.

export type AdminRole =
  | "super_admin"
  | "bureau"
  | "cerdotola"
  | "ambassadeur_diaspora";

export type StatutAbonnement = "aucun" | "reserve" | "partiel" | "solde" | "annule";
export type StatutGravure = "non_fait" | "fait";
export type StatutCartePvc =
  | "non_demandee"
  | "demandee"
  | "en_attente_validation_cerdotola"
  | "validee"
  | "imprimee"
  | "expediee";
export type MoyenPaiement = "mobile_money" | "carte";
export type EtapePaiement = "reservation" | "j30" | "j60";
export type StatutPaiement = "en_attente" | "confirme" | "echoue";
export type CommentEntenduParler =
  | "instagram"
  | "facebook"
  | "tiktok"
  | "youtube";
export type LanguePreferee = "fr" | "en" | "zh" | "de" | "pt" | "es";

export interface Token {
  token: string;
  expired_at: string;
}

export interface FullAdminAccount {
  id: string;
  email: string;
  role: AdminRole;
  disabled: boolean;
  created_at: string;
  code_parrainage: string | null;
}

export interface AdminAuthResponse {
  admin: FullAdminAccount;
  access_token: Token;
  refresh_token: Token;
}

export interface RefreshTokenResponse {
  access_token: Token;
  refresh_token: Token;
}

export interface CreateAdminAccountRequest {
  email: string;
  password: string;
  role: AdminRole;
  ambassadeur_ville?: string | null;
  ambassadeur_association?: string | null;
}

export interface GetAdminAccountsResponse {
  total: number;
  content: FullAdminAccount[];
}

export interface FullCitoyen {
  email: string;
  name: string;
  first_name: string;
  telephone: string;
  pays_residence: string;
  ville: string;
  pays_origine: string;
  village: string | null;
  lignage: string | null;
  comment_avez_vous_entendu_parler: CommentEntenduParler | null;
  langue_preferee: LanguePreferee;
  disabled: boolean;
  statut_abonnement: StatutAbonnement;
  statut_gravure: StatutGravure;
  statut_carte_pvc: StatutCartePvc;
  tracking_dhl: string | null;
  id: string;
  created_at: string;
}

export interface GetCitoyensResponse {
  total: number;
  page: number;
  content: FullCitoyen[];
}

export interface AdminUpdateCitoyenRequest {
  name?: string | null;
  first_name?: string | null;
  pays_residence?: string | null;
  ville?: string | null;
  pays_origine?: string | null;
  village?: string | null;
  lignage?: string | null;
  langue_preferee?: LanguePreferee | null;
  disabled?: boolean | null;
}

export interface BureauCreateCitoyenRequest {
  email: string;
  name: string;
  first_name: string;
  telephone: string;
  pays_residence: string;
  ville: string;
  pays_origine: string;
  village?: string | null;
  lignage?: string | null;
  comment_avez_vous_entendu_parler: CommentEntenduParler;
  langue_preferee?: LanguePreferee;
  code_parrainage?: string | null;
}

export interface RecordPaymentRequest {
  moyen?: MoyenPaiement;
}

export interface InitiatePaymentResponse {
  reference_transaction: string;
  etape: EtapePaiement;
  montant: number;
  devise: string;
  statut: StatutPaiement;
  statut_abonnement: string;
  note: string;
}

export interface CartePvcUpdateRequest {
  statut_carte_pvc: StatutCartePvc;
  tracking_dhl?: string | null;
}

export interface FinancialDashboardResponse {
  total_encaisse: number;
  total_reste_a_payer: number;
  citoyens_par_statut: Record<string, number>;
  // Keys: CommentEntenduParler values, plus "non_renseigne" for legacy accounts.
  citoyens_par_reseau: Record<CommentEntenduParler | "non_renseigne", number>;
  nombre_citoyens_soldes: number;
  montant_du_cerdotola: number;
  deja_reverse_cerdotola: number;
}

export interface JournalAccesRead {
  id: string;
  citoyen_id: string;
  type_contenu: string;
  contenu_id: string;
  date_heure: string;
  ip_address: string | null;
}

export interface GetJournalAccesResponse {
  total: number;
  content: JournalAccesRead[];
}

export interface GraveRead {
  citoyen_id: string;
  nom_complet: string;
  pays_origine: string;
  photo_url: string;
  identifiant_certificat: string | null;
}

export interface ReversementRead {
  id: string;
  montant: number;
  date: string;
  recu_key: string;
  cree_par_admin_id: string;
}

export interface ReversementWithUrl extends ReversementRead {
  recu_url: string;
}

export interface VerifyCertificateResponse {
  valide: boolean;
  identifiant: string;
  nom_complet?: string | null;
  pays_origine?: string | null;
  date_generation?: string | null;
  mention_legale: string;
}

export interface FilleulRead {
  citoyen_id: string;
  nom_complet: string;
  statut_abonnement: string;
  created_at: string;
}

export interface CommissionRead {
  id: string;
  citoyen_id: string;
  montant: number;
  date: string;
}

export interface CommissionsResponse {
  total_du: number;
  historique: CommissionRead[];
}

export interface CartothequeRead {
  id: string;
  nom_village: string;
  signification_fr: string;
}

export interface CreateCartothequeRequest {
  nom_village: string;
  signification_fr: string;
}

export interface ConfigurationContenu {
  id: number;
  lecons_semaine_solde: number;
  lecons_semaine_partiel: number;
  pdf_semaine: number;
  videos_par_lecon: number;
  blocage_fonds_cerdotola_jours: number;
}

export interface UpdateConfigurationRequest {
  lecons_semaine_solde?: number | null;
  lecons_semaine_partiel?: number | null;
  pdf_semaine?: number | null;
  videos_par_lecon?: number | null;
  blocage_fonds_cerdotola_jours?: number | null;
}

export interface LeconAdminRead {
  id: string;
  semaine: number;
  numero: number;
  video_uids: string[];
  pdf_keys: string[];
  musique_key: string | null;
  created_at: string;
}

export interface FondsCerdotolaRead {
  id: string;
  titre: string;
  description: string | null;
  date_publication: string;
}
