export type Role = "user" | "admin";

export interface User {
  email: string;
  full_name: string;
  disabled: boolean;
  role: Role;
  expiry_alerts_enabled: boolean;
  flash_alerts_enabled: boolean;
}

export interface FullUser extends User {
  id: string;
  created_at: string;
}

export interface Token {
  token: string;
  expired_at: string;
}

export interface AuthUserResponse {
  user: User;
  access_token: Token;
  refresh_token: Token;
}

export interface RefreshTokenResponse {
  access_token: Token;
  refresh_token: Token;
}

export interface Paginated<T> {
  total: number;
  page: number;
  content: T[];
}

export interface AccessCode {
  id: string;
  service_email: string;
  code: string;
  created_at: string;
}

export interface CreateAccessCode {
  service_email: string;
  code: string;
}

export interface Credential {
  id: string;
  service_id: string;
  group_id: string;
  user_id: string | null;
  /** Holder's name and email, set when the credential is assigned. */
  user_full_name: string | null;
  user_email: string | null;
  email: string;
  password: string;
  profil: string;
  pin_code: string;
  created_at: string;
}

export interface CreateCredential {
  service_id: string;
  email: string;
  password: string;
  profil: string;
  pin_code: string;
}

/** Email and password are managed on the credential group, not per profile. */
export interface UpdateCredentialRequest {
  profil?: string;
  pin_code?: string;
}

export interface CredentialProfile {
  /** Credential id. */
  id: string;
  /** null means the profile is free (in stock). */
  user_id: string | null;
  /** Holder's name and email, set when the profile is assigned. */
  user_full_name: string | null;
  user_email: string | null;
  profil: string;
  pin_code: string;
  created_at: string;
}

/** A streaming account (email + password) shared by up to `max_profiles` profiles. */
export interface CredentialGroup {
  id: string;
  service_id: string;
  email: string;
  password: string;
  created_at: string;
  max_profiles: number;
  available_slots: number;
  profiles: CredentialProfile[];
}

export interface UpdateCredentialGroupRequest {
  email?: string;
  password?: string;
}

export interface Description {
  fr: string;
  en: string;
}

export interface Service {
  id: string;
  name: string;
  email: string;
  price: number;
  image_url: string;
  description: Description;
  /** Fixed 24h price, read-only (set by the backend). */
  daily_price: number;
  stock: number;
}

export interface CreateService {
  name: string;
  email: string;
  price: number;
  image_url: string;
  description: Description;
}

export type LinkType = "HOUSE_CHANGE" | "TEMP_ACCESS";

export interface ServiceLink {
  id: string;
  type: LinkType;
  link: string;
  service_email: string;
  created_at: string;
}

export interface CreateServiceLink {
  type: LinkType;
  link: string;
  service_email: string;
}

export type PaymentStatus = "ACCEPTED" | "SUBMITTED" | "COMPLETED" | "FAILED";

export type SubscriptionType = "daily" | "monthly";

export interface Payment {
  id: string;
  user_id: string;
  service_id: string;
  amount: number;
  subscription_type: SubscriptionType;
  payement_statut: PaymentStatus;
  user_number: string;
  created_at: string;
}

export interface GiftSubscriptionRequest {
  service_id: string;
  /** 1 to 30. */
  days: number;
  /** Profile to give; omitted or null lets the backend pick any available one. */
  credential_id?: string | null;
}

export interface GiftSubscription {
  id: string;
  user_id: string;
  service_id: string;
  subscription_type: "gift";
  days: number;
  subscribed_at: string;
  expired_at: string;
  /** false when no free profile could be assigned to the user. */
  credential_assigned: boolean;
  credential_id: string | null;
}

/** Dates are ISO strings in the server's local time (no offset). */
export interface UserSubscription {
  id: string;
  user_id: string;
  service_id: string;
  service_name: string;
  subscription_type: SubscriptionType | "gift";
  payement_id: string | null;
  subscribed_at: string;
  expired_at: string;
  cancelled_at: string | null;
  is_active: boolean;
}

export interface UpdateSubscriptionResponse extends UserSubscription {
  /** false when no free profile could be assigned to the user. */
  credential_assigned: boolean;
}

export interface SendMailRequest {
  subject: string;
  recipient: string;
  body: string;
}

export interface SetAdminPasswordRequest {
  password: string;
  current_password?: string | null;
}

export interface ApiErrorBody {
  detail: string;
}
