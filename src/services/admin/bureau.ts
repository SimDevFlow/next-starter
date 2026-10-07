import { api } from '@/services/api';
import type { ReversementRead } from '@/types/admin';

// NOTE: the backend spec doesn't document a request body for this route —
// it's almost certainly a multipart file upload (receipt). Verify the real
// field names against http://localhost:8000/docs before wiring a form.
const bureauApi = api.injectEndpoints({
  endpoints: (build) => ({
    createReversement: build.mutation<ReversementRead, FormData>({
      query: (body) => ({
        url: '/bureau/reversements',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['reversements'],
    }),
  }),
});

export const { useCreateReversementMutation } = bureauApi;
