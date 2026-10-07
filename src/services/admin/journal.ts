import { api } from '@/services/api';
import type { GetJournalAccesResponse } from '@/types/admin';

const journalApi = api.injectEndpoints({
  endpoints: (build) => ({
    getJournal: build.query<
      GetJournalAccesResponse,
      { citoyenId?: string; page?: number; pageSize?: number } | void
    >({
      query: (args) => ({
        url: '/super/journal-acces',
        params: {
          citoyen_id: args?.citoyenId,
          page: args?.page ?? 1,
          page_size: args?.pageSize ?? 50,
        },
      }),
      providesTags: ['journal'],
    }),
  }),
});

export const { useGetJournalQuery } = journalApi;
