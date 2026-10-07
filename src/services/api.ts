import { Mutex } from 'async-mutex';
import { INTERN_BASE_URL } from '@/lib/config';
import {
  fetchBaseQuery,
  FetchArgs,
  FetchBaseQueryError,
  BaseQueryFn,
  createApi,
} from '@reduxjs/toolkit/query/react';

const baseQuery = fetchBaseQuery({
  baseUrl: INTERN_BASE_URL,
  credentials: 'include',
});

// Ensures concurrent 401s trigger a single refresh call instead of racing
// each other against a rotating refresh token.
const refreshMutex = new Mutex();

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  await refreshMutex.waitForUnlock();
  let result = await baseQuery(args, api, extraOptions);

  if (result.error?.status === 401) {
    if (!refreshMutex.isLocked()) {
      const release = await refreshMutex.acquire();
      try {
        const refreshResponse = await fetch('/api/admin/auth/refresh', {
          method: 'POST',
        });

        if (refreshResponse.ok) {
          result = await baseQuery(args, api, extraOptions);
        } else if (typeof window !== 'undefined') {
          await fetch('/api/admin/auth/logout', { method: 'POST' });
          window.location.href = '/';
        }
      } finally {
        release();
      }
    } else {
      await refreshMutex.waitForUnlock();
      result = await baseQuery(args, api, extraOptions);
    }
  }

  return result;
};

export const api = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  endpoints: () => ({}),
  tagTypes: [
    'citoyens',
    'adminAccounts',
    'journal',
    'dashboard',
    'graves',
    'reversements',
    'filleuls',
    'commissions',
    'content',
    'configuration',
  ],
});
