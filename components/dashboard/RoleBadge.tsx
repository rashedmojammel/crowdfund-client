"use client";

import { Label } from "@gravity-ui/uikit";
import type { UserRole } from "@/types";

const roleTheme: Record<UserRole, "info" | "success" | "warning"> = {
  supporter: "info",
  creator: "success",
  admin: "warning",
};

const roleText: Record<UserRole, string> = {
  supporter: "Supporter",
  creator: "Creator",
  admin: "Admin",
};

export function RoleBadge({ role }: { role: UserRole }) {
  return <Label theme={roleTheme[role]}>{roleText[role]}</Label>;
}
