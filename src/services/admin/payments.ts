import { api } from "@/services/api";
import type { Paginated, Payment } from "@/types/admin";

export interface GetPaymentsParams {
  offset?: number;
  limit?: number;
  from?: string;
  to?: string;
  user_id?: string;
}

export const paymentsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getPayments: builder.query<Paginated<Payment>, GetPaymentsParams | void>({
      query: (params) => ({
        url: "admin/payements",
        params: params ?? undefined,
      }),
      providesTags: ["payments"],
    }),
  }),
});

export const { useGetPaymentsQuery } = paymentsApi;
