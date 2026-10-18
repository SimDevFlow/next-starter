"use client";

import { useState } from "react";
import { Gift, ListChecks } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/admin/page-header";
import { Pager, PAGE_SIZE } from "@/components/admin/pager";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { GiftSubscriptionDialog } from "@/components/admin/gift-subscription-dialog";
import { UserSubscriptionsSheet } from "@/components/admin/user-subscriptions-sheet";
import { TableMessage, TableSkeleton } from "@/components/admin/table-states";
import { formatDate, getErrorMessage } from "@/lib/format";
import {
  useActivateUserMutation,
  useDeactivateUserMutation,
  useGetUsersQuery,
  useUpdateUserRoleMutation,
} from "@/services/admin/users";
import type { FullUser, Role } from "@/types/admin";

type SubscriptionFilter = "all" | "with" | "without";

export default function UsersPage() {
  const [page, setPage] = useState(0);
  const [filter, setFilter] = useState<SubscriptionFilter>("all");
  const [toggleTarget, setToggleTarget] = useState<FullUser | null>(null);
  const [giftTarget, setGiftTarget] = useState<FullUser | null>(null);
  // Kept after closing so the sheet keeps its content during the close animation.
  const [subscriptionsUser, setSubscriptionsUser] = useState<FullUser | null>(null);
  const [subscriptionsOpen, setSubscriptionsOpen] = useState(false);

  const { data, isLoading, isFetching, isError, error } = useGetUsersQuery({
    offset: page * PAGE_SIZE,
    limit: PAGE_SIZE,
    with_active_subscription: filter === "with",
    without_active_subscription: filter === "without",
  });
  const [activateUser] = useActivateUserMutation();
  const [deactivateUser] = useDeactivateUserMutation();
  const [updateRole, { isLoading: isUpdatingRole }] = useUpdateUserRoleMutation();

  async function confirmToggle() {
    if (!toggleTarget) return;
    const user = toggleTarget;
    setToggleTarget(null);
    try {
      await (user.disabled ? activateUser(user.id) : deactivateUser(user.id)).unwrap();
      toast.success(`${user.full_name} ${user.disabled ? "activated" : "deactivated"}.`);
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  }

  async function changeRole(user: FullUser, role: Role) {
    if (role === user.role) return;
    try {
      await updateRole({ userId: user.id, role }).unwrap();
      toast.success(`${user.full_name} is now ${role}.`);
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  }

  return (
    <>
      <PageHeader title="Users" description="Manage accounts, roles and activation." />
      <Card>
        <CardContent>
          <div className="mb-4 flex items-center gap-3">
            <Label htmlFor="subscription-filter">Subscription</Label>
            <Select
              value={filter}
              onValueChange={(v) => {
                setFilter(v as SubscriptionFilter);
                setPage(0);
              }}
            >
              <SelectTrigger id="subscription-filter" className="w-56">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All users</SelectItem>
                <SelectItem value="with">With active subscription</SelectItem>
                <SelectItem value="without">Without active subscription</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableSkeleton columns={6} />
                ) : isError ? (
                  <TableMessage columns={6}>{getErrorMessage(error, "Failed to load users.")}</TableMessage>
                ) : data?.content.length === 0 ? (
                  <TableMessage columns={6}>No users found.</TableMessage>
                ) : (
                  data?.content.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.full_name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Select
                          value={user.role}
                          disabled={isUpdatingRole}
                          onValueChange={(v) => changeRole(user, v as Role)}
                        >
                          <SelectTrigger size="sm" className="w-28">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">user</SelectItem>
                            <SelectItem value="admin">admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1.5">
                          <Badge variant={user.disabled ? "destructive" : "secondary"}>
                            {user.disabled ? "Disabled" : "Active"}
                          </Badge>
                          {!user.email_verified && <Badge variant="outline">Unverified</Badge>}
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(user.created_at)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSubscriptionsUser(user);
                              setSubscriptionsOpen(true);
                            }}
                          >
                            <ListChecks /> Abonnements
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => setGiftTarget(user)}>
                            <Gift /> Offrir un abonnement
                          </Button>
                          <Button
                            variant={user.disabled ? "outline" : "destructive"}
                            size="sm"
                            onClick={() => setToggleTarget(user)}
                          >
                            {user.disabled ? "Activate" : "Deactivate"}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <Pager page={page} total={data?.total ?? 0} onPageChange={setPage} />
          {isFetching && !isLoading && <p className="pt-2 text-xs text-muted-foreground">Refreshing…</p>}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={toggleTarget !== null}
        onOpenChange={(open) => !open && setToggleTarget(null)}
        title={toggleTarget?.disabled ? "Activate user?" : "Deactivate user?"}
        description={
          toggleTarget
            ? `${toggleTarget.full_name} (${toggleTarget.email}) will be ${
                toggleTarget.disabled ? "able" : "unable"
              } to sign in.`
            : ""
        }
        confirmLabel={toggleTarget?.disabled ? "Activate" : "Deactivate"}
        onConfirm={confirmToggle}
      />

      <UserSubscriptionsSheet
        user={subscriptionsUser}
        open={subscriptionsOpen}
        onOpenChange={setSubscriptionsOpen}
        onGift={setGiftTarget}
      />
      <GiftSubscriptionDialog user={giftTarget} onOpenChange={(open) => !open && setGiftTarget(null)} />
    </>
  );
}
