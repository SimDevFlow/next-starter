import { api } from "@/services/api";
import type { CreateServiceLink, Paginated, ServiceLink } from "@/types/admin";

export interface GetServiceLinksParams {
  offset?: number;
  limit?: number;
}

export const serviceLinksApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getServiceLinks: builder.query<Paginated<ServiceLink>, GetServiceLinksParams | void>({
      query: (params) => ({
        url: "admin/service-links",
        params: params ?? undefined,
      }),
      providesTags: ["serviceLinks"],
    }),
    createServiceLink: builder.mutation<ServiceLink, CreateServiceLink>({
      query: (body) => ({
        url: "admin/service-links",
        method: "POST",
        body,
      }),
      invalidatesTags: ["serviceLinks"],
    }),
    deleteServiceLink: builder.mutation<void, string>({
      query: (id) => ({
        url: `admin/service-links/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["serviceLinks"],
    }),
  }),
});

export const {
  useGetServiceLinksQuery,
  useCreateServiceLinkMutation,
  useDeleteServiceLinkMutation,
} = serviceLinksApi;
