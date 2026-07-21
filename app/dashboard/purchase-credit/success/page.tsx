import { Suspense } from "react";
import { SuccessClient } from "./success-client";

/** Stripe Checkout success redirect target (?session_id=...). */
export default function PurchaseSuccessPage() {
  return (
    <Suspense>
      <SuccessClient />
    </Suspense>
  );
}
