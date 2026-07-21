"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Select } from "@gravity-ui/uikit";
import { apiFetch } from "@/lib/api-client";
import { useSessionStore } from "@/lib/store";
import type { User, UserRole } from "@/types";

const ROLE_OPTIONS: Array<{ value: UserRole; content: string }> = [
  { value: "supporter", content: "Supporter" },
  { value: "creator", content: "Creator" },
  { value: "admin", content: "Admin" },
];

interface RoleDropdownProps {
  user: User;
}

/** Per-row role selector — PATCHes /users/:id/role on change. */
export function RoleDropdown({ user }: RoleDropdownProps) {
  const queryClient = useQueryClient();
  const sessionUser = useSessionStore((s) => s.user);
  const isSelf = sessionUser?.email === user.email;

  const updateRole = useMutation({
    mutationFn: (role: UserRole) =>
      apiFetch<User>(`/users/${user.id}/role`, { method: "PATCH", body: { role } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  return (
    <Select
      size="m"
      value={[user.role]}
      onUpdate={(v) => {
        const role = v[0] as UserRole;
        if (role && role !== user.role) updateRole.mutate(role);
      }}
      options={ROLE_OPTIONS}
      disabled={isSelf || updateRole.isPending}
      title={isSelf ? "You can't change your own role" : undefined}
      aria-label={`Role of ${user.name}`}
    />
  );
}
