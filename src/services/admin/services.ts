import { api } from "@/services/api";
import type { CreateService, Paginated, Service } from "@/types/admin";

export interface GetServicesParams {
  offset?: number;
  limit?: number;
}

export const servicesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getServices: builder.query<Paginated<Service>, GetServicesParams | void>({
      query: (params) => ({
        url: "services",
        params: params ?? undefined,
      }),
      providesTags: ["services"],
    }),
    addService: builder.mutation<Service, CreateService>({
      query: (body) => ({
        url: "admin/services",
        method: "POST",
        body,
      }),
      invalidatesTags: ["services"],
    }),
    updateService: builder.mutation<Service, { id: string; body: CreateService }>({
      query: ({ id, body }) => ({
        url: `admin/services/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["services"],
    }),
    deleteService: builder.mutation<void, string>({
      query: (id) => ({
        url: `admin/services/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["services"],
    }),
  }),
});

export const {
  useGetServicesQuery,
  useAddServiceMutation,
  useUpdateServiceMutation,
  useDeleteServiceMutation,
} = servicesApi;
