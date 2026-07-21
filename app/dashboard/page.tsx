"use client";

// Placeholder role-aware dashboard home — replaced by the
// SupporterHome / CreatorHome / AdminHome dispatcher later.

import { Avatar, Button, Label } from "@gravity-ui/uikit";
import { useRouter } from "next/navigation";
import { useSessionStore } from "@/lib/store";

export default function DashboardHomePage() {
  const router = useRouter();
  const user = useSessionStore((s) => s.user);
  const clearSession = useSessionStore((s) => s.clearSession);

  if (!user) return null; // guard in layout.tsx handles the redirect

  return (
    <main className="mx-auto w-full max-w-2xl grow px-4 py-16">
      <div className="flex items-center gap-4">
        <Avatar imgUrl={user.image} text={user.name} size="xl" />
        <div>
          <h1 className="text-2xl font-semibold">Welcome, {user.name}</h1>
          <div className="mt-1 flex items-center gap-2">
            <Label theme="info">{user.role}</Label>
            <Label theme="success">{user.credits} credits</Label>
          </div>
        </div>
      </div>

      <p className="mt-8 text-sm opacity-70">
        Your {user.role} dashboard is under construction — campaign tables, stats, and
        notifications land here next.
      </p>

      <div className="mt-8">
        <Button
          view="outlined"
          size="l"
          onClick={() => {
            clearSession();
            router.replace("/login");
          }}
        >
          Log out
        </Button>
      </div>
    </main>
  );
}
