"use client";

import { Dialog } from "@gravity-ui/uikit";
import { ContributionStatusBadge } from "@/components/dashboard/ContributionStatusBadge";
import { formatCredits, formatDateTime } from "@/lib/format";
import type { Contribution } from "@/types";

interface ViewContributionModalProps {
  contribution: Contribution | null;
  onClose: () => void;
  onApprove: (contribution: Contribution) => void;
  onReject: (contribution: Contribution) => void;
  /** True while an approve/reject on this contribution is in flight. */
  actionPending?: boolean;
}

/** Detail modal opened from the review table. Actions only while pending. */
export function ViewContributionModal({
  contribution,
  onClose,
  onApprove,
  onReject,
  actionPending = false,
}: ViewContributionModalProps) {
  const isPending = contribution?.status === "pending";

  return (
    <Dialog open={Boolean(contribution)} onClose={onClose} size="s">
      <Dialog.Header caption="Contribution details" />
      <Dialog.Body>
        {contribution ? (
          <dl className="flex flex-col gap-3 text-sm">
            <div className="flex items-center justify-between gap-4">
              <dt className="opacity-70">Supporter</dt>
              <dd className="text-right">
                <p className="font-medium">{contribution.supporterName}</p>
                <p className="opacity-60">{contribution.supporterEmail}</p>
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="opacity-70">Campaign</dt>
              <dd className="text-right font-medium">{contribution.campaignId}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="opacity-70">Amount</dt>
              <dd className="font-semibold">{formatCredits(contribution.amount)}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="opacity-70">Status</dt>
              <dd>
                <ContributionStatusBadge status={contribution.status} />
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="opacity-70">Submitted</dt>
              <dd>{formatDateTime(contribution.createdAt)}</dd>
            </div>
          </dl>
        ) : null}
      </Dialog.Body>
      {contribution && isPending ? (
        <Dialog.Footer
          textButtonApply="Approve"
          textButtonCancel="Reject"
          onClickButtonApply={() => onApprove(contribution)}
          onClickButtonCancel={() => onReject(contribution)}
          propsButtonApply={{ view: "action", loading: actionPending }}
          propsButtonCancel={{ view: "outlined-danger", disabled: actionPending }}
        />
      ) : (
        <Dialog.Footer
          textButtonApply="Close"
          onClickButtonApply={onClose}
          propsButtonApply={{ view: "normal" }}
        />
      )}
    </Dialog>
  );
}
