"use client";

import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/admin/page-header";
import { getErrorMessage } from "@/lib/format";
import { useSetAdminPasswordMutation } from "@/services/admin/password";

export default function SettingsPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [setAdminPassword, { isLoading }] = useSetAdminPasswordMutation();

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (password !== confirm) {
      toast.error("Passwords do not match.");
      return;
    }
    try {
      await setAdminPassword({
        password,
        current_password: currentPassword || null,
      }).unwrap();
      toast.success("Password updated.");
      setCurrentPassword("");
      setPassword("");
      setConfirm("");
    } catch (e) {
      toast.error(getErrorMessage(e, "Failed to update password."));
    }
  }

  return (
    <>
      <PageHeader title="Settings" description="Manage your admin account." />
      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>Change password</CardTitle>
          <CardDescription>Use 8 to 128 characters.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="pw-current">Current password</Label>
              <Input
                id="pw-current"
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="pw-new">New password</Label>
              <Input
                id="pw-new"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                maxLength={128}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="pw-confirm">Confirm new password</Label>
              <Input
                id="pw-confirm"
                type="password"
                autoComplete="new-password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </div>
            <div>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving…" : "Update password"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
