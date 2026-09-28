import { api } from "@/services/api";
import type { FullUser, SetAdminPasswordRequest } from "@/types/admin";

export const passwordApi = api.injectEndpoints({
  endpoints: (builder) => ({
    setAdminPassword: builder.mutation<FullUser, SetAdminPasswordRequest>({
      query: (body) => ({
        url: "admin/password",
        method: "PUT",
        body,
      }),
    }),
  }),
});

export const { useSetAdminPasswordMutation } = passwordApi;
