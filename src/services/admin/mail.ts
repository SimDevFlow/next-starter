import { api } from "@/services/api";
import type { SendMailRequest } from "@/types/admin";

export const mailApi = api.injectEndpoints({
  endpoints: (builder) => ({
    sendMail: builder.mutation<void, SendMailRequest>({
      query: (body) => ({
        url: "admin/mails/send",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { useSendMailMutation } = mailApi;
