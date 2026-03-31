
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

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error?.status === 401) {
    const refreshResponse = await fetch('/api/auth/refresh', {
      method: 'POST',
    });

    if (refreshResponse.ok) {
      result = await baseQuery(args, api, extraOptions);
    } else {
      if (typeof window !== 'undefined') {
        await fetch('/api/auth/logout', {
          method: 'POST',
        });
        window.location.href = '/';
      }
    }
  }

  return result;
};

export const api = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  endpoints: () => ({}),
  tagTypes: ['chapters', 'courses', 'forums', 'users', 'forumReplies', 'tests', 'olympiads', 'papers'],
});