import { api } from '@/services/api';
import type { AdminAuthResponse, FullAdminAccount } from '@/types/admin';

interface LoginResult {
  admin: FullAdminAccount;
}

const authApi = api.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation<
      LoginResult,
      { email: string; password: string }
    >({
      query: (body) => ({
        url: '/auth/login',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const { useLoginMutation } = authApi;
export type { AdminAuthResponse };
