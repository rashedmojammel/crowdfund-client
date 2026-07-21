"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Button, PasswordInput, Select, TextInput } from "@gravity-ui/uikit";
import { Pressable } from "@/components/animations/Pressable";
import { FormField } from "@/components/forms/FormField";
import { ImageUploader } from "@/components/forms/ImageUploader";
import { apiFetch } from "@/lib/api-client";
import { useSessionStore } from "@/lib/store";
import { registerSchema, type RegisterInput } from "@/lib/validators";
import type { AuthResponse } from "@/types";

export function RegisterForm() {
  const router = useRouter();
  const setSession = useSessionStore((s) => s.setSession);
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
    try {
      const { user, token } = await apiFetch<AuthResponse>("/auth/sign-up", {
        method: "POST",
        body: { ...values, image: values.image || undefined },
      });
      // Session must exist before the bonus call — apiFetch reads it for auth.
      setSession(user, token);
      // Server grants 50 (supporter) / 20 (creator) exactly once; idempotent.
      await apiFetch("/auth/grant-signup-bonus", { method: "POST" });
      router.push("/dashboard");
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Registration failed — try again");
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      {formError ? <Alert theme="danger" message={formError} /> : null}

      <Controller
        control={control}
        name="name"
        render={({ field, fieldState }) => (
          <FormField label="Full name" htmlFor="register-name" required>
            <TextInput
              id="register-name"
              size="l"
              placeholder="Samiha Noor"
              autoComplete="name"
              value={field.value}
              onUpdate={field.onChange}
              onBlur={field.onBlur}
              validationState={fieldState.error ? "invalid" : undefined}
              errorMessage={fieldState.error?.message}
            />
          </FormField>
        )}
      />

      <Controller
        control={control}
        name="email"
        render={({ field, fieldState }) => (
          <FormField label="Email" htmlFor="register-email" required>
            <TextInput
              id="register-email"
              size="l"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              value={field.value}
              onUpdate={field.onChange}
              onBlur={field.onBlur}
              validationState={fieldState.error ? "invalid" : undefined}
              errorMessage={fieldState.error?.message}
            />
          </FormField>
        )}
      />

      <Controller
        control={control}
        name="password"
        render={({ field, fieldState }) => (
          <FormField label="Password" htmlFor="register-password" required>
            <PasswordInput
              id="register-password"
              size="l"
              placeholder="At least 8 characters, letters and numbers"
              autoComplete="new-password"
              value={field.value}
              onUpdate={field.onChange}
              onBlur={field.onBlur}
              validationState={fieldState.error ? "invalid" : undefined}
              errorMessage={fieldState.error?.message}
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
          <FormField label="Join as" required>
            <Select
              size="l"
              width="max"
              value={[field.value]}
              onUpdate={(values) => field.onChange(values[0])}
              validationState={fieldState.error ? "invalid" : undefined}
              errorMessage={fieldState.error?.message}
            >
              <Select.Option value="supporter">
                Supporter — back campaigns (50-credit welcome bonus)
              </Select.Option>
              <Select.Option value="creator">
                Creator — launch campaigns (20-credit welcome bonus)
              </Select.Option>
            </Select>
          </FormField>
        )}
      />

      <Pressable>
        <Button type="submit" view="action" size="l" width="max" loading={isSubmitting}>
          Create account
        </Button>
      </Pressable>
    </form>
  );
}
