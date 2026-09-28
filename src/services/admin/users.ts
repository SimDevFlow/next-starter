import { api } from "@/services/api";
import type { FullUser, GiftSubscription, GiftSubscriptionRequest, Paginated, Role } from "@/types/admin";

export interface GetUsersParams {
  offset?: number;
  limit?: number;
  with_active_subscription?: boolean;
  without_active_subscription?: boolean;
}

export const usersApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<Paginated<FullUser>, GetUsersParams | void>({
      query: (params) => ({
        url: "admin/users",
        params: params ?? undefined,
      }),
      providesTags: ["users"],
    }),
    activateUser: builder.mutation<FullUser, string>({
      query: (userId) => ({
        url: `admin/users/${userId}/activate`,
        method: "PUT",
      }),
      invalidatesTags: ["users"],
    }),
    deactivateUser: builder.mutation<FullUser, string>({
      query: (userId) => ({
        url: `admin/users/${userId}/deactivate`,
        method: "PUT",
      }),
      invalidatesTags: ["users"],
    }),
    updateUserRole: builder.mutation<FullUser, { userId: string; role: Role }>({
      query: ({ userId, role }) => ({
        url: `admin/users/${userId}/role`,
        method: "PUT",
        body: { role },
      }),
      invalidatesTags: ["users"],
    }),
    giftSubscription: builder.mutation<GiftSubscription, { userId: string; body: GiftSubscriptionRequest }>({
      query: ({ userId, body }) => ({
        url: `admin/users/${userId}/subscriptions`,
        method: "POST",
        body,
      }),
      // A gift consumes a profile: stock and credential assignments change too.
      invalidatesTags: ["users", "subscriptions", "services", "credentials", "credentialGroups"],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useActivateUserMutation,
  useDeactivateUserMutation,
  useUpdateUserRoleMutation,
  useGiftSubscriptionMutation,
} = usersApi;
