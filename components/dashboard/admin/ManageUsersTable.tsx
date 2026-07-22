"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Avatar, Button, Icon } from "@gravity-ui/uikit";
import { Persons, TrashBin } from "@gravity-ui/icons";
import { DataTable, type DataTableColumn } from "@/components/dashboard/DataTable";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { RoleDropdown } from "@/components/dashboard/admin/RoleDropdown";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { apiFetch } from "@/lib/api-client";
import { formatCredits, formatDate } from "@/lib/format";
import { useSessionStore } from "@/lib/store";
import type { AdminUserRow, Paginated } from "@/types";

export function ManageUsersTable() {
  const queryClient = useQueryClient();
  const sessionUser = useSessionStore((s) => s.user);
  const [deleting, setDeleting] = useState<AdminUserRow | null>(null);

  const { data, isPending } = useQuery({
    queryKey: ["users"],
    // limit=50 approximates "all" — this table has no pagination control.
    queryFn: () => apiFetch<Paginated<AdminUserRow>>("/users?limit=50"),
  });

  const remove = useMutation({
    mutationFn: (u: AdminUserRow) => apiFetch(`/users/${u._id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      setDeleting(null);
    },
  });

  const columns: Array<DataTableColumn<AdminUserRow>> = [
    {
      key: "user",
      title: "User",
      sortable: true,
      sortValue: (row) => row.name ?? row.email,
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar imgUrl={row.image} text={row.name ?? row.email} size="s" />
          <div>
            <p className="font-medium">{row.name ?? row.email}</p>
            <p className="text-xs opacity-60">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      title: "Role",
      render: (row) => <RoleDropdown user={row} />,
    },
    {
      key: "credits",
      title: "Credits",
      align: "right",
      sortable: true,
      sortValue: (row) => row.credits,
      render: (row) => formatCredits(row.credits),
    },
    {
      key: "joined",
      title: "Joined",
      sortable: true,
      sortValue: (row) => row.createdAt,
      render: (row) => formatDate(row.createdAt),
    },
    {
      key: "actions",
      title: "Actions",
      align: "right",
      render: (row) => {
        const isSelf = sessionUser?.email === row.email;
        const isAdmin = row.role === "admin";
        return (
          <Button
            view="flat-danger"
            size="s"
            title={
              isSelf
                ? "You can't delete your own account"
                : isAdmin
                  ? "Admin accounts can't be deleted"
                  : "Delete user"
            }
            aria-label={`Delete ${row.name ?? row.email}`}
            disabled={isSelf || isAdmin}
            onClick={() => setDeleting(row)}
          >
            <Icon data={TrashBin} size={16} />
          </Button>
        );
      },
    },
  ];

  if (isPending || !data) {
    return <Skeleton className="h-64 w-full rounded-xl" />;
  }

  return (
    <>
      <DataTable
        columns={columns}
        rows={data.items}
        rowKey={(row) => row._id}
        emptyState={
          <EmptyState
            icon={Persons}
            title="No users found"
            subtitle="Registered accounts appear here with their role and wallet balance."
          />
        }
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete this user?"
        message={
          deleting
            ? `${deleting.name ?? deleting.email} (${deleting.email}) will lose access permanently, along with their ${formatCredits(deleting.credits)}. This can't be undone.`
            : ""
        }
        confirmText="Delete user"
        danger
        loading={remove.isPending}
        onConfirm={() => deleting && remove.mutate(deleting)}
        onClose={() => setDeleting(null)}
      />
    </>
  );
}
