import { api } from '@/services/api';
import type {
  AdminUpdateCitoyenRequest,
  BureauCreateCitoyenRequest,
  CartePvcUpdateRequest,
  FullCitoyen,
  GetCitoyensResponse,
  InitiatePaymentResponse,
  RecordPaymentRequest,
} from '@/types/admin';

const citoyensApi = api.injectEndpoints({
  endpoints: (build) => ({
    listCitoyens: build.query<GetCitoyensResponse, { page?: number; pageSize?: number } | void>({
      query: (args) => ({
        url: '/super/citoyens',
        params: {
          page: args?.page ?? 1,
          page_size: args?.pageSize ?? 50,
        },
      }),
      providesTags: ['citoyens'],
    }),
    getCitoyen: build.query<FullCitoyen, string>({
      query: (citoyenId) => `/super/citoyens/${citoyenId}`,
      providesTags: ['citoyens'],
    }),
    updateCitoyen: build.mutation<
      FullCitoyen,
      { citoyenId: string; body: AdminUpdateCitoyenRequest }
    >({
      query: ({ citoyenId, body }) => ({
        url: `/super/citoyens/${citoyenId}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['citoyens'],
    }),
    deleteCitoyen: build.mutation<void, string>({
      query: (citoyenId) => ({
        url: `/super/citoyens/${citoyenId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['citoyens'],
    }),

    // Bureau (front-desk) actions — same FullCitoyen domain.
    createCitoyenBureau: build.mutation<FullCitoyen, BureauCreateCitoyenRequest>({
      query: (body) => ({
        url: '/bureau/citoyens',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['citoyens'],
    }),
    recordPayment: build.mutation<
      InitiatePaymentResponse,
      { citoyenId: string; body: RecordPaymentRequest }
    >({
      query: ({ citoyenId, body }) => ({
        url: `/bureau/citoyens/${citoyenId}/payment`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['citoyens'],
    }),
    markGravure: build.mutation<FullCitoyen, string>({
      query: (citoyenId) => ({
        url: `/bureau/citoyens/${citoyenId}/gravure`,
        method: 'PATCH',
      }),
      invalidatesTags: ['citoyens'],
    }),
    updateCartePvc: build.mutation<
      FullCitoyen,
      { citoyenId: string; body: CartePvcUpdateRequest }
    >({
      query: ({ citoyenId, body }) => ({
        url: `/bureau/citoyens/${citoyenId}/carte-pvc`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['citoyens'],
    }),
  }),
});

export const {
  useListCitoyensQuery,
  useGetCitoyenQuery,
  useUpdateCitoyenMutation,
  useDeleteCitoyenMutation,
  useCreateCitoyenBureauMutation,
  useRecordPaymentMutation,
  useMarkGravureMutation,
  useUpdateCartePvcMutation,
} = citoyensApi;
