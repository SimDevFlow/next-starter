import { api } from "@/services/api";
import type {
  Credential,
  CreateCredential,
  Paginated,
  UpdateCredentialRequest,
} from "@/types/admin";

export interface GetCredentialsParams {
  offset?: number;
  limit?: number;
  service_id?: string;
  /** Only profiles not assigned to any user. */
  available_only?: boolean;
}

export const credentialsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getCredentials: builder.query<Paginated<Credential>, GetCredentialsParams | void>({
      query: (params) => ({
        url: "admin/credentials",
        params: params ?? undefined,
      }),
      providesTags: ["credentials"],
    }),
    getCredential: builder.query<Credential, string>({
      query: (id) => `admin/credentials/${id}`,
      providesTags: (_result, _error, id) => [{ type: "credentials", id }],
    }),
    addCredential: builder.mutation<Credential, CreateCredential>({
      query: (body) => ({
        url: "admin/credentials",
        method: "POST",
        body,
      }),
      invalidatesTags: ["credentials", "credentialGroups", "services"],
    }),
    updateCredential: builder.mutation<Credential, { id: string; body: UpdateCredentialRequest }>({
      query: ({ id, body }) => ({
        url: `admin/credentials/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["credentials", "credentialGroups", "services"],
    }),
    deleteCredential: builder.mutation<void, string>({
      query: (id) => ({
        url: `admin/credentials/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["credentials", "credentialGroups", "services"],
    }),
  }),
});

export const {
  useGetCredentialsQuery,
  useGetCredentialQuery,
  useAddCredentialMutation,
  useUpdateCredentialMutation,
  useDeleteCredentialMutation,
} = credentialsApi;
