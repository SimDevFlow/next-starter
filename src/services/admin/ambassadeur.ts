import { api } from '@/services/api';
import type { CommissionsResponse, FilleulRead } from '@/types/admin';

const ambassadeurApi = api.injectEndpoints({
  endpoints: (build) => ({
    getFilleuls: build.query<FilleulRead[], void>({
      query: () => '/ambassadeur/filleuls',
      providesTags: ['filleuls'],
    }),
    getCommissions: build.query<CommissionsResponse, void>({
      query: () => '/ambassadeur/commissions',
      providesTags: ['commissions'],
    }),
  }),
});

export const { useGetFilleulsQuery, useGetCommissionsQuery } = ambassadeurApi;
