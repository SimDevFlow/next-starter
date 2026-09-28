import { api } from "@/services/api";
import type { CredentialGroup, Paginated, UpdateCredentialGroupRequest } from "@/types/admin";

export interface GetCredentialGroupsParams {
  offset?: number;
  limit?: number;
  service_id?: string;
}

export const credentialGroupsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getCredentialGroups: builder.query<Paginated<CredentialGroup>, GetCredentialGroupsParams | void>({
      query: (params) => ({
        url: "admin/credential-groups",
        params: params ?? undefined,
      }),
      providesTags: ["credentialGroups"],
    }),
    getCredentialGroup: builder.query<CredentialGroup, string>({
      query: (id) => `admin/credential-groups/${id}`,
      providesTags: (_result, _error, id) => [{ type: "credentialGroups", id }],
    }),
    updateCredentialGroup: builder.mutation<CredentialGroup, { id: string; body: UpdateCredentialGroupRequest }>({
      query: ({ id, body }) => ({
        url: `admin/credential-groups/${id}`,
        method: "PUT",
        body,
      }),
      // Changing the password can move expired profiles back to stock.
      invalidatesTags: ["credentialGroups", "credentials", "services"],
    }),
    deleteCredentialGroup: builder.mutation<void, string>({
      query: (id) => ({
        url: `admin/credential-groups/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["credentialGroups", "credentials", "services"],
    }),
  }),
});

export const {
  useGetCredentialGroupsQuery,
  useLazyGetCredentialGroupsQuery,
  useGetCredentialGroupQuery,
  useUpdateCredentialGroupMutation,
  useDeleteCredentialGroupMutation,
} = credentialGroupsApi;
