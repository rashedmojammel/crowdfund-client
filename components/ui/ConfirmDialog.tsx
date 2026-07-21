"use client";

import { Dialog } from "@gravity-ui/uikit";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  /** Styles the confirm button as destructive (deletes, rejections). */
  danger?: boolean;
  /** Shows a spinner on the confirm button while the action runs. */
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

/**
 * Confirmation for actions with consequences (CLAUDE.md: delete / reject /
 * withdraw always confirm first). Gravity's Dialog provides focus trapping,
 * Escape handling, and dialog ARIA out of the box.
 */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  danger = false,
  loading = false,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} size="s">
      <Dialog.Header caption={title} />
      <Dialog.Body>
        <p className="text-sm leading-relaxed opacity-90">{message}</p>
      </Dialog.Body>
      <Dialog.Footer
        textButtonApply={confirmText}
        textButtonCancel={cancelText}
        onClickButtonApply={onConfirm}
        onClickButtonCancel={onClose}
        propsButtonApply={{ view: danger ? "outlined-danger" : "action", loading }}
      />
    </Dialog>
  );
}
