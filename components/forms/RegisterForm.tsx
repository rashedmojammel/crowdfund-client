"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, TriangleAlert } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pressable } from "@/components/animations/Pressable";
import { FormField } from "@/components/forms/FormField";
import { ImageUploader } from "@/components/forms/ImageUploader";
import { apiFetch } from "@/lib/api-client";
import { authClient, useSession } from "@/lib/auth-client";
import { registerSchema, type RegisterInput } from "@/lib/validators";

export function RegisterForm() {
  const router = useRouter();
  const { refetch: refetchSession } = useSession();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", image: "", role: "supporter" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    const { error } = await authClient.signUp.email({
      name: values.name,
      email: values.email,
      password: values.password,
      role: values.role,
      image: values.image || undefined,
    });
    if (error) {
      setFormError(error.message ?? "Registration failed — try again");
      return;
    }
    try {
      // Server grants 50 (supporter) / 20 (creator) exactly once; idempotent.
      // Also retried from the dashboard layout in case this call races the
      // session cookie landing (e.g. right after Google OAuth).
      await apiFetch("/auth/grant-signup-bonus", { method: "POST" });
      // useSession() caches in memory — the bonus call went through a plain
      // fetch, not authClient, so the cached session still shows 0 credits
      // until this refetch picks up the server-side change.
      await refetchSession();
    } catch {
      // Non-fatal — the dashboard layout retries this once the session loads.
    }
    router.push("/dashboard");
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      {formError ? (
        <Alert variant="destructive">
          <TriangleAlert />
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      ) : null}

      <Controller
        control={control}
        name="name"
        render={({ field, fieldState }) => (
          <FormField
            label="Full name"
            htmlFor="register-name"
            required
            error={fieldState.error?.message}
          >
            <Input
              id="register-name"
              placeholder="Samiha Noor"
              autoComplete="name"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              aria-invalid={fieldState.error ? true : undefined}
            />
          </FormField>
        )}
      />

      <Controller
        control={control}
        name="email"
        render={({ field, fieldState }) => (
          <FormField
            label="Email"
            htmlFor="register-email"
            required
            error={fieldState.error?.message}
          >
            <Input
              id="register-email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              aria-invalid={fieldState.error ? true : undefined}
            />
          </FormField>
        )}
      />

      <Controller
        control={control}
        name="password"
        render={({ field, fieldState }) => (
          <FormField
            label="Password"
            htmlFor="register-password"
            required
            error={fieldState.error?.message}
          >
            <Input
              id="register-password"
              type="password"
              placeholder="At least 8 characters, letters and numbers"
              autoComplete="new-password"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              aria-invalid={fieldState.error ? true : undefined}
            />
          </FormField>
        )}
      />

      <Controller
        control={control}
        name="image"
        render={({ field, fieldState }) => (
          <FormField label="Profile picture">
            <ImageUploader
              value={field.value}
              onChange={field.onChange}
              errorMessage={fieldState.error?.message}
              disabled={isSubmitting}
            />
          </FormField>
        )}
      />

      <Controller
        control={control}
        name="role"
        render={({ field, fieldState }) => (
          <FormField label="Join as" required error={fieldState.error?.message}>
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger
                id="register-role"
                className="w-full"
                aria-invalid={fieldState.error ? true : undefined}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="supporter">
                  Supporter — back campaigns (50-credit welcome bonus)
                </SelectItem>
                <SelectItem value="creator">
                  Creator — launch campaigns (20-credit welcome bonus)
                </SelectItem>
              </SelectContent>
            </Select>
          </FormField>
        )}
      />

      <Pressable>
        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
          Create account
        </Button>
      </Pressable>
    </form>
  );
}
