import { api } from '@/services/api';
import type {
  CartothequeRead,
  CreateCartothequeRequest,
  LeconAdminRead,
} from '@/types/admin';

const contentApi = api.injectEndpoints({
  endpoints: (build) => ({
    listCartotheque: build.query<CartothequeRead[], void>({
      query: () => '/super/content/cartotheque',
      providesTags: ['content'],
    }),
    createCartotheque: build.mutation<CartothequeRead, CreateCartothequeRequest>({
      query: (body) => ({
        url: '/super/content/cartotheque',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['content'],
    }),

    // NOTE: the backend spec doesn't document a request body for these two —
    // they're almost certainly multipart file uploads (video/PDF). Verify
    // the real field names against http://localhost:8000/docs before wiring
    // a form to them.
    listLecons: build.query<LeconAdminRead[], { semaine?: number } | void>({
      query: (args) => ({
        url: '/super/content/lecons',
        params: args?.semaine ? { semaine: args.semaine } : undefined,
      }),
      providesTags: ['content'],
    }),
    createLecon: build.mutation<LeconAdminRead, FormData>({
      query: (body) => ({
        url: '/super/content/lecons',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['content'],
    }),
    createFondsCerdotola: build.mutation<unknown, FormData>({
      query: (body) => ({
        url: '/super/content/fonds-cerdotola',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['content'],
    }),
  }),
});

export const {
  useListCartothequeQuery,
  useCreateCartothequeMutation,
  useListLeconsQuery,
  useCreateLeconMutation,
  useCreateFondsCerdotolaMutation,
} = contentApi;
