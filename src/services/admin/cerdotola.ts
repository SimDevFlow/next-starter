import { api } from '@/services/api';
import type {
  GraveRead,
  ReversementWithUrl,
  VerifyCertificateResponse,
} from '@/types/admin';

const cerdotolaApi = api.injectEndpoints({
  endpoints: (build) => ({
    getGraves: build.query<GraveRead[], void>({
      query: () => '/cerdotola/graves',
      providesTags: ['graves'],
    }),
    getReversementsCerdotola: build.query<ReversementWithUrl[], void>({
      query: () => '/cerdotola/reversements',
      providesTags: ['reversements'],
    }),
    verifyQr: build.query<VerifyCertificateResponse, string>({
      query: (code) => `/cerdotola/verify-qr/${code}`,
    }),
  }),
});

export const {
  useGetGravesQuery,
  useGetReversementsCerdotolaQuery,
  useLazyVerifyQrQuery,
} = cerdotolaApi;
