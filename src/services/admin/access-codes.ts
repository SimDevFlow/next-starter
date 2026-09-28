import { api } from "@/services/api";
import type { AccessCode, CreateAccessCode, Paginated } from "@/types/admin";

export interface GetAccessCodesParams {
  offset?: number;
  limit?: number;
}

export const accessCodesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAccessCodes: builder.query<Paginated<AccessCode>, GetAccessCodesParams | void>({
      query: (params) => ({
        url: "admin/access-codes",
        params: params ?? undefined,
      }),
      providesTags: ["accessCodes"],
    }),
    createAccessCode: builder.mutation<AccessCode, CreateAccessCode>({
      query: (body) => ({
        url: "admin/access-codes",
        method: "POST",
        body,
      }),
      invalidatesTags: ["accessCodes"],
    }),
    deleteAccessCode: builder.mutation<void, string>({
      query: (id) => ({
        url: `admin/access-codes/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["accessCodes"],
    }),
  }),
});

export const {
  useGetAccessCodesQuery,
  useCreateAccessCodeMutation,
  useDeleteAccessCodeMutation,
} = accessCodesApi;
