import { api } from "@/services/api";
import type { Paginated, UpdateSubscriptionResponse, UserSubscription } from "@/types/admin";

export interface GetUserSubscriptionsParams {
  userId: string;
  offset?: number;
  limit?: number;
  active_only?: boolean;
}

// Changing a subscription moves profiles in or out of stock.
const AFFECTED_TAGS = ["subscriptions", "users", "services", "credentials", "credentialGroups"] as const;

export const subscriptionsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getUserSubscriptions: builder.query<Paginated<UserSubscription>, GetUserSubscriptionsParams>({
      query: ({ userId, ...params }) => ({
        url: `admin/users/${userId}/subscriptions`,
        params,
      }),
      providesTags: ["subscriptions"],
    }),
    updateSubscription: builder.mutation<UpdateSubscriptionResponse, { id: string; expired_at: string }>({
      query: ({ id, expired_at }) => ({
        url: `admin/subscriptions/${id}`,
        method: "PUT",
        body: { expired_at },
      }),
      invalidatesTags: [...AFFECTED_TAGS],
    }),
    cancelSubscription: builder.mutation<UserSubscription, string>({
      query: (id) => ({
        url: `admin/subscriptions/${id}/cancel`,
        method: "POST",
      }),
      invalidatesTags: [...AFFECTED_TAGS],
    }),
  }),
});

export const {
  useGetUserSubscriptionsQuery,
  useUpdateSubscriptionMutation,
  useCancelSubscriptionMutation,
} = subscriptionsApi;
