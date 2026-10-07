import { api } from '@/services/api';
import type {
  ConfigurationContenu,
  UpdateConfigurationRequest,
} from '@/types/admin';

// NOTE: there is no GET /api/admin/super/content/configuration in the
// backend spec, so this slice can only ever reflect the last value saved
// during the current session — see the configuration screen for the
// on-page notice explaining this to the admin.
const configurationApi = api.injectEndpoints({
  endpoints: (build) => ({
    updateConfiguration: build.mutation<ConfigurationContenu, UpdateConfigurationRequest>({
      query: (body) => ({
        url: '/super/content/configuration',
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['configuration'],
    }),
  }),
});

export const { useUpdateConfigurationMutation } = configurationApi;
