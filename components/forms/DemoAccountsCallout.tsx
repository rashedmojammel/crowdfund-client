"use client";

// Mock-mode helper shown on the login page — remove when the real server
// is wired up.

import { Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function DemoAccountsCallout() {
  return (
    <Alert variant="info">
      <Info />
      <AlertTitle>Demo accounts (password: Test@1234)</AlertTitle>
      <AlertDescription>
        <ul className="mt-1 space-y-1">
          <li>supporter@test.com — supporter dashboard</li>
          <li>creator@test.com — creator dashboard</li>
          <li>admin@test.com — admin dashboard</li>
        </ul>
      </AlertDescription>
    </Alert>
  );
}
