"use client";

import { FormEvent, useState } from "react";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/admin/page-header";
import { getErrorMessage } from "@/lib/format";
import { useSendMailMutation } from "@/services/admin/mail";

export default function MailsPage() {
  const [recipient, setRecipient] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sendMail, { isLoading }] = useSendMailMutation();

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    try {
      await sendMail({ recipient, subject, body }).unwrap();
      toast.success(`Mail sent to ${recipient}.`);
      setRecipient("");
      setSubject("");
      setBody("");
    } catch (e) {
      toast.error(getErrorMessage(e, "Failed to send mail."));
    }
  }

  return (
    <>
      <PageHeader title="Mails" description="Send a message to any email address." />
      <Card className="max-w-2xl">
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="mail-recipient">Recipient</Label>
              <Input
                id="mail-recipient"
                type="email"
                required
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="mail-subject">Subject</Label>
              <Input
                id="mail-subject"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="mail-body">Message</Label>
              <Textarea
                id="mail-body"
                required
                rows={8}
                value={body}
                onChange={(e) => setBody(e.target.value)}
              />
            </div>
            <div>
              <Button type="submit" disabled={isLoading}>
                <Send /> {isLoading ? "Sending…" : "Send mail"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
