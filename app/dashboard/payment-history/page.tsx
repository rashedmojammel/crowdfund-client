"use client";

import { FadeIn } from "@/components/animations/FadeIn";
import { PaymentHistoryTable } from "@/components/dashboard/supporter/PaymentHistoryTable";

export default function PaymentHistoryPage() {
  return (
    <FadeIn className="flex flex-col gap-6">
      <div>
        <h2>Payment History</h2>
        <p className="mt-2 text-sm opacity-70">
          Every credit purchase on your account, with the amount paid and its receipt id.
        </p>
      </div>
      <PaymentHistoryTable />
    </FadeIn>
  );
}
