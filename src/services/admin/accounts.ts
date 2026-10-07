import { api } from '@/services/api';
import type {
  AdminRole,
  CreateAdminAccountRequest,
  FullAdminAccount,
  GetAdminAccountsResponse,
} from '@/types/admin';

const accountsApi = api.injectEndpoints({
  endpoints: (build) => ({
    listAccounts: build.query<GetAdminAccountsResponse, { role?: AdminRole } | void>({
      query: (args) => ({
        url: '/super/accounts',
        params: args?.role ? { role: args.role } : undefined,
      }),
      providesTags: ['adminAccounts'],
    }),
    createAccount: build.mutation<FullAdminAccount, CreateAdminAccountRequest>({
      query: (body) => ({
        url: '/super/accounts',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['adminAccounts'],
    }),
    enableAccount: build.mutation<FullAdminAccount, string>({
      query: (adminId) => ({
        url: `/super/accounts/${adminId}/enable`,
        method: 'PATCH',
      }),
      invalidatesTags: ['adminAccounts'],
    }),
    disableAccount: build.mutation<FullAdminAccount, string>({
      query: (adminId) => ({
        url: `/super/accounts/${adminId}/disable`,
        method: 'PATCH',
      }),
      invalidatesTags: ['adminAccounts'],
    }),
  }),
});

export const {
  useListAccountsQuery,
  useCreateAccountMutation,
  useEnableAccountMutation,
  useDisableAccountMutation,
} = accountsApi;
