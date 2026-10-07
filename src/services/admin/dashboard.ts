import { api } from '@/services/api';
import type { FinancialDashboardResponse } from '@/types/admin';

const dashboardApi = api.injectEndpoints({
  endpoints: (build) => ({
    getDashboard: build.query<FinancialDashboardResponse, void>({
      query: () => '/super/dashboard',
      providesTags: ['dashboard'],
    }),
  }),
});

export const { useGetDashboardQuery } = dashboardApi;
