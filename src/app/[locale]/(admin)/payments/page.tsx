"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/admin/page-header";
import { Pager, PAGE_SIZE } from "@/components/admin/pager";
import { TableMessage, TableSkeleton } from "@/components/admin/table-states";
import { formatAmount, formatDate, getErrorMessage } from "@/lib/format";
import { useGetPaymentsQuery } from "@/services/admin/payments";
import type { PaymentStatus, SubscriptionType } from "@/types/admin";

const STATUS_VARIANT: Record<PaymentStatus, "default" | "secondary" | "destructive" | "outline"> = {
  COMPLETED: "default",
  ACCEPTED: "secondary",
  SUBMITTED: "outline",
  FAILED: "destructive",
};

const TYPE_LABEL: Record<SubscriptionType, string> = {
  daily: "24h",
  monthly: "Classique",
};

interface Filters {
  from: string;
  to: string;
  userId: string;
}

const EMPTY_FILTERS: Filters = { from: "", to: "", userId: "" };

export default function PaymentsPage() {
  const [page, setPage] = useState(0);
  const [draft, setDraft] = useState<Filters>(EMPTY_FILTERS);
  const [applied, setApplied] = useState<Filters>(EMPTY_FILTERS);

  const { data, isLoading, isError, error } = useGetPaymentsQuery({
    offset: page * PAGE_SIZE,
    limit: PAGE_SIZE,
    from: applied.from || undefined,
    to: applied.to || undefined,
    user_id: applied.userId.trim() || undefined,
  });

  function applyFilters(event: React.FormEvent) {
    event.preventDefault();
    setApplied(draft);
    setPage(0);
  }

  function resetFilters() {
    setDraft(EMPTY_FILTERS);
    setApplied(EMPTY_FILTERS);
    setPage(0);
  }

  return (
    <>
      <PageHeader title="Payments" description="Payment history across all users." />
      <Card>
        <CardContent>
          <form onSubmit={applyFilters} className="mb-4 flex flex-wrap items-end gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="pay-from">From</Label>
              <Input
                id="pay-from"
                type="date"
                value={draft.from}
                onChange={(e) => setDraft({ ...draft, from: e.target.value })}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="pay-to">To</Label>
              <Input
                id="pay-to"
                type="date"
                value={draft.to}
                onChange={(e) => setDraft({ ...draft, to: e.target.value })}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="pay-user">User ID</Label>
              <Input
                id="pay-user"
                placeholder="UUID"
                className="w-72"
                value={draft.userId}
                onChange={(e) => setDraft({ ...draft, userId: e.target.value })}
              />
            </div>
            <Button type="submit">Apply</Button>
            <Button type="button" variant="outline" onClick={resetFilters}>
              Reset
            </Button>
          </form>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Service</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableSkeleton columns={7} />
                ) : isError ? (
                  <TableMessage columns={7}>{getErrorMessage(error, "Failed to load payments.")}</TableMessage>
                ) : data?.content.length === 0 ? (
                  <TableMessage columns={7}>No payments found.</TableMessage>
                ) : (
                  data?.content.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>{formatDate(p.created_at)}</TableCell>
                      <TableCell>
                        <Badge variant={p.subscription_type === "daily" ? "secondary" : "outline"}>
                          {TYPE_LABEL[p.subscription_type]}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatAmount(p.amount)}</TableCell>
                      <TableCell>
                        <Badge variant={STATUS_VARIANT[p.payement_statut]}>{p.payement_statut}</Badge>
                      </TableCell>
                      <TableCell>{p.user_number}</TableCell>
                      <TableCell className="font-mono text-xs" title={p.user_id}>
                        {p.user_id.slice(0, 8)}…
                      </TableCell>
                      <TableCell className="font-mono text-xs" title={p.service_id}>
                        {p.service_id.slice(0, 8)}…
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <Pager page={page} total={data?.total ?? 0} onPageChange={setPage} />
        </CardContent>
      </Card>
    </>
  );
}
