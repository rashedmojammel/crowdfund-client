"use client";

import type { ReactNode } from "react";

interface FormFieldProps {
  label: string;
  htmlFor?: string;
  /** Renders a subtle asterisk after the label (never the word "required"). */
  required?: boolean;
  children: ReactNode;
}

/** Visible label above the control — Gravity UI inputs render their own error text. */
export function FormField({ label, htmlFor, required, children }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={htmlFor} className="text-sm font-medium">
        {label}
        {required ? (
          <span aria-hidden="true" className="ml-1 opacity-60">
            *
          </span>
        ) : null}
      </label>
      {children}
    </div>
  );
}
