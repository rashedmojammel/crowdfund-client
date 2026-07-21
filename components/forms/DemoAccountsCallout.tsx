"use client";

// Mock-mode helper shown on the login page — remove when the real server
// is wired up. Lives in a client component because Gravity UI components
// can't render inside a server component boundary.

import { Alert } from "@gravity-ui/uikit";

export function DemoAccountsCallout() {
  return (
    <Alert
      theme="info"
      title="Demo accounts (password: Test@1234)"
      message={
        <ul className="mt-1 space-y-1">
          <li>supporter@test.com — supporter dashboard</li>
          <li>creator@test.com — creator dashboard</li>
          <li>admin@test.com — admin dashboard</li>
        </ul>
      }
    />
  );
}
